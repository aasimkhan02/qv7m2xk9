import { formatNumber, formatSignedMW, formatPercent } from '../../utils/formatters';
import './AccuracySnapshot.css';

export default function AccuracySnapshot({ metrics, loading = false }) {
  const observations = metrics?.observations ?? 744;
  const decisionDays = metrics?.decision_days_evaluated ?? 31;
  const bias = metrics?.bias_mw ?? 1729.93;
  const wape = metrics?.wape_percent ?? 17.84;
  const complement = wape !== null && wape !== undefined ? (100 - Number(wape)).toFixed(2) : null;

  return (
    <div className="accuracy-snapshot-card card-base">
      <div className="snapshot-header">
        <div className="snapshot-title-group">
          <div className="snapshot-badge">Model Performance</div>
          <h2 className="snapshot-title">Accuracy & Bias Snapshot</h2>
        </div>
        <div className="snapshot-gate-tag">Cutoff: 11:00 UTC</div>
      </div>

      <div className="snapshot-metrics-grid">
        <div className="snapshot-metric-item">
          <span className="item-label">Total Observations</span>
          <span className="item-value tabular-nums">{loading ? '...' : formatNumber(observations, 0)}</span>
          <span className="item-caption">Hourly settlement periods</span>
        </div>

        <div className="snapshot-metric-item">
          <span className="item-label">Decision Days</span>
          <span className="item-value tabular-nums">{loading ? '...' : decisionDays}</span>
          <span className="item-caption">Jan 01 – Jan 31, 2026</span>
        </div>

        <div className="snapshot-metric-item highlight-bias">
          <span className="item-label">Mean Forecast Bias</span>
          <span className="item-value tabular-nums text-bias">
            {loading ? '...' : formatSignedMW(bias, 2)}
          </span>
          <span className="item-caption">Systematic overforecasting</span>
        </div>

        <div className="snapshot-metric-item highlight-wape">
          <span className="item-label">WAPE</span>
          <span className="item-value tabular-nums text-wape">
            {loading ? '...' : formatPercent(wape, 2)}
          </span>
          <span className="item-caption">Weighted abs percentage error</span>
        </div>
      </div>
      <div className="snapshot-analysis-box">
        <div className="bias-explanation">
          <div className="explanation-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="bias-icon">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="explanation-title">Bias Interpretation: Systematic Overforecasting</span>
          </div>
          <p className="explanation-body">
            The positive forecast bias of <strong>{formatSignedMW(bias, 2)}</strong> demonstrates that the day-ahead wind model 
            persistently overpredicted power generation across the evaluation period. In wholesale energy markets, consistent overforecasting 
            leaves traders structurally long going into real-time dispatch, requiring expensive system balancing mechanism buy-backs.
          </p>
        </div>

        <div className="complement-disclaimer">
          <div className="complement-row">
            <span className="complement-label">Arithmetic Complement (100% − WAPE):</span>
            <span className="complement-val tabular-nums">{complement ? `${complement}%` : '—'}</span>
          </div>
          <p className="complement-note">
            <strong>Important methodological distinction:</strong> This value is displayed strictly as a mathematical complement 
            (100% − WAPE) and must <em>not</em> be interpreted as a formal, industry-validated forecasting accuracy score.
          </p>
        </div>
      </div>
    </div>
  );
}
