'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Pet {
  id: string
  name: string
  species: string
  breed: string
  photo_url: string
  is_lost: boolean
  show_contact_public: boolean
  owner_phone: string
  owner_email: string
}

interface FoundFormData {
  finder_name: string
  finder_phone: string
  location_text: string
  lat: number | null
  lng: number | null
  message: string
}

export default function ScanPage() {
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showFoundForm, setShowFoundForm] = useState(false)
  const [foundSubmitted, setFoundSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [form, setForm] = useState<FoundFormData>({
    finder_name: '', finder_phone: '', location_text: '', lat: null, lng: null, message: ''
  })
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    fetchPet(params.petId as string)
  }, [params.petId])

  const fetchPet = async (petId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('pets')
        .select('id, name, species, breed, photo_url, is_lost, show_contact_public, owner_phone, owner_email')
        .eq('id', petId)
        .single()

      if (fetchError) throw fetchError
      setPet(data)
    } catch (err) {
      console.error('Error fetching pet:', err)
      setError('Pet not found')
    } finally {
      setLoading(false)
    }
  }

  const getGPS = () => {
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(f => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude, location_text: f.location_text || `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}` }))
        setGpsLoading(false)
      },
      () => setGpsLoading(false)
    )
  }

  const submitFound = async () => {
    if (!form.finder_name.trim() || !pet) return
    setSubmitting(true)
    await supabase.from('found_reports').insert({
      pet_id: pet.id,
      finder_name: form.finder_name,
      finder_phone: form.finder_phone || null,
      location_text: form.location_text || null,
      lat: form.lat,
      lng: form.lng,
      message: form.message || null,
    })
    setFoundSubmitted(true)
    setSubmitting(false)
  }

  const getSpeciesEmoji = (species: string) => {
    switch (species?.toLowerCase()) {
      case 'dog': return '🐕'
      case 'cat': return '🐱'
      case 'rabbit': return '🐰'
      case 'bird': return '🐦'
      default: return '🐾'
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-MY', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <div className="text-6xl mb-4">😿</div>
        <h1 className="text-2xl font-bold text-white mb-2">Pet Not Found</h1>
        <p className="text-gray-400 mb-8">This QR code may be invalid or the pet has been removed.</p>
        <Link
          href="/"
          className="text-teal-400 hover:text-teal-300"
        >
          Go to PetPass Malaysia
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Lost Banner */}
      {pet.is_lost && (
        <div className="bg-red-600 text-white py-3 px-4 text-center font-bold animate-pulse">
          🚨 THIS PET IS LOST - PLEASE HELP FIND THEM! 🚨
        </div>
      )}

      <main className="px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Pet Photo */}
          <div className="aspect-square max-h-80 mx-auto mb-8 bg-white/10 rounded-3xl overflow-hidden">
            {pet.photo_url ? (
              <img
                src={pet.photo_url}
                alt={pet.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-9xl">
                {getSpeciesEmoji(pet.species)}
              </div>
            )}
          </div>

          {/* Pet Name */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">{pet.name}</h1>
            <p className="text-xl text-gray-400">
              {pet.species} {pet.breed && `• ${pet.breed}`}
            </p>
          </div>

          {/* Contact Card */}
          {pet.show_contact_public && (pet.owner_phone || pet.owner_email) && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Contact Owner</h2>
              <div className="space-y-3">
                {pet.owner_phone && (
                  <a
                    href={`tel:${pet.owner_phone}`}
                    className="flex items-center gap-3 p-3 bg-teal-600/20 hover:bg-teal-600/30 rounded-xl transition-colors"
                  >
                    <span className="text-2xl">📞</span>
                    <div>
                      <p className="text-white font-medium">{pet.owner_phone}</p>
                      <p className="text-gray-400 text-xs">Tap to call</p>
                    </div>
                  </a>
                )}
                {pet.owner_email && (
                  <a
                    href={`mailto:${pet.owner_email}`}
                    className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <span className="text-2xl">✉️</span>
                    <div>
                      <p className="text-white font-medium">{pet.owner_email}</p>
                      <p className="text-gray-400 text-xs">Tap to email</p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Info Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Pet Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Species</span>
                <span className="text-white capitalize">{pet.species}</span>
              </div>
              {pet.breed && (
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Breed</span>
                  <span className="text-white">{pet.breed}</span>
                </div>
              )}
            </div>
          </div>

          {/* I Found This Pet — only for lost pets */}
          {pet.is_lost && (
            <div className="mb-6">
              {foundSubmitted ? (
                <div style={{ background: 'rgba(13,148,136,0.1)', border: '1px solid #0d9488', borderRadius: 16, padding: 24, textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
                  <h3 style={{ color: '#0d9488', fontWeight: 700, fontSize: 18, margin: '0 0 8px' }}>Thank you!</h3>
                  <p style={{ color: '#aaa', fontSize: 14, margin: 0 }}>The owner has been notified. You're a hero! 🐾</p>
                </div>
              ) : !showFoundForm ? (
                <button onClick={() => setShowFoundForm(true)}
                  style={{ width: '100%', background: '#0d9488', border: 'none', color: '#fff', padding: '16px', borderRadius: 14, fontSize: 17, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.3 }}>
                  🐾 I Found This Pet!
                </button>
              ) : (
                <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 16, padding: 20 }}>
                  <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 16, margin: '0 0 16px' }}>Tell the owner where you found {pet.name}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input placeholder="Your name *" value={form.finder_name} onChange={e => setForm(f => ({ ...f, finder_name: e.target.value }))}
                      style={{ padding: '12px 14px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 10, color: '#fff', fontSize: 15, outline: 'none' }} />
                    <input placeholder="Your phone (optional)" value={form.finder_phone} onChange={e => setForm(f => ({ ...f, finder_phone: e.target.value }))}
                      style={{ padding: '12px 14px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 10, color: '#fff', fontSize: 15, outline: 'none' }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input placeholder="Location / area" value={form.location_text} onChange={e => setForm(f => ({ ...f, location_text: e.target.value }))}
                        style={{ flex: 1, padding: '12px 14px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 10, color: '#fff', fontSize: 15, outline: 'none' }} />
                      <button onClick={getGPS} disabled={gpsLoading}
                        style={{ padding: '12px 14px', background: form.lat ? 'rgba(13,148,136,0.2)' : '#1a1a1a', border: `1px solid ${form.lat ? '#0d9488' : '#333'}`, borderRadius: 10, color: form.lat ? '#0d9488' : '#666', cursor: 'pointer', fontSize: 18, whiteSpace: 'nowrap' }}>
                        {gpsLoading ? '⏳' : form.lat ? '📍✓' : '📍'}
                      </button>
                    </div>
                    <textarea placeholder="Any message for the owner? (optional)" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3}
                      style={{ padding: '12px 14px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', resize: 'none' }} />
                    <button onClick={submitFound} disabled={!form.finder_name.trim() || submitting}
                      style={{ padding: '14px', background: form.finder_name.trim() ? '#0d9488' : '#1a1a1a', border: 'none', borderRadius: 10, color: '#fff', fontSize: 16, fontWeight: 700, cursor: form.finder_name.trim() ? 'pointer' : 'not-allowed', opacity: submitting ? 0.7 : 1 }}>
                      {submitting ? 'Sending...' : 'Send Report to Owner'}
                    </button>
                    <button onClick={() => setShowFoundForm(false)}
                      style={{ padding: '10px', background: 'transparent', border: 'none', color: '#666', fontSize: 14, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PetPass Branding */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors">
              <span className="text-xl">🐾</span>
              <span className="font-medium">PetPass Malaysia</span>
            </Link>
            <p className="text-gray-500 text-sm mt-2">
              Powered by PetPass
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
