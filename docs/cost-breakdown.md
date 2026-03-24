# YouCode — AWS Cost Breakdown

> Region: `us-east-1` | Pricing as of March 2025 | All prices in USD

---

## Monthly Cost Summary

| Layer | Service | Est. Monthly Cost |
|---|---|---|
| Compute | EKS Control Plane | $73.00 |
| Compute | EC2 Workers (3× t4g.small) | $37.08 |
| Networking | NAT Gateway | $34.56 |
| Networking | Application Load Balancer | ~$18.00 |
| Networking | Network Load Balancers (×3) | ~$48.60 |
| Storage | ECR (images) | ~$2.00 |
| Storage | S3 (uploads bucket) | ~$1.00 |
| Serverless | Lambda | ~$0.00 (free tier) |
| Serverless | SQS | ~$0.00 (free tier) |
| Serverless | SNS | ~$0.00 (free tier) |
| Secrets | Secrets Manager (×2) | $0.80 |
| Observability | CloudWatch Logs | ~$2.00 |
| **Total** | | **~$217/month** |

---

## Detailed Breakdown

### 1. EKS Control Plane
- **Cost**: $0.10/hour × 730h = **$73.00/month**
- Flat fee regardless of cluster size
- Biggest fixed cost in the stack

### 2. EC2 Worker Nodes — 3× `t4g.small` (ARM64 Graviton)
| | |
|---|---|
| On-Demand price | $0.0168/hr per instance |
| 3 nodes × 730h | **$36.79/month** |
| EBS root volumes (20GB × 3, gp2) | ~$6.00/month |
| **Worker subtotal** | **~$42.79/month** |

> 💡 **Savings opportunity**: Switch to Spot instances for non-prod or worker nodes.
> `t4g.small` Spot price ≈ $0.005/hr (-70%) → **~$11/month** for 3 nodes.

### 3. NAT Gateway
| | |
|---|---|
| Hourly charge | $0.045/hr × 730h = $32.85 |
| Data processing | ~0.045/GB (varies) ≈ $1.71 |
| **NAT subtotal** | **~$34.56/month** |

> ⚠️ Currently using a **single NAT Gateway** (SPOF). Adding HA (3 NATs, one per AZ) would triple this to ~$103/month.

### 4. Load Balancers
#### Application Load Balancer (app-ingress)
| | |
|---|---|
| Base charge | $0.008/hr × 730h = $5.84 |
| LCU usage (est. light traffic) | ~$12.00 |
| **ALB subtotal** | **~$18.00/month** |

#### Network Load Balancers (×3: ArgoCD, Grafana, ArgoCD internal)
| | |
|---|---|
| Base charge | $0.008/hr × 730h × 3 NLBs = $17.52 |
| NLCU usage (est. minimal) | ~$31.08 |
| **NLB subtotal** | **~$48.60/month** |

> 💡 **Savings opportunity**: Use a single ingress controller (NGINX or Traefik) with path-based routing instead of separate NLBs per service. Estimated saving: **$35-40/month**.

### 5. ECR (Container Registry)
| | |
|---|---|
| Storage (2 repos × ~5 images × ~200MB) | ~2GB = $0.10/GB × 2 = **$0.20** |
| Data transfer (pulls within same region) | $0.00 |
| **ECR subtotal** | **~$0.20/month** |

> The lifecycle policy keeping only 10 images per repo keeps this near-zero.

### 6. S3 (Uploads Bucket)
| | |
|---|---|
| Storage (estimate: 10GB) | $0.023/GB × 10 = $0.23 |
| PUT/GET requests | ~$0.50 |
| Data transfer | ~$0.23 |
| **S3 subtotal** | **~$1.00/month** |

### 7. Lambda (Feature Notifier)
| | |
|---|---|
| Invocations | Free tier: 1M/month (likely <100 feature commits/month) |
| Duration (est. 5s × 256MB × 100 invocations) | Free tier: 400,000 GB-seconds |
| **Lambda subtotal** | **$0.00/month** |

### 8. SQS (Feature Announcements Queue)
| | |
|---|---|
| Free tier | 1M requests/month |
| Expected usage | <1,000/month |
| **SQS subtotal** | **$0.00/month** |

### 9. SNS (Email Notifications)
| | |
|---|---|
| Free tier | 1,000 email deliveries/month |
| Expected usage | <1,000/month |
| **SNS subtotal** | **$0.00/month** |

### 10. Secrets Manager
| | |
|---|---|
| HuggingFace token (1 secret) | $0.40/month |
| API call pricing | <10,000/month = $0.00 |
| **Secrets Manager subtotal** | **$0.40/month** |

### 11. CloudWatch Logs
| | |
|---|---|
| Lambda logs (14-day retention) | ~$0.50 |
| EKS control plane logs (if enabled) | ~$1.50 |
| **CloudWatch subtotal** | **~$2.00/month** |

---

## Cost Optimization Roadmap

### Quick Wins (implement now)

| Action | Monthly Saving | Effort |
|---|---|---|
| Use Spot instances for worker nodes | ~$25 | Low |
| Replace 3 NLBs with single NGINX ingress | ~$37 | Medium |
| Reduce node count to 2 during off-hours (KEDA/scheduled scaling) | ~$12 | Medium |
| **Total quick wins** | **~$74/month** | |

### Architecture-level savings

| Action | Monthly Saving | Effort |
|---|---|---|
| Move to Fargate for small workloads (no EC2 to manage) | Varies | High |
| Use EKS Auto Mode (node lifecycle managed by AWS) | ~$10 | Low |
| Reserved Instances for EC2 (1-year, no upfront) | ~$12 (-35%) | Low |
| Use single NAT if HA not required in prod | $0 (already single) | — |

---

## Cost by Phase (as you scaled)

| Phase | What was added | Incremental cost |
|---|---|---|
| Baseline (EKS + network) | VPC, NAT, EKS, 3 nodes | ~$185/month |
| +GitOps add-ons | ArgoCD NLB, ALB controller | +$18/month |
| +Monitoring | Grafana NLB, Prometheus pods | +$16/month |
| +Notifications | Lambda, SQS, SNS, Secrets Manager | +$0.40/month |
| **Current total** | | **~$217/month** |

---

## Free Tier Eligibility

If this is a **new AWS account** (< 12 months old):

| Service | Free Tier |
|---|---|
| EC2 t2.micro/t3.micro | 750h/month (not t4g.small — not eligible) |
| S3 | 5GB storage, 20K GET, 2K PUT |
| Lambda | Always-free 1M requests |
| SQS | Always-free 1M requests |
| SNS | Always-free 1K emails |
| CloudWatch | 10 custom metrics, 5GB logs |

> ⚠️ **EKS and NAT Gateway are NOT free tier eligible** — they will always incur cost.

---

## Infracost (Automated Tracking)

To get real-time cost estimates in your CI/CD pipeline, add [Infracost](https://www.infracost.io/):

```bash
# Install
brew install infracost
infracost auth login

# Run against your Terraform
infracost breakdown \
  --path terraform/environments/prod/02-cluster \
  --terraform-var-file terraform.tfvars

# Add to GitHub Actions — posts cost diff as PR comment
```
