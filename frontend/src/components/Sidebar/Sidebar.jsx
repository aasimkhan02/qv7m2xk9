import { useState } from 'react';
import './Sidebar.css';

export default function Sidebar({ 
  activeNav = 'overview', 
  onNavSelect,
  backendConnected = true 
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: 'forecast-analysis',
      label: 'Forecast Analysis',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      id: 'hourly-records',
      label: 'Hourly Records',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      ),
    },
  ];

  const handleSelect = (id) => {
    if (onNavSelect) {
      onNavSelect(id);
    }
    setMobileOpen(false);
  };

  return (
    <>
      <button 
        type="button" 
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {mobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {mobileOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside className={`sidebar-island ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand-block">
          <div className="brand-pinwheel-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="2.2" />
              <path d="M12 9.8C12 5.5 15.5 3 15.5 3S14.2 7.2 12 9.8Z" />
              <path d="M10.1 13.1C6.4 15.2 4 13 4 13S7.7 11.2 10.1 13.1Z" />
              <path d="M13.9 13.1C17.6 15.2 20 13 20 13S16.3 11.2 13.9 13.1Z" />
            </svg>
          </div>
          <div className="brand-text-block">
            <span className="brand-title">WindCast</span>
            <span className="brand-tagline">ANALYTICS</span>
          </div>
        </div>
        <nav className="sidebar-nav-list">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-nav-btn ${isActive ? 'nav-active-lime' : ''}`}
                onClick={() => handleSelect(item.id)}
              >
                <span className="nav-btn-icon">{item.icon}</span>
                <span className="nav-btn-label">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-bottom-block">
          <div className="backend-conn-card">
            <div className="conn-status-row">
              <span className={`conn-indicator-dot ${backendConnected ? 'dot-green' : 'dot-red'}`} />
              <span className="conn-status-label">
                {backendConnected ? 'Backend Connected' : 'Backend Offline'}
              </span>
            </div>
            <div className="conn-subtext">
              FastAPI • 127.0.0.1:8000
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
