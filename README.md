# DARKROOM / Image Security Lab
## A Secure Adaptive Image Steganography System with Encryption, Integrity Verification and Image Quality Analysis

**Academic Capstone Project — B.Tech Implementation**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/yogavannidhi8-web/darkroom-steganography)

---

## 1. Project Overview

**DARKROOM** is a full-stack image-security workstation integrating:
1. **Password-Derived Key Derivation:** Argon2id (memory-hard, GPU-resistant).
2. **Authenticated Encryption:** AES-256-GCM with Associated Authenticated Data (AAD) binding.
3. **Reproducible Adaptive Steganography:** Content-aware spatial embedding using an upper-6-bit stable analysis representation (`rgb & 0xFC`).
4. **Key-Dependent Permutation:** ChaCha20-driven Fisher-Yates slot shuffling.
5. **Two-Stage Integrity Verification:** AES-GCM Galois MAC verification + inner SHA-256 payload digest.
6. **Quantitative Image Quality Analysis:** True computation of MSE, PSNR, SSIM, Shannon entropy, and RGB histograms.

---

## 2. Technology Stack

### Backend
- **Framework:** FastAPI 0.115, Uvicorn 0.32, Pydantic v2
- **Image Processing:** OpenCV 4.10 (headless), Pillow 11.0, NumPy 2.1, scikit-image 0.24, SciPy 1.14
- **Cryptography:** `cryptography` 44.0 (AES-256-GCM, HKDF, ChaCha20), `argon2-cffi` 23.1
- **Testing:** Pytest 8.3, HTTPX 0.28, Pytest-Asyncio 0.24

### Frontend
- **Framework:** React 18, TypeScript 5.6, Vite 5.4
- **Styling & Tokens:** Tailwind CSS, minimal darkroom editorial design system
- **UI Components:** Radix UI primitives, Lucide React icons
- **Visualization:** Recharts, HTML5 Canvas, JSZip
- **Validation:** React Hook Form, Zod

---

## 3. Production Architecture

```
Internet (HTTPS)
      │
      ├──▶ [Render / Cloud Static CDN]
      │     Frontend SPA (React 18 + Vite)
      │     - Security Headers (X-Content-Type-Options, X-Frame-Options)
      │     - SPA Client-Side Fallback (/index.html)
      │     │
      │     ▼ (HTTPS API Calls)
      └──▶ [Render / Container Web Service]
            Backend REST API (FastAPI + Uvicorn)
            ├── Production Security Headers & Upload Limiting
            ├── CORS restricted to deployed frontend domain
            ├── Core Cryptography: Argon2id KDF -> HKDF Subkeys -> AES-256-GCM -> SHA-256
            ├── Steganography Engine: Stable 6-Bit Map -> Sobel/Variance/Canny -> Permute -> LSB Embed
            └── Quality Engine: MSE, PSNR, SSIM, Shannon Entropy, Difference Heatmaps
```

---

## 4. Production Security Hardening

- **Zero External AI / Third-Party APIs:** Operates 100% deterministically using local cryptographic libraries.
- **Strict CORS Policy:** Restricted strictly to configured origins via `ALLOWED_ORIGINS` environment variable.
- **Defense in Depth:**
  - Header CRC32 validation for fast corruption detection.
  - AES-256-GCM Galois/Counter Mode authenticated encryption (AAD header-bound).
  - SHA-256 payload digest verified via constant-time comparison (`hmac.compare_digest`).
  - Strict filename sanitization (`os.path.basename`) preventing path traversal.
  - Request body size limits (20 MB default) and benchmark input clamping.
- **Production HTTP Security Headers:**
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY` (Backend) / `SAMEORIGIN` (Frontend)
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: geolocation=(), camera=(), microphone=()`
  - `Cache-Control: no-store, no-cache, must-revalidate` (API responses)
- **Container Hardening:** Runs as non-root user `appuser` in production Docker containers.

