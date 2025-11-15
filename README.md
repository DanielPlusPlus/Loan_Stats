# Loan Stats

A full-stack web application for loan statistics analysis and visualization with Docker support and HTTPS deployment.

## 🚀 Quick Start with Docker (Recommended)

The easiest way to run the application is using Docker with HTTPS support.

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

### Run with Docker

```bash
# Generate SSL certificates
chmod +x generate-certs.sh
./generate-certs.sh

# Start the application
docker compose up --build
```

Access the application:

- **Frontend (HTTPS):** https://localhost:3443
- **Backend API (HTTPS):** https://localhost:5001
- **Swagger API Docs:** https://localhost:5001/apidocs

⚠️ **Note:** You'll see a browser warning for self-signed certificates. Click "Advanced" → "Proceed to localhost" to continue.

### Docker Commands

```bash
# View logs
docker compose logs -f

# Stop services
docker compose down

# Rebuild specific service
docker compose up -d --build backend
docker compose up -d --build frontend
```

For detailed Docker documentation, see [DOCKER_README.md](./DOCKER_README.md)

---

## 💻 Local Development

### Backend

**Technologies:**

- Python: ver. 3.12+
- Flask: ver. 3.0.3
- Pandas: ver. 2.2.2
- NumPy: ver. 1.26.4

**Installing dependencies:**

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Linux / macOS
venv\Scripts\activate           # Windows
pip install -r requirements.txt
```

**Running the Flask server:**

```bash
# Without HTTPS (development)
python main.py
```

The server will be available at:

- Without SSL certificates: http://127.0.0.1:5001
- With SSL certificates: https://127.0.0.1:5001

**Running with SSL (optional):**

Generate certificates first:

```bash
./generate-certs.sh
```

The Flask server will automatically use HTTPS if certificates are found in the `certs/` directory.

---

### Frontend

**Technologies:**

- React: ver. 18.3.1
- Vite: ver. 5.3.5
- TypeScript: ver. 5.2.2
- Bootstrap: ver. 5.3.3

**Installing dependencies:**

```bash
cd frontend
npm install
```

**Running the Vite development server:**

```bash
npm run dev
```

By default, the server will be available at: http://localhost:5173

**Building for production:**

```bash
npm run build
```

---

## 📁 Project Structure

```
.
├── backend/              # Flask backend application
│   ├── app/             # Application modules
│   ├── Dockerfile       # Backend Docker configuration
│   ├── main.py          # Application entry point
│   └── requirements.txt # Python dependencies
├── frontend/            # React frontend application
│   ├── src/            # Source code
│   ├── Dockerfile      # Frontend Docker configuration
│   ├── nginx.conf      # Nginx HTTPS configuration
│   └── package.json    # Node.js dependencies
├── scripts/            # Configuration scripts
│   ├── generate-certs.sh   # SSL certificate generator
├── compose.yaml         # Docker Compose configuration
└── README.md           # This file
```

---

## 🔒 HTTPS Configuration

This application supports full HTTPS deployment in Docker:

- **Backend:** Flask with SSL context
- **Frontend:** Nginx with TLS 1.2/1.3
- **Certificates:** Self-signed for development (use CA-signed for production)

---

## 🌐 API Documentation

Interactive API documentation is available via Swagger UI:

- Local: http://127.0.0.1:5001/apidocs
- Docker: https://localhost:5001/apidocs

---

## 📝 Environment Variables

### Frontend

Create a `.env` file in the `frontend/` directory:

```bash
VITE_API_URL=https://localhost:5001  # For Docker
# VITE_API_URL=http://localhost:5001  # For local development
```

---

## 🛠️ Development Workflow

1. **Local Development:** Use `python main.py` and `npm run dev` for rapid iteration
2. **Testing with Docker:** Use `docker compose up` to test in production-like environment
3. **Production:** Deploy using Docker Compose with proper SSL certificates

---

## 📚 Additional Resources

- [API Documentation](https://localhost:5001/apidocs) - Interactive Swagger UI

---

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Find and kill process using port
lsof -i :5001  # Backend
lsof -i :443   # Frontend (Docker)
```

### Docker Issues

```bash
# Check service status
docker compose ps

# View logs
docker compose logs -f

# Restart services
docker compose restart
```
