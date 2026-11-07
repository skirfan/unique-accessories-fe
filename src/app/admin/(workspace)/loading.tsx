export default function AdminLoading() {
  return (
    <div className="ad-loading" role="status" aria-label="Loading workspace">
      <div className="ad-skeleton ad-skeleton-title" />
      <div className="ad-stat-grid">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="ad-skeleton ad-skeleton-stat" />
        ))}
      </div>
      <div className="ad-skeleton ad-skeleton-chart" />
      <span className="ad-sr-only">Loading your store data…</span>
    </div>
  );
}
