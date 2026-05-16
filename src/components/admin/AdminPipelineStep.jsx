export default function AdminPipelineStep({ label, value, tag, desc }) {
  return (
    <div className="admin-pipeline-step">
      <em className={`admin-tag admin-tag-${tag}`}>{tag}</em>
      <h4>{value}</h4>
      <strong style={{ fontSize: 'var(--text-sm)', display: 'block', marginBottom: '0.4rem' }}>{label}</strong>
      <p>{desc}</p>
    </div>
  )
}
