import AdminMetricChip from './AdminMetricChip'

export default function AdminStatRow({ stats = [] }) {
  return (
    <div className="admin-stat-row">
      {stats.map((s, i) => (
        <AdminMetricChip key={i} {...s} delay={i * 80} />
      ))}
    </div>
  )
}
