#!/usr/bin/env bash
# ============================================================================
# DevHub backend → AWS App Runner (one-shot, from a working local checkout)
# ----------------------------------------------------------------------------
# Builds backend/Dockerfile, pushes it to ECR, ensures the instance role that
# lets App Runner read Secrets Manager exists, resolves the two secret ARNs
# (never hand-build one — they carry an unpredictable 6-char suffix), and
# writes a ready-to-use deploy/aws/apprunner.generated.json (git-ignored —
# it will contain your real account ID and secret ARNs).
#
# Prereqs:
#   - aws CLI v2, configured (`aws configure`). Also run once, to stop a large
#     response (e.g. apprunner create-service) looking like a hung terminal:
#       aws configure set cli_pager ""
#   - Docker running
#   - ./deploy/aws/secrets-setup.sh already run at least once (creates the
#     jwt-secret / db-password entries this script resolves ARNs for)
#
# Usage:    AWS_REGION=us-east-1 ./deploy/aws/deploy.sh
# ============================================================================
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"
ECR_REPO="${ECR_REPO:-devhub-backend}"
TAG="${TAG:-latest}"
SECRET_PREFIX="devhub-backend"
INSTANCE_ROLE_NAME="AppRunnerDevHubInstanceRole"

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
REGISTRY="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE="${REGISTRY}/${ECR_REPO}:${TAG}"

echo "▶ Region ${AWS_REGION} · account ${ACCOUNT_ID}"

echo "▶ Ensuring ECR repository '${ECR_REPO}' exists…"
aws ecr describe-repositories --repository-names "$ECR_REPO" --region "$AWS_REGION" >/dev/null 2>&1 \
  || aws ecr create-repository --repository-name "$ECR_REPO" --region "$AWS_REGION" >/dev/null

echo "▶ Logging Docker in to ECR…"
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "$REGISTRY"

echo "▶ Building image (lean: no language runtimes, exec is off in prod)…"
docker build --build-arg INCLUDE_RUNTIMES=false -t "$IMAGE" ./backend

echo "▶ Pushing ${IMAGE}…"
docker push "$IMAGE"

echo "▶ Ensuring the App Runner instance role exists (grants read access to the two"
echo "  Secrets Manager entries — without it the task fails to start with AccessDenied)…"
if ! aws iam get-role --role-name "$INSTANCE_ROLE_NAME" >/dev/null 2>&1; then
  TRUST_POLICY='{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"tasks.apprunner.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
  aws iam create-role \
    --role-name "$INSTANCE_ROLE_NAME" \
    --assume-role-policy-document "$TRUST_POLICY" >/dev/null
  aws iam put-role-policy \
    --role-name "$INSTANCE_ROLE_NAME" \
    --policy-name "SecretsManagerRead" \
    --policy-document "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Action\":\"secretsmanager:GetSecretValue\",\"Resource\":\"arn:aws:secretsmanager:${AWS_REGION}:${ACCOUNT_ID}:secret:${SECRET_PREFIX}/*\"}]}" >/dev/null
  echo "  Created ${INSTANCE_ROLE_NAME}."
else
  echo "  ${INSTANCE_ROLE_NAME} already exists."
fi
INSTANCE_ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${INSTANCE_ROLE_NAME}"

echo "▶ Resolving secret ARNs from Secrets Manager (run secrets-setup.sh first if this fails)…"
JWT_SECRET_ARN=$(aws secretsmanager describe-secret --secret-id "${SECRET_PREFIX}/jwt-secret" --region "$AWS_REGION" --query ARN --output text)
DB_PASSWORD_ARN=$(aws secretsmanager describe-secret --secret-id "${SECRET_PREFIX}/db-password" --region "$AWS_REGION" --query ARN --output text)

echo "▶ Writing deploy/aws/apprunner.generated.json (real account ID + ARNs — never commit this)…"
jq \
  --arg image "$IMAGE" \
  --arg accessRole "arn:aws:iam::${ACCOUNT_ID}:role/AppRunnerECRAccessRole" \
  --arg instanceRole "$INSTANCE_ROLE_ARN" \
  --arg jwtArn "$JWT_SECRET_ARN" \
  --arg dbPassArn "$DB_PASSWORD_ARN" \
  '.SourceConfiguration.ImageRepository.ImageIdentifier = $image
   | .SourceConfiguration.AuthenticationConfiguration.AccessRoleArn = $accessRole
   | .InstanceConfiguration.InstanceRoleArn = $instanceRole
   | .SourceConfiguration.ImageRepository.ImageConfiguration.RuntimeEnvironmentSecrets.JWT_SECRET = $jwtArn
   | .SourceConfiguration.ImageRepository.ImageConfiguration.RuntimeEnvironmentSecrets.DATABASE_PASSWORD = $dbPassArn' \
  ./deploy/aws/apprunner.json > ./deploy/aws/apprunner.generated.json

cat <<EOF

✓ Image pushed: ${IMAGE}
✓ Instance role ready: ${INSTANCE_ROLE_ARN}
✓ Wrote deploy/aws/apprunner.generated.json with real ARNs resolved — no more placeholders
  to hand-edit except CORS_ALLOWED_ORIGINS, DATABASE_URL, DATABASE_USERNAME (still plain
  RuntimeEnvironmentVariables — not secrets), and the AccessRoleArn if you haven't created
  AppRunnerECRAccessRole yet (the AWS console offers to create it automatically on first
  service create; the managed policy is AWSAppRunnerServicePolicyForECRAccess).

Next:
  1. Edit deploy/aws/apprunner.generated.json — fill CORS_ALLOWED_ORIGINS, DATABASE_URL,
     DATABASE_USERNAME. If AppRunnerECRAccessRole doesn't exist yet, create it first.
  2. First time only — create the service:
       aws apprunner create-service --cli-input-json file://deploy/aws/apprunner.generated.json --region ${AWS_REGION}
  3. Set a log retention on the service's CloudWatch log group once it exists (App Runner
     defaults to Never Expire, which grows forever):
       aws logs put-retention-policy --region ${AWS_REGION} --retention-in-days 14 \\
         --log-group-name "/aws/apprunner/devhub-backend/\$(aws apprunner list-services --region ${AWS_REGION} --query "ServiceSummaryList[?ServiceName=='devhub-backend'].ServiceId" --output text)/application"
  4. Later deploys auto-trigger on each push to :${TAG}. To force one:
       aws apprunner start-deployment --service-arn <SERVICE_ARN> --region ${AWS_REGION}
  5. Grab the URL → put it in frontend/config.js (window.DEVHUB_API_BASE), and confirm
     CORS_ALLOWED_ORIGINS matches your GitHub Pages origin exactly.
EOF
