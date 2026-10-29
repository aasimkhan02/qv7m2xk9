# WindCast Analytics — Backend API

FastAPI and pandas backend service for evaluating day-ahead wind power generation forecasts against metered grid actuals from Elexon BMRS.

---

## Directory Layout

```text
backend/
├── main.py                    # FastAPI application, routing, CORS, in-memory LRU cache
├── analysis.py                # Pipeline: Ingestion, 11:00 UTC cutoff filter, metrics
├── requirements.txt           # Python dependencies
├── test_api.py                # Pytest automated test suite
├── README_BACKEND.md          # Backend instructions (this file)
└── data/
    ├── wind_actuals_jan2026.json   # Actuals for January 2026 (FUELHH dataset)
    ├── wind_actuals_feb1.json      # Actuals for February 1, 2026
    └── wind_forecasts_jan2026.json # Day-ahead forecasts (WINDFOR dataset)
```

---

## Getting Started

### 1. Environment Setup

Create and activate a Python virtual environment:

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

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Start the Server

```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

- API Base URL: `http://127.0.0.1:8000`
- Interactive Swagger Documentation: `http://127.0.0.1:8000/docs`
- Redoc Documentation: `http://127.0.0.1:8000/redoc`

---

## Endpoints

| Method | Endpoint | Query Parameters | Description |
|---|---|---|---|
| `GET` | `/` | None | API status and endpoint directory. |
| `GET` | `/health` | None | Healthcheck probe (`{"status": "ok"}`). |
| `GET` | `/metrics` | None | Global evaluation statistics across all 744 hours (MAE, RMSE, Bias, WAPE). |
| `GET` | `/daily-summary` | None | Aggregated daily mean actual/forecast generation, daily MAE, and daily bias. |
| `GET` | `/comparisons` | `delivery_date`, `limit`, `offset` | Paginated hourly settlement comparisons. |

---

## Running Tests

Run the test suite with pytest:

```bash
pytest -v
```
