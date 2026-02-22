# Actions Runner Controller (ARC) Setup on EKS

To use EKS as a GitHub Actions runner, we recommend using the Actions Runner Controller (ARC).

## 1. Prerequisites
- Helm installed.
- EKS cluster with `cert-manager` installed.

## 2. Install ARC
```bash
# Add ARC repo
helm repo add actions-runner-controller https://actions-runner-controller.github.io/actions-runner-controller
helm repo update

# Install ARC
helm upgrade --install --namespace actions-runner-system --create-namespace \
  actions-runner-controller actions-runner-controller/actions-runner-controller
```

## 3. Authentication
Generate a Personal Access Token (PAT) with `repo` scope and create a secret:
```bash
kubectl create secret generic controller-manager \
    -n actions-runner-system \
    --from-literal=github_token=<YOUR_GITHUB_TOKEN>
```

## 4. Deploy Runners
Create a `RunnerDeployment` manifest:
```yaml
apiVersion: actions.summerwind.dev/v1alpha1
kind: RunnerDeployment
metadata:
  name: youcode-runner
  namespace: actions-runner-system
spec:
  replicas: 2
  template:
    spec:
      repository: <YOUR_REPO_URL>
```

## 5. Usage in Workflows
Update your workflows to use:
```yaml
runs-on: self-hosted
```
OR if using a custom label:
```yaml
runs-on: [self-hosted, linux, x64]
```
