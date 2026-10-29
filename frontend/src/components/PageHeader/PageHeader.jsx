import './PageHeader.css';

export default function PageHeader() {
  return (
    <div className="clean-page-header">
      <h1 className="clean-page-title">Forecast Overview</h1>
      <p className="clean-page-sub">
        Day-ahead wind generation forecasts vs actual metered generation.
      </p>
    </div>
  );
}
