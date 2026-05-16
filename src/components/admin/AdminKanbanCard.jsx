export default function AdminKanbanCard({ title, items = [] }) {
  return (
    <div className="admin-kanban-card">
      <div className="admin-kanban-header">
        <h4>{title}</h4>
        <span className="admin-kanban-count">{items.length}</span>
      </div>
      <div className="admin-mini-list">
        {items.length === 0 && (
          <div className="admin-mini-empty">No items here</div>
        )}
        {items.map((item, i) => (
          <div key={i} className="admin-mini-item">
            <strong>{item.client_name || 'Client'}</strong>
            <span>{item.project_type || '—'}</span>
            <span className={`admin-status-dot ${item.status}`} />
          </div>
        ))}
      </div>
    </div>
  )
}
