# Kubernetes & Application Documentation

The application is deployed as a set of microservices on AWS EKS.

## Frontend
- **Type**: Argo Rollout
- **Service**: LoadBalancer (Exposed via ALB)
- **Image**: `app-frontend-prod`

## Backend
- **Type**: Argo Rollout
- **Service**: ClusterIP
- **Database**: MySQL (deployed within the cluster)
- **Image**: `app-backend-prod`

## Deployment Strategy
We use **Argo Rollouts** for Progressive Delivery. The CI pipeline initiates a rollout, which requires manual or automated promotion after verification.
