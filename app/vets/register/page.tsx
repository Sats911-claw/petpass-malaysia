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

export default function VetRegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clinics, setClinics] = useState<ClinicListItem[]>([])
  const [showNewClinic, setShowNewClinic] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    // Personal
    full_name: '',
    email: '',
    phone: '',
    photo_url: '',
    // Professional
    license_number: '',
    license_expiry: '',
    years_in_service: '',
    bio: '',
    // Specialities & Animals
    specialities: [] as string[],
    animal_types: [] as string[],
    // Clinic
    clinic_id: '',
    // House calls
    does_house_calls: false,
    house_call_areas: '',
    // On call
    is_on_call: false,
    on_call_until: '',
  })
  
  const [clinicData, setClinicData] = useState({
    name: '',
    address: '',
    area: '',
    phone: '',
    email: '',
    website: '',
    is_24h: false,
    emergency_line: '',
    operating_hours: {} as Record<string, string>,
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

  const handleSpecialityToggle = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specialities: prev.specialities.includes(spec)
        ? prev.specialities.filter(s => s !== spec)
        : [...prev.specialities, spec]
    }))
  }

  const handleAnimalTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      animal_types: prev.animal_types.includes(type)
        ? prev.animal_types.filter(a => a !== type)
        : [...prev.animal_types, type]
    }))
  }

  const handleOperatingHours = (day: number, hours: string) => {
    setClinicData(prev => ({
      ...prev,
      operating_hours: { ...prev.operating_hours, [day]: hours }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let clinicId = formData.clinic_id

      // Create new clinic if needed
      if (showNewClinic && clinicData.name) {
        const { data: newClinic, error: clinicError } = await supabase
          .from('vet_clinics')
          .insert({
            name: clinicData.name,
            address: clinicData.address,
            area: clinicData.area,
            phone: clinicData.phone,
            email: clinicData.email,
            website: clinicData.website,
            is_24h: clinicData.is_24h,
            emergency_line: clinicData.emergency_line,
            operating_hours: Object.keys(clinicData.operating_hours).length > 0 
              ? clinicData.operating_hours 
              : null,
          })
          .select('id')
          .single()

        if (clinicError) throw new Error(clinicError.message)
        clinicId = newClinic.id
      }

      if (!clinicId) {
        throw new Error('Please select or create a clinic')
      }

      // Parse house call areas
      const houseCallAreas = formData.does_house_calls && formData.house_call_areas
        ? formData.house_call_areas.split(',').map(a => a.trim()).filter(Boolean)
        : []

      // Parse on_call_until
      const onCallUntil = formData.is_on_call && formData.on_call_until
        ? new Date(formData.on_call_until).toISOString()
        : null

      // Create vet record
      const { data: vet, error: vetError } = await supabase
        .from('vets')
        .insert({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          photo_url: formData.photo_url || null,
          license_number: formData.license_number,
          license_expiry: formData.license_expiry || null,
          years_in_service: formData.years_in_service ? parseInt(formData.years_in_service) : null,
          bio: formData.bio || null,
          specialities: formData.specialities,
          animal_types: formData.animal_types,
          clinic_id: clinicId,
          does_house_calls: formData.does_house_calls,
          house_call_areas: houseCallAreas.length > 0 ? houseCallAreas : null,
          is_on_call: formData.is_on_call,
          on_call_until: onCallUntil,
        })
        .select('id')
        .single()

      if (vetError) throw new Error(vetError.message)

      // Redirect to profile
      router.push(`/vets/${vet.id}`)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <a href="/vets" className="text-teal-400 hover:text-teal-300 text-sm flex items-center gap-1 mb-4">
            ← Back to Directory
          </a>
          <h1 className="text-2xl font-bold">Register as a Vet</h1>
          <p className="text-white/60">Join PetPass Malaysia's vet network</p>
        </div>

        {error && (
          <div className="bg-red-400/20 border border-red-400/30 text-red-400 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              👤 Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                  placeholder="Dr. John Smith"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                  placeholder="+60 12 345 6789"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Photo URL</label>
                <input
                  type="url"
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Professional Info Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              📜 Professional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">License Number *</label>
                <input
                  type="text"
                  required
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                  placeholder="VET/2020/001234"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">License Expiry</label>
                <input
                  type="date"
                  value={formData.license_expiry}
                  onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Years in Service</label>
                <input
                  type="number"
                  min="0"
                  value={formData.years_in_service}
                  onChange={(e) => setFormData({ ...formData, years_in_service: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                  placeholder="5"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm text-white/70 mb-1">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600 h-24 resize-none"
                placeholder="Tell pet owners about your experience and approach..."
              />
            </div>
          </div>

          {/* Specialities Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">⚕️ Specialities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SPECIALITIES.map(spec => (
                <label
                  key={spec}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${
                    formData.specialities.includes(spec)
                      ? 'bg-teal-600/20 border-teal-600/50 text-teal-400'
                      : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.specialities.includes(spec)}
                    onChange={() => handleSpecialityToggle(spec)}
                    className="hidden"
                  />
                  <span className="text-sm">{spec}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Animal Types Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">🐾 Animal Types Treated</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {ANIMAL_TYPES.map(type => (
                <label
                  key={type.value}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${
                    formData.animal_types.includes(type.value)
                      ? 'bg-teal-600/20 border-teal-600/50 text-teal-400'
                      : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.animal_types.includes(type.value)}
                    onChange={() => handleAnimalTypeToggle(type.value)}
                    className="hidden"
                  />
                  <span className="text-lg">{type.emoji}</span>
                  <span className="text-sm">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Clinic Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">🏥 Clinic</h2>
            
            {!showNewClinic ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm text-white/70 mb-1">Select Existing Clinic</label>
                  <select
                    value={formData.clinic_id}
                    onChange={(e) => setFormData({ ...formData, clinic_id: e.target.value })}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                  >
                    <option value="">-- Select a clinic --</option>
                    {clinics.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.area})</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewClinic(true)}
                  className="text-teal-400 hover:text-teal-300 text-sm"
                >
                  + Add new clinic
                </button>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Clinic Name *</label>
                    <input
                      type="text"
                      required
                      value={clinicData.name}
                      onChange={(e) => setClinicData({ ...clinicData, name: e.target.value })}
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                      placeholder="Pet Care Clinic"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Area</label>
                    <input
                      type="text"
                      value={clinicData.area}
                      onChange={(e) => setClinicData({ ...clinicData, area: e.target.value })}
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                      placeholder="Bangsar, KL"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-white/70 mb-1">Address</label>
                    <input
                      type="text"
                      value={clinicData.address}
                      onChange={(e) => setClinicData({ ...clinicData, address: e.target.value })}
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                      placeholder="123 Main Street, Kuala Lumpur"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={clinicData.phone}
                      onChange={(e) => setClinicData({ ...clinicData, phone: e.target.value })}
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Email</label>
                    <input
                      type="email"
                      value={clinicData.email}
                      onChange={(e) => setClinicData({ ...clinicData, email: e.target.value })}
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Website</label>
                    <input
                      type="url"
                      value={clinicData.website}
                      onChange={(e) => setClinicData({ ...clinicData, website: e.target.value })}
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Emergency Line</label>
                    <input
                      type="tel"
                      value={clinicData.emergency_line}
                      onChange={(e) => setClinicData({ ...clinicData, emergency_line: e.target.value })}
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                      placeholder="+60 12 345 6789"
                    />
                  </div>
                </div>

                {/* 24h Toggle */}
                <div className="mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={clinicData.is_24h}
                      onChange={(e) => setClinicData({ ...clinicData, is_24h: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20 bg-white/10 text-teal-600 focus:ring-teal-600"
                    />
                    <span className="text-sm text-white/70">24-Hour Clinic</span>
                  </label>
                </div>

                {/* Operating Hours */}
                {!clinicData.is_24h && (
                  <div className="mt-4">
                    <label className="block text-sm text-white/70 mb-2">Operating Hours</label>
                    <div className="space-y-2">
                      {DAYS.map(day => (
                        <div key={day.value} className="flex items-center gap-2">
                          <span className="text-sm text-white/50 w-24">{day.label}</span>
                          <input
                            type="text"
                            placeholder="9:00-18:00"
                            value={clinicData.operating_hours[day.value] || ''}
                            onChange={(e) => handleOperatingHours(day.value, e.target.value)}
                            className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-teal-600"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowNewClinic(false)
                    setFormData({ ...formData, clinic_id: '' })
                  }}
                  className="mt-4 text-white/50 hover:text-white/70 text-sm"
                >
                  ← Select existing clinic instead
                </button>
              </>
            )}
          </div>

          {/* House Calls Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">🏠 House Calls</h2>
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={formData.does_house_calls}
                onChange={(e) => setFormData({ ...formData, does_house_calls: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-teal-600 focus:ring-teal-600"
              />
              <span className="text-sm text-white/70">I offer house calls</span>
            </label>
            {formData.does_house_calls && (
              <div>
                <label className="block text-sm text-white/70 mb-1">Areas Covered</label>
                <input
                  type="text"
                  value={formData.house_call_areas}
                  onChange={(e) => setFormData({ ...formData, house_call_areas: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                  placeholder="Bangsar, Mont Kiara, Petaling Jaya (comma-separated)"
                />
              </div>
            )}
          </div>

          {/* On Call Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">📞 On Call Status</h2>
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={formData.is_on_call}
                onChange={(e) => setFormData({ ...formData, is_on_call: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-teal-600 focus:ring-teal-600"
              />
              <span className="text-sm text-white/70">I am currently on call</span>
            </label>
            {formData.is_on_call && (
              <div>
                <label className="block text-sm text-white/70 mb-1">On Call Until</label>
                <input
                  type="datetime-local"
                  value={formData.on_call_until}
                  onChange={(e) => setFormData({ ...formData, on_call_until: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-600"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-teal-600/50 text-white font-semibold py-3 rounded-xl transition"
          >
            {loading ? 'Registering...' : 'Register as a Vet'}
          </button>
        </form>
      </div>
    </div>
  )
}
