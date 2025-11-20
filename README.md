# TipTrack 💰
<div align="center">
  <img src="screenshot-dashboard.png" width="600" alt="Dashboard">
  <img src="screenshot-overtax.png" width="600" alt="Tax Tracker Over $25K">
  <img src="screenshot-calendar.png" width="600" alt="Calendar View">
  <img src="screenshot-add-shift.png" width="600" alt="Add Shift Form">
  <img src="screenshot-tax.png" width="600" alt="Tax-Free Tracker">
</div>


_Built by a bartender, for bartenders._

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-4EA94B?logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Container-Docker-2496ED?logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Orchestration-Kubernetes-326CE5?logo=kubernetes&logoColor=white)

---

## 📖 What Is TipTrack?

A **full-stack MERN application** that helps service industry workers:
- Track **actual tips vs claimed tips** (for tax purposes)
- Auto-calculate **tax withholding** based on your rate
- Stay under the **$25,000 tax-free threshold** (2024 IRS law)
- View earnings by day, week, month, and year
- **Secure user authentication** with JWT tokens

Built by a bartender — **battle-tested on real shifts**.  
Deployed with **Docker + Kubernetes** to showcase **DevOps/SRE skills**.

---

## 🏗️ Architecture

```
User → Frontend (LoadBalancer)
        ↓
     Backend (ClusterIP) + Auth Routes
        ↓
    MongoDB + PVC (ClusterIP)
```

**Kubernetes Components:**
- **3 Deployments:** Frontend (2 replicas), Backend (2 replicas), MongoDB (1 replica)
- **3 Services:** Frontend (LoadBalancer), Backend (ClusterIP), MongoDB (ClusterIP)
- **1 PVC:** Persistent storage for MongoDB data
- **1 Secret:** JWT secret for token signing
- **Health Probes:** Liveness and readiness checks on backend
- **Self-Healing:** Kubernetes automatically restarts failed pods

---

## 🎯 Key Features

- ✅ **User Authentication** - Secure signup/login with JWT tokens (90-day expiration)
- ✅ **Beautiful Animated UI** - Neon-style login with gradient borders and smooth animations
- ✅ **Password Security** - Bcrypt hashing (10 salt rounds) with show/hide toggle
- ✅ **Add/Edit/Delete Shifts** - Full CRUD operations for shift management
- ✅ **Cash vs Credit Tips** - Separate tracking or total entry modes
- ✅ **Tax Calculator** - Auto-calculates withholding (claimed × rate)
- ✅ **Dashboard Analytics** - Today, week, month, and total earnings stats
- ✅ **Calendar View** - Visual shift history by month
- ✅ **$25K Tax-Free Tracker** - Real-time progress toward tax-free threshold
- ✅ **Persistent Data** - MongoDB with Kubernetes persistent volume
- ✅ **Self-Healing Infrastructure** - Kubernetes auto-restarts failed pods
- ✅ **Health Monitoring** - Liveness and readiness checks

---

## 🛠️ Tech Stack

### Frontend
- React 18 (with Vite for fast builds)
- Axios for API calls with JWT interceptors
- Lucide-React icons (including password visibility toggle)
- Modern animated neon theme UI
- JWT token storage in localStorage
- Responsive design for mobile/desktop

### Backend
- Node.js + Express
- MongoDB + Mongoose ODM
- **bcryptjs** - Password hashing (10 salt rounds)
- **jsonwebtoken** - JWT authentication with 90-day expiration
- CORS enabled for cross-origin requests
- RESTful API design with protected routes

### DevOps & Infrastructure
- **Docker** - Multi-stage builds for optimized images
- **Kubernetes** - Deployments, Services, ConfigMaps, Secrets, PVCs
- **Minikube** - Local Kubernetes cluster for development
- **Nginx** - Production-grade web server for React frontend
- **Health Checks** - Liveness + readiness probes for zero-downtime

---

## 🚀 Quick Start

### Prerequisites

1. **Install required software:**
   ```bash
   # Docker Desktop (must be running)
   # Download: https://www.docker.com/products/docker-desktop
   
   # Minikube
   brew install minikube
   
   # kubectl
   brew install kubectl
   ```

2. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/tiptrack.git
   cd tiptrack
   ```

3. **Install project dependencies:**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

4. **Set up environment variables:**
   
   **Backend** (`backend/.env`):
   ```env
   MONGODB_URI=mongodb://mongodb-service:27017/tiptrack
   PORT=5000
   JWT_SECRET=your-super-secret-key-change-this-in-production
   ```
   
   **Frontend** (`frontend/.env`):
   ```env
   VITE_API_URL=http://localhost:5000/api/shifts
   ```

### Deploy to Kubernetes

```bash
# 1. Start Minikube
minikube start --cpus=4 --memory=4096 --driver=docker

# 2. Build Docker images in Minikube's environment
eval $(minikube docker-env)
cd backend && docker build -t tiptrack-backend:latest .
cd ../frontend && docker build -t tiptrack-frontend:latest .

# 3. Create Kubernetes Secret for JWT
cd ..
kubectl create secret generic backend-secret \
  --from-literal=JWT_SECRET=your-super-secret-key-change-this-in-production \
  -n tiptrack

# 4. Deploy all Kubernetes resources
kubectl apply -f k8s/

# 5. Wait for all pods to be ready
kubectl get pods -n tiptrack -w
# Press Ctrl+C when all pods show "Running" status

# 6. Continue to Daily Usage section below
```

---

## 📄 Daily Usage

**Every time you want to use the app:**

### Step 1: Check Minikube Status
```bash
minikube status
# If stopped, start it:
# minikube start
```

### Step 2: Open 2 Terminal Windows (Keep Both Running!)

**Terminal 1 (Backend API):**
```bash
kubectl port-forward -n tiptrack service/backend-service 5000:5000
```
You should see: `Forwarding from 127.0.0.1:5000 -> 5000`

**Terminal 2 (Frontend UI):**
```bash
kubectl port-forward -n tiptrack service/frontend-service 3000:80
```
You should see: `Forwarding from 127.0.0.1:3000 -> 80`

### Step 3: Open Your Browser
Navigate to:
```
http://localhost:3000
```

**First time using the app?**  
1. Click "Sign Up" on the login screen
2. Create your account with a username and password
3. Start tracking your shifts!

**✅ These ports never change - always use localhost:3000**

**⚠️ Important:** Keep both terminal windows open while using the app. Closing them will disconnect the port forwards.

---

## 🔌 API Endpoints

**Base URL:** `http://localhost:5000`

### Authentication Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Create new user account | No |
| POST | `/api/auth/login` | Login and receive JWT token | No |

### Shift Management Routes
**Base Path:** `/api/shifts`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Backend health check | No |
| GET | `/` | Get all shifts for logged-in user | Yes |
| GET | `/:id` | Get specific shift by ID | Yes |
| POST | `/` | Create new shift | Yes |
| PUT | `/:id` | Update existing shift | Yes |
| DELETE | `/:id` | Delete shift | Yes |
| GET | `/stats/summary` | Get dashboard statistics | Yes |

**Authentication:** Protected routes require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 📁 Project Structure

```
tiptrack/
├── backend/                    # Node.js + Express API
│   ├── models/                # Mongoose schemas
│   │   ├── Shift.js          # Shift data model
│   │   └── User.js           # User authentication model
│   ├── routes/                # API route handlers
│   │   ├── shifts.js         # Shift CRUD operations
│   │   └── auth.js           # Login/signup endpoints
│   ├── server.js              # Main Express server
│   ├── Dockerfile             # Backend container image
│   └── .env                   # Backend environment variables
├── frontend/                   # React + Vite application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Login.jsx    # Animated login component
│   │   │   ├── Dashboard.jsx # Main dashboard view
│   │   │   ├── ShiftCalendar.jsx # Calendar view
│   │   │   └── AddShiftForm.jsx  # Add/edit shift modal
│   │   ├── services/         # API client layer
│   │   │   └── api.js       # Axios + JWT configuration
│   │   ├── styles/           # CSS styling
│   │   └── App.jsx           # Root component
│   ├── Dockerfile            # Frontend container image
│   ├── nginx.conf            # Nginx web server config
│   ├── vite.config.js        # Vite build configuration
│   └── .env                  # Frontend environment variables
├── k8s/                        # Kubernetes manifests
│   ├── namespace.yaml         # tiptrack namespace
│   ├── mongodb/               # MongoDB deployment & service
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── pvc.yaml          # Persistent volume claim
│   ├── backend/               # Backend deployment & service
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── configmap.yaml
│   └── frontend/              # Frontend deployment & service
│       ├── deployment.yaml
│       └── service.yaml
├── docker-compose.yml          # Alternative Docker Compose setup
└── README.md                   # This file
```

