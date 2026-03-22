# kube-prometheus-stack
resource "helm_release" "prometheus_stack" {
  name       = "prometheus-stack"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = "monitoring"
  version    = "58.3.1"

  create_namespace = true
  timeout          = 600
  wait             = true

  # Disable components we don't need to save resources on t4g.small nodes
  set {
    name  = "alertmanager.enabled"
    value = "true"
  }

  set {
    name  = "grafana.enabled"
    value = "true"
  }

  # Expose Grafana via LoadBalancer (internal)
  set {
    name  = "grafana.service.type"
    value = "LoadBalancer"
  }

  set {
    name  = "grafana.service.annotations.service\\.beta\\.kubernetes\\.io/aws-load-balancer-type"
    value = "external"
  }

  set {
    name  = "grafana.service.annotations.service\\.beta\\.kubernetes\\.io/aws-load-balancer-scheme"
    value = "internet-facing"
  }

  set {
    name  = "grafana.service.annotations.service\\.beta\\.kubernetes\\.io/aws-load-balancer-nlb-target-type"
    value = "ip"
  }

  # Enable ServiceMonitor discovery across all namespaces
  set {
    name  = "prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues"
    value = "false"
  }

  set {
    name  = "prometheus.prometheusSpec.podMonitorSelectorNilUsesHelmValues"
    value = "false"
  }

  # Resource limits for t4g.small constraints
  set {
    name  = "prometheus.prometheusSpec.resources.requests.memory"
    value = "256Mi"
  }

  set {
    name  = "prometheus.prometheusSpec.resources.limits.memory"
    value = "512Mi"
  }

  set {
    name  = "prometheus.prometheusSpec.resources.requests.cpu"
    value = "100m"
  }

  set {
    name  = "prometheus.prometheusSpec.resources.limits.cpu"
    value = "300m"
  }

  # Reduce retention for low-cost storage
  set {
    name  = "prometheus.prometheusSpec.retention"
    value = "7d"
  }

  depends_on = [helm_release.aws_lb_controller]
}
