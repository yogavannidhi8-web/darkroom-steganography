# DARKROOM / Image Security Lab
## A Secure Adaptive Image Steganography System with Encryption, Integrity Verification and Image Quality Analysis

**Academic Capstone Project — B.Tech Implementation**

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
- **Styling & Tokens:** Tailwind CSS, custom analog darkroom editorial tokens
- **UI Components:** Radix UI primitives, Lucide React icons
- **Visualization:** Recharts, HTML5 Canvas, JSZip
- **Validation:** React Hook Form, Zod

---

## 3. System Architecture

```
User Browser
    │
    ▼
React 18 / TypeScript SPA (Vite)
    │  (HTTP / Multipart REST)
    ▼
FastAPI Backend (/api/v1)
    ├── Core Cryptography: Argon2id KDF -> HKDF Subkeys -> AES-256-GCM -> SHA-256
    ├── Steganography Engine: Stable 6-Bit Map -> Sobel/Variance/Canny -> Permute -> LSB Embed
    └── Quality Engine: MSE, PSNR, SSIM, Shannon Entropy, Difference Heatmaps
```

---

## 4. Quick Start: Local Development

### Prerequisites
- Python 3.11+ (Python 3.12 recommended)
- Node.js 18+ (Node 20+ recommended)
- npm 9+

### Option A: Using the Automated Startup Script

#### Windows (PowerShell):
```powershell
.\scripts\dev.ps1
```

#### macOS / Linux (Bash):
```bash
chmod +x scripts/dev.sh
./scripts/dev.sh
```

---

### Option B: Manual Startup

#### 1. Start the Backend
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # On Unix: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend API will be live at: `http://localhost:8000` (Docs at: `http://localhost:8000/api/docs`).

#### 2. Start the Frontend
In a separate terminal window:
```powershell
cd frontend
npm install
npm run dev
```
Frontend application will be live at: `http://localhost:5173`.

---

## 5. Running Tests

Run the complete backend test suite:
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pytest tests/ -v
```
All 19 automated tests cover cryptographic correctness, wrong password rejection, tampered ciphertext detection, stable feature map invariance, and image quality metrics.

To verify the frontend production build:
```powershell
cd frontend
npm run build
```

---

## 6. Running Benchmarks

Generate synthetic carriers and run the 72-trial benchmark suite:
```powershell
python scripts/generate_samples.py
python experiments/run_benchmarks.py
```
Results are saved to:
- `experiments/results/benchmark_results.json`
- `experiments/results/benchmark_results.csv`
- `experiments/results/benchmark_report.md`

### Empirical Results Summary:
- **PSNR:** Consistently $> 62.8\text{ dB}$ across all test cases (up to $75.5\text{ dB}$).
- **SSIM:** $\ge 0.9994$ (virtually identical to the human eye).
- **Integrity Pass Rate:** $100\%$ ($72/72$ trials passed round-trip verification).

---

## 7. Deployment Configuration

### Render Blueprint Deployment (`render.yaml`)
The project includes a ready-to-deploy Render Blueprint configuring:
- `darkroom-backend`: FastAPI Python Web Service on port 8000.
- `darkroom-frontend`: Vite React Static Site with SPA fallback routing.

To deploy on Render:
1. Push this repository to GitHub.
2. In the Render Dashboard, choose **New > Blueprint**.
3. Select this repository and click **Apply**.

### Docker Compose
Run both backend and frontend in Docker:
```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

---

## 8. Documentation Directory

Detailed academic documentation is available in `docs/`:
- [`problem_statement.md`](docs/problem_statement.md): Mathematical context and steganography challenges.
- [`objectives_and_scope.md`](docs/objectives_and_scope.md): Primary goals, bounds, and requirements.
- [`system_architecture.md`](docs/system_architecture.md): Dataflow and Mermaid diagrams.
- [`algorithm_and_mathematics.md`](docs/algorithm_and_mathematics.md): Feature extraction and bit allocation formulas.
- [`cryptographic_design.md`](docs/cryptographic_design.md): KDF, AES-GCM, and AAD construction.
- [`adaptive_embedding_method.md`](docs/adaptive_embedding_method.md): Slot allocation and ChaCha20 permutation.
- [`api_reference.md`](docs/api_reference.md): Endpoints, request schemas, and responses.
- [`testing_and_validation.md`](docs/testing_and_validation.md): Unit tests and security validation.
- [`experiment_protocol.md`](docs/experiment_protocol.md): Benchmark results across synthetic carriers.
- [`limitations_and_future_work.md`](docs/limitations_and_future_work.md): Honest technical limitations and roadmap.
- [`viva_preparation.md`](docs/viva_preparation.md): Q&A guide for capstone viva defense.
- [`references.md`](docs/references.md): IEEE, NIST, and IETF academic citations.

---

## 9. Academic Contribution Statement

> *This project implements an integrated adaptive image steganography framework combining content-aware spatial embedding, password-derived authenticated encryption, integrity verification and quantitative image-quality evaluation, with experimental comparison against simpler LSB baselines.*
