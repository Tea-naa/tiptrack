# TipTrack Kubernetes Deployment Guide

## 📋 Prerequisites

### Install Required Software
```bash
# 1. Docker Desktop (must be running!)
# Download from: https://www.docker.com/products/docker-desktop

# 2. Minikube
brew install minikube

# 3. kubectl
brew install kubectl

# 4. Verify installations
docker --version
minikube version
kubectl version --client
```

### Install Project Dependencies

**Backend:**
```bash
cd ~/tiptrack/backend
npm install
# ⚠️ IMPORTANT: Make sure 'cors' is installed
npm install cors
```

**Frontend:**
```bash
cd ~/tiptrack/frontend
npm install
```

---

## 🚀 Deployment Steps

### Step 1: Start Minikube

```bash
# macOS Apple Silicon (M1/M2/M3)
minikube start --cpus=4 --memory=4096 --driver=docker

# Verify it's running
minikube status
```

**Expected output:**
```
minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
```

---

### Step 2: Build Docker Images

**CRITICAL:** Build images in Minikube's Docker daemon (not your laptop's)!

```bash
# Point terminal to Minikube's Docker
eval $(minikube docker-env)

# Build backend
cd ~/tiptrack/backend
docker build -t tiptrack-backend:latest .

# Build frontend  
cd ~/tiptrack/frontend
docker build -t tiptrack-frontend:latest .

# Verify images exist
cd ~/tiptrack
docker images | grep tiptrack
```

**Expected output:**
```
tiptrack-backend   latest   abc123   2 minutes ago   XXX MB
tiptrack-frontend  latest   xyz789   1 minute ago   XXX MB
```

---

### Step 3: Create Environment Files

**Backend .env** (`~/tiptrack/backend/.env`):
```env
MONGODB_URI=mongodb://mongodb-service:27017/tiptrack
PORT=5000
```

**Frontend .env** (`~/tiptrack/frontend/.env`):
```env
VITE_API_URL=http://127.0.0.1:PORT_NUMBER/api/shifts
```

**⚠️ IMPORTANT:** You'll update the frontend `.env` with the actual port number in Step 5!

---

### Step 4: Deploy to Kubernetes

```bash
cd ~/tiptrack

# Deploy all resources
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/mongodb/
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/

# Wait for pods to start
kubectl get pods -n tiptrack -w
```

**Wait until all pods show:**
- `STATUS: Running`
- `READY: 1/1`

Press `Ctrl+C` when done.

---

### Step 5: Access the Application (3-Terminal Setup)

**⚠️ CRITICAL SETUP:** Minikube tunnels require **3 separate terminals** to stay open!

#### Terminal 1: Backend Tunnel (KEEP RUNNING!)

```bash
minikube service backend-service -n tiptrack
```

**You'll see output like:**
```
🏃  Starting tunnel for service backend-service.
│ NAMESPACE │      NAME       │ TARGET PORT │          URL           │
│ tiptrack  │ backend-service │             │ http://127.0.0.1:61184 │
```

**📝 COPY THIS PORT NUMBER!** (Example: 61184)

**❌ DO NOT CLOSE THIS TERMINAL!** The tunnel must stay running.

---

#### Terminal 2: Update Frontend & Rebuild

**Open a NEW terminal and run:**

```bash
# 1. Update frontend .env with the backend port from Terminal 1
cat > ~/tiptrack/frontend/.env << 'EOF'
VITE_API_URL=http://127.0.0.1:61184/api/shifts
EOF
# ⚠️ Replace 61184 with YOUR port number from Terminal 1!

# 2. Point to Minikube Docker
eval $(minikube docker-env)

# 3. Rebuild frontend with new URL
cd ~/tiptrack/frontend
docker build -t tiptrack-frontend:latest .

# 4. Restart frontend pods
kubectl rollout restart deployment/frontend -n tiptrack

# 5. Wait for new pods
kubectl get pods -n tiptrack -w
# Press Ctrl+C when new frontend pods are Running
```

---

#### Terminal 3: Frontend Tunnel (KEEP RUNNING!)

**Open a NEW terminal and run:**

```bash
minikube service frontend-service -n tiptrack
```

**This will:**
- Create a tunnel to your frontend
- Open your browser automatically
- Show you the URL (e.g., `http://127.0.0.1:55508`)

**❌ DO NOT CLOSE THIS TERMINAL!** The tunnel must stay running.

---

## ✅ Verify It's Working

**In your browser:**
1. Dashboard loads without errors ✅
2. Console shows NO red errors ✅
3. Try adding a shift - it should save ✅

**If you see errors, check the Troubleshooting section below!**

