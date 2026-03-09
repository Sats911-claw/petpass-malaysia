'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MerchantDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [merchantId, setMerchantId] = useState('')
  const [merchantName, setMerchantName] = useState('')
  const [stats, setStats] = useState({
    activeBoardings: 0,
    upcomingCheckins: 0,
    totalPets: 0,
    pendingBookings: 0
  })
  const [recentBookings, setRecentBookings] = useState<any[]>([])

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
    fetchDashboardData(mid)
  }, [router])

  async function fetchDashboardData(mid: string) {
    setLoading(true)
    
    // Fetch bookings
    const { data: bookings } = await supabase
      .from('pet_boarding')
      .select('*')
      .eq('merchant_id', mid)
      .order('created_at', { ascending: false })
      .limit(10)

    // Calculate stats
    const allBookings = bookings || []
    const active = allBookings.filter(b => b.status === 'checked_in').length
    const upcoming = allBookings.filter(b => ['pending', 'confirmed'].includes(b.status) && new Date(b.check_in) > new Date()).length
    const pending = allBookings.filter(b => b.status === 'pending').length
    const uniquePets = new Set(allBookings.map(b => b.pet_id).filter(Boolean)).size

    setStats({
      activeBoardings: active,
      upcomingCheckins: upcoming,
      totalPets: uniquePets,
      pendingBookings: pending
    })
    setRecentBookings(allBookings.slice(0, 5))
    setLoading(false)
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
                color: item.href === '/merchant/dashboard' ? '#0d9488' : '#888',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: item.href === '/merchant/dashboard' ? 600 : 400,
                borderLeft: item.href === '/merchant/dashboard' ? '3px solid #0d9488' : '3px solid transparent'
              }}
            >
              <span style={{ marginRight: 10, fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: 32 }}>
          {loading ? (
            <div style={{ color: '#666', textAlign: 'center', padding: 60 }}>Loading...</div>
          ) : (
            <>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Dashboard Overview</h2>
              
              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
                <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 36, fontWeight: 700, color: '#0d9488' }}>{stats.activeBoardings}</div>
                  <div style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Active Boardings</div>
                </div>
                <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 36, fontWeight: 700, color: '#eab308' }}>{stats.upcomingCheckins}</div>
                  <div style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Upcoming Check-ins</div>
                </div>
                <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 36, fontWeight: 700, color: '#fff' }}>{stats.totalPets}</div>
                  <div style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Total Pets Served</div>
                </div>
                <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 36, fontWeight: 700, color: '#ef4444' }}>{stats.pendingBookings}</div>
                  <div style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Pending Bookings</div>
                </div>
              </div>

              {/* Recent Bookings */}
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Recent Bookings</h3>
              <div style={{ background: '#111', borderRadius: 12, border: '1px solid #1a1a1a', overflow: 'hidden' }}>
                {recentBookings.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                        {['Pet Name', 'Owner', 'Check-in', 'Check-out', 'Status'].map(h => (
                          <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: '#666', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map((b, i) => (
                        <tr key={b.id} style={{ borderBottom: i < recentBookings.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                          <td style={{ padding: '14px 20px', fontWeight: 600 }}>{b.pet_name || '—'}</td>
                          <td style={{ padding: '14px 20px', color: '#aaa' }}>{b.owner_name}</td>
                          <td style={{ padding: '14px 20px', color: '#aaa' }}>{new Date(b.check_in).toLocaleDateString('en-MY')}</td>
                          <td style={{ padding: '14px 20px', color: '#aaa' }}>{new Date(b.check_out).toLocaleDateString('en-MY')}</td>
                          <td style={{ padding: '14px 20px' }}>
                            <StatusBadge status={b.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: 40, textAlign: 'center', color: '#444' }}>No bookings yet</div>
                )}
              </div>

              {/* Quick Actions */}
              <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
                <Link href="/merchant/bookings" style={{ background: '#0d9488', border: 'none', color: '#fff', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                  View All Bookings →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
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
