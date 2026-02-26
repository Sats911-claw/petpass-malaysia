'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

interface Pet {
  id: string
  name: string
  species: string
  breed: string
  photo_url: string
  is_lost: boolean
  owner_phone: string
  owner_email: string
  created_at: string
}

interface FoundReport {
  id: string
  pet_id: string
  finder_name: string
  finder_phone: string
  location_text: string
  lat: number
  lng: number
  message: string
  created_at: string
}

function getSpeciesEmoji(species: string) {
  switch (species?.toLowerCase()) {
    case 'dog': return '🐕'
    case 'cat': return '🐱'
    case 'rabbit': return '🐰'
    case 'bird': return '🐦'
    default: return '🐾'
  }
}

export default function LostFoundPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [reports, setReports] = useState<Record<string, FoundReport[]>>({})
  const [selected, setSelected] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchLostPets()
  }, [])

  async function fetchLostPets() {
    setLoading(true)
    const { data: petsData } = await supabase
      .from('pets')
      .select('id, name, species, breed, photo_url, is_lost, owner_phone, owner_email, created_at')
      .eq('is_lost', true)
      .order('created_at', { ascending: false })

    const lostPets = petsData || []
    setPets(lostPets)

    if (lostPets.length > 0) {
      const petIds = lostPets.map((p: Pet) => p.id)
      const { data: reportsData } = await supabase
        .from('found_reports')
        .select('*')
        .in('pet_id', petIds)
        .order('created_at', { ascending: false })

      const grouped: Record<string, FoundReport[]> = {}
      ;(reportsData || []).forEach((r: FoundReport) => {
        if (!grouped[r.pet_id]) grouped[r.pet_id] = []
        grouped[r.pet_id].push(r)
      })
      setReports(grouped)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(180deg, #7f1d1d 0%, #0a0a0a 100%)', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
            ← Back to PetPass
          </Link>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🚨</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 8px' }}>Lost & Found</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, margin: 0 }}>
            {pets.length > 0 ? `${pets.length} pet${pets.length !== 1 ? 's' : ''} currently missing in Malaysia` : 'All pets are safe 🐾'}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#666' }}>Loading...</div>
        ) : pets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🐾</div>
            <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>No missing pets!</h2>
            <p style={{ color: '#666' }}>All registered pets are safe and accounted for.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {pets.map(pet => {
              const petReports = reports[pet.id] || []
              const hasReports = petReports.length > 0
              return (
                <div key={pet.id} onClick={() => setSelected(selected?.id === pet.id ? null : pet)}
                  style={{ background: '#111', border: `1px solid ${hasReports ? '#0d9488' : '#ef444444'}`, borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.15s, border-color 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}>

                  {/* Photo */}
                  <div style={{ aspectRatio: '1', background: '#1a1a1a', position: 'relative' }}>
                    {pet.photo_url ? (
                      <img src={pet.photo_url} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>
                        {getSpeciesEmoji(pet.species)}
                      </div>
                    )}
                    {hasReports && (
                      <div style={{ position: 'absolute', top: 10, right: 10, background: '#0d9488', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
                        📍 SPOTTED
                      </div>
                    )}
                    {!hasReports && (
                      <div style={{ position: 'absolute', top: 10, left: 10, background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
                        🚨 MISSING
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>{pet.name}</h3>
                    <p style={{ color: '#666', fontSize: 13, margin: '0 0 12px', textTransform: 'capitalize' }}>
                      {pet.species}{pet.breed ? ` · ${pet.breed}` : ''}
                    </p>
                    {hasReports ? (
                      <p style={{ color: '#0d9488', fontSize: 13, fontWeight: 600 }}>
                        👤 {petReports[0].finder_name} spotted them
                      </p>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        {pet.owner_phone && (
                          <a href={`tel:${pet.owner_phone}`} onClick={e => e.stopPropagation()}
                            style={{ flex: 1, background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.3)', color: '#0d9488', padding: '7px 0', borderRadius: 8, textAlign: 'center', textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>
                            📞 Call Owner
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Expanded found reports */}
                  {selected?.id === pet.id && hasReports && (
                    <div style={{ borderTop: '1px solid #1a1a1a', padding: 16, background: '#0d0d0d' }}>
                      <p style={{ color: '#0d9488', fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Found Reports ({petReports.length})</p>
                      {petReports.map(r => (
                        <div key={r.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #1a1a1a' }}>
                          <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>👤 {r.finder_name}</p>
                          {r.location_text && <p style={{ color: '#aaa', fontSize: 13, margin: '0 0 4px' }}>📍 {r.location_text}</p>}
                          {r.message && <p style={{ color: '#888', fontSize: 12, margin: '0 0 4px', fontStyle: 'italic' }}>"{r.message}"</p>}
                          {r.lat && r.lng && (
                            <a href={`https://maps.google.com/?q=${r.lat},${r.lng}`} target="_blank" rel="noopener noreferrer"
                              style={{ color: '#0d9488', fontSize: 12, textDecoration: 'none' }}>
                              🗺 View exact location →
                            </a>
                          )}
                          {r.finder_phone && (
                            <a href={`tel:${r.finder_phone}`} style={{ display: 'block', color: '#0d9488', fontSize: 12, textDecoration: 'none', marginTop: 4 }}>
                              📞 Call finder: {r.finder_phone}
                            </a>
                          )}
                          <p style={{ color: '#444', fontSize: 11, margin: '6px 0 0' }}>
                            {new Date(r.created_at).toLocaleString('en-MY')}
                          </p>
                        </div>
                      ))}
                      {pet.owner_phone && (
                        <a href={`tel:${pet.owner_phone}`}
                          style={{ display: 'block', width: '100%', background: '#0d9488', border: 'none', color: '#fff', padding: '10px 0', borderRadius: 8, textAlign: 'center', textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
                          📞 Call Owner Now
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
