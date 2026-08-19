#!/bin/bash
# Setup Workload Identity Federation for GitHub Actions
# Replace with your actual Project ID and GitHub Repo
export PROJECT_ID="crisisops-1783794010"
export REPO="thangak18/MatchFlow-AI"
export POOL_NAME="github-actions-pool"
export PROVIDER_NAME="github-actions-provider"
export SERVICE_ACCOUNT="github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com"

# 1. Set the project
gcloud config set project $PROJECT_ID

# 2. Enable necessary APIs
gcloud services enable iamcredentials.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# 3. Create a Service Account for GitHub Actions
gcloud iam service-accounts create github-actions-deployer \
    --display-name="Service Account for GitHub Actions Deployments"

# 4. Grant permissions to the Service Account to deploy to Cloud Run and use Cloud Build
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/storage.admin"

# 5. Create a Workload Identity Pool
gcloud iam workload-identity-pools create $POOL_NAME \
    --location="global" \
    --display-name="GitHub Actions Pool"

# Get the Pool ID
export WORKLOAD_IDENTITY_POOL_ID=$(gcloud iam workload-identity-pools describe $POOL_NAME \
    --location="global" \
    --format="value(name)")

# 6. Create a Workload Identity Provider in that pool for GitHub
gcloud iam workload-identity-pools providers create-oidc $PROVIDER_NAME \
    --location="global" \
    --workload-identity-pool=$POOL_NAME \
    --display-name="GitHub Actions Provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
    --attribute-condition="assertion.repository == '${REPO}'" \
    --issuer-uri="https://token.actions.githubusercontent.com"

# 7. Allow authentications from the Workload Identity Provider to impersonate the Service Account
gcloud iam service-accounts add-iam-policy-binding $SERVICE_ACCOUNT \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/${WORKLOAD_IDENTITY_POOL_ID}/attribute.repository/${REPO}"

# 8. Print out the values needed for GitHub Actions
echo "--------------------------------------------------------"
echo "✅ Setup Complete!"
echo "Please add the following values as Repository Secrets in GitHub (Settings > Secrets and variables > Actions > New repository secret):"
echo ""
echo "1. Secret Name: GCP_WORKLOAD_IDENTITY_PROVIDER"
echo "   Secret Value: $(gcloud iam workload-identity-pools providers describe $PROVIDER_NAME --location=global --workload-identity-pool=$POOL_NAME --format='value(name)')"
echo ""
echo "2. Secret Name: GCP_SERVICE_ACCOUNT"
echo "   Secret Value: ${SERVICE_ACCOUNT}"
echo "--------------------------------------------------------"
