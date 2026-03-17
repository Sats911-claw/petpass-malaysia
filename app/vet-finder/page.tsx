'use client'

import { useState } from 'react'

type Specialty = 'Dogs' | 'Cats' | 'Exotic' | '24hr'

interface Vet {
  name: string
  area: string
  address: string
  phone: string
  specialties: Specialty[]
  mapsQuery: string
}

const VETS: Vet[] = [
  { name: 'Pusat Veterinar Damansara', area: 'Damansara', address: 'Jalan SS22/25, Damansara Jaya, Petaling Jaya', phone: '03-7729 3053', specialties: ['Dogs', 'Cats', 'Exotic'], mapsQuery: 'Pusat+Veterinar+Damansara+Petaling+Jaya' },
  { name: 'Klinik Haiwan Subang Jaya', area: 'Subang Jaya', address: 'Jalan SS15/4, Subang Jaya, Selangor', phone: '03-5631 8832', specialties: ['Dogs', 'Cats'], mapsQuery: 'Klinik+Haiwan+Subang+Jaya+SS15' },
  { name: 'Mont Kiara Veterinary Clinic', area: 'Mont Kiara', address: 'Plaza Mont Kiara, Jalan Kiara, Mont Kiara, KL', phone: '03-6203 1788', specialties: ['Dogs', 'Cats', 'Exotic'], mapsQuery: 'Mont+Kiara+Veterinary+Clinic+KL' },
  { name: 'TTDI Animal Clinic', area: 'TTDI', address: 'Jalan Tun Mohd Fuad 3, Taman Tun Dr Ismail, KL', phone: '03-7727 6788', specialties: ['Dogs', 'Cats'], mapsQuery: 'TTDI+Animal+Clinic+Kuala+Lumpur' },
  { name: 'Bangsar Animal Clinic', area: 'Bangsar', address: 'Jalan Ara, Bangsar, Kuala Lumpur', phone: '03-2282 4428', specialties: ['Dogs', 'Cats'], mapsQuery: 'Bangsar+Animal+Clinic+Kuala+Lumpur' },
  { name: 'Klinik Haiwan Cheras', area: 'Cheras', address: 'Jalan Cochrane, Cheras, Kuala Lumpur', phone: '03-9200 4738', specialties: ['Dogs', 'Cats'], mapsQuery: 'Klinik+Haiwan+Cheras+Kuala+Lumpur' },
  { name: 'Ampang Animal Hospital', area: 'Ampang', address: 'Jalan Ampang, Ampang, Kuala Lumpur', phone: '03-4252 1688', specialties: ['Dogs', 'Cats', '24hr'], mapsQuery: 'Ampang+Animal+Hospital+Kuala+Lumpur' },
  { name: 'Klinik Veterinar Kepong', area: 'Kepong', address: 'Jalan Kepong, Kepong, Kuala Lumpur', phone: '03-6257 9938', specialties: ['Dogs', 'Cats'], mapsQuery: 'Klinik+Veterinar+Kepong+Kuala+Lumpur' },
  { name: 'PJ Animal Clinic', area: 'Petaling Jaya', address: 'Jalan Gasing, Petaling Jaya, Selangor', phone: '03-7956 2332', specialties: ['Dogs', 'Cats', 'Exotic'], mapsQuery: 'PJ+Animal+Clinic+Petaling+Jaya' },
  { name: 'Sri Petaling Veterinary Clinic', area: 'Sri Petaling', address: 'Jalan Radin Bagus, Sri Petaling, Kuala Lumpur', phone: '03-9058 1228', specialties: ['Dogs', 'Cats'], mapsQuery: 'Sri+Petaling+Veterinary+Clinic+KL' },
  { name: 'Klinik Haiwan Shah Alam', area: 'Shah Alam', address: 'Persiaran Hamdan Sheikh Tahir, Shah Alam, Selangor', phone: '03-5513 3838', specialties: ['Dogs', 'Cats', 'Exotic'], mapsQuery: 'Klinik+Haiwan+Shah+Alam+Selangor' },
  { name: 'Emergency Vet KL (24hr)', area: 'KL Sentral', address: 'Jalan Sultan Ismail, Kuala Lumpur', phone: '03-2697 9999', specialties: ['Dogs', 'Cats', 'Exotic', '24hr'], mapsQuery: 'Emergency+Vet+KL+Sentral+24+hour' },
  { name: 'Ara Damansara Animal Hospital', area: 'Ara Damansara', address: 'Jalan PJU 1A/3B, Ara Damansara, Petaling Jaya', phone: '03-7846 0033', specialties: ['Dogs', 'Cats', '24hr'], mapsQuery: 'Ara+Damansara+Animal+Hospital' },
  { name: 'Klinik Haiwan Setapak', area: 'Setapak', address: 'Jalan Gombak, Setapak, Kuala Lumpur', phone: '03-4023 2299', specialties: ['Dogs', 'Cats'], mapsQuery: 'Klinik+Haiwan+Setapak+Kuala+Lumpur' },
  { name: 'Bukit Jalil Veterinary Centre', area: 'Bukit Jalil', address: 'Jalan Jalil Perkasa, Bukit Jalil, Kuala Lumpur', phone: '03-8996 1122', specialties: ['Dogs', 'Cats', 'Exotic'], mapsQuery: 'Bukit+Jalil+Veterinary+Centre+KL' },
  { name: 'Klinik Haiwan Klang', area: 'Klang', address: 'Jalan Meru, Klang, Selangor', phone: '03-3371 5544', specialties: ['Dogs', 'Cats'], mapsQuery: 'Klinik+Haiwan+Klang+Selangor' },
]

