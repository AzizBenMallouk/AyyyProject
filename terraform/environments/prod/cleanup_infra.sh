#!/bin/bash

# Configuration
CLUSTER_NAME="prod-eks-cluster"
REGION="us-east-1"
OIDC_PROVIDER_URL="token.actions.githubusercontent.com"

echo "⚠️ Starting cleanup for $CLUSTER_NAME in $REGION..."

# 1. Delete EKS Node Groups
echo "🔍 Checking for Node Groups..."
NODE_GROUPS=$(aws eks list-nodegroups --cluster-name $CLUSTER_NAME --region $REGION --query 'nodegroups' --output text 2>/dev/null)
for ng in $NODE_GROUPS; do
    echo "🗑️ Deleting Node Group: $ng"
    aws eks delete-nodegroup --cluster-name $CLUSTER_NAME --nodegroup-name $ng --region $REGION
done

if [ ! -z "$NODE_GROUPS" ]; then
    echo "⏳ Waiting for Node Groups to be deleted (this can take several minutes)..."
    aws eks wait nodegroup-deleted --cluster-name $CLUSTER_NAME --nodegroup-name $ng --region $REGION 2>/dev/null
fi

# 2. Delete EKS Cluster
echo "🗑️ Deleting EKS Cluster: $CLUSTER_NAME"
aws eks delete-cluster --name $CLUSTER_NAME --region $REGION 2>/dev/null

echo "⏳ Waiting for Cluster to be deleted..."
aws eks wait cluster-deleted --name $CLUSTER_NAME --region $REGION 2>/dev/null

# 3. Delete IAM OIDC Provider
echo "🔍 Checking for OIDC Provider..."
OIDC_ARN=$(aws iam list-open-id-connect-providers --query "OpenIDConnectProviderList[?contains(Arn, '$OIDC_PROVIDER_URL')].Arn" --output text)
if [ ! -z "$OIDC_ARN" ]; then
    echo "🗑️ Deleting OIDC Provider: $OIDC_ARN"
    aws iam delete-open-id-connect-provider --open-id-connect-provider-arn "$OIDC_ARN"
fi

# 4. Delete CloudWatch Log Groups
LOG_GROUP="/aws/eks/$CLUSTER_NAME/cluster"
echo "🗑️ Deleting Log Group: $LOG_GROUP"
aws logs delete-log-group --log-group-name "$LOG_GROUP" 2>/dev/null

# 5. Delete KMS Alias
KMS_ALIAS="alias/eks/$CLUSTER_NAME"
echo "🗑️ Deleting KMS Alias: $KMS_ALIAS"
aws kms delete-alias --alias-name "$KMS_ALIAS" 2>/dev/null

# 6. Delete IAM Roles for Addons
echo "🔍 Checking for Addon IAM Roles..."
ROLES=("${CLUSTER_NAME}-lb-controller" "${CLUSTER_NAME}-backend-s3")
for role in "${ROLES[@]}"; do
    echo "🗑️ Deleting IAM Role: $role"
    # Need to detach policies first
    POLICIES=$(aws iam list-attached-role-policies --role-name "$role" --query 'AttachedPolicies[].PolicyArn' --output text 2>/dev/null)
    for policy in $POLICIES; do
        aws iam detach-role-policy --role-name "$role" --policy-arn "$policy" 2>/dev/null
    done
    aws iam delete-role --role-name "$role" 2>/dev/null
done

# 7. Delete S3 Bucket
S3_BUCKET="${CLUSTER_NAME}-uploads"
echo "🗑️ Deleting S3 Bucket: $S3_BUCKET"
# Force delete objects first
aws s3 rb s3://$S3_BUCKET --force 2>/dev/null

echo "✅ Cleanup script execution finished."
echo "Note: Some resources might still be deleting in the background. Use the AWS console to verify."
