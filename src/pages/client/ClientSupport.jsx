import { useState } from 'react'
import { Mail, MessageSquare, Phone, HelpCircle, Send, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  fontSize: 'var(--text-sm)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  outline: 'none',
}

const cardStyle = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-xl)',
  boxShadow: 'var(--shadow-sm)',
}

const faq = [
  {
    q: 'How soon will support respond?',
    a: 'We usually respond within 1 business day for dashboard and account related queries.',
  },
  {
    q: 'Can I ask about payments or orders here?',
    a: 'Yes. Use this page for payment, order, profile, or general client support questions.',
  },
  {
    q: 'Can I request design help here?',
    a: 'Yes. You can describe your issue here and the support team will route it to the right person.',
  },
]

export default function ClientSupport() {
  const { profile } = useAuth()
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({
    name: profile?.full_name || '',
    email: profile?.email || '',
    subject: '',
    message: '',
  })

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <section style={{
        ...cardStyle,
        padding: '1.5rem',
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-blue) 100%)',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <HelpCircle size={24} />
          <h1 style={{ fontSize: 'var(--text-xl)', lineHeight: 1.1 }}>Client Support</h1>
        </div>
        <p style={{ maxWidth: '60ch', color: 'rgba(255,255,255,0.88)' }}>
          Need help with your account, payments, orders, or rainwater consultation process? Send a message and our team will get back to you.
        </p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: '1.5rem' }}>
        <section style={{ ...cardStyle, padding: '1.5rem' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: '1rem' }}>Send us a message</h2>

          {sent ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              textAlign: 'center', minHeight: 280, gap: '0.75rem',
            }}>
              <CheckCircle2 size={42} style={{ color: 'var(--color-success)' }} />
              <h3 style={{ fontSize: 'var(--text-lg)' }}>Support request received</h3>
              <p style={{ color: 'var(--color-text-muted)', maxWidth: '44ch' }}>
                Thanks for contacting us. Our team will review your message and reply to your email soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.45rem', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)' }}>Name</label>
                  <input style={inputStyle} value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Your full name" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.45rem', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)' }}>Email</label>
                  <input type="email" style={inputStyle} value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="you@example.com" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.45rem', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)' }}>Subject</label>
                <input style={inputStyle} value={form.subject} onChange={e => handleChange('subject', e.target.value)} placeholder="What do you need help with?" />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.45rem', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)' }}>Message</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 160, resize: 'vertical' }}
                  value={form.message}
                  onChange={e => handleChange('message', e.target.value)}
                  placeholder="Describe your issue, question, or request here..."
                />
              </div>

              <div>
                <button
                  type="submit"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.8rem 1.2rem', border: 'none', cursor: 'pointer',
                    borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', color: '#fff',
                    fontWeight: 700,
                  }}
                >
                  <Send size={16} />
                  Submit request
                </button>
              </div>
            </form>
          )}
        </section>

        <aside style={{ display: 'grid', gap: '1rem' }}>
          <section style={{ ...cardStyle, padding: '1.25rem' }}>
            <h2 style={{ fontSize: 'var(--text-base)', marginBottom: '0.9rem' }}>Contact options</h2>
            <div style={{ display: 'grid', gap: '0.85rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Mail size={18} style={{ color: 'var(--color-primary)', marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700 }}>Email</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>support@rainharvest.example</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Phone size={18} style={{ color: 'var(--color-primary)', marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700 }}>Phone</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>+91 90000 00000</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <MessageSquare size={18} style={{ color: 'var(--color-primary)', marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700 }}>Support hours</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Mon to Sat, 9:00 AM to 6:00 PM</div>
                </div>
              </div>
            </div>
          </section>

          <section style={{ ...cardStyle, padding: '1.25rem' }}>
            <h2 style={{ fontSize: 'var(--text-base)', marginBottom: '0.9rem' }}>Common questions</h2>
            <div style={{ display: 'grid', gap: '0.85rem' }}>
              {faq.map(item => (
                <div key={item.q} style={{ paddingBottom: '0.85rem', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.3rem', fontSize: 'var(--text-sm)' }}>{item.q}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>{item.a}</div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