---

## 🔐 Security Features

- ✅ **Password Hashing** - Bcrypt with 10 salt rounds (industry standard)
- ✅ **JWT Authentication** - Tokens expire after 90 days
- ✅ **Secure Token Storage** - localStorage with automatic header injection
- ✅ **CORS Configuration** - Controlled cross-origin access
- ✅ **Kubernetes Secrets** - Sensitive data encrypted at rest
- ✅ **Environment Variables** - No hardcoded credentials
- ✅ **Authorization Middleware** - Protected API routes
- ✅ **Input Validation** - User data sanitization

---

## 📊 Kubernetes Features Demonstrated

- ✅ **Multi-Container Orchestration** - Frontend, Backend, MongoDB in separate pods
- ✅ **Service Discovery** - Internal DNS resolution (mongodb-service, backend-service)
- ✅ **Persistent Storage** - PersistentVolumeClaim for MongoDB data durability
- ✅ **Secrets Management** - JWT secret stored in Kubernetes Secret
- ✅ **ConfigMaps** - Environment configuration separated from code
- ✅ **Health Probes** - Liveness and readiness checks for automatic recovery
- ✅ **Rolling Updates** - Zero-downtime deployments with replica management
- ✅ **High Availability** - Multiple replicas (2 frontend, 2 backend pods)
- ✅ **Self-Healing** - Automatic pod restart on failure
- ✅ **Resource Management** - CPU and memory limits/requests defined

---

## 🧪 Testing & Verification

### Check Cluster Status
```bash
# View all resources in tiptrack namespace
kubectl get all -n tiptrack

# Check pod logs
kubectl logs -n tiptrack deployment/backend
kubectl logs -n tiptrack deployment/frontend

# Describe resources for debugging
kubectl describe pod <pod-name> -n tiptrack
```

### Test Backend Health
```bash
# Health check endpoint
curl http://localhost:5000/health

# Expected response:
# {"status":"OK","message":"TipTrack API is running","timestamp":"..."}
```

### Test Authentication
```bash
# Sign up new user
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"securepass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"securepass123"}'
```

### View Services
```bash
# List all services with their ports
minikube service list -n tiptrack
```

---

## 🛠️ Troubleshooting

### Pods Not Starting

**Symptom:** Pods stuck in `Pending`, `CrashLoopBackOff`, or `Error` state

**Diagnosis:**
```bash
# Check pod status
kubectl get pods -n tiptrack

# View pod events
kubectl describe pod <pod-name> -n tiptrack

# Check logs for errors
kubectl logs <pod-name> -n tiptrack
```

**Common fixes:**
- **ImagePullBackOff:** Rebuild images with `eval $(minikube docker-env)` first
- **CrashLoopBackOff:** Check logs for application errors (missing env vars, connection issues)
- **Pending:** Check if Minikube has enough resources (`minikube start --cpus=4 --memory=4096`)

### Cannot Access Application

**Symptom:** Browser shows "This site can't be reached" or "Connection refused"

**Diagnosis:**
```bash
# Check if port-forward is running
ps aux | grep "port-forward"

# Verify services exist
kubectl get svc -n tiptrack
```

**Fixes:**
1. Ensure **both** port-forward terminals are running
2. Kill any existing port-forwards: `killall kubectl`
3. Restart port-forwards fresh
4. Check if Minikube is running: `minikube status`

### MongoDB Connection Failures

