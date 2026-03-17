'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SUPERADMIN_USERNAME = 'sats911'
const SUPERADMIN_PASSWORD = 'Pagani911$'

type Tab = 'overview' | 'users' | 'pets' | 'clinics' | 'waitlist' | 'merchants' | 'admin-users' | 'audit-log'
type Role = 'superadmin' | 'editor' | 'viewer'

// ── helpers ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div style={{ background: '#111', border: `1px solid ${color ? color + '44' : '#1a1a1a'}`, borderRadius: 12, padding: '20px 24px', minWidth: 140 }}>
      <div style={{ fontSize: 32, fontWeight: 800, color: color || '#fff' }}>{value}</div>
      <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ color: color || '#0d9488', fontSize: 12, marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

function Badge({ text, color }: { text: string; color: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    green: { bg: '#0d9488', fg: '#fff' }, red: { bg: '#ef4444', fg: '#fff' },
    yellow: { bg: '#eab308', fg: '#000' }, gray: { bg: '#374151', fg: '#fff' },
    blue: { bg: '#3b82f6', fg: '#fff' }, purple: { bg: '#8b5cf6', fg: '#fff' },
  }
  const c = map[color] || map.gray
  return <span style={{ background: c.bg, color: c.fg, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>{text}</span>
}

function countByPeriod(items: any[], field = 'created_at') {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7)
  const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1)
  return {
    today: items.filter(i => new Date(i[field]) >= today).length,
    week: items.filter(i => new Date(i[field]) >= weekAgo).length,
    month: items.filter(i => new Date(i[field]) >= monthAgo).length,
  }
}

