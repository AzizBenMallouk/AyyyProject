# Nginx demo — Deployment + ClusterIP Service + ALB Ingress
# Runs in the default namespace (covered by the Fargate profile in infra/)

resource "kubernetes_deployment_v1" "nginx" {
  metadata {
    name      = "nginx"
    namespace = "default"
    labels    = { app = "nginx" }
  }

  spec {
    replicas = 2

    selector {
      match_labels = { app = "nginx" }
    }

    template {
      metadata {
        labels = { app = "nginx" }
      }

      spec {
        container {
          name  = "nginx"
          image = "nginx:1.27-alpine"

          port {
            container_port = 80
          }

          resources {
            requests = { cpu = "100m", memory = "128Mi" }
            limits   = { cpu = "250m", memory = "256Mi" }
          }

          lifecycle {
            post_start {
              exec {
                command = [
                  "/bin/sh", "-c",
                  "echo '<h1>Hello from EKS Fargate + ALB!</h1><p>Cluster: ${local.cluster_name}</p>' > /usr/share/nginx/html/index.html"
                ]
              }
            }
          }
        }
      }
    }
  }

  depends_on = [helm_release.aws_load_balancer_controller]
}

resource "kubernetes_service_v1" "nginx" {
  metadata {
    name      = "nginx"
    namespace = "default"
  }

  spec {
    selector = { app = "nginx" }

    port {
      name        = "http"
      port        = 80
      target_port = 80
      protocol    = "TCP"
    }

    type = "ClusterIP"   # ALB target-type=ip, so NodePort is NOT required
  }

  depends_on = [kubernetes_deployment_v1.nginx]
}

resource "kubernetes_ingress_v1" "nginx" {
  metadata {
    name      = "nginx-ingress"
    namespace = "default"
    annotations = {
      "alb.ingress.kubernetes.io/scheme"           = "internet-facing"
      "alb.ingress.kubernetes.io/target-type"      = "ip"   # required for Fargate
      "alb.ingress.kubernetes.io/listen-ports"     = "[{\"HTTP\": 80}]"
      "alb.ingress.kubernetes.io/healthcheck-path" = "/"
    }
  }

  spec {
    ingress_class_name = "alb"

    rule {
      http {
        path {
          path      = "/"
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service_v1.nginx.metadata[0].name
              port { number = 80 }
            }
          }
        }
      }
    }
  }

  # wait_for_load_balancer = true

  depends_on = [
    kubernetes_service_v1.nginx,
    helm_release.aws_load_balancer_controller,
  ]
}
