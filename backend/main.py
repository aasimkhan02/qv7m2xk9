from datetime import date
from functools import lru_cache
from typing import Optional

import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from analysis import GetResults

app = FastAPI(
    title="WindCast Analytics API",
    description="Wind generation forecast evaluation API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://qv7m2xk9.vercel.app",
    ],   
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@lru_cache(maxsize=1)
def load_results():
    try:
        return GetResults()
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not load analysis results: {exc}",
        ) from exc


@app.get("/")
def root():
    return {
        "name": "WindCast Analytics API",
        "status": "running",
        "docs": "/docs",
        "endpoints": ["/health", "/metrics", "/comparisons", "/daily-summary"],
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/metrics")
def get_metrics():
    metrics, _ = load_results()
    return metrics


@app.get("/comparisons")
def get_comparisons(
    delivery_date: Optional[date] = Query(
        default=None, description="Filter by delivery date, e.g. 2026-01-02"
    ),
    limit: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
):
    _, comparison = load_results()
    data = comparison.copy()

    if delivery_date is not None:
        data = data.loc[
            pd.to_datetime(data["deliveryDate"]).dt.date == delivery_date
        ]

    total = int(len(data))
    page = data.iloc[offset:offset + limit].copy()

    for column in ["startTime", "publishTime"]:
        if column in page.columns:
            page[column] = pd.to_datetime(page[column], utc=True).map(
                lambda value: value.isoformat()
            )

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "items": page.to_dict(orient="records"),
    }


@app.get("/daily-summary")
def get_daily_summary():
    _, comparison = load_results()
    summary = (
        comparison.groupby(["decisionDate", "deliveryDate"], as_index=False)
        .agg(
            observations=("actual", "size"),
            actual_mean_mw=("actual", "mean"),
            forecast_mean_mw=("forecast", "mean"),
            mae_mw=("absoluteError", "mean"),
            bias_mw=("error", "mean"),
        )
    )

    numeric_columns = [
        "actual_mean_mw", "forecast_mean_mw", "mae_mw", "bias_mw"
    ]
    summary[numeric_columns] = summary[numeric_columns].round(2)
    return {"items": summary.to_dict(orient="records")}
