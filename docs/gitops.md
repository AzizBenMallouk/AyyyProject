# GitOps Documentation

We follow the GitOps philosophy using ArgoCD to maintain the desired state of the cluster.

## Kustomize Structure
Manifests are located in the `gitops/` directory:
- `base/`: Common Kubernetes resources (Deployments, Services, etc.).
- `overlays/prod/`: Environment-specific overrides (image tags, replicas).

## Workflow
1. Developers push code to `main`.
2. CI pipeline builds and pushes new images to ECR.
3. CI pipeline updates `gitops/overlays/prod/kustomization.yaml` with the new image tag.
4. ArgoCD detects the change in the repository and synchronizes the cluster.
