#!/usr/bin/env bash
set -e  # Exit immediately if any command fails

# ============================================
# 🚀 COMPLETE INGRESS + TLS AUTOMATION SCRIPT
# ============================================
# This script will:
# 1. Deploy NGINX Ingress Controller with UpCloud optimizations
# 2. Install Cert-Manager for automatic TLS certificates
# 3. Configure a test Let's Encrypt issuer
# ============================================

# =====================
# NGINX Ingress Setup
# =====================
echo "🚀 Deploying NGINX Ingress Controller for UpCloud..."

helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

helm upgrade --install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.publishService.enabled=true \
  --set controller.service.type=LoadBalancer \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/upcloud-loadbalancer-vip"="true" \
  --set controller.config.use-forwarded-headers="true"

echo -e "\n🔍 Checking Ingress Service (Ctrl+C to exit watch mode)..."
kubectl get svc nginx-ingress-ingress-nginx-controller -n ingress-nginx -w

# =====================
# Cert-Manager Setup
# =====================
echo -e "\n🔐 Installing Cert-Manager for automated TLS certificates..."

# Install CRDs first
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.crds.yaml

# Create namespace if not exists
kubectl create namespace cert-manager || true

helm upgrade --install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --version v1.13.2 \
  --set installCRDs=true \
  --set prometheus.enabled=false

# =====================
# Test Configuration
# =====================
echo -e "\n🧪 Creating Let's Encrypt Staging Issuer (safe for testing)..."
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: admin@example.com  # ➔ Replace with your email
    privateKeySecretRef:
      name: letsencrypt-staging
    solvers:
    - http01:
        ingress:
          class: nginx
EOF

# =====================
# Verification & Next Steps
# =====================
echo -e "\n✅ Verification Commands:"
echo "1. Check Ingress pods:"
echo "   kubectl get pods -n ingress-nginx"
echo "2. Check Cert-Manager:"
echo "   kubectl get pods -n cert-manager"
echo "3. Monitor certificate issuance:"
echo "   kubectl get certificates -w"

echo -e "\n🎉 Setup Complete! Next Steps:"
echo "1. Get your LoadBalancer IP:"
echo "   kubectl get svc -n ingress-nginx"
echo "2. Update DNS A records to point to this IP"
echo "3. Deploy your application with an Ingress resource"
echo "4. For production, replace letsencrypt-staging with letsencrypt-prod"