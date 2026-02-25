variable "project_name" {
  type    = string
  default = "devops-bucketlister"
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "cluster_name" {
  type    = string
  default = "devops-bucketlister-cluster"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}
