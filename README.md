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
![Kubernetes](https://img.shields.io/badge/Orchestration-Kubernetes-326CE5?logo=kubernetes&logoColor=white)
![Docker](https://img.shields.io/badge/Container-Docker-2496ED?logo=docker&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)
![Railway](https://img.shields.io/badge/Deploy-Railway-0B0D0E?logo=railway&logoColor=white)

---

## 📖 What Is TipTrack?

A **full-stack MERN application** that helps service industry workers:
- Track **actual tips vs claimed tips** (for tax purposes)
- Auto-calculate **tax withholding** based on your rate
- Stay under the **$25,000 tax-free threshold** (2024 IRS law)
- View earnings by day, week, month, and year
- **Secure user authentication** with JWT tokens

Built by a bartender — **battle-tested on real shifts**.  

**Deployed TWO ways** to demonstrate both traditional DevOps and modern cloud skills:
- 🎯 **Kubernetes** (Minikube) - Container orchestration, self-healing, persistent storage
- ☁️ **Railway + Vercel** - Modern cloud platforms, CI/CD, microservices

---

## 🚀 Live Demo

**Production (Cloud):**
- **Frontend:** https://tiptrack.vercel.app  
- **Backend API:** https://tiptrack-production.up.railway.app

**Local (Kubernetes):**
- See [Kubernetes Deployment](#-kubernetes-deployment) section below

*Try the live app! Create an account and track your first shift.* 💪

---

## 🏗️ Architecture

### Cloud Architecture (Production)
```
User Browser
    ↓
Frontend (Vercel CDN) - Global edge network
    ↓
Backend API (Railway) - Node.js + Express
    ↓
MongoDB (Railway) - Persistent database
```

### Kubernetes Architecture (Portfolio Showcase)
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
- **Health Probes:** Liveness and readiness checks
- **Auto-healing:** Kubernetes restarts failed pods automatically

---

## 🎯 Key Features

- ✅ **User Authentication** - Secure signup/login with JWT tokens (90-day expiration)
- ✅ **Beautiful Animated UI** - Neon-style login with gradient borders and smooth animations
- ✅ **Password Security** - Bcrypt hashing with show/hide toggle
- ✅ **Add/Edit/Delete Shifts** - Track every shift you work
- ✅ **Tax Calculator** - Auto-calculates withholding (claimed × rate)
- ✅ **Dashboard** - Today, week, month, and total stats
- ✅ **$25K Tax-Free Tracker** - Know exactly how much is tax-free
- ✅ **Persistent Data** - MongoDB with persistent volume (Kubernetes) or managed DB (Railway)
- ✅ **Self-Healing** - Kubernetes auto-restarts failed pods
- ✅ **Health Probes** - Liveness and readiness checks

---

## 🛠️ Tech Stack

### Frontend
- React 18 (with Vite)
- Axios for API calls
- Lucide-React icons (including eye toggle for passwords)
- Modern animated neon theme UI
- JWT token storage (localStorage)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- CORS enabled
- RESTful API design

### DevOps & Deployment
- **Docker** (multi-stage builds, containerization)
- **Kubernetes** (Deployments, Services, ConfigMaps, Secrets, PVCs)
- **Minikube** (local Kubernetes cluster)
- **Railway** (backend + MongoDB hosting)
- **Vercel** (frontend CDN deployment)
- **Nixpacks** (Railway build system)
- **GitHub** (version control, CI/CD triggers)

---

## 🚀 Deployment Options

Choose your deployment method based on what you want to demonstrate:

### Option 1: Kubernetes (Show SRE/DevOps Skills) 🎯

**Use this to demonstrate:**
- Container orchestration
- Service discovery
- Persistent storage
- Health checks and self-healing
- ConfigMaps and Secrets management

[Jump to Kubernetes Deployment Guide](#-kubernetes-deployment)

### Option 2: Cloud Platforms (Production Ready) ☁️

**Use this to demonstrate:**
- Modern cloud architecture
- CI/CD pipelines
- Microservices deployment
- Managed services
- Zero-downtime deployments

[Jump to Cloud Deployment Guide](#%EF%B8%8F-cloud-deployment-railway--vercel)

---

## 🎯 Kubernetes Deployment

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

2. **Install project dependencies:**
   ```bash
   # Backend
   cd backend
   npm install
   npm install cors bcryptjs jsonwebtoken  # ⚠️ REQUIRED for API and auth!
   
   # Frontend
   cd ../frontend
   npm install
   npm install lucide-react  # ⚠️ REQUIRED for eye icon and UI!
   ```

3. **Set up environment variables (for local K8s):**
   
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

### Quick Deploy to Kubernetes

```bash
# 1. Start Minikube
minikube start --cpus=4 --memory=4096 --driver=docker

# 2. Build images in Minikube's Docker environment
eval $(minikube docker-env)
cd backend && docker build -t tiptrack-backend:latest .
cd ../frontend && docker build -t tiptrack-frontend:latest .

# 3. Deploy to Kubernetes
cd ..
kubectl apply -f k8s/

# 4. Wait for pods to be ready
kubectl get pods -n tiptrack -w
# Press Ctrl+C when all show Running

# 5. Access the app
# See Daily Usage section below
```

### Daily Usage (Kubernetes)

**Every time you want to use the Kubernetes deployment:**

#### Step 1: Check Minikube
```bash
minikube status
# If stopped: minikube start
```

#### Step 2: Open 2 Terminals (Keep Both Running!)

**Terminal 1 (Backend):**
```bash
kubectl port-forward -n tiptrack service/backend-service 5000:5000
```

**Terminal 2 (Frontend):**
```bash
kubectl port-forward -n tiptrack service/frontend-service 3000:80
```

#### Step 3: Open Browser
```
http://localhost:3000
```

**✅ Ports never change! Always localhost:3000**

### Kubernetes Features Demonstrated

- ✅ **Multi-container deployment** - Frontend, Backend, MongoDB
- ✅ **Service discovery** - Services communicate via DNS
- ✅ **Persistent storage** - PVC for MongoDB data
- ✅ **Secrets management** - MongoDB credentials + JWT secrets
- ✅ **ConfigMaps** - Environment configuration
- ✅ **Health probes** - Liveness and readiness checks
- ✅ **Rolling updates** - Zero-downtime deployments
- ✅ **Auto-scaling** - Multiple replicas for high availability
- ✅ **Self-healing** - Automatic pod restarts

### Kubernetes Testing

```bash
# Check all resources
kubectl get all -n tiptrack

# View pod logs
kubectl logs <pod-name> -n tiptrack

# Check health endpoint
curl http://localhost:5000/health

# Test signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'

# Get service URLs
minikube service list -n tiptrack
```

### Kubernetes Cleanup

```bash
# Delete everything
kubectl delete namespace tiptrack

# Stop Minikube
minikube stop

# Delete Minikube cluster (optional)
minikube delete
```

---

## ☁️ Cloud Deployment (Railway + Vercel)

### Architecture

**Modern microservices approach:**
- **Frontend** (Vercel) - React app on global CDN
- **Backend** (Railway) - Node.js API + MongoDB
- **Auto-deployment** - Push to GitHub = automatic deploy

### Backend Setup (Railway)

1. Create Railway account
2. New Project → Deploy from GitHub
3. Connect `tiptrack` repository
4. Set root directory: `backend`
5. Add environment variables:
   - `MONGODB_URI` (provided by Railway MongoDB)
   - `JWT_SECRET` (your secret key)
   - `PORT` (auto-assigned)
6. Railway auto-deploys on git push

### Frontend Setup (Vercel)

1. Create Vercel account
2. Import Git Repository
3. Select `tiptrack` repository
4. Set root directory: `frontend`
5. Framework: Vite (auto-detected)
6. Add environment variable:
   - `VITE_API_URL` = `https://tiptrack-production.up.railway.app`
7. Deploy!

### Cloud Features Demonstrated

- ✅ **Microservices architecture** - Separate frontend/backend
- ✅ **CI/CD pipelines** - Auto-deploy from GitHub
- ✅ **Managed services** - No server management needed
- ✅ **Global CDN** - Fast worldwide with Vercel
- ✅ **Health monitoring** - Built-in platform monitoring
- ✅ **Zero-downtime deploys** - Automatic blue/green deployment
- ✅ **Environment management** - Separate dev/prod configs

---

## 💻 Local Development (No Kubernetes)

**Want to just run the app locally for development?**

### Prerequisites
```bash
# Node.js 18+
node --version

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
```

### Environment Variables

**Backend** (`backend/.env`):
```env
MONGODB_URI=mongodb://localhost:27017/tiptrack
PORT=5001
JWT_SECRET=your-secret-key-change-in-production
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5001
```

### Run Locally
```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Open http://localhost:5173

---

## 🔌 API Endpoints

**Base URLs:**
- **Production:** `https://tiptrack-production.up.railway.app`
- **Kubernetes:** `http://localhost:5000`

### Authentication Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new user account |
| POST | `/api/auth/login` | Login and get JWT token |

### Shift Routes
**Base:** `/api/shifts`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/` | Get all shifts (requires auth) |
| GET | `/:id` | Get shift by ID (requires auth) |
| POST | `/` | Create new shift (requires auth) |
| PUT | `/:id` | Update shift (requires auth) |
| DELETE | `/:id` | Delete shift (requires auth) |
| GET | `/stats/summary` | Get dashboard stats (requires auth) |

---

## 📁 Project Structure

```
tiptrack/
├── backend/                # Node.js + Express API
│   ├── models/            # Mongoose schemas
│   │   ├── Shift.js      # Shift data model
│   │   └── User.js       # User authentication model
│   ├── routes/            # API endpoints
│   │   ├── shifts.js     # Shift CRUD operations
│   │   └── auth.js       # Login/signup endpoints
│   ├── server.js          # Main server file
│   ├── Dockerfile         # Backend container image
│   └── nixpacks.toml      # Railway build config
├── frontend/              # React + Vite app
│   ├── src/
│   │   ├── components/   # React components
│   │   │   └── Login.jsx # Animated login component
│   │   ├── services/     # API client
│   │   │   └── api.js   # Axios + JWT configuration
│   │   └── styles/       # CSS files
│   ├── Dockerfile        # Frontend container image
│   ├── nginx.conf        # Nginx configuration
│   └── vite.config.js    # Vite build config
├── k8s/                   # Kubernetes manifests
│   ├── namespace.yaml     # tiptrack namespace
│   ├── mongodb/           # Database resources
│   ├── backend/           # API resources
│   └── frontend/          # UI resources
└── README.md
```

---

## 🔐 Security Features

- ✅ **Password hashing** with bcrypt (10 salt rounds)
- ✅ **JWT token authentication** (90-day expiration)
- ✅ **HTTPS** on both Railway and Vercel
- ✅ **CORS** configured for cross-origin requests
- ✅ **Environment variables** for secrets
- ✅ **Authorization headers** on protected routes
- ✅ **Kubernetes Secrets** for sensitive data in K8s deployment

---

## 📊 What This Project Demonstrates

### For SRE/DevOps Roles:

**Kubernetes Expertise:**
- Container orchestration with Kubernetes
- Service discovery and networking
- Persistent storage with PVCs
- ConfigMaps and Secrets management
- Health checks (liveness/readiness probes)
- Self-healing and auto-scaling
- Multi-container deployments

**Docker Skills:**
- Multi-stage builds
- Container optimization
- Image management
- Docker Compose (alternative)

**Cloud Platform Knowledge:**
- Modern cloud architecture (Railway + Vercel)
- CI/CD pipelines
- Microservices deployment
- Managed services vs self-hosted

### For Full-Stack Roles:

- MERN stack implementation
- RESTful API design
- JWT authentication from scratch
- Responsive UI with animations
- State management in React

### Interview Talking Points:

✅ "Deployed the same application using both Kubernetes and cloud platforms to demonstrate versatility"  
✅ "Implemented container orchestration with self-healing, persistent storage, and service discovery"  
✅ "Built CI/CD pipelines with auto-deployment from GitHub"  
✅ "Configured health probes, secrets management, and rolling updates in Kubernetes"  
✅ "Designed a microservices architecture with separate frontend and backend deployments"

---

## 🐛 Troubleshooting

### Kubernetes Issues

```bash
# Are all pods running?
kubectl get pods -n tiptrack

# Check pod logs for errors
kubectl logs <pod-name> -n tiptrack

# Verify services exist
kubectl get svc -n tiptrack

# Check MongoDB connection
kubectl logs <backend-pod> -n tiptrack | grep MongoDB
```

### Cloud Deployment Issues

**Backend (Railway):**
```bash
# Test health endpoint
curl https://tiptrack-production.up.railway.app/health

# Check logs in Railway dashboard
# Railway → tiptrack service → Deploy Logs
```

**Frontend (Vercel):**
```bash
# Verify environment variable
# Vercel → tiptrack → Settings → Environment Variables
# VITE_API_URL should be: https://tiptrack-production.up.railway.app
```

---

## 🧹 Why Two Deployment Methods?

**Kubernetes Deployment:**
- Shows deep DevOps/SRE skills
- Demonstrates container orchestration
- Perfect for "Have you worked with Kubernetes?" interviews
- Self-hosted, full control

**Cloud Deployment:**
- Shows modern platform knowledge
- Easier to share with recruiters (just send a link!)
- Demonstrates CI/CD understanding
- Production-ready, scalable

**Together, they show:**
- ✅ You understand both traditional DevOps AND modern cloud platforms
- ✅ You can choose the right tool for the job
- ✅ You're not locked into one approach
- ✅ You can work in startups (cloud) or enterprises (K8s)

---

## 📝 License

MIT License - feel free to use this project for learning or your portfolio!

---

## 🙏 Acknowledgments

Built as a portfolio project to demonstrate:
- Full-stack development (MERN)
- User authentication with JWT
- Modern animated UI design
- **Containerization** (Docker)
- **Container orchestration** (Kubernetes)
- **Cloud deployment** (Railway + Vercel)
- DevOps/SRE practices
- Security best practices

**Perfect for bootcamp grads looking to break into SRE/DevOps roles!** 🚀

---

## 👤 Author

**Tina Bajwa**  
Bootcamp Grad + SRE Intern  
Building real-world projects to showcase DevOps skills

*"Track your tips. Automate your taxes. Deploy with Kubernetes."* 🚀