'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'

// Types
interface VetClinic {
  id: string
  name: string
  address: string
  area: string
  phone: string
  email: string
  website: string
  photo_url: string
  operating_hours: Record<string, string> | null
  is_24h: boolean
  emergency_line: string
}

interface Vet {
  id: string
  clinic_id: string
  full_name: string
  photo_url: string
  license_number: string
  license_expiry: string
  years_in_service: number
  bio: string
  specialities: string[]
  animal_types: string[]
  does_house_calls: boolean
  house_call_areas: string[]
  is_on_call: boolean
  on_call_until: string
  is_active: boolean
  phone: string
  email: string
  clinic?: VetClinic
}

interface VetAvailability {
  id: string
  vet_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_on_call: boolean
}

const ANIMAL_EMOJI: Record<string, string> = {
  small: '🐕',
  large: '🐴',
  exotic: '🦎',
  avian: '🦜',
  aquatic: '🐠',
  wildlife: '🦌',
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Helper to check if clinic is open
function isClinicOpen(clinic: VetClinic | null | undefined): { open: boolean; status: string } {
  if (!clinic) return { open: false, status: 'Unknown' }
  if (clinic.is_24h) return { open: true, status: 'Open 24 Hours' }
  
  const now = new Date()
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const today = dayNames[now.getDay()]
  
  const hours = clinic.operating_hours?.[today]
  if (!hours) return { open: false, status: 'Closed' }
  
  const [open, close] = hours.split('-')
  if (!open || !close) return { open: false, status: 'Closed' }
  
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const [openH, openM] = open.split(':').map(Number)
  const [closeH, closeM] = close.split(':').map(Number)
  const openMinutes = openH * 60 + openM
  const closeMinutes = closeH * 60 + closeM
  
  const isOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes
  return { open: isOpen, status: isOpen ? 'Open Now' : 'Closed' }
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function VetProfilePage() {
  const params = useParams()
  const supabase = createClient()
  
  const [vet, setVet] = useState<Vet | null>(null)
  const [clinic, setClinic] = useState<VetClinic | null>(null)
  const [availability, setAvailability] = useState<VetAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      const vetId = params.id

      // Fetch vet
      const { data: vetData, error: vetError } = await supabase
        .from('vets')
        .select('*')
        .eq('id', vetId)
        .single()

      if (vetError || !vetData) {
        setError('Vet not found')
        setLoading(false)
        return
      }

      setVet(vetData)

      // Fetch clinic
      if (vetData.clinic_id) {
        const { data: clinicData } = await supabase
          .from('vet_clinics')
          .select('*')
          .eq('id', vetData.clinic_id)
          .single()

        if (clinicData) {
          setClinic(clinicData)
        }
      }

      // Fetch availability
      const { data: availData } = await supabase
        .from('vet_availability')
        .select('*')
        .eq('vet_id', vetId)
        .order('day_of_week')

      if (availData) {
        setAvailability(availData)
      }

      setLoading(false)
    }

    fetchData()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !vet) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-white/60 text-lg mb-4">{error || 'Vet not found'}</p>
          <a href="/vets" className="text-teal-400 hover:text-teal-300">
            ← Back to Directory
          </a>
        </div>
      </div>
    )
  }

  const clinicStatus = isClinicOpen(clinic)
  const whatsappNumber = vet.phone?.replace(/[^0-9]/g, '')

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <a href="/vets" className="text-teal-400 hover:text-teal-300 text-sm flex items-center gap-1 mb-6">
          ← Back to Directory
        </a>

        {/* Hero Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Photo */}
            <div className="w-24 h-24 rounded-full bg-teal-600/20 flex items-center justify-center text-teal-400 font-bold text-3xl shrink-0 overflow-hidden mx-auto md:mx-0">
              {vet.photo_url ? (
                <img src={vet.photo_url} alt={vet.full_name} className="w-full h-full object-cover" />
              ) : (
                getInitials(vet.full_name)
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h1 className="text-2xl font-bold">{vet.full_name}</h1>
                <span className="text-green-400 text-lg" title="Verified">✓</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-white/60 mb-2">
                <span>📜</span>
                <span>{vet.license_number}</span>
              </div>
              {vet.years_in_service && (
                <p className="text-white/50 text-sm">{vet.years_in_service} years in service</p>
              )}

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                {vet.is_on_call && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-400/20 text-green-400 text-sm rounded-full border border-green-400/30">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    ON CALL
                  </span>
                )}
                {vet.does_house_calls && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-400/20 text-blue-400 text-sm rounded-full border border-blue-400/30">
                    🏠 House Calls
                  </span>
                )}
                {clinic?.is_24h && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-400/20 text-red-400 text-sm rounded-full border border-red-400/30">
                    🕐 24 Hours
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {vet.bio && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">About</h2>
            <p className="text-white/70 whitespace-pre-wrap">{vet.bio}</p>
          </div>
        )}

        {/* Clinic Info */}
        {clinic && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">🏥 Clinic</h2>
              <span className={`text-sm font-medium ${clinicStatus.open ? 'text-green-400' : 'text-red-400'}`}>
                {clinicStatus.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">{clinic.name}</p>
                {clinic.area && <p className="text-white/50 text-sm">📍 {clinic.area}</p>}
                {clinic.address && <p className="text-white/50 text-sm">{clinic.address}</p>}
              </div>
              
              <div className="space-y-2">
                {clinic.phone && (
                  <a href={`tel:${clinic.phone}`} className="flex items-center gap-2 text-teal-400 hover:text-teal-300">
                    <span>📞</span> {clinic.phone}
                  </a>
                )}
                {clinic.emergency_line && (
                  <a href={`tel:${clinic.emergency_line}`} className="flex items-center gap-2 text-red-400 hover:text-red-300">
                    <span>🚨</span> Emergency: {clinic.emergency_line}
                  </a>
                )}
                {clinic.website && (
                  <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-teal-400 hover:text-teal-300">
                    <span>🌐</span> Website
                  </a>
                )}
                {clinic.address && (
                  <a 
                    href={`https://www.google.com/maps/search/${encodeURIComponent(clinic.address + ' ' + (clinic.area || ''))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-teal-400 hover:text-teal-300"
                  >
                    <span>🗺</span> Get Directions
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Specialities */}
        {vet.specialities && vet.specialities.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">⚕️ Specialities</h2>
            <div className="flex flex-wrap gap-2">
              {vet.specialities.map(s => (
                <span key={s} className="px-3 py-1.5 bg-teal-600/20 text-teal-400 text-sm rounded-full border border-teal-600/30">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Animal Types */}
        {vet.animal_types && vet.animal_types.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">🐾 Animal Types Treated</h2>
            <div className="flex flex-wrap gap-3">
              {vet.animal_types.map(at => (
                <span key={at} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white/80 text-sm rounded-full">
                  <span className="text-xl">{ANIMAL_EMOJI[at] || '🐾'}</span>
                  <span className="capitalize">{at}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* House Call Info */}
        {vet.does_house_calls && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">🏠 House Calls Available</h2>
            <p className="text-white/70">This vet offers house call services.</p>
            {vet.house_call_areas && vet.house_call_areas.length > 0 && (
              <div className="mt-2">
                <p className="text-white/50 text-sm">Areas covered:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {vet.house_call_areas.map(area => (
                    <span key={area} className="px-2 py-1 bg-blue-400/20 text-blue-400 text-xs rounded-full">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Availability Schedule */}
        {availability.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">📅 Schedule</h2>
            <div className="space-y-2">
              {availability.map(avail => (
                <div key={avail.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                  <span className="text-white/70">{DAYS[avail.day_of_week]}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white/90">
                      {avail.start_time?.slice(0, 5) || '--:--'} - {avail.end_time?.slice(0, 5) || '--:--'}
                    </span>
                    {avail.is_on_call && (
                      <span className="px-2 py-0.5 bg-green-400/20 text-green-400 text-xs rounded-full">On Call</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">📞 Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {vet.phone && (
              <a
                href={`tel:${vet.phone}`}
                className="flex items-center justify-center gap-2 bg-teal-600/20 border border-teal-600/30 text-teal-400 py-3 rounded-xl hover:bg-teal-600/30 transition"
              >
                <span>📞</span>
                <span>Call</span>
              </a>
            )}
            {vet.email && (
              <a
                href={`mailto:${vet.email}`}
                className="flex items-center justify-center gap-2 bg-white/10 border border-white/10 text-white/70 py-3 rounded-xl hover:bg-white/20 transition"
              >
                <span>✉️</span>
                <span>Email</span>
              </a>
            )}
            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500/20 border border-green-500/30 text-green-400 py-3 rounded-xl hover:bg-green-500/30 transition"
              >
                <span>💬</span>
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* On Call Until */}
        {vet.is_on_call && vet.on_call_until && (
          <div className="bg-green-400/10 border border-green-400/30 rounded-2xl p-4 text-center">
            <p className="text-green-400 text-sm">
              On call until {new Date(vet.on_call_until).toLocaleString('en-MY', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