**Symptom:** Backend logs show "MongoDB connection error"

**Diagnosis:**
```bash
# Check MongoDB pod
kubectl get pod -n tiptrack -l app=mongodb

# View MongoDB logs
kubectl logs -n tiptrack deployment/mongodb

# Verify MongoDB service DNS
kubectl get svc mongodb-service -n tiptrack
```

**Fixes:**
- Ensure backend `.env` uses `mongodb://mongodb-service:27017/tiptrack`
- Check if MongoDB pod is running
- Verify PVC is bound: `kubectl get pvc -n tiptrack`

### Images Not Found

**Symptom:** Pods show `ImagePullBackOff` or `ErrImagePull`

**Diagnosis:**
```bash
# Check deployment image configuration
kubectl get deployment -n tiptrack -o yaml | grep image:
```

**Fixes:**
```bash
# CRITICAL: Build in Minikube's Docker environment
eval $(minikube docker-env)

# Rebuild images
cd backend && docker build -t tiptrack-backend:latest .
cd ../frontend && docker build -t tiptrack-frontend:latest .

# Force pod restart
kubectl rollout restart deployment -n tiptrack
```

### Port Forward Disconnects

**Symptom:** Port-forward randomly stops working

**Causes:** Pods restart during deployment updates

**Fix:**
```bash
# Kill existing port-forwards
killall kubectl

# Wait for pods to stabilize
kubectl get pods -n tiptrack -w

# Start fresh port-forwards
kubectl port-forward -n tiptrack service/backend-service 5000:5000
kubectl port-forward -n tiptrack service/frontend-service 3000:80
```

### Full Reset (Nuclear Option)

If nothing else works:
```bash
# Delete everything
kubectl delete namespace tiptrack

# Stop and restart Minikube
minikube stop
minikube delete
minikube start --cpus=4 --memory=4096 --driver=docker

# Redeploy from scratch
eval $(minikube docker-env)
cd backend && docker build -t tiptrack-backend:latest .
cd ../frontend && docker build -t tiptrack-frontend:latest .
cd .. && kubectl apply -f k8s/
```

---

## 🧹 Cleanup

### Stop the Application (Keep Data)
```bash
# Stop port-forwards (Ctrl+C in both terminals)

# Stop Minikube (keeps cluster data)
minikube stop
```

### Delete Everything
```bash
# Delete all TipTrack resources
kubectl delete namespace tiptrack

# Stop and delete Minikube cluster
minikube stop
minikube delete

# Clear browser data
# Open browser console (F12) → Console tab → run:
localStorage.clear()
```

---

## 🎤 Interview Talking Points

### Why Kubernetes?
> "I chose Kubernetes to demonstrate container orchestration, service discovery, and self-healing infrastructure. The app showcases critical SRE concepts like persistent storage, health checks, secrets management, and zero-downtime deployments—all skills directly applicable to production environments."

### Technical Architecture
> "I implemented a 3-tier microservices architecture with clear separation of concerns. The frontend is a React SPA served by Nginx, the backend is a RESTful Node.js API with JWT authentication, and MongoDB provides persistent storage with a PVC. Each service runs in separate pods with multiple replicas for high availability. Services communicate via Kubernetes internal DNS, and health probes ensure automatic recovery from failures."

### Challenges & Solutions
> "The biggest challenge was Kubernetes networking in a local development environment. Services use internal DNS names like 'backend-service' which work inside the cluster but aren't accessible from my browser. I solved this with kubectl port-forward to create tunnels from localhost to the cluster services. I also had to ensure Docker images were built in Minikube's Docker environment rather than my local Docker daemon."

### Authentication Implementation
> "I built the authentication system from scratch using industry-standard practices: bcrypt for password hashing with 10 salt rounds, JWTs for stateless authentication with 90-day expiration, and secure token storage in localStorage. The frontend Axios instance automatically injects tokens into request headers, and the backend middleware validates tokens before processing protected routes."

### What I Learned
> "This project taught me infrastructure-as-code principles, container orchestration patterns, and how to debug distributed systems. I gained hands-on experience with persistent storage, rolling updates, health probes, secrets management, and the complete development lifecycle of a Kubernetes application. Most importantly, I learned how to troubleshoot containerized applications systematically."

