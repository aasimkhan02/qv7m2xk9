# WindCast Analytics — Frontend Dashboard

A modern, responsive React 19 analytics dashboard built with Vite and vanilla CSS. Evaluates day-ahead wind power generation forecasts against actual electricity grid data for January 2026.

---

## Features

- **Hybrid Theme Layout:** Floating dark navigation sidebar island paired with clean, modern cards on a soft slate canvas.
- **Native SVG Visualizations:** Dual-line generation curves and daily MAE error bar charts created purely with responsive SVG paths—no large charting library overhead.
- **Dynamic Connection Detection:** Monitors FastAPI backend health on `http://127.0.0.1:8000` with automated offline fallback and reconnect triggers.
- **Settlement Interval Table:** 6-column hourly comparison grid with date filtering and CSV export.
- **Zero Heavy UI Frameworks:** Built with standard React, pure CSS modules, and the native Fetch API.

---

## Directory Structure

```text
frontend/src/
├── main.jsx                     # Root entry point
├── App.jsx                      # Coordinator component
├── App.css                      # Layout grids and canvas styles
├── components/
│   ├── Sidebar/                 # Floating dark sidebar island & status pill
│   ├── Topbar/                  # Breadcrumbs, date selector, refresh button
│   ├── PageHeader/              # View title & subtitle
│   ├── MetricCard/              # KPI card with background wave graphics
│   ├── ForecastChart/           # Native SVG line/area generation curves
│   ├── DailyErrorChart/         # Native SVG daily MAE error bars
│   └── ComparisonTable/         # 6-column hourly settlement table
├── hooks/
│   └── useForecastData.js       # Asynchronous data fetching and state hook
├── services/
│   ├── forecastApi.js           # Centralized API service with timeout handling
│   └── demoFallbackData.js      # Isolated offline demo dataset
├── styles/
│   └── global.css               # Design tokens, variables, resets
└── utils/
    └── formatters.js            # MW, %, UTC timestamps, CSV export utilities
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration (Optional)
By default, the frontend connects to `http://127.0.0.1:8000`. You can configure a custom backend endpoint via `.env`:
```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```

### 5. Linting
```bash
npm run lint
```
