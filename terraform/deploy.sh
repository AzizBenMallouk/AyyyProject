#!/usr/bin/env bash
###############################################################################
# deploy.sh — Terraform helper script
# Usage: ./terraform/deploy.sh <env> <action> [extra tf args]
#   env:    prod | dev
#   action: init | plan | apply | destroy | validate | fmt
#
# Examples:
#   ./terraform/deploy.sh prod init
#   ./terraform/deploy.sh prod plan
#   ./terraform/deploy.sh prod apply
#   ./terraform/deploy.sh prod apply -target=module.vpc
###############################################################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Args ──────────────────────────────────────────────────────────────────────

ENV="${1:-}"
ACTION="${2:-}"
shift 2 || true
EXTRA_ARGS=("$@")

if [[ -z "$ENV" || -z "$ACTION" ]]; then
  echo "Usage: $0 <env> <action> [extra args]"
  echo "  env:    prod | dev"
  echo "  action: init | plan | apply | destroy | validate | fmt | output"
  exit 1
fi

ENV_DIR="${SCRIPT_DIR}/environments/${ENV}"

if [[ ! -d "$ENV_DIR" ]]; then
  echo "❌ Environment directory not found: $ENV_DIR"
  exit 1
fi

# ── Colors ────────────────────────────────────────────────────────────────────

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
RESET='\033[0m'

log() { echo -e "${GREEN}▶ $*${RESET}"; }
warn() { echo -e "${YELLOW}⚠ $*${RESET}"; }
error() { echo -e "${RED}✖ $*${RESET}"; exit 1; }

# ── Execute ───────────────────────────────────────────────────────────────────

log "Environment : $ENV"
log "Action      : $ACTION"
log "Directory   : $ENV_DIR"
echo ""

cd "$ENV_DIR"

case "$ACTION" in
  init)
    log "Initialising Terraform..."
    terraform init "${EXTRA_ARGS[@]}"
    ;;

  validate)
    log "Validating configuration..."
    terraform init -backend=false -reconfigure
    terraform validate
    ;;

  fmt)
    log "Formatting all .tf files..."
    terraform fmt -recursive "$SCRIPT_DIR"
    ;;

  plan)
    log "Planning changes..."
    terraform plan \
      -var-file="terraform.tfvars" \
      -out="${ENV}.tfplan" \
      "${EXTRA_ARGS[@]}"
    echo ""
    log "Plan saved to ${ENV}.tfplan — run 'apply' to execute."
    ;;

  apply)
    if [[ -f "${ENV}.tfplan" ]]; then
      warn "Applying saved plan: ${ENV}.tfplan"
      terraform apply "${ENV}.tfplan"
      rm -f "${ENV}.tfplan"
    else
      warn "No saved plan found. Running plan + apply..."
      terraform apply \
        -var-file="terraform.tfvars" \
        -auto-approve \
        "${EXTRA_ARGS[@]}"
    fi
    ;;

  destroy)
    warn "⚠️  This will DESTROY all resources in: $ENV"
    read -r -p "Type 'yes' to confirm: " confirm
    if [[ "$confirm" == "yes" ]]; then
      terraform destroy \
        -var-file="terraform.tfvars" \
        -auto-approve \
        "${EXTRA_ARGS[@]}"
    else
      echo "Aborted."
      exit 0
    fi
    ;;

  output)
    terraform output "${EXTRA_ARGS[@]}"
    ;;

  *)
    error "Unknown action: $ACTION. Valid: init | plan | apply | destroy | validate | fmt | output"
    ;;
esac
