'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

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

// Constants
const SPECIALITIES = [
  'Surgery', 'Dermatology', 'Oncology', 'Cardiology', 'Dentistry',
  'Ophthalmology', 'Orthopaedics', 'Emergency & Critical Care',
  'Internal Medicine', 'Neurology', 'Radiology', 'Rehabilitation', 'General Practice'
]

const ANIMAL_TYPES = [
  { value: 'small', label: 'Small Animals', emoji: '🐕🐈' },
  { value: 'large', label: 'Large Animals', emoji: '🐴' },
  { value: 'exotic', label: 'Exotic Animals', emoji: '🦎' },
  { value: 'avian', label: 'Avian', emoji: '🦜' },
  { value: 'aquatic', label: 'Aquatic', emoji: '🐠' },
  { value: 'wildlife', label: 'Wildlife', emoji: '🦌' },
]

const ANIMAL_EMOJI: Record<string, string> = {
  small: '🐕',
  large: '🐴',
  exotic: '🦎',
  avian: '🦜',
  aquatic: '🐠',
  wildlife: '🦌',
}

// Helper to check if clinic is open
function isClinicOpen(clinic: VetClinic | undefined): boolean {
  if (!clinic) return false
  if (clinic.is_24h) return true
  
  const now = new Date()
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const today = dayNames[now.getDay()]
  
  const hours = clinic.operating_hours?.[today]
  if (!hours) return false
  
  const [open, close] = hours.split('-')
  if (!open || !close) return false
  
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const [openH, openM] = open.split(':').map(Number)
  const [closeH, closeM] = close.split(':').map(Number)
  const openMinutes = openH * 60 + openM
  const closeMinutes = closeH * 60 + closeM
  
  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function VetsDirectoryPage() {
  const [vets, setVets] = useState<Vet[]>([])
  const [clinics, setClinics] = useState<Map<string, VetClinic>>(new Map())
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [animalFilter, setAnimalFilter] = useState<string>('all')
  const [specialityFilter, setSpecialityFilter] = useState<string>('')
  const [onCallOnly, setOnCallOnly] = useState(false)
  const [houseCallsOnly, setHouseCallsOnly] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      
      // Fetch vets with clinic info
      const { data: vetsData } = await supabase
        .from('vets')
        .select('*')
        .eq('is_active', true)
        .order('is_on_call', { ascending: false })
        .order('does_house_calls', { ascending: false })
        .order('full_name', { ascending: true })
      
      if (vetsData) {
        setVets(vetsData)
        
        // Get unique clinic IDs
        const clinicIds = Array.from(new Set(vetsData.map((v: any) => v.clinic_id).filter(Boolean)))
        
        if (clinicIds.length > 0) {
          const { data: clinicsData } = await supabase
            .from('vet_clinics')
            .select('*')
            .in('id', clinicIds)
          
          if (clinicsData) {
            const clinicMap = new Map<string, VetClinic>()
            clinicsData.forEach(c => clinicMap.set(c.id, c))
            setClinics(clinicMap)
          }
        }
      }
      
      setLoading(false)
    }
    
    fetchData()
  }, [])

  // Calculate stats
  const clinicsOpenNow = Array.from(new Set(
    vets.filter(v => isClinicOpen(v.clinic ? clinics.get(v.clinic_id) : undefined)).map(v => v.clinic_id)
  )).length
  const doctorsOnCall = vets.filter(v => v.is_on_call).length
  const houseCallsAvailable = vets.filter(v => v.does_house_calls).length

  // Filter vets
  const filteredVets = vets.filter(vet => {
    if (animalFilter !== 'all' && !vet.animal_types?.includes(animalFilter)) return false
    if (specialityFilter && !vet.specialities?.includes(specialityFilter)) return false
    if (onCallOnly && !vet.is_on_call) return false
    if (houseCallsOnly && !vet.does_house_calls) return false
    return true
  })

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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Emergency Status Bar */}
      <div className="bg-gradient-to-r from-red-900/20 via-black to-teal-900/20 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🚨</span>
            <h1 className="text-xl font-bold">Emergency Vet Finder</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              clinicsOpenNow > 0 ? 'bg-green-400/20 text-green-400 border border-green-400/30' : 'bg-red-400/20 text-red-400 border border-red-400/30'
            }`}>
              🏥 {clinicsOpenNow} Clinic{clinicsOpenNow !== 1 ? 's' : ''} Open Now
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              doctorsOnCall > 0 ? 'bg-green-400/20 text-green-400 border border-green-400/30' : 'bg-orange-400/20 text-orange-400 border border-orange-400/30'
            }`}>
              👨‍⚕️ {doctorsOnCall} Doctor{doctorsOnCall !== 1 ? 's' : ''} On Call
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              houseCallsAvailable > 0 ? 'bg-blue-400/20 text-blue-400 border border-blue-400/30' : 'bg-white/10 text-white/40 border border-white/10'
            }`}>
              🏠 {houseCallsAvailable} House Call{houseCallsAvailable !== 1 ? 's' : ''} Available
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filter Bar */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Animal Type Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setAnimalFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  animalFilter === 'all' 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                🐾 All
              </button>
              {ANIMAL_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => setAnimalFilter(type.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    animalFilter === type.value
                      ? 'bg-teal-600 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {type.emoji} {type.label}
                </button>
              ))}
            </div>

            {/* Speciality Dropdown */}
            <select
              value={specialityFilter}
              onChange={(e) => setSpecialityFilter(e.target.value)}
              className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/70 focus:outline-none focus:border-teal-600"
            >
              <option value="">All Specialities</option>
              {SPECIALITIES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Toggles */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onCallOnly}
                onChange={(e) => setOnCallOnly(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-teal-600 focus:ring-teal-600"
              />
              <span className="text-sm text-white/70">Available Now</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={houseCallsOnly}
                onChange={(e) => setHouseCallsOnly(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-teal-600 focus:ring-teal-600"
              />
              <span className="text-sm text-white/70">House Calls</span>
            </label>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-white/50 text-sm mb-4">
          {filteredVets.length} vet{filteredVets.length !== 1 ? 's' : ''} found
        </p>

        {/* Vet Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVets.map(vet => {
            const clinic = vet.clinic_id ? clinics.get(vet.clinic_id) : undefined
            const clinicOpen = isClinicOpen(clinic)
            
            return (
              <Link
                key={vet.id}
                href={`/vets/${vet.id}`}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-teal-600/50 transition group block"
              >
                {/* Header */}
                <div className="flex gap-4 mb-4">
                  {/* Photo or Avatar */}
                  <div className="w-14 h-14 rounded-full bg-teal-600/20 flex items-center justify-center text-teal-400 font-bold text-lg shrink-0 overflow-hidden">
                    {vet.photo_url ? (
                      <img src={vet.photo_url} alt={vet.full_name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(vet.full_name)
                    )}
                  </div>
                  
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white group-hover:text-teal-400 transition truncate">
                      {vet.full_name}
                    </h3>
                    <div className="flex items-center gap-1 text-white/50 text-sm">
                      <span>📜</span>
                      <span className="truncate">{vet.license_number}</span>
                    </div>
                    {vet.years_in_service && (
                      <p className="text-white/40 text-xs">{vet.years_in_service} years experience</p>
                    )}
                  </div>
                </div>

                {/* Clinic Info */}
                {clinic && (
                  <div className="mb-3 text-sm">
                    <p className="text-white/70 truncate">🏥 {clinic.name}</p>
                    <p className="text-white/40 text-xs">📍 {clinic.area || 'Kuala Lumpur'}</p>
                  </div>
                )}

                {/* Animal Types */}
                {vet.animal_types && vet.animal_types.length > 0 && (
                  <div className="flex gap-1 mb-3 flex-wrap">
                    {vet.animal_types.map(at => (
                      <span key={at} className="text-lg" title={at}>
                        {ANIMAL_EMOJI[at] || '🐾'}
                      </span>
                    ))}
                  </div>
                )}

                {/* Specialities */}
                {vet.specialities && vet.specialities.length > 0 && (
                  <div className="flex gap-1 mb-3 flex-wrap">
                    {vet.specialities.slice(0, 3).map(s => (
                      <span key={s} className="px-2 py-0.5 bg-teal-600/20 text-teal-400 text-xs rounded-full border border-teal-600/30">
                        {s}
                      </span>
                    ))}
                    {vet.specialities.length > 3 && (
                      <span className="px-2 py-0.5 bg-white/10 text-white/50 text-xs rounded-full">
                        +{vet.specialities.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {vet.is_on_call && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-400/20 text-green-400 text-xs rounded-full border border-green-400/30">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      ON CALL
                    </span>
                  )}
                  {vet.does_house_calls && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-400/20 text-blue-400 text-xs rounded-full border border-blue-400/30">
                      🏠 HOUSE CALLS
                    </span>
                  )}
                  {clinic?.emergency_line && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-400/20 text-red-400 text-xs rounded-full border border-red-400/30">
                      📞 EMERGENCY
                    </span>
                  )}
                </div>

                {/* Clinic Open Status */}
                {clinic && (
                  <div className="text-xs">
                    <span className={`font-medium ${clinicOpen ? 'text-green-400' : 'text-red-400'}`}>
                      {clinic.is_24h ? '🕐 24 Hours' : clinicOpen ? '🟢 OPEN' : '🔴 CLOSED'}
                    </span>
                  </div>
                )}
              </Link>
            )
          })}
        </div>

        {filteredVets.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-white/50 text-lg">No vets found matching your criteria</p>
            <button
              onClick={() => {
                setAnimalFilter('all')
                setSpecialityFilter('')
                setOnCallOnly(false)
                setHouseCallsOnly(false)
              }}
              className="mt-4 text-teal-400 hover:text-teal-300"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Register CTA */}
        <div className="mt-12 bg-gradient-to-r from-teal-900/20 to-black border border-white/10 rounded-2xl p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Are you a Vet?</h2>
          <p className="text-white/60 mb-4">Register your clinic and start helping pet owners find you</p>
          <Link
            href="/vets/register"
            className="inline-block bg-teal-600 hover:bg-teal-500 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            Register as a Vet
          </Link>
        </div>
      </div>
    </div>
  )
}
