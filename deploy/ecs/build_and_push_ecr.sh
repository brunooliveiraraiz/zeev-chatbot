#!/usr/bin/env bash
set -euo pipefail

# Required: AWS_ACCOUNT_ID
# Optional (with defaults):
#   AWS_REGION=sa-east-1
#   API_REPO=zeev-chatbot-api
#   WIDGET_REPO=zeev-chatbot-widget
#   IMAGE_TAG=v2

AWS_REGION="${AWS_REGION:-sa-east-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:?AWS_ACCOUNT_ID is required}"
API_REPO="${API_REPO:-zeev-chatbot-api}"
WIDGET_REPO="${WIDGET_REPO:-zeev-chatbot-widget}"
IMAGE_TAG="${IMAGE_TAG:-v2}"

ECR="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo "Logging into ECR ${ECR}"
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${ECR}"

echo "Building API image"
docker build -f apps/api/Dockerfile -t "${API_REPO}:${IMAGE_TAG}" .
docker tag "${API_REPO}:${IMAGE_TAG}" "${ECR}/${API_REPO}:${IMAGE_TAG}"

echo "Building Widget image"
docker build -f apps/widget/Dockerfile -t "${WIDGET_REPO}:${IMAGE_TAG}" .
docker tag "${WIDGET_REPO}:${IMAGE_TAG}" "${ECR}/${WIDGET_REPO}:${IMAGE_TAG}"

echo "Pushing API image"
docker push "${ECR}/${API_REPO}:${IMAGE_TAG}"

echo "Pushing Widget image"
docker push "${ECR}/${WIDGET_REPO}:${IMAGE_TAG}"

echo "Done. Images:"
echo "  ${ECR}/${API_REPO}:${IMAGE_TAG}"
echo "  ${ECR}/${WIDGET_REPO}:${IMAGE_TAG}"