### Production Improvements
> "For production deployment, I would implement several enhancements: an Ingress controller with cert-manager for TLS termination and external access, a managed database service like AWS RDS for better reliability and automated backups, HashiCorp Vault for centralized secrets management, Horizontal Pod Autoscaler for dynamic scaling based on metrics, and a full observability stack with Prometheus for metrics, Grafana for dashboards, and ELK or Loki for centralized logging."

---

## 📊 What This Project Demonstrates

### For SRE/DevOps Roles:

**Container Orchestration:**
- Kubernetes deployments with replica management
- Service discovery and internal DNS
- Persistent storage with PVCs
- ConfigMaps and Secrets for configuration management
- Health probes (liveness and readiness)
- Self-healing and automatic recovery
- Rolling updates for zero-downtime deployments

**Infrastructure as Code:**
- All infrastructure defined in YAML manifests
- Version-controlled Kubernetes configurations
- Reproducible deployments across environments
- Declarative resource management

**Containerization:**
- Multi-stage Docker builds for optimization
- Container best practices (non-root users, minimal base images)
- Image tagging and management
- Docker Compose for development

**Troubleshooting & Operations:**
- Log aggregation and analysis
- Resource monitoring and debugging
- Pod lifecycle management
- Network connectivity troubleshooting

### For Full-Stack Roles:

- **MERN Stack:** MongoDB, Express, React, Node.js
- **RESTful API Design:** Proper HTTP methods, status codes, endpoint structure
- **JWT Authentication:** Token-based auth from scratch
- **Frontend State Management:** React hooks and component lifecycle
- **Security:** Password hashing, CORS, input validation
- **Modern Development:** Vite, ES6+, async/await, Axios interceptors

### Key Resume Bullets:

✅ "Deployed full-stack MERN application on Kubernetes with 3-tier architecture, persistent storage, and multi-replica high availability"

✅ "Implemented container orchestration with self-healing, service discovery, health probes, and zero-downtime rolling updates"

✅ "Built JWT-based authentication system with bcrypt password hashing, token refresh, and secure credential management via Kubernetes Secrets"

✅ "Configured infrastructure as code using Kubernetes manifests, enabling reproducible deployments and version-controlled infrastructure"

✅ "Designed RESTful API with protected routes, CRUD operations, and aggregated analytics endpoints for dashboard metrics"

---

## 🚀 Alternative: Docker Compose

**Want to run without Kubernetes?** Use Docker Compose for simpler local development:

```bash
# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# MongoDB: localhost:27017

# Stop all services
docker-compose down

# Stop and remove volumes (deletes data)
docker-compose down -v
```

**Docker Compose features:**
- Single command deployment
- Automatic service linking
- Volume persistence
- Simpler for development/testing
- No Kubernetes knowledge required

**Use Docker Compose when:**
- Quick testing during development
- Don't need to demonstrate K8s skills
- Simpler onboarding for non-DevOps team members

**Use Kubernetes when:**
- Demonstrating infrastructure/SRE skills
- Need production-like environment
- Testing scaling and self-healing
- Portfolio/interview demonstrations

---

## 📝 License

MIT License - Free to use for learning, portfolios, and personal projects.

---

## 🙏 Acknowledgments

This project was built from scratch to demonstrate:
- **Full-stack development** with the MERN stack
- **DevOps practices** with Docker and Kubernetes
- **Security best practices** with JWT and bcrypt
- **Infrastructure as Code** with K8s manifests
- **Modern UI/UX** with animated components
- **Real-world application** solving an actual problem

**Perfect for:**
- Bootcamp graduates entering SRE/DevOps roles
- Developers learning Kubernetes
- Portfolio projects demonstrating production-ready skills
- Interview technical discussions

---

## 👤 Author

**Tina Bajwa**  
Bootcamp Graduate + SRE Intern  
*Building production-ready projects to showcase real-world DevOps skills*

*"Track your tips. Automate your taxes. Deploy with Kubernetes."* 🚀