---

## 5. Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `APP_ENV` | string | `development` | Set to `production` in live environments |
| `ALLOWED_ORIGINS` | string | `http://localhost:5173,...` | Comma-separated list of allowed frontend origins |
| `MAX_UPLOAD_MB` | int | `20` | Maximum upload size in megabytes |
| `MAX_IMAGE_PIXELS` | int | `8000000` | Maximum allowed pixels (8 Megapixels) |
| `PORT` | int | `8000` | Port for Uvicorn server |

### Frontend (`frontend/.env`)

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | string | *(empty)* | Deployed backend HTTPS URL (e.g. `https://darkroom-backend.onrender.com`). In local dev, leave empty to use Vite proxy. |

---

## 6. Deployment Guides

### Option A: Render Blueprint Deployment (`render.yaml`)

The included `render.yaml` sets up both services with automated cross-referencing:

1. Push this repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com), click **New + > Blueprint**.
3. Select your repository and click **Apply**.
4. Render automatically configures:
   - `darkroom-backend` (Python Web Service) on free tier.
   - `darkroom-frontend` (Static Site) pointing to the backend API URL.

### Option B: Docker / Container Deployment

#### Local Multi-Container Run:
```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/api/docs`

#### Build Backend Image Standalone:
```bash
docker build -t darkroom-backend ./backend
docker run -p 8000:8000 -e APP_ENV=production darkroom-backend
```

#### Build Frontend Image Standalone:
```bash
docker build --build-arg VITE_API_BASE_URL=https://your-backend.com -t darkroom-frontend ./frontend
docker run -p 80:80 darkroom-frontend
```

---

## 7. Local Development

### 1. Backend Setup
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # On Unix: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
- API Docs live at `http://localhost:8000/api/docs`.
- Health check: `http://localhost:8000/api/v1/health`.

### 2. Frontend Setup
```powershell
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```
- Application live at `http://localhost:5173`.

---

## 8. Automated Testing & Quality Audit

Run backend unit & security tests:
```powershell
cd backend
pytest tests/ -v
```
**Test Coverage (19/19 Tests Passed):**
- Key derivation stability and salt/passphrase sensitivity.
- HKDF key separation between encryption and permutation subkeys.
- AES-256-GCM AEAD encryption and tampering rejection.
- Wrong password atomic rejection.
- Upper 6-bit feature analysis map invariance ($I_{stego} \ \& \ 0\text{xFC} \equiv I_{cover} \ \& \ 0\text{xFC}$).
- End-to-end text and binary file round-trip recovery.
- Quality metrics mathematical accuracy (MSE, PSNR, SSIM, Entropy).

Verify frontend production build:
```powershell
cd frontend
npm run build
```

---

## 9. Troubleshooting

- **Frontend cannot reach backend:**
  Verify that `VITE_API_BASE_URL` in the frontend matches the deployed backend HTTPS address without trailing slashes. In local dev, leave `VITE_API_BASE_URL` empty to let the Vite proxy forward `/api` requests to `http://127.0.0.1:8000`.
- **CORS Error in Browser:**
  Ensure the frontend domain (e.g. `https://darkroom-frontend.onrender.com`) is included in the backend's `ALLOWED_ORIGINS` environment variable.
- **Render Free Tier Cold Start:**
  On Render free tier, the backend spins down after 15 minutes of inactivity. When the frontend is opened, the top status indicator may show `Connecting...` for 30–50 seconds while the backend wakes up. Once awake, the indicator switches to `Ready`.
- **413 Payload Too Large:**
  The server enforces a maximum upload size of 20 MB. Ensure carrier images and secret files do not exceed this limit.

---

## 10. Academic Contribution Statement

> *This project implements an integrated adaptive image steganography framework combining content-aware spatial embedding, password-derived authenticated encryption, integrity verification and quantitative image-quality evaluation, with experimental comparison against simpler LSB baselines.*
