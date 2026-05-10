# Real-time Crypto Ticker with IAM Integration

This project is a **Laboratory Work** focused on building a secure, high-performance real-time cryptocurrency price tracker. It integrates a professional **IAM platform (Casdoor)** for authentication and utilizes **WebSockets** with **Protobuf** serialization to stream live data from the **Binance API**.

## Project Overview

The system demonstrates a modern full-stack architecture where:

* Users authenticate via **OAuth2/OIDC** (Casdoor).
* Real-time data is filtered on the backend based on user subscriptions.
* Binary data transfer is optimized using **Protocol Buffers**.
* All services are orchestrated behind an **Nginx Reverse Proxy** with full **TLS/SSL** support.

## Tech Stack

* **Monorepo Management:** Turborepo
* **IAM Platform:** Casdoor
* **Web Frontend:** Next.js (inside `web` package)
* **Backend API:** NestJS (inside `api` package)
* **Real-time Communication:** Socket.io (WebSockets)
* **Data Serialization:** Protobufjs
* **External Data Source:** Binance WebSocket API
* **Infrastructure:** Nginx, Docker & Docker Compose
* **Security:** TLS/SSL (HTTPS/WSS) via custom certificates

---

## Prerequisites

Before starting, ensure you have the following installed:

* **Docker & Docker Compose**
* **Node.js**
* **mkcert** (for local SSL certificates)

---

## Setup & Installation

### 1. Environment Variables

Copy the example environment file in the root directory and configure your Casdoor credentials and Binance API settings:

```bash
cp .env.example .env

```

### 2. SSL Certificates

The project requires HTTPS and WSS for secure communication. Generate certificates for the required local domains:

**Using mkcert:**

```bash
mkcert -key-file infrastructure/certs/localhost-key.pem -cert-file infrastructure/certs/localhost.pem localhost casdoor.localhost 127.0.0.1

```

### 3. Prune Packages for Docker

To optimize the Docker build process in this monorepo, prune the workspaces:

```bash
# Prune for the Next.js Web frontend
npx turbo prune web --docker --out-dir ./out/web

# Prune for the NestJS API backend
npx turbo prune api --docker --out-dir ./out/api

```

---

## Running the Project

### Build and Start Containers

Deploy the entire stack (Database, Casdoor, API, Web, and Nginx) using Docker Compose:

```bash
docker-compose up --build

```

### Service Access Points

Once the containers are up and healthy, you can access the services at:

* **Web Application:** [https://localhost]()
* **IAM Dashboard (Casdoor):** [https://casdoor.localhost]()
* **REST API** [https://localhost/api]()
