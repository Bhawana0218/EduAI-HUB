<div align="center">
  <h1>🚀 MERN Full-Stack Technical Assessment</h1>
  <p><em>Scalable, Production-Ready Full-Stack Application with AI Integration & Distributed Caching</em></p>

  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
  [![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
  [![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
  [![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
  [![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)
  [![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io)
  [![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
  [![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)

  <p>🛡️ Built with Best Practices | ⚡ Highly Optimized | 🔒 Secure & Scalable</p>
</div>

---

## 📖 Overview

A production-grade, full-stack application built on the **MERN stack**, featuring **AI-powered course recommendations**, **Redis caching**, **JWT-based authentication**, and **Dockerized deployment**. Designed with a strong focus on clean architecture, state management, and real-world engineering standards.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| 🔐 **Secure Auth** | JWT authentication with HTTP-only cookies & role-based access control (Admin/User) |
| 🤖 **AI Integration** | Gemini API-driven course recommendations with graceful mock fallback |
| 📊 **CSV Processing** | Bulk upload & parsing → direct MongoDB ingestion with validation |
| ⚡ **Redis Caching** | High-speed response caching for frequently accessed endpoints |
| 🛡️ **Protected Routes** | Frontend route guarding + backend middleware validation |
| 🐳 **Dockerized** | One-command deployment via Docker Compose (Frontend, Backend, DB, Cache) |
| 📡 **Real-world Ready** | CI/CD pipeline support, environment config, and production monitoring |

---

## 🛠️ Tech Stack

<div align="center">
  <table>
    <tr>
      <td align="center" width="120"><img src="https://cdn.simpleicons.org/nextdotjs/000000" width="40"><br><b>Next.js</b></td>
      <td align="center" width="120"><img src="https://cdn.simpleicons.org/node.js/339933" width="40"><br><b>Node.js</b></td>
      <td align="center" width="120"><img src="https://cdn.simpleicons.org/express/000000" width="40"><br><b>Express</b></td>
      <td align="center" width="120"><img src="https://cdn.simpleicons.org/mongodb/47A248" width="40"><br><b>MongoDB</b></td>
      <td align="center" width="120"><img src="https://cdn.simpleicons.org/redis/DC382D" width="40"><br><b>Redis</b></td>
      <td align="center" width="120"><img src="https://cdn.simpleicons.org/docker/2496ED" width="40"><br><b>Docker</b></td>
      <td align="center" width="120"><img src="https://cdn.simpleicons.org/typescript/3178C6" width="40"><br><b>TypeScript</b></td>
    </tr>
  </table>
</div>

---

## 🏗️ Project Architecture

The system follows a **decoupled client-server model** with clear separation of concerns:

```text
[ Next.js Frontend (React/TS) ]
          │
          ▼ (HTTP / Axios)
[ Express.js API Gateway ]
    ├── 📦 Auth Middleware (JWT + HTTP-only Cookies)
    ├── 📦 Validation Layer (Zod/Joi)
    ├── ⚡ Cache Interceptor (Redis)
    │
    ├── 🗄️ MongoDB (Mongoose ODM)
    │     └── Course, User, Analytics Collections
    │
    ├── 📡 Async Messaging (Kafka - Extensible)
    └── 🤖 AI Service (Gemini API + Mock Fallback)
```
## 🔌 API Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|------------|--------|
| POST | /api/auth/register | Register new user | Public |
| POST | /api/auth/login | Authenticate & set cookie | Public |
| POST | /api/auth/logout | Clear auth session | Authenticated |
| POST | /api/courses/upload | Upload & parse CSV data | Admin Only |
| GET | /api/courses | Fetch paginated courses | Public |
| GET | /api/courses/:id | Get course details | Public |
| POST | /api/ai/recommend | Get AI-powered course picks | Authenticated |

---

## 🚀 Setup Instructions

### 📋 Prerequisites
- Node.js v18+
- Docker & Docker Compose
- Redis Server (if running locally)
- MongoDB Atlas or Local MongoDB

### 📦 Environment Variables
Create `.env` in `/backend` and `.env.local` in `/frontend`

```
MONGODB_URI=your_mongo_uri
JWT_SECRET=your_secret
GEMINI_API_KEY=your_key
REDIS_URL=your_redis_url

NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

### 💻 Local Development

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

---

### 🐳 Docker Deployment

```bash
docker compose up --build
```

👉 Access the app at http://localhost:3000

---

## 🔄 CI/CD Pipeline

- Automated linting & formatting (ESLint, Prettier)
- Unit & integration testing on PR
- Zero-downtime deployment strategy

---

## ☁️ Production Deployment (Linux Hosting)

- **Process Manager:** PM2 for clustering & auto-restart  
- **Reverse Proxy:** Nginx for routing, SSL termination & gzip compression  
- **Environment:** Secure `.env`, restricted ports, firewall rules (ufw)  
- **Monitoring:** Log rotation, uptime checks, Redis eviction policies  

---

## 📦 Kafka Integration Use Cases

Although implemented asynchronously, the architecture supports Kafka for:

- 📜 **Async Logging:** Decoupled audit trail for auth & data mutations  
- 🔄 **Event-Driven Recommendations:** Trigger background AI processing on CSV upload  
- 📊 **Analytics Pipeline:** Stream user interactions → data warehouse  

---

## 🖼️ UI / Screenshots

<div align="center">
<table>
<tr>
<td width="50%"><img src="https://via.placeholder.com/600x350/0f172a/ffffff?text=Home+Page" alt="Home Page"></td>
<td width="50%"><img src="https://via.placeholder.com/600x350/0f172a/ffffff?text=Course+Listing" alt="Course Listing"></td>
</tr>
<tr>
<td><b>🏠 Home Page</b><br>Clean UI, featured courses, quick access</td>
<td><b>📚 Course Listing</b><br>Paginated, filtered, cached responses</td>
</tr>
<tr>
<td><img src="https://via.placeholder.com/600x350/0f172a/ffffff?text=AI+Recommendation+Page" alt="AI Recommendation Page"></td>
<td><img src="https://via.placeholder.com/600x350/0f172a/ffffff?text=Admin+Dashboard" alt="Admin Dashboard"></td>
</tr>
<tr>
<td><b>🤖 AI Recommendations</b><br>Gemini-powered personalized picks</td>
<td><b>🛡️ Admin Dashboard</b><br>CSV upload, user management, analytics</td>
</tr>
</table>
</div>

---

## 🎯 Skills Demonstrated

<div align="center">
<table>
<tr>
<td align="center"><img src="https://cdn.simpleicons.org/mongodb/47A248" width="30"><br>MERN Stack</td>
<td align="center"><img src="https://cdn.simpleicons.org/apachekafka/231F20" width="30"><br>REST APIs</td>
<td align="center"><img src="https://cdn.simpleicons.org/jsonwebtokens/000000" width="30"><br>Auth (JWT)</td>
<td align="center"><img src="https://cdn.simpleicons.org/redis/DC382D" width="30"><br>Redis Caching</td>
<td align="center"><img src="https://cdn.simpleicons.org/google/4285F4" width="30"><br>AI Integration</td>
<td align="center"><img src="https://cdn.simpleicons.org/docker/2496ED" width="30"><br>Docker & DevOps</td>
<td align="center"><img src="https://cdn.simpleicons.org/redux/764ABC" width="30"><br>State Management</td>
</tr>
</table>
</div>

---

## 🌟 Project Highlights

- ✅ Clean, Modular Codebase – Structured routers, controllers, services, middleware  
- 📐 Scalable Architecture – Redis caching, async-ready, containerized setup  
- 🛠️ Production-Ready Mindset – Error handling, validation, secure cookies  
- 📈 Engineering Quality – Type-safe, linted, documented, CI-ready  

---

<div align="center">
<h3>📬 Built with passion & best practices. Ready for enterprise-scale deployment.</h3>
<p><em>Thank you for your time & consideration.</em></p>
</div>
