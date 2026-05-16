export default function AdminKanbanCard({ title, items = [] }) {
  return (
    <div className="admin-kanban-card">
      <h4>{title}</h4>
      <div className="admin-mini-list">
        {items.length === 0 && (
          <div className="admin-mini-item">
            <strong>All clear</strong>
            <span>Nothing in this lane right now.</span>
          </div>
        )}
        {items.map((item, i) => (
          <div key={i} className="admin-mini-item">
            <strong>{item.client_name || 'Project'}</strong>
            <span>{item.project_type || item.status?.replace(/_/g, ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
