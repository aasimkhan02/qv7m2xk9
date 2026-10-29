import { useState, useMemo, useRef } from 'react';
import { formatMW, formatDateShort } from '../../utils/formatters';
import './ForecastChart.css';

export default function ForecastChart({ dailyData = [], loading = false }) {
  const [timeRange, setTimeRange] = useState('All');
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const svgRef = useRef(null);
  const filteredData = useMemo(() => {
    if (!dailyData || dailyData.length === 0) return [];
    if (timeRange === '7D') {
      return dailyData.slice(-7);
    }
    if (timeRange === '14D') {
      return dailyData.slice(-14);
    }
    return dailyData;
  }, [dailyData, timeRange]);

  const svgWidth = 640;
  const svgHeight = 250;
  const padding = { top: 20, right: 24, bottom: 35, left: 56 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  const { points, yTicks, maxVal } = useMemo(() => {
    const yMax = 25000;
    const ticks = [0, 5000, 10000, 15000, 20000, 25000];

    if (filteredData.length === 0) {
      return { points: [], yTicks: ticks, maxVal: yMax };
    }

    const pts = filteredData.map((d, i) => {
      const x = padding.left + (i / Math.max(filteredData.length - 1, 1)) * chartWidth;
      const yForecast = padding.top + chartHeight - (d.forecast_mean_mw / yMax) * chartHeight;
      const yActual = padding.top + chartHeight - (d.actual_mean_mw / yMax) * chartHeight;
      return {
        ...d,
        x,
        yForecast,
        yActual,
        index: i,
      };
    });

    return { points: pts, yTicks: ticks, maxVal: yMax };
  }, [filteredData, chartWidth, chartHeight, padding.left, padding.top]);

  const forecastPath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.yForecast.toFixed(1)}`, '');
  }, [points]);

  const actualPath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.yActual.toFixed(1)}`, '');
  }, [points]);

  const forecastAreaPath = useMemo(() => {
    if (points.length === 0) return '';
    const baseline = padding.top + chartHeight;
    const firstX = points[0].x.toFixed(1);
    const lastX = points[points.length - 1].x.toFixed(1);
    return `${forecastPath} L ${lastX} ${baseline} L ${firstX} ${baseline} Z`;
  }, [forecastPath, points, padding.top, chartHeight]);

  const actualAreaPath = useMemo(() => {
    if (points.length === 0) return '';
    const baseline = padding.top + chartHeight;
    const firstX = points[0].x.toFixed(1);
    const lastX = points[points.length - 1].x.toFixed(1);
    return `${actualPath} L ${lastX} ${baseline} L ${firstX} ${baseline} Z`;
  }, [actualPath, points, padding.top, chartHeight]);

  const handleMouseMove = (e) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * svgWidth;

    let nearestIndex = 0;
    let minDistance = Infinity;

    points.forEach((pt, i) => {
      const dist = Math.abs(pt.x - mouseX);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = i;
      }
    });

    setHoveredIndex(nearestIndex);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="light-forecast-card card-base" id="forecast-analysis">
      <div className="forecast-card-header">
        <div className="forecast-title-group">
          <h2 className="forecast-title-main">Actual vs Forecast Generation</h2>
          <p className="forecast-subtitle-main">
            Daily mean generation across January 2026.
          </p>
        </div>
        <div className="forecast-range-tabs" role="group" aria-label="Timeframe selector">
          {['7D', '14D', 'All'].map((t) => (
            <button
              key={t}
              type="button"
              className={`range-tab-btn ${timeRange === t ? 'active-purple' : ''}`}
              onClick={() => setTimeRange(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="forecast-svg-wrapper">
        {loading ? (
          <div className="chart-loading-state">
            <div className="spinner-light" />
            <span>Loading generation curves...</span>
          </div>
        ) : points.length === 0 ? (
          <div className="chart-empty-state">No daily generation records available.</div>
        ) : (
          <div className="svg-rel-container">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="light-chart-svg"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="greenAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <text
                x={-((padding.top + chartHeight) / 2)}
                y={14}
                transform="rotate(-90)"
                textAnchor="middle"
                className="axis-title-text"
              >
                Generation (MW)
              </text>
              {yTicks.map((tickVal) => {
                const yPos = padding.top + chartHeight - (tickVal / maxVal) * chartHeight;
                return (
                  <g key={tickVal}>
                    <line
                      x1={padding.left}
                      y1={yPos}
                      x2={svgWidth - padding.right}
                      y2={yPos}
                      className="light-grid-line"
                    />
                    <text
                      x={padding.left - 8}
                      y={yPos + 4}
                      className="axis-tick-text tick-y"
                    >
                      {tickVal.toLocaleString('en-US')}
                    </text>
                  </g>
                );
              })}
              {points.map((pt, i) => {
                const stride = timeRange === '7D' ? 1 : timeRange === '14D' ? 2 : 4;
                const isFirst = i === 0;
                const isLast = i === points.length - 1;
                const show = i % stride === 0 || isLast;

                if (!show) return null;

                return (
                  <text
                    key={pt.deliveryDate}
                    x={pt.x}
                    y={padding.top + chartHeight + 20}
                    className="axis-tick-text tick-x"
                    textAnchor={isFirst ? 'start' : isLast ? 'end' : 'middle'}
                  >
                    {formatDateShort(pt.deliveryDate)}
                  </text>
                );
              })}
              <path d={forecastAreaPath} fill="url(#purpleAreaGrad)" />
              <path d={actualAreaPath} fill="url(#greenAreaGrad)" />
              <path d={forecastPath} className="svg-curve-line curve-purple" />
              <path d={actualPath} className="svg-curve-line curve-green" />
              {activePoint && (
                <g>
                  <line
                    x1={activePoint.x}
                    y1={padding.top}
                    x2={activePoint.x}
                    y2={padding.top + chartHeight}
                    className="hover-cursor-line"
                  />
                  <circle cx={activePoint.x} cy={activePoint.yForecast} r="4.5" className="hover-dot dot-purple" />
                  <circle cx={activePoint.x} cy={activePoint.yActual} r="4.5" className="hover-dot dot-green" />
                </g>
              )}
            </svg>
            {activePoint && (
              <div
                className="light-chart-tooltip"
                style={{
                  left: `${(activePoint.x / svgWidth) * 100}%`,
                  top: `${Math.min(activePoint.yForecast, activePoint.yActual) - 6}px`,
                }}
              >
                <div className="tooltip-head">{activePoint.deliveryDate}</div>
                <div className="tooltip-entry">
                  <span className="dot-forecast-purple" />
                  <span className="tooltip-lbl">Forecast:</span>
                  <span className="tooltip-val">{formatMW(activePoint.forecast_mean_mw, 1)}</span>
                </div>
                <div className="tooltip-entry">
                  <span className="dot-actual-green" />
                  <span className="tooltip-lbl">Actual:</span>
                  <span className="tooltip-val">{formatMW(activePoint.actual_mean_mw, 1)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="forecast-bottom-legend">
        <div className="legend-item">
          <span className="legend-dot dot-purple" />
          <span className="legend-label">Forecast (Daily Mean)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot dot-green" />
          <span className="legend-label">Actual Generation (Daily Mean)</span>
        </div>
      </div>
    </div>
  );
}
