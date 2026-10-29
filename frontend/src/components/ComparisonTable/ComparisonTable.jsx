import { useState, useMemo } from 'react';
import { formatNumber, exportToCSV } from '../../utils/formatters';
import './ComparisonTable.css';

export default function ComparisonTable({ comparisons = [], loading = false }) {
  const [selectedDate, setSelectedDate] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;
  const deliveryDates = useMemo(() => {
    if (!comparisons || comparisons.length === 0) return [];
    const set = new Set(comparisons.map((c) => c.deliveryDate));
    return Array.from(set).sort();
  }, [comparisons]);
  const formatTimeHHMM = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      const hours = String(d.getUTCHours()).padStart(2, '0');
      const minutes = String(d.getUTCMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return isoString;
    }
  };
  const filteredRecords = useMemo(() => {
    if (!comparisons) return [];

    return comparisons.filter((record) => {
      if (selectedDate !== 'all' && record.deliveryDate !== selectedDate) {
        return false;
      }
      return true;
    });
  }, [comparisons, selectedDate]);

  const totalItems = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentRecords = filteredRecords.slice(startIndex, endIndex);
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;
    const exportRows = filteredRecords.map((item) => ({
      'Delivery Date': item.deliveryDate,
      'Delivery Time (UTC)': formatTimeHHMM(item.startTime),
      'Forecast (MW)': item.forecast,
      'Actual (MW)': item.actual,
      'Error (MW)': item.error,
      'Abs Error (MW)': item.absoluteError,
    }));
    exportToCSV(`windcast_comparisons_${selectedDate === 'all' ? 'jan2026' : selectedDate}`, exportRows);
  };

  return (
    <div className="light-comparison-card card-base" id="hourly-records">
      <div className="table-card-topbar">
        <div className="table-title-group">
          <h2 className="table-title-main">Hourly Forecast vs Actual</h2>
          <p className="table-subtitle-main">
            Forecast and actual generation for each delivery interval (UTC).
          </p>
        </div>

        <div className="table-top-actions">
          <div className="date-select-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cal-pill-icon">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <select
              className="dates-dropdown-select"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Dates</option>
              {deliveryDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="chevron-pill-icon">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <button
            type="button"
            className="btn-purple-export"
            onClick={handleExportCSV}
            disabled={filteredRecords.length === 0}
            title="Download CSV table"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>
      </div>
      <div className="clean-table-responsive-wrapper">
        <table className="clean-data-table">
          <thead>
            <tr>
              <th scope="col" className="th-cell">Delivery Date</th>
              <th scope="col" className="th-cell">Delivery Time (UTC)</th>
              <th scope="col" className="th-cell">Forecast (MW)</th>
              <th scope="col" className="th-cell">Actual (MW)</th>
              <th scope="col" className="th-cell">Error (MW)</th>
              <th scope="col" className="th-cell">Abs Error (MW)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="table-status-cell">
                  <div className="table-loader-spinner" />
                  <span>Loading records...</span>
                </td>
              </tr>
            ) : currentRecords.length === 0 ? (
              <tr>
                <td colSpan="6" className="table-status-cell">
                  No records found for the selected date.
                </td>
              </tr>
            ) : (
              currentRecords.map((row) => {
                const isPositive = row.error > 0;
                const formattedError = `${isPositive ? '+' : ''}${formatNumber(row.error, 2)}`;

                return (
                  <tr key={`${row.deliveryDate}-${row.startTime}`} className="clean-table-row">
                    <td className="td-cell tabular-nums">{row.deliveryDate}</td>
                    <td className="td-cell tabular-nums">{formatTimeHHMM(row.startTime)}</td>
                    <td className="td-cell tabular-nums">{formatNumber(row.forecast, 2)}</td>
                    <td className="td-cell tabular-nums">{formatNumber(row.actual, 2)}</td>
                    <td className="td-cell tabular-nums td-error-red">{formattedError}</td>
                    <td className="td-cell tabular-nums">{formatNumber(row.absoluteError, 2)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {!loading && totalItems > pageSize && (
        <div className="table-pagination-row">
          <span className="pagination-info-text">
            Showing <strong className="tabular-nums">{startIndex + 1}</strong> to{' '}
            <strong className="tabular-nums">{endIndex}</strong> of{' '}
            <strong className="tabular-nums">{totalItems}</strong> intervals
          </span>

          <div className="pagination-nav-actions">
            <button
              type="button"
              className="btn-page-nav-light"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="page-current-num tabular-nums">
              {safeCurrentPage} / {totalPages}
            </span>
            <button
              type="button"
              className="btn-page-nav-light"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
