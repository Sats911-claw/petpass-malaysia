'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Clinic {
  id: string
  name: string
  address: string
  area: string
  phone: string
  email: string
  website: string
  is_24h: boolean
  emergency_line: string
}

export default function VetFinderPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [areaFilter, setAreaFilter] = useState('All')

  useEffect(() => {
    async function fetchClinics() {
      const { data, error } = await supabase
        .from('vet_clinics')
        .select('*')
        .order('name')

      if (data) setClinics(data)
      setLoading(false)
    }
    fetchClinics()
  }, [])

  const areas = ['All', ...new Set(clinics.map(c => c.area).filter(Boolean))]

  const filteredClinics = clinics.filter(c => {
    const matchSearch = !search || 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.area?.toLowerCase().includes(search.toLowerCase()) ||
      c.address?.toLowerCase().includes(search.toLowerCase())
    const matchArea = areaFilter === 'All' || c.area === areaFilter
    return matchSearch && matchArea
  })

  function findNearMe() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords
        window.open(`https://www.google.com/maps/search/veterinary+clinic/@${latitude},${longitude},14z`, '_blank')
      }, () => {
        window.open('https://www.google.com/maps/search/veterinary+clinic+kuala+lumpur', '_blank')
      })
    } else {
      window.open('https://www.google.com/maps/search/veterinary+clinic+kuala+lumpur', '_blank')
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🏥</div>
          <div style={{ color: 'rgba(255,255,255,0.6)' }}>Loading...</div>
        </div>
      </div>
    )
  }

  if (clinics.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(180deg, #0d9488 0%, #0a0a0a 100%)', padding: '48px 24px 32px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <a href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
              ← Back
            </a>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🏥</div>
            <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 8px' }}>Vet Finder</h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, margin: '0 0 24px' }}>Find trusted veterinary clinics in Kuala Lumpur & Selangor</p>
            <button onClick={findNearMe} style={{ background: '#fff', color: '#0d9488', border: 'none', padding: '12px 24px', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              📍 Find Near Me
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🐾</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Vet Network Coming Soon</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, marginBottom: 32, lineHeight: 1.6 }}>
            We're building Malaysia's largest network of trusted veterinarians. 
            Register your clinic to be among the first listed!
          </p>
          <a href="/vets/join?tab=clinic" style={{ background: '#0d9488', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}>
            🏥 Register Your Clinic
          </a>
        </div>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '32px 24px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>© 2026 petpass.my</p>
        </footer>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(180deg, #0d9488 0%, #0a0a0a 100%)', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <a href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
            ← Back
          </a>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏥</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 8px' }}>Vet Finder</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, margin: '0 0 24px' }}>Find trusted veterinary clinics in Kuala Lumpur & Selangor</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={findNearMe} style={{ background: '#fff', color: '#0d9488', border: 'none', padding: '12px 24px', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              📍 Find Near Me
            </button>
            <a href="/vets/join" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '12px 24px', borderRadius: 10, fontWeight: 600, fontSize: 15, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              🏥 Register Clinic
            </a>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          <input
            type="text"
            placeholder="Search clinics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200, padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 15 }}
          />
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 15, minWidth: 150 }}
          >
            {areas.map(area => (
              <option key={area} value={area} style={{ background: '#1a1a1a' }}>{area}</option>
            ))}
          </select>
        </div>

        {/* Results */}
        <div style={{ display: 'grid', gap: 16 }}>
          {filteredClinics.map(clinic => (
            <div key={clinic.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{clinic.name}</h3>
                {clinic.is_24h && (
                  <span style={{ background: '#dc2626', color: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>24/7</span>
                )}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: '0 0 12px' }}>{clinic.address}</p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <a href={`tel:${clinic.phone}`} style={{ color: '#2dd4bf', textDecoration: 'none', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  📞 {clinic.phone}
                </a>
                {clinic.emergency_line && (
                  <a href={`tel:${clinic.emergency_line}`} style={{ color: '#f87171', textDecoration: 'none', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    🚨 Emergency: {clinic.emergency_line}
                  </a>
                )}
                {clinic.area && (
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>📍 {clinic.area}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredClinics.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'rgba(255,255,255,0.5)' }}>
            No clinics found matching your search.
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '32px 24px', textAlign: 'center', marginTop: 40 }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>© 2026 petpass.my</p>
      </footer>
    </div>
  )
}
