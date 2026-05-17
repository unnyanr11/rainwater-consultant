const STATUS_COLOR = {
  pending:              { bg: '#fef3c7', text: '#92400e' },
  reviewed:             { bg: '#dbeafe', text: '#1e40af' },
  quote_sent:           { bg: '#ede9fe', text: '#5b21b6' },
  deposit_paid:         { bg: '#d1fae5', text: '#065f46' },
  in_progress:          { bg: '#dbeafe', text: '#1e40af' },
  drawings_ready:       { bg: '#d1fae5', text: '#065f46' },
  completed:            { bg: '#d1fae5', text: '#065f46' },
  cancelled:            { bg: '#fee2e2', text: '#991b1b' },
  visit_scheduled:      { bg: '#fef3c7', text: '#92400e' },
  visit_complete:       { bg: '#dbeafe', text: '#1e40af' },
  drawing_in_progress:  { bg: '#dbeafe', text: '#1e40af' },
  drawing_ready:        { bg: '#d1fae5', text: '#065f46' },
}

export default function StatusBadge({ status }) {
  const c = STATUS_COLOR[status] || { bg: 'var(--color-surface-offset)', text: 'var(--color-text-muted)' }
  return (
    <span style={{
      fontSize: 'var(--text-xs)',
      fontWeight: 700,
      padding: '3px 10px',
      borderRadius: 'var(--radius-full)',
      background: c.bg,
      color: c.text,
      textTransform: 'capitalize',
      whiteSpace: 'nowrap',
    }}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}
