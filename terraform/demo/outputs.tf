output "nginx_alb_dns" {
  description = "ALB DNS name for the nginx demo — open in browser or curl"
  value       = try(kubernetes_ingress_v1.nginx.status[0].load_balancer[0].ingress[0].hostname, "ALB not yet provisioned")
}
