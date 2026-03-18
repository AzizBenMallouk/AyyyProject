# CI/CD Pipeline Documentation

Automated workflows are managed via GitHub Actions.

## Deploy Workflow (`.github/workflows/deploy.yml`)
1. **Build and Push**:
    - Triggers on push to `main`.
    - Builds ARM64 Docker images for Frontend and Backend.
    - Pushes images to Amazon ECR.
2. **Deploy**:
    - Updates image tags in `gitops/overlays/prod/kustomization.yaml`.
    - Commits and pushes changes back to the repository.
3. **Promote**:
    - Installs Argo Rollouts CLI.
    - Executes `kubectl argo rollouts promote` for both services.

## Secrets Required
- `AWS_ROLE_ARN`
- `AWS_REGION`
- `CLUSTER_NAME`
