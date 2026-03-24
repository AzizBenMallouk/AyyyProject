# ArgoCD Application — applied via kubectl to avoid Helm CRD marshaling issues

resource "null_resource" "youcode_app" {
  # Re-apply if ArgoCD itself is recreated or the manifest changes
  triggers = {
    argocd_release_id = helm_release.argocd.id
    manifest_hash     = filesha256("${path.root}/../../../../gitops/argocd/application.yaml")
  }

  provisioner "local-exec" {
    command = <<-EOT
      aws eks update-kubeconfig \
        --name ${data.terraform_remote_state.cluster.outputs.cluster_name} \
        --region ${var.region} \
        --alias prod-eks-cluster

      kubectl apply -f ${path.root}/../../../../gitops/argocd/application.yaml
    EOT
  }

  depends_on = [helm_release.argocd]
}
