import './MetricCard.css';

export default function MetricCard({
  title,
  subtitle,
  value,
  unit,
  footerText,
  type = 'mae', 
  loading = false,
}) {
  const waveforms = {
    mae: {
      color: '#8b5cf6',
      fillId: 'maeWaveFill',
      path: 'M 20 40 Q 60 22 95 30 T 160 14 L 160 40 L 20 40 Z',
      stroke: 'M 20 40 Q 60 22 95 30 T 160 14',
    },
    rmse: {
      color: '#f87171',
      fillId: 'rmseWaveFill',
      path: 'M 30 40 Q 70 24 105 32 T 160 18 L 160 40 L 30 40 Z',
      stroke: 'M 30 40 Q 70 24 105 32 T 160 18',
    },
    bias: {
      color: '#f59e0b',
      fillId: 'biasWaveFill',
      path: 'M 40 40 Q 80 30 115 34 T 160 22 L 160 40 L 40 40 Z',
      stroke: 'M 40 40 Q 80 30 115 34 T 160 22',
    },
    wape: {
      color: '#10b981',
      fillId: 'wapeWaveFill',
      path: 'M 15 40 Q 55 20 90 28 T 160 12 L 160 40 L 15 40 Z',
      stroke: 'M 15 40 Q 55 20 90 28 T 160 12',
    },
  };

  const wave = waveforms[type] || waveforms.mae;

  const renderIcon = () => {
    switch (type) {
      case 'mae':
        return (
          <div className="card-icon-badge badge-mae">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="11" width="3.5" height="9" rx="1.75" fill="#7c3aed" />
              <rect x="10.25" y="4" width="3.5" height="16" rx="1.75" fill="#7c3aed" />
              <rect x="16.5" y="8" width="3.5" height="12" rx="1.75" fill="#7c3aed" />
            </svg>
          </div>
        );
      case 'rmse':
        return (
          <div className="card-icon-badge badge-rmse">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 13 C 6 8, 9 8, 12 12 C 15 16, 18 16, 21 11" />
            </svg>
          </div>
        );
      case 'bias':
        return (
          <div className="card-icon-badge badge-bias">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="6" y1="18" x2="18" y2="6" />
              <polyline points="9 6 18 6 18 15" />
            </svg>
          </div>
        );
      case 'wape':
      default:
        return (
          <div className="card-icon-badge badge-wape">
            <span className="wape-percent-symbol">%</span>
          </div>
        );
    }
  };

  return (
    <div className={`light-kpi-card card-base card-${type}`}>
 
      <div className="kpi-content-wrap">
        <div className="kpi-top-row">
          {renderIcon()}
          <div className="kpi-title-block">
            <div className="kpi-main-name">{title}</div>
            {subtitle && <div className="kpi-sub-name">{subtitle}</div>}
          </div>
        </div>

        <div className="kpi-value-row">
          {loading ? (
            <div className="kpi-skeleton-loading" />
          ) : (
            <>
              <span className="kpi-number tabular-nums">{value}</span>
              {unit && <span className="kpi-unit">{unit}</span>}
            </>
          )}
        </div>

        <div className="kpi-footer-row">
          <span className="kpi-footer-label">{footerText}</span>
        </div>
      </div>

      <div className="kpi-decorative-wave" aria-hidden="true">
        <svg viewBox="0 0 160 40" preserveAspectRatio="none" className="kpi-wave-svg">
          <defs>
            <linearGradient id={wave.fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={wave.color} stopOpacity="0.14" />
              <stop offset="100%" stopColor={wave.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={wave.path} fill={`url(#${wave.fillId})`} />
          <path d={wave.stroke} fill="none" stroke={wave.color} strokeWidth="1.6" strokeOpacity="0.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
