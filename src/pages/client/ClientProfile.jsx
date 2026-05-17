<<<<<<< HEAD
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
=======
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { UserCircle, Save } from 'lucide-react'

export default function ClientProfile() {
  const { user, profile } = useAuth()
  const [form, setForm]     = useState({ full_name: '', phone: '', city: '', state: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone:     profile.phone     || '',
        city:      profile.city      || '',
        state:     profile.state     || '',
      })
    }
  }, [profile])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error: err } = await supabase
      .from('profiles')
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq('id', user.id)
    setSaving(false)
    if (err) setError(err.message)
    else { setSaved(true); setTimeout(() => setSaved(false), 2500) }
  }

  const inputStyle = {
    padding: '0.6rem 0.75rem',
    background: 'var(--color-surface-offset)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text)',
    outline: 'none',
    width: '100%',
  }

  const Field = ({ label, name, type = 'text' }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      <input
        type={type}
        value={form[name]}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        style={inputStyle}
        onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
        onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
>>>>>>> ac353a5455730e56e2e74dcdd33da75755af363c
      />
    </div>
  )

  return (
<<<<<<< HEAD
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
=======
    <div style={{ maxWidth: 520 }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <UserCircle size={28} style={{ color: 'var(--color-primary)' }} />
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text)' }}>My Profile</h1>
      </div>

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Email</div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>{user?.email}</div>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Field label="Full Name" name="full_name" />
          <Field label="Phone"     name="phone"     type="tel" />
          <Field label="City"      name="city" />
          <Field label="State"     name="state" />
        </div>

        {error && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)', marginTop: '0.5rem' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          style={{
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            background: saved ? 'var(--color-success)' : 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: 'var(--text-sm)',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            transition: 'background 300ms',
          }}
        >
          <Save size={15} />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
>>>>>>> ac353a5455730e56e2e74dcdd33da75755af363c