---

## 🔄 Daily Usage

**Every time you want to use TipTrack:**

1. **Start Minikube** (if not running):
   ```bash
   minikube start
   ```

2. **Open 2 terminals for tunnels:**
   
   **Terminal 1 (Backend):**
   ```bash
   minikube service backend-service -n tiptrack
   ```
   
   **Terminal 2 (Frontend):**
   ```bash
   minikube service frontend-service -n tiptrack
   ```

3. **Keep both terminals open while using the app!**

---

## 🐛 Troubleshooting

### Error: "Access to XMLHttpRequest blocked by CORS"

**Problem:** Frontend can't reach backend

**Solution:**
1. Make sure Terminal 1 (backend tunnel) is running
2. Check the backend port number in Terminal 1
3. Update `frontend/.env` with the correct port
4. Rebuild frontend and restart:
   ```bash
   eval $(minikube docker-env)
   cd ~/tiptrack/frontend
   docker build -t tiptrack-frontend:latest .
   kubectl rollout restart deployment/frontend -n tiptrack
   ```

---

### Error: "net::ERR_NAME_NOT_RESOLVED" for backend-service

**Problem:** Frontend `.env` is set to `backend-service` instead of `127.0.0.1:PORT`

**Solution:**
Update `frontend/.env` to use the tunnel URL:
```env
VITE_API_URL=http://127.0.0.1:61184/api/shifts
```
(Use YOUR port number from the backend tunnel)

Then rebuild frontend (see above).

---

### Pods Not Starting

**Check pod status:**
```bash
kubectl get pods -n tiptrack
kubectl describe pod <pod-name> -n tiptrack
kubectl logs <pod-name> -n tiptrack
```

**Common fixes:**
- **ImagePullBackOff:** Rebuild images in Minikube Docker (`eval $(minikube docker-env)`)
- **CrashLoopBackOff:** Check logs for errors
- **Pending:** Not enough resources - increase Minikube memory

---

### MongoDB Connection Issues

**Check if MongoDB is running:**
```bash
kubectl get pods -n tiptrack | grep mongodb
kubectl logs <mongodb-pod-name> -n tiptrack
```

**Verify service exists:**
```bash
kubectl get svc -n tiptrack | grep mongodb
```

---

## 🧹 Cleanup

**Delete everything:**
```bash
kubectl delete namespace tiptrack
```

**Stop Minikube:**
```bash
minikube stop
```

**Delete Minikube cluster:**
```bash
minikube delete
```

---

## 📊 Useful Commands

```bash
# View all resources
kubectl get all -n tiptrack

# Check pod logs
kubectl logs <pod-name> -n tiptrack

# Get shell in a pod
kubectl exec -it <pod-name> -n tiptrack -- /bin/sh

# Scale deployment
kubectl scale deployment backend -n tiptrack --replicas=3

# Check services
kubectl get svc -n tiptrack

# Watch pods in real-time
kubectl get pods -n tiptrack -w
```

---

## 🎯 Why 3 Terminals?

**Minikube runs in Docker**, which is isolated from your laptop's network. To access services:

1. **Minikube creates tunnels** that forward traffic from your laptop to Kubernetes
2. **Each tunnel needs its own terminal** to stay active
3. **Terminal 1 (Backend):** Exposes backend at `127.0.0.1:PORT`
4. **Terminal 3 (Frontend):** Exposes frontend at `127.0.0.1:PORT`

**If you close a tunnel terminal, that service becomes unreachable!**

---

## 🎤 Interview Talking Points

**Question:** "Why do you need 3 terminals?"

**Answer:** 
> "Minikube runs in a Docker container, isolated from the host network. To access services locally, I use Minikube tunnels that forward traffic from my laptop to the cluster. Each tunnel requires an active terminal session. In production with a real cluster, you'd use an Ingress controller or LoadBalancer with a real domain, eliminating the need for tunnels."

**Question:** "How would you deploy this in production?"

**Answer:**
> "In production, I'd use an Ingress controller (like nginx-ingress) with a real domain name. Both frontend and backend would be accessible through the same domain with different paths (e.g., example.com and api.example.com). I'd also add TLS certificates, use managed databases, implement proper secrets management, and set up CI/CD pipelines."

---

## ✅ Success Checklist

- [ ] All pods showing `Running` and `1/1 Ready`
- [ ] Backend tunnel active in Terminal 1
- [ ] Frontend tunnel active in Terminal 3  
- [ ] Frontend loads in browser without console errors
- [ ] Can add/edit/delete shifts
- [ ] Data persists after closing browser
- [ ] Health checks passing

**You're running Kubernetes! 🎉**