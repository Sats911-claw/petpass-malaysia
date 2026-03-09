'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MerchantPets() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [merchantId, setMerchantId] = useState('')
  const [merchantName, setMerchantName] = useState('')
  const [pets, setPets] = useState<any[]>([])
  const [search, setSearch] = useState('')

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
    fetchPets(mid)
  }, [router])

  async function fetchPets(mid: string) {
    setLoading(true)
    // Fetch all bookings and extract unique pets
    const { data: bookings } = await supabase
      .from('pet_boarding')
      .select('*')
      .eq('merchant_id', mid)
      .order('created_at', { ascending: false })

    // Group by pet (using pet_name + owner_phone as unique key for display)
    const petMap = new Map<string, any>()
    bookings?.forEach(b => {
      const key = b.pet_name + '|' + b.owner_phone
      if (!petMap.has(key)) {
        petMap.set(key, {
          pet_name: b.pet_name,
          pet_type: b.pet_type,
          owner_name: b.owner_name,
          owner_phone: b.owner_phone,
          total_visits: 0,
          last_visit: null,
          statuses: []
        })
      }
      const pet = petMap.get(key)
      pet.total_visits++
      pet.last_visit = b.check_in
      pet.statuses.push(b.status)
    })

    setPets(Array.from(petMap.values()))
    setLoading(false)
  }

  function logout() {
    sessionStorage.removeItem('merchant_authed')
    sessionStorage.removeItem('merchant_id')
    sessionStorage.removeItem('merchant_user_id')
    sessionStorage.removeItem('merchant_name')
    router.push('/merchant/login')
  }

  const filteredPets = pets.filter(p => 
    p.pet_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.owner_phone?.includes(search)
  )

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
                color: item.href === '/merchant/pets' ? '#0d9488' : '#888',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: item.href === '/merchant/pets' ? 600 : 400,
                borderLeft: item.href === '/merchant/pets' ? '3px solid #0d9488' : '3px solid transparent'
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
            <h2 style={{ fontSize: 24, fontWeight: 700 }}>Pets</h2>
            <div style={{ fontSize: 14, color: '#666' }}>{pets.length} unique pets served</div>
          </div>

          {/* Search */}
          <div style={{ marginBottom: 20 }}>
            <input
              type="text"
              placeholder="Search by pet name, owner, or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', maxWidth: 400, padding: '12px 16px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 }}
            />
          </div>

          {/* Pets Grid */}
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Loading...</div>
          ) : filteredPets.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {filteredPets.map((pet, i) => (
                <div key={i} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: pet.pet_type === 'cat' ? '#8b5cf6' : '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginRight: 14 }}>
                      {pet.pet_type === 'cat' ? '🐱' : '🐕'}
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{pet.pet_name || 'Unknown'}</div>
                      <div style={{ fontSize: 12, color: '#666', textTransform: 'capitalize' }}>{pet.pet_type || 'Pet'}</div>
                    </div>
                  </div>
                  
                  <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 16 }}>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ color: '#666', fontSize: 12 }}>Owner</span>
                      <div style={{ fontSize: 14 }}>{pet.owner_name}</div>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ color: '#666', fontSize: 12 }}>Phone</span>
                      <div style={{ fontSize: 14, color: '#0d9488' }}>{pet.owner_phone}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div>
                        <span style={{ color: '#666', fontSize: 12 }}>Total Visits</span>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{pet.total_visits}</div>
                      </div>
                      <div>
                        <span style={{ color: '#666', fontSize: 12 }}>Last Visit</span>
                        <div style={{ fontSize: 14 }}>{pet.last_visit ? new Date(pet.last_visit).toLocaleDateString('en-MY') : '—'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#444' }}>
              {search ? 'No pets match your search' : 'No pets served yet'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
