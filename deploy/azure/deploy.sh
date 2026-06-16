#!/usr/bin/env bash
# ============================================================================
# DevHub backend → Azure Container Apps (quick path, from a working checkout)
# ----------------------------------------------------------------------------
# `az containerapp up --source` builds backend/Dockerfile in the cloud (ACR
# Tasks — no local Docker needed) and deploys it in one command. Great for a
# first deploy; for repeatable infra use containerapp.bicep instead.
#
# Prereqs:  az CLI (`az login`) + the containerapp extension
#           (az extension add --name containerapp)
# Set these env vars before running (or edit the defaults):
#   DATABASE_URL DATABASE_USERNAME DATABASE_PASSWORD JWT_SECRET CORS_ALLOWED_ORIGINS
# Usage:    ./deploy/azure/deploy.sh
# ============================================================================
set -euo pipefail

RG="${RG:-devhub-rg}"
LOCATION="${LOCATION:-eastus}"
APP="${APP:-devhub-backend}"

: "${DATABASE_URL:?set DATABASE_URL=jdbc:postgresql://host:5432/db}"
: "${DATABASE_USERNAME:?set DATABASE_USERNAME}"
: "${DATABASE_PASSWORD:?set DATABASE_PASSWORD}"
: "${JWT_SECRET:?set JWT_SECRET (32+ chars)}"
: "${CORS_ALLOWED_ORIGINS:?set CORS_ALLOWED_ORIGINS=https://<you>.github.io}"

echo "▶ Resource group ${RG} (${LOCATION})…"
az group create -n "$RG" -l "$LOCATION" -o none

echo "▶ Building from ./backend and deploying to Container Apps '${APP}'…"
az containerapp up \
  --name "$APP" \
  --resource-group "$RG" \
  --location "$LOCATION" \
  --source ./backend \
  --ingress external \
  --target-port 8080 \
  --env-vars \
    SPRING_PROFILES_ACTIVE=prod \
    EXEC_ENABLED=false \
    CORS_ALLOWED_ORIGINS="$CORS_ALLOWED_ORIGINS" \
    DATABASE_URL="$DATABASE_URL" \
    DATABASE_USERNAME="$DATABASE_USERNAME" \
    DATABASE_PASSWORD="$DATABASE_PASSWORD" \
    JWT_SECRET="$JWT_SECRET"

echo
echo "✓ Deployed. Public URL:"
az containerapp show -n "$APP" -g "$RG" --query properties.configuration.ingress.fqdn -o tsv \
  | sed 's#^#  https://#'
echo "  Put that URL in frontend/config.js (window.DEVHUB_API_BASE)."
echo "  Tip: promote the plaintext env-vars above to Container App secrets for real use."
