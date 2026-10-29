# WindCast Analytics

> **Day-Ahead Wind Power Forecast Evaluation Platform**  
> Quantitative analytics and reactive dashboard evaluating day-ahead wind generation forecasts against metered grid actuals across 744 settlement hours in January 2026.

---

## Table of Contents
1. [Overview & Market Context](#overview--market-context)
2. [Key Evaluation Results](#key-evaluation-results)
3. [Architecture & System Design](#architecture--system-design)
4. [Project Structure](#project-structure)
5. [Quickstart Guide](#quickstart-guide)
   - [Backend Setup (FastAPI)](#backend-setup-fastapi)
   - [Frontend Setup (React + Vite)](#frontend-setup-react--vite)
6. [API Reference](#api-reference)
7. [Dashboard Components](#dashboard-components)
8. [Testing & Verification](#testing--verification)
9. [Technical Documentation](#technical-documentation)

---

## Overview & Market Context

In deregulated electricity markets (such as the UK Balancing Mechanism operated by Elexon BMRS), market participants and transmission system operators (TSOs) must submit physical generation notifications and balance positions prior to market gate closure.

- **Decision Gate Cutoff:** Fixed at **11:00 UTC** on the day prior to delivery ($D$).
- **Target Delivery Window:** Next-day delivery ($D+1$, covering 00:00 to 23:00 UTC).
- **The Challenge:** Wind generation is intermittent and volatile. Any mismatch between forecasted generation and real-time metered delivery requires costly grid balancing actions (e.g., spinning reserves, peaker plants, or curtailment).

WindCast Analytics automates the ingestion of raw half-hourly actual outturn feeds and multi-run forecasts, applies market gate closure constraints, computes error statistics, and delivers real-time analytics through a high-performance web dashboard.

---

## Key Evaluation Results (January 2026)

Evaluated across **744 continuous settlement hours** (31 delivery days $\times$ 24 hours):

| Metric | Value | Technical Meaning |
|---|---|---|
| **Total Observations** | `744` intervals | 100% hourly settlement continuity across January 2026. |
| **Decision Days** | `31` days | Evaluated from 2026-01-01 to 2026-01-31. |
| **Mean Absolute Error (MAE)** | `2,013.01 MW` | Average magnitude of forecast error per hour. |
| **Root Mean Squared Error (RMSE)** | `2,505.94 MW` | Residual standard deviation; penalizes large ramp misses. |
| **Forecast Bias** | `+1,729.93 MW` | **Systematic Overforecasting:** Models consistently predicted ~1.73 GW more power than delivered. |
| **WAPE** | `17.84%` | Weighted Absolute Percentage Error relative to total actual volume. |

---

## Architecture & System Design

```
+-------------------------------------------------------------+
|                     Elexon BMRS Data                         |
|   - FUELHH (Half-hourly metered wind actuals)               |
|   - WINDFOR (Day-ahead published wind forecasts)             |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                      Python Backend                          |
|  - Ingestion & Resampling (analysis.py)                     |
|  - 11:00 UTC Cutoff Filter & Deduplication                  |
|  - Metrics Engine (MAE, RMSE, Bias, WAPE)                   |
|  - FastAPI REST API + LRU Cache (main.py)                   |
+------------------------------+------------------------------+
                               |  HTTP / JSON (Port 8000)
                               v
+-------------------------------------------------------------+
|                     React 19 Frontend                        |
|  - Custom Data Hook (useForecastData.js)                    |
|  - Native SVG Visualizations (No large chart libraries)    |
|  - Live Status Detection & Interactive Filter Controls       |
+-------------------------------------------------------------+
```

---

## Project Structure

```text
GridBricks/
├── README.md                      # Root system documentation (this file)
├── TECHNICAL_DOCUMENTATION.md     # In-depth technical architecture document
├── backend/
│   ├── main.py                    # FastAPI application, routing, CORS, LRU cache
│   ├── analysis.py                # Pipeline: Ingestion, 11:00 UTC cutoff matching, metrics
│   ├── requirements.txt           # Python dependencies
│   ├── test_api.py                # Pytest test suite for API endpoints
│   ├── README_BACKEND.md          # Backend-specific instructions
│   └── data/
│       ├── wind_actuals_jan2026.json
│       ├── wind_actuals_feb1.json
│       └── wind_forecasts_jan2026.json
└── frontend/
    ├── package.json               # Node dependencies & npm scripts
    ├── vite.config.js             # Vite build configuration
    ├── index.html                 # HTML entry point with fonts & metadata
    └── src/
        ├── main.jsx               # React DOM root
        ├── App.jsx                # Coordinator layout component
        ├── App.css                # Layout grids and canvas styles
        ├── components/
        │   ├── Sidebar/           # Dark navigation island & connection status
        │   ├── Topbar/            # Breadcrumbs, date dropdown & API pill
        │   ├── PageHeader/        # View header & subtitle
        │   ├── MetricCard/        # Reusable KPI cards with bottom wave accents
        │   ├── ForecastChart/     # Native SVG line/area generation curves
        │   ├── DailyErrorChart/   # Native SVG daily MAE error bars
        │   └── ComparisonTable/   # 6-column hourly interval comparison table
        ├── hooks/
        │   └── useForecastData.js # State management & API synchronization hook
        ├── services/
        │   ├── forecastApi.js     # Native Fetch HTTP client with timeout
        │   └── demoFallbackData.js# Isolated offline fallback dataset
        ├── styles/
        │   └── global.css         # Theme design tokens & global resets
        └── utils/
            └── formatters.js      # MW, %, UTC timestamps, CSV export utilities
```

---

## Quickstart Guide

### Backend Setup (FastAPI)

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   - **Windows PowerShell:**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Launch the FastAPI development server:**
   ```bash
   uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```

5. **Verify backend status:**
   - Healthcheck: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
   - Interactive Swagger Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### Frontend Setup (React + Vite)

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **Start the Vite development server:**
   ```bash
   npm run dev
   ```

4. **Open the application:**
   - Navigate to [http://localhost:5173](http://localhost:5173) in your browser.

5. **Production Build:**
   ```bash
   npm run build
   ```

---

## API Reference

The backend operates on `http://127.0.0.1:8000`:

| Method | Endpoint | Query Parameters | Description |
|---|---|---|---|
| `GET` | `/` | None | Service index and endpoint sitemap. |
| `GET` | `/health` | None | Healthcheck verification probe (`{"status": "ok"}`). |
| `GET` | `/metrics` | None | Global evaluation statistics across all 744 hours. |
| `GET` | `/daily-summary` | None | Aggregated daily mean generation, daily MAE, and daily bias for 31 days. |
| `GET` | `/comparisons` | `delivery_date` (YYYY-MM-DD)<br>`limit` (default 100, max 1000)<br>`offset` (default 0) | Paginated hourly settlement comparisons. |

### Example Request
```bash
curl -s http://127.0.0.1:8000/metrics
```

### Example Response
```json
{
  "observations": 744,
  "decision_days_evaluated": 31,
  "mae_mw": 2013.01,
  "rmse_mw": 2505.94,
  "bias_mw": 1729.93,
  "wape_percent": 17.84
}
```

---

## Dashboard Components

1. **Floating Dark Sidebar:**
   - WindCast pinwheel logo branding.
   - High-contrast navigation pill (`Overview`, `Forecast Analysis`, `Hourly Records`).
   - Live backend connectivity monitor showing active connection status.

2. **Topbar Navigation:**
   - Path breadcrumbs (`WindCast › Overview`).
   - Evaluation period selector (`January 2026`).
   - Live API status pill (`API Connected`).
   - One-click manual reload button.

3. **KPI Metric Cards:**
   - **MAE:** Mean Absolute Error with purple accent and bottom background wave.
   - **RMSE:** Root Mean Squared Error with coral accent and volatility indicator.
   - **Forecast Bias:** Overforecasting flag highlighting systematic model surplus.
   - **WAPE:** Weighted Absolute Percentage Error benchmarked against total volume.

4. **Actual vs Forecast Generation Chart:**
   - Responsive native SVG line and gradient area chart.
   - Compares predicted wind generation (purple) against metered grid output (green).
   - Timeframe toggles: `7D`, `14D`, and `All`.
   - Hover crosshair and detailed tooltips.

5. **Daily Forecast Error Chart (MAE):**
   - Native SVG vertical column chart.
   - Warm amber bars displaying daily mean absolute error across all 31 delivery days.

6. **Hourly Forecast vs Actual Table:**
   - 6-column settlement interval table (`Delivery Date`, `Delivery Time (UTC)`, `Forecast (MW)`, `Actual (MW)`, `Error (MW)`, `Abs Error (MW)`).
   - Date filter dropdown to isolate individual settlement days.
   - One-click **Export CSV** action generating clean downloadable reports.

---

## Testing & Verification

### Running Backend Tests
Execute pytest inside the `backend/` directory:
```bash
cd backend
pytest -v
```
All 5 test suites validate root status, `/health`, `/metrics`, `/comparisons`, and `/daily-summary` endpoints.

### Running Frontend Linter & Build
Inside the `frontend/` directory:
```bash
cd frontend
npm run lint      # Runs oxlint static analysis
npm run build     # Runs Vite production build
```

---

## Technical Documentation

For an exhaustive technical breakdown covering:
- Elexon BMRS raw schema definitions
- Timestamp floor resampling mathematical logic
- The 11:00 UTC day-ahead cutoff algorithm
- Complete mathematical proofs and formula definitions
- A ready-to-use technical presentation script

## AI Usage Disclosure

AI tools were used to assist with the development of this project. The README documentation was also generated with AI assistance.

