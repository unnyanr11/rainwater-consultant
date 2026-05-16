export default function AdminMetricChip({ label, value, sub }) {
  return (
    <div className="admin-metric-chip">
      <small>{label}</small>
      <strong>{value}</strong>
      <span>{sub}</span>
    </div>
  )
}
