import { useState, useMemo } from 'react';
import { formatMW, formatDateShort } from '../../utils/formatters';
import './DailyErrorChart.css';

export default function DailyErrorChart({ dailyData = [], loading = false }) {
  const [hoveredBar, setHoveredBar] = useState(null);
  const svgWidth = 420;
  const svgHeight = 250;
  const padding = { top: 20, right: 16, bottom: 35, left: 50 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;
  const { bars, yTicks, maxVal } = useMemo(() => {
    const yMax = 5000;
    const ticks = [0, 1000, 2000, 3000, 4000, 5000];

    if (!dailyData || dailyData.length === 0) {
      return { bars: [], yTicks: ticks, maxVal: yMax };
    }

    const n = dailyData.length;
    const slotWidth = chartWidth / Math.max(n, 1);
    const barWidth = Math.max(slotWidth * 0.55, 3.5);

    const barItems = dailyData.map((d, i) => {
      const centerX = padding.left + i * slotWidth + slotWidth / 2;
      const x = centerX - barWidth / 2;
      const maeVal = Math.min(d.mae_mw || 0, yMax);
      const h = (maeVal / yMax) * chartHeight;
      const y = padding.top + chartHeight - h;

      return {
        ...d,
        x,
        y,
        centerX,
        barWidth,
        h,
        index: i,
      };
    });

    return { bars: barItems, yTicks: ticks, maxVal: yMax };
  }, [dailyData, chartWidth, chartHeight, padding.left, padding.top]);

  return (
    <div className="light-error-card card-base">
      <div className="error-card-header">
        <h2 className="error-title-main">Daily Forecast Error (MAE)</h2>
        <p className="error-subtitle-main">Mean absolute error per delivery day.</p>
      </div>
      <div className="error-svg-wrapper">
        {loading ? (
          <div className="error-loading-state">
            <div className="spinner-light-amber" />
            <span>Loading error bars...</span>
          </div>
        ) : bars.length === 0 ? (
          <div className="error-empty-state">No error records available.</div>
        ) : (
          <div className="svg-rel-container">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="light-error-svg">

              <text
                x={-((padding.top + chartHeight) / 2)}
                y={14}
                transform="rotate(-90)"
                textAnchor="middle"
                className="axis-title-text"
              >
                MAE (MW)
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
                      x={padding.left - 6}
                      y={yPos + 4}
                      className="axis-tick-text tick-y"
                    >
                      {tickVal.toLocaleString('en-US')}
                    </text>
                  </g>
                );
              })}

              {bars.map((bar, i) => {
                const show = i % 4 === 0 || i === bars.length - 1;
                if (!show) return null;

                return (
                  <text
                    key={`label-${bar.deliveryDate}`}
                    x={bar.centerX}
                    y={padding.top + chartHeight + 20}
                    className="axis-tick-text tick-x"
                    textAnchor="middle"
                  >
                    {formatDateShort(bar.deliveryDate)}
                  </text>
                );
              })}

              {bars.map((bar) => {
                const isHovered = hoveredBar?.deliveryDate === bar.deliveryDate;
                return (
                  <rect
                    key={bar.deliveryDate}
                    x={bar.x}
                    y={bar.y}
                    width={bar.barWidth}
                    height={Math.max(bar.h, 2)}
                    rx={2}
                    className={`light-amber-bar ${isHovered ? 'hovered' : ''}`}
                    onMouseEnter={() => setHoveredBar(bar)}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                );
              })}
            </svg>
            {hoveredBar && (
              <div
                className="light-bar-tooltip"
                style={{
                  left: `${(hoveredBar.centerX / svgWidth) * 100}%`,
                  top: `${hoveredBar.y - 8}px`,
                }}
              >
                <div className="tooltip-head">{hoveredBar.deliveryDate}</div>
                <div className="tooltip-entry">
                  <span className="tooltip-lbl">MAE:</span>
                  <span className="tooltip-val">{formatMW(hoveredBar.mae_mw, 1)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
