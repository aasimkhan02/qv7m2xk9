/**
 * WindCast Analytics - Formatting & Export Utilities
 */

/**
 * Format a number to standard locale string with fixed decimals
 */
export function formatNumber(val, decimals = 2) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return Number(val).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format megawatt values (e.g. 15,366.5 MW)
 */
export function formatMW(val, decimals = 1) {
  if (val === null || val === undefined || isNaN(val)) return '— MW';
  return `${formatNumber(val, decimals)} MW`;
}

/**
 * Format signed megawatt values (e.g. +1,729.93 MW or -342.10 MW)
 */
export function formatSignedMW(val, decimals = 2) {
  if (val === null || val === undefined || isNaN(val)) return '— MW';
  const num = Number(val);
  const sign = num > 0 ? '+' : '';
  return `${sign}${formatNumber(num, decimals)} MW`;
}

/**
 * Format percentage values (e.g. 17.84%)
 */
export function formatPercent(val, decimals = 2) {
  if (val === null || val === undefined || isNaN(val)) return '— %';
  return `${formatNumber(val, decimals)}%`;
}

/**
 * Format ISO datetime string to consistent UTC display (YYYY-MM-DD HH:mm UTC)
 */
export function formatDateTimeUTC(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;

    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const minutes = String(d.getUTCMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes} UTC`;
  } catch {
    return isoString;
  }
}

/**
 * Format short month day in UTC (e.g. "Jan 02")
 */
export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00Z`);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getUTCMonth()];
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${month} ${day}`;
  } catch {
    return dateStr;
  }
}

/**
 * Categorize error deviation with explicit documented thresholds
 * Threshold rationale:
 *  - High: absolute error > 2,500 MW (above overall evaluation RMSE of 2,505.94 MW)
 *  - Moderate: 1,000 MW <= absolute error <= 2,500 MW
 *  - Low: absolute error < 1,000 MW
 */
export function getDeviationStatus(absoluteError) {
  const err = Number(absoluteError);
  if (isNaN(err)) return { level: 'unknown', label: 'Unknown', className: 'status-unknown' };

  if (err > 2500) {
    return {
      level: 'high',
      label: 'High Deviation',
      threshold: '> 2,500 MW (> RMSE)',
      badgeClass: 'badge-danger',
    };
  }
  if (err >= 1000) {
    return {
      level: 'moderate',
      label: 'Moderate Deviation',
      threshold: '1,000 - 2,500 MW',
      badgeClass: 'badge-bias',
    };
  }
  return {
    level: 'low',
    label: 'Low Deviation',
    threshold: '< 1,000 MW',
    badgeClass: 'badge-actual',
  };
}

/**
 * Export array of objects to downloadable CSV
 */
export function exportToCSV(filename, data) {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      if (val === null || val === undefined) return '""';
      const escaped = String(val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
