'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MerchantProfile() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [merchantId, setMerchantId] = useState('')
  const [merchantName, setMerchantName] = useState('')
  
  const [profile, setProfile] = useState({
    name: '',
    type: 'pet_hotel',
    address: '',
    phone: '',
    email: '',
    website: '',
    instagram: '',
    description: ''
  })

  const [services, setServices] = useState<any[]>([])
  const [newService, setNewService] = useState({ service_name: '', price: '', duration_minutes: '', description: '' })

  useEffect(() => {
    const merchantAuthed = sessionStorage.getItem('merchant_authed')
    const mid = sessionStorage.getItem('merchant_id')
    const mname = sessionStorage.getItem('merchant_name')

    if (!merchantAuthed || !mid) {
      router.push('/merchant/login')
      return
    }

    setMerchantId(mid)
    setMerchantName(mname || 'Merchant')
    fetchProfile(mid)
  }, [router])

  async function fetchProfile(mid: string) {
    setLoading(true)
    
    const { data: merchant } = await supabase
      .from('merchants')
      .select('*')
      .eq('id', mid)
      .single()

    if (merchant) {
      setProfile({
        name: merchant.name || '',
        type: merchant.type || 'pet_hotel',
        address: merchant.address || '',
        phone: merchant.phone || '',
        email: merchant.email || '',
        website: merchant.website || '',
        instagram: merchant.instagram || '',
        description: merchant.description || ''
      })
    }

    const { data: merchantServices } = await supabase
      .from('merchant_services')
      .select('*')
      .eq('merchant_id', mid)
      .order('created_at', { ascending: false })

    setServices(merchantServices || [])
    setLoading(false)
  }

  async function updateProfile() {
    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('merchants')
      .update(profile)
      .eq('id', merchantId)

    if (error) {
      setMessage('Error updating profile')
    } else {
      setMessage('Profile updated successfully!')
      sessionStorage.setItem('merchant_name', profile.name)
    }
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  async function addService() {
    if (!newService.service_name || !newService.price) {
      alert('Please enter service name and price')
      return
    }

    await supabase.from('merchant_services').insert({
      merchant_id: merchantId,
      service_name: newService.service_name,
      price: parseFloat(newService.price),
      duration_minutes: newService.duration_minutes ? parseInt(newService.duration_minutes) : null,
      description: newService.description
    })

    setNewService({ service_name: '', price: '', duration_minutes: '', description: '' })
    fetchProfile(merchantId)
  }

  async function deleteService(serviceId: string) {
    if (!confirm('Delete this service?')) return
    await supabase.from('merchant_services').delete().eq('id', serviceId)
    fetchProfile(merchantId)
  }

  function logout() {
    sessionStorage.removeItem('merchant_authed')
    sessionStorage.removeItem('merchant_id')
    sessionStorage.removeItem('merchant_user_id')
    sessionStorage.removeItem('merchant_name')
    router.push('/merchant/login')
  }

  const navItems = [
    { href: '/merchant/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/merchant/bookings', label: 'Bookings', icon: '📅' },
    { href: '/merchant/pets', label: 'Pets', icon: '🐾' },
    { href: '/merchant/profile', label: 'Profile', icon: '⚙️' },
  ]

  const types = [
    { value: 'pet_hotel', label: 'Pet Hotel' },
    { value: 'vet', label: 'Veterinary Clinic' },
    { value: 'groomer', label: 'Pet Groomer' },
    { value: 'pet_store', label: 'Pet Store' },
    { value: 'trainer', label: 'Pet Trainer' },
    { value: 'other', label: 'Other' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #1a1a1a', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: 20, fontWeight: 700 }}>🏪 {merchantName}</span>
          <span style={{ marginLeft: 12, fontSize: 12, color: '#0d9488', background: 'rgba(13,148,136,0.1)', padding: '2px 8px', borderRadius: 4 }}>Merchant</span>
        </div>
        <button onClick={logout} style={{ background: 'transparent', border: '1px solid #333', color: '#666', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
          Logout
        </button>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 65px)' }}>
        {/* Sidebar */}
        <div style={{ width: 220, background: '#111', borderRight: '1px solid #1a1a1a', padding: '20px 0' }}>
          {navItems.map(item => (
            <Link 
              key={item.href} 
              href={item.href}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '12px 24px', 
                color: item.href === '/merchant/profile' ? '#0d9488' : '#888',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: item.href === '/merchant/profile' ? 600 : 400,
                borderLeft: item.href === '/merchant/profile' ? '3px solid #0d9488' : '3px solid transparent'
              }}
            >
              <span style={{ marginRight: 10, fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: 32, overflow: 'auto' }}>
          {loading ? (
            <div style={{ color: '#666', textAlign: 'center', padding: 60 }}>Loading...</div>
          ) : (
            <>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Profile Settings</h2>

              {message && (
                <div style={{ 
                  background: message.includes('Error') ? 'rgba(239,68,68,0.1)' : 'rgba(13,148,136,0.1)', 
                  border: `1px solid ${message.includes('Error') ? '#ef4444' : '#0d9488'}`,
                  color: message.includes('Error') ? '#ef4444' : '#0d9488',
                  padding: '12px 16px', 
                  borderRadius: 8, 
                  marginBottom: 20,
                  fontSize: 14
                }}>
                  {message}
                </div>
              )}

              {/* Profile Form */}
              <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Business Information</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>Business Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={e => setProfile({...profile, name: e.target.value})}
                      style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>Business Type</label>
                    <select
                      value={profile.type}
                      onChange={e => setProfile({...profile, type: e.target.value})}
                      style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 }}
                    >
                      {types.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>Address</label>
                  <input
                    type="text"
                    value={profile.address}
                    onChange={e => setProfile({...profile, address: e.target.value})}
                    style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>Phone</label>
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={e => setProfile({...profile, phone: e.target.value})}
                      style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={e => setProfile({...profile, email: e.target.value})}
                      style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>Website</label>
                    <input
                      type="text"
                      value={profile.website}
                      onChange={e => setProfile({...profile, website: e.target.value})}
                      style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>Instagram</label>
                    <input
                      type="text"
                      value={profile.instagram}
                      onChange={e => setProfile({...profile, instagram: e.target.value})}
                      placeholder="@username"
                      style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>Description</label>
                    <input
                      type="text"
                      value={profile.description}
                      onChange={e => setProfile({...profile, description: e.target.value})}
                      style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 }}
                    />
                  </div>
                </div>

                <button
                  onClick={updateProfile}
                  disabled={saving}
                  style={{ padding: '12px 24px', background: saving ? '#0a7a70' : '#0d9488', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              {/* Services */}
              <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Services Offered</h3>
                
                {/* Add new service */}
                <div style={{ background: '#1a1a1a', borderRadius: 8, padding: 16, marginBottom: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr auto', gap: 12, alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', color: '#888', fontSize: 11, marginBottom: 4 }}>Service Name</label>
                      <input
                        type="text"
                        value={newService.service_name}
                        onChange={e => setNewService({...newService, service_name: e.target.value})}
                        placeholder="e.g. Cat Boarding"
                        style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 13 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#888', fontSize: 11, marginBottom: 4 }}>Price (RM)</label>
                      <input
                        type="number"
                        value={newService.price}
                        onChange={e => setNewService({...newService, price: e.target.value})}
                        placeholder="50"
                        style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 13 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#888', fontSize: 11, marginBottom: 4 }}>Duration (min)</label>
                      <input
                        type="number"
                        value={newService.duration_minutes}
                        onChange={e => setNewService({...newService, duration_minutes: e.target.value})}
                        placeholder="60"
                        style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 13 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#888', fontSize: 11, marginBottom: 4 }}>Description</label>
                      <input
                        type="text"
                        value={newService.description}
                        onChange={e => setNewService({...newService, description: e.target.value})}
                        placeholder="Brief description"
                        style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 13 }}
                      />
                    </div>
                    <button
                      onClick={addService}
                      style={{ padding: '10px 16px', background: '#0d9488', border: 'none', borderRadius: 6, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Services List */}
                {services.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                        {['Service', 'Price', 'Duration', 'Description', ''].map(h => (
                          <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#666', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {services.map(s => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 600 }}>{s.service_name}</td>
                          <td style={{ padding: '12px 16px', color: '#0d9488' }}>RM {s.price}</td>
                          <td style={{ padding: '12px 16px', color: '#aaa' }}>{s.duration_minutes ? `${s.duration_minutes} min` : '—'}</td>
                          <td style={{ padding: '12px 16px', color: '#888', fontSize: 13 }}>{s.description || '—'}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <button
                              onClick={() => deleteService(s.id)}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: 20, textAlign: 'center', color: '#444' }}>No services added yet</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
