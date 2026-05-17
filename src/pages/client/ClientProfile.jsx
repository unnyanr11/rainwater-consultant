import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export default function ClientProfile() {
  const { profile, user } = useAuth()
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone:     profile?.phone     || '',
    city:      profile?.city      || '',
  })
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  const save = async () => {
    setSaving(true)
    await supabase.from('profiles').update(form).eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const F = ({ label, k, type = 'text' }) => (
    <div style={{ marginBottom: '1.1rem' }}>
      <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>{label}</label>
      <input
        type={type} value={form[k]}
        onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
        style={{ width: '100%', padding: '0.65rem 0.9rem', fontSize: 'var(--text-sm)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none' }}
      />
    </div>
  )

  return (
    <div style={{ maxWidth: 480 }}>
      <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text)', marginBottom: '1.5rem' }}>My Profile</h1>

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <F label="Full Name" k="full_name" />
        <div style={{ marginBottom: '1.1rem' }}>
          <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>Email</label>
          <input disabled value={profile?.email || ''} style={{ width: '100%', padding: '0.65rem 0.9rem', fontSize: 'var(--text-sm)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-offset)', color: 'var(--color-text-muted)', outline: 'none' }} />
        </div>
        <F label="Phone" k="phone" type="tel" />
        <F label="City"  k="city" />

        <button onClick={save} disabled={saving} style={{ padding: '0.65rem 1.5rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}