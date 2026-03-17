'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// Types
interface ClinicListItem {
  id: string
  name: string
  area: string
}

const SPECIALITIES = [
  'Surgery', 'Dermatology', 'Oncology', 'Cardiology', 'Dentistry',
  'Ophthalmology', 'Orthopaedics', 'Emergency & Critical Care',
  'Internal Medicine', 'Neurology', 'Radiology', 'Rehabilitation', 'General Practice'
]

const ANIMAL_TYPES = [
  { value: 'small', label: 'Small Animals (Dogs/Cats)', emoji: '🐕🐈' },
  { value: 'large', label: 'Large Animals (Horses/Cattle)', emoji: '🐴' },
  { value: 'exotic', label: 'Exotic Animals (Reptiles/Birds)', emoji: '🦎' },
  { value: 'avian', label: 'Avian', emoji: '🦜' },
  { value: 'aquatic', label: 'Aquatic', emoji: '🐠' },
  { value: 'wildlife', label: 'Wildlife', emoji: '🦌' },
]

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

export default function JoinPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [tab, setTab] = useState<'clinic' | 'vet'>('clinic')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [clinics, setClinics] = useState<ClinicListItem[]>([])
  const [showNewClinic, setShowNewClinic] = useState(false)

  // Clinic Form Data
  const [clinicForm, setClinicForm] = useState({
    name: '',
    ssm_number: '',
    address: '',
    area: '',
    phone: '',
    email: '',
    website: '',
    years_operation: '',
    is_24h: false,
    emergency_line: '',
    operating_hours: {} as Record<string, string>,
  })

  // Vet Form Data  
  const [vetForm, setVetForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    license_number: '',
    license_expiry: '',
    years_practice: '',
    clinic_id: '',
    does_house_calls: false,
    house_call_areas: '',
    is_on_call: false,
    on_call_until: '',
  })

  useEffect(() => {
    async function fetchClinics() {
      const { data } = await supabase
        .from('vet_clinics')
        .select('id, name, area')
        .order('name')
      
      if (data) setClinics(data)
    }
    fetchClinics()
  }, [])

  const handleOperatingHours = (day: number, hours: string) => {
    setClinicForm(prev => ({
      ...prev,
      operating_hours: { ...prev.operating_hours, [day]: hours }
    }))
  }

  const handleClinicSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: clinicError } = await supabase
        .from('vet_clinics')
        .insert({
          name: clinicForm.name,
          ssm_number: clinicForm.ssm_number || null,
          address: clinicForm.address,
          area: clinicForm.area,
          phone: clinicForm.phone,
          email: clinicForm.email,
          website: clinicForm.website || null,
          is_24h: clinicForm.is_24h,
          emergency_line: clinicForm.emergency_line || null,
          operating_hours: Object.keys(clinicForm.operating_hours).length > 0 
            ? clinicForm.operating_hours 
            : null,
        })
        .select('id')
        .single()

      if (clinicError) throw new Error(clinicError.message)

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleVetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!vetForm.clinic_id) {
        throw new Error('Please select a clinic')
      }

      // Parse house call areas
      const houseCallAreas = vetForm.does_house_calls && vetForm.house_call_areas
        ? vetForm.house_call_areas.split(',').map(a => a.trim()).filter(Boolean)
        : []

      // Parse on_call_until
      const onCallUntil = vetForm.is_on_call && vetForm.on_call_until
        ? new Date(vetForm.on_call_until).toISOString()
        : null

      // Create vet record
      const { data: vet, error: vetError } = await supabase
        .from('vets')
        .insert({
          full_name: vetForm.full_name,
          email: vetForm.email,
          phone: vetForm.phone,
          license_number: vetForm.license_number,
          license_expiry: vetForm.license_expiry || null,
          years_in_service: vetForm.years_practice ? parseInt(vetForm.years_practice) : null,
          clinic_id: vetForm.clinic_id,
          does_house_calls: vetForm.does_house_calls,
          house_call_areas: houseCallAreas.length > 0 ? houseCallAreas : null,
          is_on_call: vetForm.is_on_call,
          on_call_until: onCallUntil,
        })
        .select('id')
        .single()

      if (vetError) throw new Error(vetError.message)

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">
            {tab === 'clinic' ? 'Clinic Registered!' : 'Vet Registered!'}
          </h2>
          <p className="text-white/60 mb-6">
            {tab === 'clinic' 
              ? 'Your clinic has been submitted for review.' 
              : 'Your vet profile has been created.'}
          </p>
          <a 
            href="/vets" 
            className="inline-block bg-teal-600 hover:bg-teal-500 text-white px-6 py-2 rounded-full"
          >
            View Vet Directory
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <a href="/vets" className="text-teal-400 hover:text-teal-300 text-sm flex items-center gap-1 mb-4">
            ← Back to Directory
          </a>
          <h1 className="text-2xl font-bold">Join PetPass Malaysia</h1>
          <p className="text-white/60">Register your clinic or join as a vet</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-white/5 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => setTab('clinic')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              tab === 'clinic' 
                ? 'bg-teal-600 text-white' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            🏥 Register Clinic
          </button>
          <button
            type="button"
            onClick={() => setTab('vet')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              tab === 'vet' 
                ? 'bg-teal-600 text-white' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            ⚕️ Register as Vet
          </button>
        </div>

        {error && (
          <div className="bg-red-400/20 border border-red-400/30 text-red-400 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Clinic Registration Form */}
        {tab === 'clinic' && (
          <form onSubmit={handleClinicSubmit} className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">🏥 Clinic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Clinic Name *</label>
                  <input
                    type="text"
                    required
                    value={clinicForm.name}
                    onChange={(e) => setClinicForm({ ...clinicForm, name: e.target.value })}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                    placeholder="Pet Care Clinic"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">SSM Number *</label>
                  <input
                    type="text"
                    required
                    value={clinicForm.ssm_number}
                    onChange={(e) => setClinicForm({ ...clinicForm, ssm_number: e.target.value })}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                    placeholder="202001000001 (SSM/ROC number)"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Years in Operation *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={clinicForm.years_operation}
                    onChange={(e) => setClinicForm({ ...clinicForm, years_operation: e.target.value })}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                    placeholder="e.g. 5"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Area *</label>
                  <input
                    type="text"
                    required
                    value={clinicForm.area}
                    onChange={(e) => setClinicForm({ ...clinicForm, area: e.target.value })}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                    placeholder="Bangsar, Kuala Lumpur"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Full Address *</label>
                  <textarea
                    required
                    value={clinicForm.address}
                    onChange={(e) => setClinicForm({ ...clinicForm, address: e.target.value })}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600 h-20 resize-none"
                    placeholder="No. 123, Jalan Besar, 59100 Kuala Lumpur"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">📞 Contact Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={clinicForm.phone}
                      onChange={(e) => setClinicForm({ ...clinicForm, phone: e.target.value })}
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                      placeholder="+60 3 1234 5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={clinicForm.email}
                      onChange={(e) => setClinicForm({ ...clinicForm, email: e.target.value })}
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                      placeholder="info@clinic.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Website</label>
                  <input
                    type="url"
                    value={clinicForm.website}
                    onChange={(e) => setClinicForm({ ...clinicForm, website: e.target.value })}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                    placeholder="https://www.clinic.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Emergency Line (24/7)</label>
                  <input
                    type="tel"
                    value={clinicForm.emergency_line}
                    onChange={(e) => setClinicForm({ ...clinicForm, emergency_line: e.target.value })}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                    placeholder="+60 12 345 6789"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">🕐 Operating Hours</h2>
              <label className="flex items-center gap-2 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={clinicForm.is_24h}
                  onChange={(e) => setClinicForm({ ...clinicForm, is_24h: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-teal-600"
                />
                <span className="text-sm text-white/70">24-Hour Clinic</span>
              </label>
              
              {!clinicForm.is_24h && (
                <div className="space-y-2">
                  {DAYS.map(day => (
                    <div key={day.value} className="flex items-center gap-2">
                      <span className="text-sm text-white/50 w-24">{day.label}</span>
                      <input
                        type="text"
                        placeholder="9:00 AM - 6:00 PM"
                        value={clinicForm.operating_hours[day.value] || ''}
                        onChange={(e) => handleOperatingHours(day.value, e.target.value)}
                        className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-teal-600"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-teal-600/50 text-white font-semibold py-3 rounded-xl transition"
            >
              {loading ? 'Registering...' : 'Register Clinic'}
            </button>
          </form>
        )}

        {/* Vet Registration Form */}
        {tab === 'vet' && (
          <form onSubmit={handleVetSubmit} className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">👤 Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={vetForm.full_name}
                    onChange={(e) => setVetForm({ ...vetForm, full_name: e.target.value })}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                    placeholder="Dr. John Smith"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={vetForm.phone}
                      onChange={(e) => setVetForm({ ...vetForm, phone: e.target.value })}
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                      placeholder="+60 12 345 6789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={vetForm.email}
                      onChange={(e) => setVetForm({ ...vetForm, email: e.target.value })}
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                      placeholder="john@clinic.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">📜 Professional Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Veterinary License Number *</label>
                  <input
                    type="text"
                    required
                    value={vetForm.license_number}
                    onChange={(e) => setVetForm({ ...vetForm, license_number: e.target.value })}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                    placeholder="VET/2020/001234 (DVS license number)"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Years of Practice *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={vetForm.years_practice}
                      onChange={(e) => setVetForm({ ...vetForm, years_practice: e.target.value })}
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                      placeholder="e.g. 5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-1">License Expiry</label>
                    <input
                      type="date"
                      value={vetForm.license_expiry}
                      onChange={(e) => setVetForm({ ...vetForm, license_expiry: e.target.value })}
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">🏥 Clinic Affiliation *</h2>
              <select
                required
                value={vetForm.clinic_id}
                onChange={(e) => setVetForm({ ...vetForm, clinic_id: e.target.value })}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
              >
                <option value="">-- Select your clinic --</option>
                {clinics.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.area})</option>
                ))}
              </select>
              <p className="text-white/50 text-sm mt-2">
                Don't see your clinic? <a href="/vets/join?tab=clinic" className="text-teal-400 hover:underline">Register it first</a>
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">🏠 House Calls</h2>
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={vetForm.does_house_calls}
                  onChange={(e) => setVetForm({ ...vetForm, does_house_calls: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-teal-600"
                />
                <span className="text-sm text-white/70">I offer house calls</span>
              </label>
              {vetForm.does_house_calls && (
                <div>
                  <label className="block text-sm text-white/70 mb-1">Areas Covered</label>
                  <input
                    type="text"
                    value={vetForm.house_call_areas}
                    onChange={(e) => setVetForm({ ...vetForm, house_call_areas: e.target.value })}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                    placeholder="Bangsar, Mont Kiara, Petaling Jaya (comma-separated)"
                  />
                </div>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">📞 On Call Status</h2>
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={vetForm.is_on_call}
                  onChange={(e) => setVetForm({ ...vetForm, is_on_call: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-teal-600"
                />
                <span className="text-sm text-white/70">I am currently available for on-call</span>
              </label>
              {vetForm.is_on_call && (
                <div>
                  <label className="block text-sm text-white/70 mb-1">Available Until</label>
                  <input
                    type="datetime-local"
                    value={vetForm.on_call_until}
                    onChange={(e) => setVetForm({ ...vetForm, on_call_until: e.target.value })}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-teal-600/50 text-white font-semibold py-3 rounded-xl transition"
            >
              {loading ? 'Registering...' : 'Register as Vet'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
