export default function AdminPageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <section className="admin-topbar admin-page-header">
      <div className="admin-page-header-text">
        <small className="admin-eyebrow">{eyebrow}</small>
        <h2 className="admin-hero-title">{title}</h2>
        {subtitle && <p className="admin-hero-sub">{subtitle}</p>}
      </div>
      {actions && <div className="admin-actions">{actions}</div>}
    </section>
  )
}
