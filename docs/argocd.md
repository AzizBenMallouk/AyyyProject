# ArgoCD Documentation

ArgoCD is the continuous delivery tool that reconciles the state defined in Git with the EKS cluster.

## Application Resource
The ArgoCD application manifest is located at `gitops/argocd/application.yaml`. It points to the `gitops/overlays/prod` directory.

## Monitoring Sync
- Use the ArgoCD UI to track synchronization status.
- **Auto-Sync**: Generally enabled for automated propagation.
- **Pruning**: Enabled to remove orphaned resources.

## Rollouts Integration
ArgoCD manages the `Rollout` resources. Use `kubectl argo rollouts get rollout <name>` to monitor the progress of a deployment.
