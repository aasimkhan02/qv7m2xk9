
import json
from pathlib import Path

import pandas as pd


DATA_DIR = Path(__file__).parent / "data"
ACTUAL_FILES = [
    DATA_DIR / "wind_actuals_jan2026.json",
    DATA_DIR / "wind_actuals_feb1.json",
]
FORECAST_FILE = DATA_DIR / "wind_forecasts_jan2026.json"
DECISION_HOUR_UTC = 11


def ReadJSON(path: Path) -> pd.DataFrame:
    with path.open("r", encoding="utf-8") as file:
        data = json.load(file)
    if isinstance(data, dict):
        data =data.get("data", data.get("results", []))

    return pd.DataFrame(data)

def LoadActuals() -> pd.DataFrame:
    frames = []

    for path in ACTUAL_FILES:
        if not path.exists():
            raise FileNotFoundError(f"Missing actuals file: {path}")

        dataframe = ReadJSON(path)
        if "fuelType" not in dataframe.columns:
            raise ValueError(f"Missing fuelType column in {path.name}")
        dataframe = dataframe.loc[
            (dataframe["dataset"] == "FUELHH") & (dataframe["fuelType"] == "WIND"),
            ["startTime", "generation"],
        ]

        frames.append(dataframe)

    actuals = pd.concat(frames, ignore_index=True)
    actuals["startTime"] = pd.to_datetime(
        actuals["startTime"], utc=True, errors="coerce"
    )
    actuals["generation"] = pd.to_numeric(
        actuals["generation"], errors="coerce"
    )

    actuals = actuals.dropna(subset=["startTime", "generation"])
    actuals= actuals.drop_duplicates("startTime", keep="last")
    actuals["hour"] = actuals["startTime"].dt.floor("h")

    return (
        actuals.groupby("hour", as_index=False)["generation"]
        .mean()
        .rename(columns={"generation": "actual"})
    )

def LoadForecasts() -> pd.DataFrame:
    if not FORECAST_FILE.exists():
        raise FileNotFoundError(
            f"Missing forecasts file: {FORECAST_FILE}"
        )

    forecasts = ReadJSON(FORECAST_FILE)

    required = {"dataset", "publishTime", "startTime", "generation"}
    missing = required.difference(forecasts.columns)

    if missing:
        raise ValueError(
            f"Forecast file is missing columns: {sorted(missing)}"
        )

    forecasts = forecasts.loc[forecasts["dataset"] == "WINDFOR"].copy()

    for column in ["publishTime", "startTime"]:
        forecasts[column] = pd.to_datetime(
            forecasts[column], utc=True, errors="coerce"
        )

    forecasts["generation"] = pd.to_numeric(
        forecasts["generation"], errors="coerce"
    )

    return forecasts.dropna(
        subset=["publishTime", "startTime", "generation"]
    )


def BuildComparision() -> pd.DataFrame:
    actuals = LoadActuals()
    forecasts = LoadForecasts()
    results =[]

    for day in pd.date_range("2026-01-01", "2026-01-31", freq="D", tz="UTC"):
        cutoff = day + pd.Timedelta(hours=DECISION_HOUR_UTC)
        delivery_day = day + pd.Timedelta(days=1)

        eligible = forecasts.loc[
            (forecasts["publishTime"] <= cutoff)
            & (forecasts["startTime"].dt.date == delivery_day.date())
        ]

        selected = (eligible.sort_values("publishTime").drop_duplicates("startTime", keep="last"))
        day_actuals = actuals.loc[
            actuals["hour"].dt.date == delivery_day.date()
        ]

        matched = selected.merge(
            day_actuals,
            left_on="startTime",
            right_on="hour",
            how="inner",
        )
        if matched.empty:
            continue

        matched["decisionDate"] = day.strftime("%Y-%m-%d")
        matched["cutoffTime"] = cutoff.isoformat()
        matched["deliveryDate"] = delivery_day.strftime("%Y-%m-%d")
        matched["error"] = matched["generation"] - matched["actual"]
        matched["absoluteError"] = matched["error"].abs()
        matched["squaredError"] = matched["error"] ** 2
        results.append(
            matched[
                [
                    "decisionDate",
                    "cutoffTime",
                    "deliveryDate",
                    "startTime",
                    "publishTime",
                    "generation",
                    "actual",
                    "error",
                    "absoluteError",
                    "squaredError",
                ]
            ].rename(columns={"generation": "forecast"})
        )

    if not results:
        raise ValueError(
            "No matched observations. Check file names and timestamps."
        )

    comparison = pd.concat(results, ignore_index=True)

    return comparison.sort_values(
        ["decisionDate", "startTime"]
    ).reset_index(drop=True)


def CalculateMetrics(comparison: pd.DataFrame) -> dict:
    error = comparison["error"]
    actual = comparison["actual"]
    actual_total = actual.abs().sum()

    wape = error.abs().sum() / actual_total * 100 if actual_total else None

    return {
        "observations": int(len(comparison)),
        "decision_days_evaluated": int(
            comparison["decisionDate"].nunique()
        ),
        "mae_mw": round(float(error.abs().mean()), 2),
        "rmse_mw": round(float((error.pow(2).mean()) ** 0.5), 2),
        "bias_mw": round(float(error.mean()), 2),
        "wape_percent": round(float(wape), 2) if wape is not None else None,
    }


def GetResults():
    comparison = BuildComparision()
    return CalculateMetrics(comparison), comparison

if __name__ == "__main__":
    metrics, comparison = GetResults()

    print("\nForecast evaluation metrics:")
    print(json.dumps(metrics, indent=2))

    print("\nFirst five matched records:")
    print(comparison.head().to_string(index=False))

    output_path = DATA_DIR / "comparison_results.csv"
    comparison.to_csv(output_path, index=False)

    print(f"\nSaved comparison data to: {output_path}")
