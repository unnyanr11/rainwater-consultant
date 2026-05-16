export default function AdminEmptyState({ icon, title, body, action }) {
  return (
    <div className="admin-empty-state">
      <div className="admin-empty-icon">{icon || '💧'}</div>
      <h3>{title || 'Nothing here yet'}</h3>
      <p>{body || 'Data will appear once records are added.'}</p>
      {action && <button className="admin-btn primary" onClick={action.onClick}>{action.label}</button>}
    </div>
  )
}
