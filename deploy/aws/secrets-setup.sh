#!/usr/bin/env bash
# ============================================================================
# secrets-setup.sh — create the DevHub backend's secrets in AWS Secrets Manager
# ----------------------------------------------------------------------------
# Run this ONCE, before the first App Runner deploy. Non-secret config
# (DATABASE_URL host/db, DATABASE_USERNAME, CORS_ALLOWED_ORIGINS) stays in
# apprunner.json's plain RuntimeEnvironmentVariables — only the two actual
# secrets (JWT signing key, DB password) go in Secrets Manager, referenced
# from apprunner.json by ARN via RuntimeEnvironmentSecrets. Never hand-type
# an ARN: it carries an unpredictable 6-char suffix, so always resolve it
# with `describe-secret` (deploy.sh does this for you).
#
# Usage:  AWS_REGION=us-east-1 ./deploy/aws/secrets-setup.sh
# ============================================================================
set -euo pipefail

REGION="${AWS_REGION:-us-east-1}"
PREFIX="devhub-backend"

create_secret() {
  local NAME="$1"
  local VALUE="$2"
  echo -n "  Creating ${PREFIX}/${NAME} ... "
  ARN=$(aws secretsmanager create-secret \
    --name "${PREFIX}/${NAME}" \
    --secret-string "${VALUE}" \
    --region "${REGION}" \
    --query ARN --output text 2>/dev/null \
    || aws secretsmanager describe-secret \
         --secret-id "${PREFIX}/${NAME}" \
         --region "${REGION}" \
         --query ARN --output text)
  echo "${ARN}"
}

echo "==> Creating Secrets Manager secrets in region: ${REGION}"
echo ""

# A real JWT secret is generated immediately — no reason to leave this one as CHANGE_ME.
JWT_SECRET=$(openssl rand -base64 48)

create_secret "jwt-secret"    "${JWT_SECRET}"
create_secret "db-password"   "CHANGE_ME_postgres_password"

echo ""
echo "✓ Secrets created in ${REGION}."
echo ""
echo "Update the DB password with the real value before deploying:"
echo "  aws secretsmanager update-secret --region ${REGION} \\"
echo "    --secret-id ${PREFIX}/db-password --secret-string '<your-postgres-password>'"
echo ""
echo "The JWT secret is already a real random value — no update needed. To rotate it later:"
echo "  aws secretsmanager update-secret --region ${REGION} \\"
echo "    --secret-id ${PREFIX}/jwt-secret --secret-string \"\$(openssl rand -base64 48)\""
echo ""
echo "Next: run ./deploy/aws/deploy.sh — it resolves both ARNs automatically and writes"
echo "a ready-to-use deploy/aws/apprunner.generated.json (git-ignored)."
