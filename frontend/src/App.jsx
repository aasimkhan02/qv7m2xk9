import { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import PageHeader from './components/PageHeader/PageHeader';
import MetricCard from './components/MetricCard/MetricCard';
import ForecastChart from './components/ForecastChart/ForecastChart';
import DailyErrorChart from './components/DailyErrorChart/DailyErrorChart';
import ComparisonTable from './components/ComparisonTable/ComparisonTable';

import { useForecastData } from './hooks/useForecastData';
import { formatNumber, formatSignedMW, formatPercent } from './utils/formatters';

import './App.css';

export default function App() {
  const [activeNav, setActiveNav] = useState('overview');

  const {
    metrics,
    dailySummary,
    comparisons,
    loading,
    backendConnected,
    refresh,
  } = useForecastData();

  const handleNavSelect = (sectionId) => {
    setActiveNav(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app-root">
      <Sidebar 
        activeNav={activeNav} 
        onNavSelect={handleNavSelect}
        backendConnected={backendConnected}
      />

      <div className="main-viewport">
        <main className="dashboard-scroll-content">
          <PageHeader />
          <section className="kpi-cards-grid" id="overview" aria-label="Key Performance Indicators">
            <MetricCard
              title="Mean Absolute Error"
              subtitle="MAE"
              value={metrics ? formatNumber(metrics.mae_mw, 2) : '2,013.01'}
              unit="MW"
              footerText="Average forecast deviation"
              type="mae"
              loading={loading}
            />

            <MetricCard
              title="Root Mean Squared Error"
              subtitle="RMSE"
              value={metrics ? formatNumber(metrics.rmse_mw, 2) : '2,505.94'}
              unit="MW"
              footerText="Penalizes larger errors"
              type="rmse"
              loading={loading}
            />

            <MetricCard
              title="Forecast Bias"
              value={metrics ? formatSignedMW(metrics.bias_mw, 2).replace(' MW', '') : '+1,729.93'}
              unit="MW"
              footerText="Positive means overforecasting"
              type="bias"
              loading={loading}
            />

            <MetricCard
              title="Weighted Absolute Percentage Error"
              subtitle="WAPE"
              value={metrics ? formatPercent(metrics.wape_percent, 2).replace('%', '') : '17.84'}
              unit="%"
              footerText="Relative to actual generation"
              type="wape"
              loading={loading}
            />
          </section>
          <section className="charts-split-grid" aria-label="Forecast generation charts">
            <ForecastChart
              dailyData={dailySummary}
              loading={loading}
            />

            <DailyErrorChart
              dailyData={dailySummary}
              loading={loading}
            />
          </section>
          <section aria-label="Hourly comparison table">
            <ComparisonTable
              comparisons={comparisons}
              loading={loading}
            />
          </section>
        </main>
      </div>
    </div>
  );
}
