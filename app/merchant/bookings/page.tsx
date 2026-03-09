'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'

export default function MerchantBookings() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [merchantId, setMerchantId] = useState('')
  const [merchantName, setMerchantName] = useState('')
  const [bookings, setBookings] = useState<any[]>([])
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  
  // New booking form
  const [newBooking, setNewBooking] = useState({
    owner_name: '',
    owner_phone: '',
    pet_name: '',
    pet_type: 'cat',
    check_in: '',
    check_out: '',
    notes: ''
  })

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
    fetchBookings(mid)
  }, [router])

  async function fetchBookings(mid: string) {
    setLoading(true)
    const { data } = await supabase
      .from('pet_boarding')
      .select('*')
      .eq('merchant_id', mid)
      .order('created_at', { ascending: false })
    
    setBookings(data || [])
    setLoading(false)
  }

  async function updateStatus(bookingId: string, newStatus: string) {
    await supabase.from('pet_boarding').update({ status: newStatus }).eq('id', bookingId)
    fetchBookings(merchantId)
  }

  async function createBooking() {
    if (!newBooking.owner_name || !newBooking.owner_phone || !newBooking.check_in || !newBooking.check_out) {
      alert('Please fill in all required fields')
      return
    }

    await supabase.from('pet_boarding').insert({
      merchant_id: merchantId,
      ...newBooking,
      status: 'pending'
    })

    setShowModal(false)
    setNewBooking({
      owner_name: '',
      owner_phone: '',
      pet_name: '',
      pet_type: 'cat',
      check_in: '',
      check_out: '',
      notes: ''
    })
    fetchBookings(merchantId)
  }

  function logout() {
    sessionStorage.removeItem('merchant_authed')
    sessionStorage.removeItem('merchant_id')
    sessionStorage.removeItem('merchant_user_id')
    sessionStorage.removeItem('merchant_name')
    router.push('/merchant/login')
  }

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  const navItems = [
    { href: '/merchant/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/merchant/bookings', label: 'Bookings', icon: '📅' },
    { href: '/merchant/pets', label: 'Pets', icon: '🐾' },
    { href: '/merchant/profile', label: 'Profile', icon: '⚙️' },
  ]

  const statusOptions: StatusFilter[] = ['all', 'pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']

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
                color: item.href === '/merchant/bookings' ? '#0d9488' : '#888',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: item.href === '/merchant/bookings' ? 600 : 400,
                borderLeft: item.href === '/merchant/bookings' ? '3px solid #0d9488' : '3px solid transparent'
              }}
            >
              <span style={{ marginRight: 10, fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700 }}>Bookings</h2>
            <button 
              onClick={() => setShowModal(true)}
              style={{ background: '#0d9488', border: 'none', color: '#fff', padding: '12px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
            >
              + New Booking
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {statusOptions.map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                style={{
                  padding: '8px 16px',
                  background: filter === status ? '#0d9488' : '#1a1a1a',
                  border: 'none',
                  borderRadius: 6,
                  color: filter === status ? '#fff' : '#888',
                  fontSize: 13,
                  fontWeight: filter === status ? 600 : 400,
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ')}
                {status !== 'all' && <span style={{ marginLeft: 6, opacity: 0.7 }}>({bookings.filter(b => b.status === status).length})</span>}
              </button>
            ))}
          </div>

          {/* Bookings Table */}
          <div style={{ background: '#111', borderRadius: 12, border: '1px solid #1a1a1a', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Loading...</div>
            ) : filteredBookings.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                    {['Pet', 'Owner', 'Phone', 'Check-in', 'Check-out', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: '#666', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b, i) => (
                    <tr key={b.id} style={{ borderBottom: i < filteredBookings.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                      <td style={{ padding: '14px 20px', fontWeight: 600 }}>{b.pet_name || '—'}</td>
                      <td style={{ padding: '14px 20px', color: '#aaa' }}>{b.owner_name}</td>
                      <td style={{ padding: '14px 20px', color: '#0d9488' }}>{b.owner_phone}</td>
                      <td style={{ padding: '14px 20px', color: '#aaa' }}>{new Date(b.check_in).toLocaleDateString('en-MY')}</td>
                      <td style={{ padding: '14px 20px', color: '#aaa' }}>{new Date(b.check_out).toLocaleDateString('en-MY')}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <StatusBadge status={b.status} />
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <select
                          value={b.status}
                          onChange={(e) => updateStatus(b.id, e.target.value)}
                          style={{
                            background: '#1a1a1a',
                            border: '1px solid #333',
                            color: '#fff',
                            padding: '6px 10px',
                            borderRadius: 6,
                            fontSize: 12,
                            cursor: 'pointer'
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="checked_in">Checked In</option>
                          <option value="checked_out">Checked Out</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: '#444' }}>No bookings found</div>
            )}
          </div>
        </div>
      </div>

      {/* New Booking Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: 32, width: 450, maxHeight: '90vh', overflow: 'auto' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>New Booking</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>Owner Name *</label>
              <input
                type="text"
                value={newBooking.owner_name}
                onChange={e => setNewBooking({...newBooking, owner_name: e.target.value})}
                style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 }}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>Phone *</label>
              <input
                type="text"
                value={newBooking.owner_phone}
                onChange={e => setNewBooking({...newBooking, owner_phone: e.target.value})}
                style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>Pet Name</label>
                <input
                  type="text"
                  value={newBooking.pet_name}
                  onChange={e => setNewBooking({...newBooking, pet_name: e.target.value})}
                  style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>Pet Type</label>
                <select
                  value={newBooking.pet_type}
                  onChange={e => setNewBooking({...newBooking, pet_type: e.target.value})}
                  style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 }}
                >
                  <option value="cat">Cat</option>
                  <option value="dog">Dog</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>Check-in *</label>
                <input
                  type="date"
                  value={newBooking.check_in}
                  onChange={e => setNewBooking({...newBooking, check_in: e.target.value})}
                  style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>Check-out *</label>
                <input
                  type="date"
                  value={newBooking.check_out}
                  onChange={e => setNewBooking({...newBooking, check_out: e.target.value})}
                  style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 }}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#888', fontSize: 12, marginBottom: 6 }}>Notes</label>
              <textarea
                value={newBooking.notes}
                onChange={e => setNewBooking({...newBooking, notes: e.target.value})}
                rows={3}
                style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14, resize: 'none' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #333', borderRadius: 8, color: '#888', fontSize: 14, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={createBooking}
                style={{ flex: 1, padding: '12px', background: '#0d9488', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                Create Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string, text: string }> = {
    pending: { bg: '#eab308', text: '#000' },
    confirmed: { bg: '#3b82f6', text: '#fff' },
    checked_in: { bg: '#0d9488', text: '#fff' },
    checked_out: { bg: '#666', text: '#fff' },
    cancelled: { bg: '#ef4444', text: '#fff' },
  }
  const c = colors[status] || { bg: '#666', text: '#fff' }
  return (
    <span style={{ background: c.bg, color: c.text, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
      {status?.replace('_', ' ')}
    </span>
  )
}
