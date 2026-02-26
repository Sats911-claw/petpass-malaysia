'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'petpass2026'

type Tab = 'waitlist' | 'users' | 'pets'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('waitlist')
  const [waitlist, setWaitlist] = useState<any[]>([])
  const [pets, setPets] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('admin_authed') === 'true') setAuthed(true)
  }, [])

  useEffect(() => {
    if (!authed) return
    fetchData()
  }, [authed, tab])

  async function fetchData() {
    setLoading(true)
    if (tab === 'waitlist') {
      const { data } = await supabase.from('waitlist').select('*').order('created_at', { ascending: false })
      setWaitlist(data || [])
    } else if (tab === 'pets') {
      const { data } = await supabase.from('pets').select('*').order('created_at', { ascending: false })
      setPets(data || [])
    }
    setLoading(false)
  }

  function login() {
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_authed', 'true')
      setAuthed(true)
    } else {
      setError('Wrong password')
    }
  }

  function exportCSV() {
    const rows = [['Name', 'Email', 'Joined'], ...waitlist.map(w => [w.name, w.email, new Date(w.created_at).toLocaleDateString()])]
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = 'petpass-waitlist.csv'
    a.click()
  }

  if (!authed) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: 40, width: 340 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🔐</div>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Admin Access</h1>
        <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>PetPass Malaysia</p>
        <input
          type="password"
          placeholder="Password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          style={{ width: '100%', padding: '12px 16px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 15, marginBottom: 12, boxSizing: 'border-box' }}
        />
        {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button onClick={login} style={{ width: '100%', padding: '12px', background: '#0d9488', border: 'none', borderRadius: 8, color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          Enter
        </button>
      </div>
    </div>
  )

  const lostCount = pets.filter(p => p.is_lost).length

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #1a1a1a', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: 20, fontWeight: 700 }}>🐾 PetPass Admin</span>
          <span style={{ marginLeft: 12, fontSize: 12, color: '#666', background: '#1a1a1a', padding: '2px 8px', borderRadius: 4 }}>Internal</span>
        </div>
        <button onClick={() => { sessionStorage.removeItem('admin_authed'); setAuthed(false) }} style={{ background: 'transparent', border: '1px solid #333', color: '#666', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 32px', borderBottom: '1px solid #1a1a1a', display: 'flex', gap: 0 }}>
        {(['waitlist', 'pets'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '14px 24px', background: 'transparent', border: 'none',
            borderBottom: tab === t ? '2px solid #0d9488' : '2px solid transparent',
            color: tab === t ? '#0d9488' : '#666', fontWeight: tab === t ? 600 : 400,
            fontSize: 14, cursor: 'pointer', textTransform: 'capitalize'
          }}>
            {t === 'waitlist' ? `Waitlist (${waitlist.length})` : `Pets (${pets.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 32 }}>
        {loading ? (
          <div style={{ color: '#666', textAlign: 'center', padding: 60 }}>Loading...</div>
        ) : tab === 'waitlist' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 28, fontWeight: 700 }}>{waitlist.length}</span>
                <span style={{ color: '#666', marginLeft: 8 }}>signups</span>
              </div>
              <button onClick={exportCSV} style={{ background: '#0d9488', border: 'none', color: '#fff', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                Export CSV
              </button>
            </div>
            <div style={{ background: '#111', borderRadius: 12, border: '1px solid #1a1a1a', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                    {['Name', 'Email', 'Joined'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: '#666', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {waitlist.map((w, i) => (
                    <tr key={w.id} style={{ borderBottom: i < waitlist.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                      <td style={{ padding: '14px 20px', color: '#fff', fontSize: 14 }}>{w.name}</td>
                      <td style={{ padding: '14px 20px', color: '#0d9488', fontSize: 14 }}>{w.email}</td>
                      <td style={{ padding: '14px 20px', color: '#666', fontSize: 13 }}>{new Date(w.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    </tr>
                  ))}
                  {waitlist.length === 0 && (
                    <tr><td colSpan={3} style={{ padding: 40, textAlign: 'center', color: '#444' }}>No signups yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 10, padding: '16px 24px' }}>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{pets.length}</div>
                <div style={{ color: '#666', fontSize: 13 }}>Total Pets</div>
              </div>
              {lostCount > 0 && (
                <div style={{ background: '#1a0a0a', border: '1px solid #ef4444', borderRadius: 10, padding: '16px 24px' }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>{lostCount}</div>
                  <div style={{ color: '#ef4444', fontSize: 13 }}>Lost 🚨</div>
                </div>
              )}
            </div>
            <div style={{ background: '#111', borderRadius: 12, border: '1px solid #1a1a1a', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                    {['Name', 'Species', 'Breed', 'Microchip', 'Status', 'Registered'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: '#666', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pets.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: i < pets.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                      <td style={{ padding: '14px 20px', color: '#fff', fontSize: 14, fontWeight: 600 }}>{p.name}</td>
                      <td style={{ padding: '14px 20px', color: '#aaa', fontSize: 14 }}>{p.species || '—'}</td>
                      <td style={{ padding: '14px 20px', color: '#aaa', fontSize: 14 }}>{p.breed || '—'}</td>
                      <td style={{ padding: '14px 20px', color: '#666', fontSize: 13 }}>{p.microchip || '—'}</td>
                      <td style={{ padding: '14px 20px' }}>
                        {p.is_lost
                          ? <span style={{ background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>LOST</span>
                          : <span style={{ background: '#0d9488', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>SAFE</span>}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#666', fontSize: 13 }}>{new Date(p.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    </tr>
                  ))}
                  {pets.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#444' }}>No pets registered yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