function fmtDate(ts: string) {
  return new Date(ts).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ── main component ────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [currentAdmin, setCurrentAdmin] = useState('')
  const [currentRole, setCurrentRole] = useState<Role>('viewer')
  const [username, setUsername] = useState('')
  const [pw, setPw] = useState('')
  const [loginError, setLoginError] = useState('')
  const [tab, setTab] = useState<Tab>('overview')

  // data
  const [waitlist, setWaitlist] = useState<any[]>([])
  const [pets, setPets] = useState<any[]>([])
  const [merchants, setMerchants] = useState<any[]>([])
  const [clinics, setClinics] = useState<any[]>([])
  const [vaccinations, setVaccinations] = useState<any[]>([])
  const [medicalRecords, setMedicalRecords] = useState<any[]>([])
  const [foundReports, setFoundReports] = useState<any[]>([])
  const [adminUsers, setAdminUsers] = useState<any[]>([])
  const [auditLog, setAuditLog] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // modals / UI state
  const [editPet, setEditPet] = useState<any>(null)
  const [showAddPet, setShowAddPet] = useState(false)
  const [newPet, setNewPet] = useState({ name: '', species: 'Dog', breed: '', microchip: '', color: '', date_of_birth: '', owner_id: '' })
  const [showAddAdmin, setShowAddAdmin] = useState(false)
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '', role: 'editor' as Role })
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [searchPets, setSearchPets] = useState('')
  const [searchUsers, setSearchUsers] = useState('')
  const [searchAudit, setSearchAudit] = useState('')

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_authed')
    const savedUser = sessionStorage.getItem('admin_user')
    const savedRole = sessionStorage.getItem('admin_role') as Role | null
    if (saved === 'true' && savedUser) { setAuthed(true); setCurrentAdmin(savedUser); setCurrentRole(savedRole || 'viewer') }
  }, [])

  useEffect(() => { if (authed) fetchAll() }, [authed])

  async function fetchAll() {
    setLoading(true)
    const [wl, pt, mc, cl, vx, mr, fr, au, al] = await Promise.all([
      supabase.from('waitlist').select('*').order('created_at', { ascending: false }),
      supabase.from('pets').select('*').order('created_at', { ascending: false }),
      supabase.from('merchants').select('*').order('created_at', { ascending: false }),
      supabase.from('vet_clinics').select('*').order('created_at', { ascending: false }),
      supabase.from('vaccinations').select('*').order('created_at', { ascending: false }),
      supabase.from('pet_medical_records').select('*').order('created_at', { ascending: false }),
      supabase.from('found_reports').select('*').order('created_at', { ascending: false }),
      supabase.from('admin_users').select('id,username,role,created_by,created_at,last_login').order('created_at', { ascending: false }),
      supabase.from('admin_audit_log').select('*').order('created_at', { ascending: false }).limit(200),
    ])
    setWaitlist(wl.data || [])
    setPets(pt.data || [])
    setMerchants(mc.data || [])
    setClinics(cl.data || [])
    setVaccinations(vx.data || [])
    setMedicalRecords(mr.data || [])
    setFoundReports(fr.data || [])
    setAdminUsers(au.data || [])
    setAuditLog(al.data || [])
    setLoading(false)
  }

  // ── audit logging ─────────────────────────────────────────────────────────
  async function logAudit(action: string, tableName: string, recordId: string, details: object) {
    await supabase.from('admin_audit_log').insert({
      admin_username: currentAdmin,
      action,
      table_name: tableName,
      record_id: recordId,
      details,
    })
    // refresh audit log
    const { data } = await supabase.from('admin_audit_log').select('*').order('created_at', { ascending: false }).limit(200)
    setAuditLog(data || [])
  }

  // ── login ─────────────────────────────────────────────────────────────────
  async function login() {
    // superadmin check
    if (username === SUPERADMIN_USERNAME && pw === SUPERADMIN_PASSWORD) {
      sessionStorage.setItem('admin_authed', 'true')
      sessionStorage.setItem('admin_user', SUPERADMIN_USERNAME)
      sessionStorage.setItem('admin_role', 'superadmin')
      setAuthed(true); setCurrentAdmin(SUPERADMIN_USERNAME); setCurrentRole('superadmin'); setLoginError('')
      // Set cookie for middleware auth
      document.cookie = 'petpass_superadmin=true; path=/; max-age=86400'
      // update last_login for superadmin if exists in table
      await supabase.from('admin_users').update({ last_login: new Date().toISOString() }).eq('username', SUPERADMIN_USERNAME)
      return
    }
    // check admin_users table
    const { data } = await supabase.from('admin_users').select('*').eq('username', username).eq('password', pw).single()
    if (data) {
      sessionStorage.setItem('admin_authed', 'true')
      sessionStorage.setItem('admin_user', data.username)
      sessionStorage.setItem('admin_role', data.role)
      setAuthed(true); setCurrentAdmin(data.username); setCurrentRole(data.role); setLoginError('')
      // Set cookie for middleware auth
      document.cookie = 'petpass_superadmin=true; path=/; max-age=86400'
      await supabase.from('admin_users').update({ last_login: new Date().toISOString() }).eq('id', data.id)
    } else {
      setLoginError('Invalid username or password')
    }
  }

  function logout() {
    sessionStorage.removeItem('admin_authed')
    sessionStorage.removeItem('admin_user')
    sessionStorage.removeItem('admin_role')
    // Clear cookie
    document.cookie = 'petpass_superadmin=; path=/; max-age=0'
    setAuthed(false); setCurrentAdmin(''); setCurrentRole('viewer')
  }

  // ── pet operations ────────────────────────────────────────────────────────
  async function addPet() {
    if (!newPet.name) return
    const payload: any = {
      name: newPet.name,
      species: newPet.species,
      breed: newPet.breed || null,
      microchip: newPet.microchip || null,
      color: newPet.color || null,
      date_of_birth: newPet.date_of_birth || null,
      owner_id: newPet.owner_id || null,
      is_lost: false,
    }
    const { data, error } = await supabase.from('pets').insert(payload).select().single()
    if (!error && data) {
      setPets(p => [data, ...p])
      await logAudit('create', 'pets', data.id, { name: data.name, species: data.species })
    }
    setShowAddPet(false)
    setNewPet({ name: '', species: 'Dog', breed: '', microchip: '', color: '', date_of_birth: '', owner_id: '' })
  }

  async function updatePet(id: string, fields: any) {
    await supabase.from('pets').update(fields).eq('id', id)
    setPets(p => p.map(x => x.id === id ? { ...x, ...fields } : x))
    await logAudit('update', 'pets', id, fields)
    setEditPet(null)
  }

  async function deletePet(id: string) {
    const pet = pets.find(p => p.id === id)
    await supabase.from('pets').delete().eq('id', id)
    setPets(p => p.filter(x => x.id !== id))
    await logAudit('delete', 'pets', id, { name: pet?.name })
    setConfirmDelete(null)
  }

  // ── admin user operations ─────────────────────────────────────────────────
  async function createAdminUser() {
    if (!newAdmin.username || !newAdmin.password) return
    const { data, error } = await supabase.from('admin_users').insert({
      username: newAdmin.username,
      password: newAdmin.password,
      role: newAdmin.role,
      created_by: currentAdmin,
    }).select().single()
    if (!error && data) {
      setAdminUsers(a => [data, ...a])
      await logAudit('create', 'admin_users', data.id, { username: data.username, role: data.role })
    }
    setShowAddAdmin(false)
    setNewAdmin({ username: '', password: '', role: 'editor' })
  }

  async function deleteAdminUser(id: string, uname: string) {
    await supabase.from('admin_users').delete().eq('id', id)
    setAdminUsers(a => a.filter(x => x.id !== id))
    await logAudit('delete', 'admin_users', id, { username: uname })
    setConfirmDelete(null)
  }

  // ── merchant operations ───────────────────────────────────────────────────
  async function updateMerchantStatus(id: string, status: string) {
    await supabase.from('merchants').update({ status }).eq('id', id)
    setMerchants(m => m.map(x => x.id === id ? { ...x, status } : x))
    await logAudit('update', 'merchants', id, { status })
  }

  async function deleteMerchant(id: string) {
    const m = merchants.find(x => x.id === id)
    await supabase.from('merchants').delete().eq('id', id)
    setMerchants(m => m.filter(x => x.id !== id))
    await logAudit('delete', 'merchants', id, { name: m?.name })
    setConfirmDelete(null)
  }

  async function deleteWaitlist(id: string) {
    const w = waitlist.find(x => x.id === id)
    await supabase.from('waitlist').delete().eq('id', id)
    setWaitlist(w => w.filter(x => x.id !== id))
    await logAudit('delete', 'waitlist', id, { email: w?.email })
    setConfirmDelete(null)
  }

  function exportCSV(data: any[], filename: string) {
    if (!data.length) return
    const keys = Object.keys(data[0])
    const rows = [keys, ...data.map(d => keys.map(k => JSON.stringify(d[k] ?? '')))]
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.map(r => r.join(',')).join('\n'))
    a.download = filename; a.click()
  }

  const uniqueUsers = Array.from(
    pets.reduce((map, p) => {
      if (p.owner_id && !map.has(p.owner_id)) map.set(p.owner_id, { owner_id: p.owner_id, pets: [], created_at: p.created_at })
      if (p.owner_id) map.get(p.owner_id).pets.push(p)
      return map
    }, new Map()).values()
  ) as any[]

  // ── login screen ──────────────────────────────────────────────────────────
  if (!authed) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: 40, width: 340 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🔐</div>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Admin Portal</h1>
        <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>PetPass Malaysia — Internal Only</p>
        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()}
          style={{ width: '100%', padding: '12px 16px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 15, marginBottom: 12, boxSizing: 'border-box' }} />
        <input type="password" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()}
          style={{ width: '100%', padding: '12px 16px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 15, marginBottom: 12, boxSizing: 'border-box' }} />
        {loginError && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{loginError}</p>}
        <button onClick={login} style={{ width: '100%', padding: 12, background: '#0d9488', border: 'none', borderRadius: 8, color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Enter</button>
      </div>
    </div>
  )

  // ── computed values ───────────────────────────────────────────────────────
  const petStats = countByPeriod(pets)
  const waitlistStats = countByPeriod(waitlist)
  const userStats = countByPeriod(uniqueUsers)
  const lostPets = pets.filter(p => p.is_lost)
  const activeMerchants = merchants.filter(m => m.status === 'active')
  const pendingMerchants = merchants.filter(m => m.status === 'pending')
  const filteredPets = pets.filter(p => !searchPets || p.name?.toLowerCase().includes(searchPets.toLowerCase()) || p.species?.toLowerCase().includes(searchPets.toLowerCase()) || p.breed?.toLowerCase().includes(searchPets.toLowerCase()))
  const filteredUsers = uniqueUsers.filter(u => !searchUsers || u.owner_id?.toLowerCase().includes(searchUsers.toLowerCase()))
  const filteredAudit = auditLog.filter(a => !searchAudit || a.admin_username?.toLowerCase().includes(searchAudit.toLowerCase()) || a.action?.toLowerCase().includes(searchAudit.toLowerCase()) || a.table_name?.toLowerCase().includes(searchAudit.toLowerCase()))
  const isSuperAdmin = currentRole === 'superadmin'
  const canEdit = currentRole === 'superadmin' || currentRole === 'editor'

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'users', label: `👤 Users (${uniqueUsers.length})` },
    { id: 'pets', label: `🐾 Pets (${pets.length})` },
    { id: 'clinics', label: `🏥 Clinics (${clinics.length})` },
    { id: 'waitlist', label: `📋 Waitlist (${waitlist.length})` },
    { id: 'merchants', label: `🏪 Merchants (${merchants.length})` },
    { id: 'admin-users', label: `🔑 Admins (${adminUsers.length + 1})` },
    { id: 'audit-log', label: `📝 Audit Log (${auditLog.length})` },
  ]

  const actionColor: Record<string, string> = { create: 'green', update: 'blue', delete: 'red' }

  // ── main render ───────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid #1a1a1a', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 700 }}>🐾 PetPass Admin</span>
          <span style={{ fontSize: 11, color: '#0d9488', background: '#0d948822', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>INTERNAL</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#666' }}>
            Logged in as <span style={{ color: '#0d9488', fontWeight: 600 }}>{currentAdmin}</span>
            <span style={{ marginLeft: 8 }}><Badge text={currentRole.toUpperCase()} color={isSuperAdmin ? 'purple' : currentRole === 'editor' ? 'blue' : 'gray'} /></span>
          </span>
          <button onClick={fetchAll} style={{ background: 'transparent', border: '1px solid #333', color: '#888', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>↻ Refresh</button>
          <button onClick={logout} style={{ background: 'transparent', border: '1px solid #333', color: '#666', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 28px', borderBottom: '1px solid #1a1a1a', display: 'flex', gap: 0, overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '13px 18px', background: 'transparent', border: 'none', whiteSpace: 'nowrap',
            borderBottom: tab === t.id ? '2px solid #0d9488' : '2px solid transparent',
            color: tab === t.id ? '#0d9488' : '#666', fontWeight: tab === t.id ? 600 : 400,
            fontSize: 13, cursor: 'pointer'
          }}>{t.label}</button>
        ))}
      </div>

      {/* Modals */}

      {/* Add Pet Modal */}
      {showAddPet && (
        <div style={{ position: 'fixed', inset: 0, background: '#000b', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111', border: '1px solid #333', borderRadius: 16, padding: 32, width: 440, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>🐾 Add New Pet</h3>
            {[
              { label: 'Pet Name *', key: 'name', type: 'text' },
              { label: 'Breed', key: 'breed', type: 'text' },
              { label: 'Microchip Number', key: 'microchip', type: 'text' },
              { label: 'Colour', key: 'color', type: 'text' },
              { label: 'Date of Birth', key: 'date_of_birth', type: 'date' },
              { label: 'Owner User ID (optional)', key: 'owner_id', type: 'text' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{f.label}</label>
                <input type={f.type} value={(newPet as any)[f.key] || ''} onChange={e => setNewPet({ ...newPet, [f.key]: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Species</label>
              <select value={newPet.species} onChange={e => setNewPet({ ...newPet, species: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' }}>
                {['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Fish', 'Reptile', 'Other'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={addPet} style={{ flex: 1, padding: 12, background: '#0d9488', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Add Pet</button>
              <button onClick={() => setShowAddPet(false)} style={{ flex: 1, padding: 12, background: 'transparent', border: '1px solid #333', borderRadius: 8, color: '#888', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Pet Modal */}
      {editPet && (
        <div style={{ position: 'fixed', inset: 0, background: '#000b', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111', border: '1px solid #333', borderRadius: 16, padding: 32, width: 400 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>Edit Pet — {editPet.name}</h3>
            {[
              { label: 'Name', key: 'name' }, { label: 'Species', key: 'species' },
              { label: 'Breed', key: 'breed' }, { label: 'Microchip', key: 'microchip' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6, textTransform: 'uppercase' }}>{f.label}</label>
                <input value={editPet[f.key] || ''} onChange={e => setEditPet({ ...editPet, [f.key]: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            ))}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 20 }}>
              <input type="checkbox" checked={editPet.is_lost || false} onChange={e => setEditPet({ ...editPet, is_lost: e.target.checked })} />
              <span style={{ color: '#ef4444', fontSize: 14 }}>Mark as Lost</span>
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => updatePet(editPet.id, { name: editPet.name, species: editPet.species, breed: editPet.breed, microchip: editPet.microchip, is_lost: editPet.is_lost })}
                style={{ flex: 1, padding: 12, background: '#0d9488', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Save Changes</button>
              <button onClick={() => setEditPet(null)} style={{ flex: 1, padding: 12, background: 'transparent', border: '1px solid #333', borderRadius: 8, color: '#888', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Admin User Modal */}
      {showAddAdmin && (
        <div style={{ position: 'fixed', inset: 0, background: '#000b', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111', border: '1px solid #333', borderRadius: 16, padding: 32, width: 380 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>🔑 Create Admin User</h3>
            {[
              { label: 'Username *', key: 'username', type: 'text' },
              { label: 'Password *', key: 'password', type: 'password' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6, textTransform: 'uppercase' }}>{f.label}</label>
                <input type={f.type} value={(newAdmin as any)[f.key]} onChange={e => setNewAdmin({ ...newAdmin, [f.key]: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6, textTransform: 'uppercase' }}>Role</label>
              <select value={newAdmin.role} onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value as Role })}
                style={{ width: '100%', padding: '10px 12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' }}>
                <option value="editor">Editor — can view + edit + create</option>
                <option value="viewer">Viewer — read only</option>
              </select>
            </div>
            <div style={{ background: '#1a1a0a', border: '1px solid #eab30844', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#aaa' }}>
              ⚠️ Editor can add/edit pets and manage merchants. Viewer can only read data. Only superadmin can manage admin users.
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={createAdminUser} style={{ flex: 1, padding: 12, background: '#0d9488', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Create</button>
              <button onClick={() => setShowAddAdmin(false)} style={{ flex: 1, padding: 12, background: 'transparent', border: '1px solid #333', borderRadius: 8, color: '#888', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: '#000b', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111', border: '1px solid #ef4444', borderRadius: 16, padding: 32, width: 320, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ margin: '0 0 8px' }}>Confirm Delete</h3>
            <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>This action will be logged. Cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => {
                const [type, id, extra] = confirmDelete.split(':')
                if (type === 'pet') deletePet(id)
                else if (type === 'merchant') deleteMerchant(id)
                else if (type === 'waitlist') deleteWaitlist(id)
                else if (type === 'admin') deleteAdminUser(id, extra)
              }} style={{ flex: 1, padding: 12, background: '#ef4444', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: 12, background: 'transparent', border: '1px solid #333', borderRadius: 8, color: '#888', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: 28 }}>
        {loading ? (
          <div style={{ color: '#666', textAlign: 'center', padding: 80 }}>Loading data...</div>
        ) : tab === 'overview' ? (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Platform Overview</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
              <StatCard label="Registered Users" value={uniqueUsers.length} sub={`+${userStats.today} today`} color="#0d9488" />
              <StatCard label="Total Pets" value={pets.length} sub={`+${petStats.today} today`} color="#3b82f6" />
              <StatCard label="Waitlist" value={waitlist.length} sub={`+${waitlistStats.today} today`} color="#8b5cf6" />
              <StatCard label="Lost Pets" value={lostPets.length} color={lostPets.length > 0 ? '#ef4444' : undefined} />
              <StatCard label="Vet Clinics" value={clinics.length} />
              <StatCard label="Vaccinations" value={vaccinations.length} />
              <StatCard label="Medical Records" value={medicalRecords.length} />
              <StatCard label="Found Reports" value={foundReports.length} />
              <StatCard label="Active Merchants" value={activeMerchants.length} color="#0d9488" />
              <StatCard label="Admin Users" value={adminUsers.length + 1} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
              {[
                { label: '🐾 Pet Registrations', stats: petStats, color: '#3b82f6' },
                { label: '📋 Waitlist Signups', stats: waitlistStats, color: '#8b5cf6' },
                { label: '👤 New Users', stats: userStats, color: '#0d9488' },
              ].map(({ label, stats, color }) => (
                <div key={label} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#888', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {([['Today', stats.today], ['This Week', stats.week], ['This Month', stats.month]] as [string, number][]).map(([l, v]) => (
                      <div key={l} style={{ flex: 1, textAlign: 'center', background: '#1a1a1a', borderRadius: 8, padding: '12px 8px' }}>
                        <div style={{ fontSize: 26, fontWeight: 800, color }}>{v}</div>
                        <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#888', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>🕐 Recent Activity</div>
              {[
                ...pets.slice(0, 5).map(p => ({ icon: '🐾', label: `New pet: ${p.name}`, time: p.created_at })),
                ...waitlist.slice(0, 4).map(w => ({ icon: '📋', label: `Waitlist: ${w.name} (${w.email})`, time: w.created_at })),
                ...auditLog.slice(0, 5).map(a => ({ icon: '📝', label: `${a.admin_username} → ${a.action} on ${a.table_name}`, time: a.created_at })),
              ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 12).map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 11 ? '1px solid #1a1a1a' : 'none' }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ flex: 1, fontSize: 14, color: '#ddd' }}>{item.label}</span>
                  <span style={{ fontSize: 12, color: '#555' }}>{fmtDate(item.time)}</span>
                </div>
              ))}
              {!pets.length && !waitlist.length && <div style={{ color: '#555', textAlign: 'center', padding: 24 }}>No activity yet</div>}
            </div>
          </>

        ) : tab === 'users' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Users</h2>
                <p style={{ color: '#666', fontSize: 13, margin: '4px 0 0' }}>Unique owners identified via registered pets</p>
              </div>
              <input placeholder="Search user ID..." value={searchUsers} onChange={e => setSearchUsers(e.target.value)}
                style={{ padding: '8px 14px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 13, width: 240 }} />
            </div>
            <div style={{ background: '#111', borderRadius: 12, border: '1px solid #1a1a1a', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                    {['User ID', 'Pets', 'First Seen'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: '#666', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={u.owner_id} style={{ borderBottom: i < filteredUsers.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                      <td style={{ padding: '14px 20px', color: '#0d9488', fontSize: 13, fontFamily: 'monospace' }}>{u.owner_id}</td>
                      <td style={{ padding: '14px 20px' }}>
                        {u.pets.map((p: any) => (
                          <span key={p.id} style={{ display: 'inline-block', background: '#1a1a1a', borderRadius: 4, padding: '2px 8px', fontSize: 12, marginRight: 4, marginBottom: 2 }}>
                            {p.name} ({p.species || '?'}) {p.is_lost && <span style={{ color: '#ef4444' }}>🚨</span>}
                          </span>
                        ))}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#666', fontSize: 13 }}>{fmtDate(u.created_at)}</td>
                    </tr>
                  ))}
                  {!filteredUsers.length && <tr><td colSpan={3} style={{ padding: 40, textAlign: 'center', color: '#444' }}>No users found</td></tr>}
                </tbody>
              </table>
            </div>
          </>

        ) : tab === 'pets' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <StatCard label="Total" value={pets.length} />
                {lostPets.length > 0 && <StatCard label="Lost" value={lostPets.length} color="#ef4444" />}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <input placeholder="Search pets..." value={searchPets} onChange={e => setSearchPets(e.target.value)}
                  style={{ padding: '8px 14px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 13, width: 200 }} />
                {canEdit && (
                  <button onClick={() => setShowAddPet(true)} style={{ background: '#0d9488', border: 'none', color: '#fff', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                    + Add Pet
                  </button>
                )}
                <button onClick={() => exportCSV(pets, 'petpass-pets.csv')} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#888', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Export CSV</button>
              </div>
            </div>
            <div style={{ background: '#111', borderRadius: 12, border: '1px solid #1a1a1a', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                    {['Name', 'Species', 'Breed', 'Microchip', 'UID', 'Status', 'Registered', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#666', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPets.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: i < filteredPets.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                      <td style={{ padding: '12px 16px', color: '#fff', fontSize: 14, fontWeight: 600 }}>{p.name}</td>
                      <td style={{ padding: '12px 16px', color: '#aaa', fontSize: 13 }}>{p.species || '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#aaa', fontSize: 13 }}>{p.breed || '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#666', fontSize: 12, fontFamily: 'monospace' }}>{p.microchip || '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#0d9488', fontSize: 12, fontFamily: 'monospace' }}>{p.pet_uid || '—'}</td>
                      <td style={{ padding: '12px 16px' }}><Badge text={p.is_lost ? 'LOST' : 'SAFE'} color={p.is_lost ? 'red' : 'green'} /></td>
                      <td style={{ padding: '12px 16px', color: '#555', fontSize: 12, whiteSpace: 'nowrap' }}>{fmtDate(p.created_at)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {canEdit && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => setEditPet(p)} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#ccc', fontSize: 11, padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>Edit</button>
                            <button onClick={() => setConfirmDelete(`pet:${p.id}`)} style={{ background: '#1a0a0a', border: '1px solid #ef4444', color: '#ef4444', fontSize: 11, padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!filteredPets.length && <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#444' }}>No pets found</td></tr>}
                </tbody>
              </table>
            </div>
          </>

        ) : tab === 'clinics' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Vet Clinics</h2>
              <button onClick={() => exportCSV(clinics, 'petpass-clinics.csv')} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#888', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Export CSV</button>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              <StatCard label="Total Clinics" value={clinics.length} />
              <StatCard label="With Emergency Line" value={clinics.filter(c => c.emergency_line).length} color="#ef4444" />
              <StatCard label="24hr Clinics" value={clinics.filter(c => c.is_24hr).length} color="#0d9488" />
            </div>
            <div style={{ background: '#111', borderRadius: 12, border: '1px solid #1a1a1a', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                    {['Clinic Name', 'Area', 'Phone', 'Emergency Line', 'Specialties', '24hr', 'Added'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#666', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clinics.map((c, i) => (
                    <tr key={c.id} style={{ borderBottom: i < clinics.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                      <td style={{ padding: '12px 16px', color: '#fff', fontSize: 14, fontWeight: 600 }}>{c.name}</td>
                      <td style={{ padding: '12px 16px', color: '#aaa', fontSize: 13 }}>{c.area || c.location || '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#0d9488', fontSize: 13 }}>{c.phone || '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#ef4444', fontSize: 13 }}>{c.emergency_line || '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#aaa', fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {Array.isArray(c.specialties) ? c.specialties.join(', ') : (c.specialties || '—')}
                      </td>
                      <td style={{ padding: '12px 16px' }}><Badge text={c.is_24hr ? 'YES' : 'NO'} color={c.is_24hr ? 'green' : 'gray'} /></td>
                      <td style={{ padding: '12px 16px', color: '#555', fontSize: 12 }}>{c.created_at ? fmtDate(c.created_at) : '—'}</td>
                    </tr>
                  ))}
                  {!clinics.length && <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#444' }}>No clinics found</td></tr>}
                </tbody>
              </table>
            </div>
          </>

        ) : tab === 'waitlist' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <StatCard label="Total" value={waitlist.length} color="#8b5cf6" />
                <StatCard label="Today" value={waitlistStats.today} />
                <StatCard label="This Week" value={waitlistStats.week} />
                <StatCard label="This Month" value={waitlistStats.month} />
              </div>
              <button onClick={() => exportCSV(waitlist, 'petpass-waitlist.csv')} style={{ background: '#0d9488', border: 'none', color: '#fff', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Export CSV</button>
            </div>
            <div style={{ background: '#111', borderRadius: 12, border: '1px solid #1a1a1a', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                    {['Name', 'Email', 'Joined', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: '#666', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {waitlist.map((w, i) => (
                    <tr key={w.id} style={{ borderBottom: i < waitlist.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                      <td style={{ padding: '14px 20px', color: '#fff', fontSize: 14 }}>{w.name}</td>
                      <td style={{ padding: '14px 20px', color: '#0d9488', fontSize: 14 }}>{w.email}</td>
                      <td style={{ padding: '14px 20px', color: '#666', fontSize: 13 }}>{fmtDate(w.created_at)}</td>
                      <td style={{ padding: '14px 20px' }}>
                        {canEdit && <button onClick={() => setConfirmDelete(`waitlist:${w.id}`)} style={{ background: '#1a0a0a', border: '1px solid #ef4444', color: '#ef4444', fontSize: 11, padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>Delete</button>}
                      </td>
                    </tr>
                  ))}
                  {!waitlist.length && <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#444' }}>No signups yet</td></tr>}
                </tbody>
              </table>
            </div>
          </>

        ) : tab === 'merchants' ? (
          <>
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <StatCard label="Total" value={merchants.length} />
              <StatCard label="Active" value={activeMerchants.length} color="#0d9488" />
              {pendingMerchants.length > 0 && <StatCard label="Pending" value={pendingMerchants.length} color="#eab308" />}
            </div>
            <div style={{ background: '#111', borderRadius: 12, border: '1px solid #1a1a1a', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                    {['Name', 'Type', 'Contact', 'Location', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#666', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {merchants.map((m, i) => (
                    <tr key={m.id} style={{ borderBottom: i < merchants.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                      <td style={{ padding: '12px 16px', color: '#fff', fontSize: 14, fontWeight: 600 }}>{m.name}</td>
                      <td style={{ padding: '12px 16px', color: '#aaa', fontSize: 13, textTransform: 'capitalize' }}>{m.type?.replace('_', ' ') || '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#0d9488', fontSize: 13 }}>{m.phone || '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#aaa', fontSize: 12, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.address || '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <Badge text={m.status === 'active' ? 'ACTIVE' : m.status === 'pending' ? 'PENDING' : 'REJECTED'}
                          color={m.status === 'active' ? 'green' : m.status === 'pending' ? 'yellow' : 'red'} />
                      </td>
                      <td style={{ padding: '12px 16px', color: '#555', fontSize: 12, whiteSpace: 'nowrap' }}>{fmtDate(m.created_at)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {canEdit && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            {m.status === 'pending' && <>
                              <button onClick={() => updateMerchantStatus(m.id, 'active')} style={{ background: '#0d9488', border: 'none', color: '#fff', fontSize: 11, padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>Approve</button>
                              <button onClick={() => updateMerchantStatus(m.id, 'rejected')} style={{ background: '#1a0a0a', border: '1px solid #ef4444', color: '#ef4444', fontSize: 11, padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>Reject</button>
                            </>}
                            <button onClick={() => setConfirmDelete(`merchant:${m.id}`)} style={{ background: '#1a0a0a', border: '1px solid #333', color: '#666', fontSize: 11, padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>Del</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!merchants.length && <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#444' }}>No merchants yet</td></tr>}
                </tbody>
              </table>
            </div>
          </>

        ) : tab === 'admin-users' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Admin Users</h2>
                <p style={{ color: '#666', fontSize: 13, margin: '4px 0 0' }}>All edits and changes are tracked in the Audit Log</p>
              </div>
              {isSuperAdmin && (
                <button onClick={() => setShowAddAdmin(true)} style={{ background: '#0d9488', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                  + Create Admin User
                </button>
              )}
            </div>
            <div style={{ background: '#111', borderRadius: 12, border: '1px solid #1a1a1a', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                    {['Username', 'Role', 'Created By', 'Created', 'Last Login', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: '#666', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Superadmin row (always shown) */}
                  <tr style={{ borderBottom: '1px solid #1a1a1a', background: '#0d948811' }}>
                    <td style={{ padding: '14px 20px', color: '#0d9488', fontSize: 14, fontWeight: 700 }}>{SUPERADMIN_USERNAME}</td>
                    <td style={{ padding: '14px 20px' }}><Badge text="SUPERADMIN" color="purple" /></td>
                    <td style={{ padding: '14px 20px', color: '#555', fontSize: 13 }}>System</td>
                    <td style={{ padding: '14px 20px', color: '#555', fontSize: 13 }}>Origin</td>
                    <td style={{ padding: '14px 20px', color: '#555', fontSize: 13 }}>—</td>
                    <td style={{ padding: '14px 20px', color: '#444', fontSize: 12 }}>Protected</td>
                  </tr>
                  {adminUsers.map((a, i) => (
                    <tr key={a.id} style={{ borderBottom: i < adminUsers.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                      <td style={{ padding: '14px 20px', color: '#fff', fontSize: 14, fontWeight: 600 }}>{a.username}</td>
                      <td style={{ padding: '14px 20px' }}><Badge text={a.role.toUpperCase()} color={a.role === 'editor' ? 'blue' : 'gray'} /></td>
                      <td style={{ padding: '14px 20px', color: '#888', fontSize: 13 }}>{a.created_by || '—'}</td>
                      <td style={{ padding: '14px 20px', color: '#666', fontSize: 13 }}>{fmtDate(a.created_at)}</td>
                      <td style={{ padding: '14px 20px', color: '#666', fontSize: 13 }}>{a.last_login ? fmtDate(a.last_login) : 'Never'}</td>
                      <td style={{ padding: '14px 20px' }}>
                        {isSuperAdmin && (
                          <button onClick={() => setConfirmDelete(`admin:${a.id}:${a.username}`)} style={{ background: '#1a0a0a', border: '1px solid #ef4444', color: '#ef4444', fontSize: 11, padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>Delete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!adminUsers.length && (
                    <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#444' }}>No additional admin users yet. Create one above.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>

        ) : (
          /* AUDIT LOG */
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Audit Log</h2>
                <p style={{ color: '#666', fontSize: 13, margin: '4px 0 0' }}>Every admin action is recorded here</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <input placeholder="Filter by admin / action / table..." value={searchAudit} onChange={e => setSearchAudit(e.target.value)}
                  style={{ padding: '8px 14px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 13, width: 300 }} />
                <button onClick={() => exportCSV(auditLog, 'petpass-audit.csv')} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#888', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Export</button>
              </div>
            </div>
            <div style={{ background: '#111', borderRadius: 12, border: '1px solid #1a1a1a', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                    {['Admin', 'Action', 'Table', 'Record ID', 'Details', 'Timestamp'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#666', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAudit.map((a, i) => (
                    <tr key={a.id} style={{ borderBottom: i < filteredAudit.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                      <td style={{ padding: '12px 16px', color: '#0d9488', fontSize: 13, fontWeight: 600 }}>{a.admin_username}</td>
                      <td style={{ padding: '12px 16px' }}><Badge text={a.action.toUpperCase()} color={actionColor[a.action] || 'gray'} /></td>
                      <td style={{ padding: '12px 16px', color: '#aaa', fontSize: 13 }}>{a.table_name}</td>
                      <td style={{ padding: '12px 16px', color: '#555', fontSize: 12, fontFamily: 'monospace' }}>{a.record_id ? `${a.record_id.slice(0, 8)}…` : '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#777', fontSize: 12, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.details ? JSON.stringify(a.details) : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#555', fontSize: 12, whiteSpace: 'nowrap' }}>{fmtDate(a.created_at)}</td>
                    </tr>
                  ))}
                  {!filteredAudit.length && <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#444' }}>No audit entries yet. Actions you take will appear here.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