const FILTERS: { label: string; value: Specialty | 'All' }[] = [
  { label: '🐾 All', value: 'All' },
  { label: '🚨 24hr Emergency', value: '24hr' },
  { label: '🐱 Cats', value: 'Cats' },
  { label: '🐶 Dogs', value: 'Dogs' },
  { label: '🦎 Exotic', value: 'Exotic' },
]

const SPECIALTY_COLORS: Record<Specialty, string> = {
  'Dogs': '#3b82f6',
  'Cats': '#8b5cf6',
  'Exotic': '#f59e0b',
  '24hr': '#ef4444',
}

export default function VetFinderPage() {
  const [filter, setFilter] = useState<Specialty | 'All'>('All')
  const [search, setSearch] = useState('')

  const filtered = VETS.filter(v => {
    const matchFilter = filter === 'All' || v.specialties.includes(filter)
    const matchSearch = !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.area.toLowerCase().includes(search.toLowerCase()) || v.address.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
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
            📍 Find Vets Near Me
          </button>
        </div>
      </div>

      {/* Search + Filter */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 24px 0' }}>
        <input
          type="text"
          placeholder="Search by clinic name or area..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '12px 16px', background: '#111', border: '1px solid #222', borderRadius: 10, color: '#fff', fontSize: 15, marginBottom: 16, boxSizing: 'border-box', outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)} style={{
              padding: '8px 16px', borderRadius: 20, border: '1px solid',
              borderColor: filter === f.value ? '#0d9488' : '#222',
              background: filter === f.value ? 'rgba(13,148,136,0.15)' : 'transparent',
              color: filter === f.value ? '#0d9488' : '#666',
              fontSize: 13, fontWeight: filter === f.value ? 600 : 400, cursor: 'pointer'
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>{filtered.length} clinic{filtered.length !== 1 ? 's' : ''} found</p>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, paddingBottom: 48 }}>
          {filtered.map((vet, i) => (
            <div key={i} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 14, padding: 20, transition: 'border-color 0.15s', cursor: 'default' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#0d9488')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#1a1a1a')}>
              <div style={{ marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px', color: '#fff' }}>{vet.name}</h3>
                <p style={{ color: '#0d9488', fontSize: 13, margin: '0 0 8px', fontWeight: 500 }}>📍 {vet.area}</p>
                <p style={{ color: '#666', fontSize: 12, margin: 0, lineHeight: 1.5 }}>{vet.address}</p>
              </div>

              {/* Specialties */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {vet.specialties.map(s => (
                  <span key={s} style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: SPECIALTY_COLORS[s] + '22', color: SPECIALTY_COLORS[s], border: `1px solid ${SPECIALTY_COLORS[s]}44` }}>
                    {s === '24hr' ? '🚨 24hr' : s}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={`tel:${vet.phone}`} style={{ flex: 1, background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.3)', color: '#0d9488', padding: '8px 0', borderRadius: 8, textAlign: 'center', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                  📞 Call
                </a>
                <a href={`https://www.google.com/maps/search/${vet.mapsQuery}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: '#1a1a1a', border: '1px solid #222', color: '#aaa', padding: '8px 0', borderRadius: 8, textAlign: 'center', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                  🗺 Directions
                </a>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: '#444' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <p>No clinics found. Try a different search or filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}
