export default function AdminPipelineStep({ label, value, tag, desc }) {
  return (
    <div className="admin-pipeline-step">
      <em className={`admin-tag admin-tag-${tag}`}>{label}</em>
      <h4>{value}</h4>
      <p>{desc}</p>
    </div>
  )
}
