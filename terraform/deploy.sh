#!/usr/bin/env bash
# deploy.sh — Two-phase Terraform apply for EKS + K8s resources
# Phase 1: infra/ (VPC, EKS, IAM, ECR) — aws provider only, no bootstrap problem
# Phase 2: k8s/  (Helm chart + K8s resources) — reads cluster info from infra state
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "══════════════════════════════════════════"
echo "  Phase 1 — AWS Infrastructure (infra/)"
echo "══════════════════════════════════════════"
cd "$SCRIPT_DIR/infra"
terraform init
terraform apply -auto-approve

echo ""
echo "══════════════════════════════════════════"
echo "  Phase 2 — Kubernetes resources (k8s/)"
echo "══════════════════════════════════════════"
cd "$SCRIPT_DIR/k8s"
terraform init
terraform apply -auto-approve

echo ""
echo "✅ Done!"
