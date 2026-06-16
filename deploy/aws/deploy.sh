#!/usr/bin/env bash
# ============================================================================
# DevHub backend → AWS App Runner (one-shot, from a working local checkout)
# ----------------------------------------------------------------------------
# Builds backend/Dockerfile, pushes it to ECR, and (first run) prints the
# command to create the App Runner service from deploy/aws/apprunner.json.
# After the first create, App Runner auto-redeploys on each new :latest push
# (AutoDeploymentsEnabled=true).
#
# Prereqs:  aws CLI v2 (run `aws configure` first) · Docker running
# Usage:    AWS_REGION=us-east-1 ./deploy/aws/deploy.sh
# ============================================================================
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"
ECR_REPO="${ECR_REPO:-devhub-backend}"
TAG="${TAG:-latest}"

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

cat <<EOF

✓ Image pushed: ${IMAGE}

Next:
  1. Edit deploy/aws/apprunner.json:
       - ImageIdentifier  → ${IMAGE}
       - AccessRoleArn    → your AppRunnerECRAccessRole ARN
       - fill DATABASE_URL / *_USERNAME / *_PASSWORD / JWT_SECRET / CORS_ALLOWED_ORIGINS
  2. First time only — create the service:
       aws apprunner create-service --cli-input-json file://deploy/aws/apprunner.json --region ${AWS_REGION}
  3. Later deploys auto-trigger on each push to :${TAG}. To force one:
       aws apprunner start-deployment --service-arn <SERVICE_ARN> --region ${AWS_REGION}
  4. Grab the URL → put it in frontend/config.js (window.DEVHUB_API_BASE), and set
     CORS_ALLOWED_ORIGINS to your GitHub Pages origin.
EOF
