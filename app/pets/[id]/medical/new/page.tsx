'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

interface FormData {
  record_type: string
  title: string
  date: string
  vet_name: string
  clinic: string
  notes: string
  medication_name: string
  dosage: string
  frequency: string
  next_due: string
}

export default function NewHealthRecordPage() {
  const [formData, setFormData] = useState<FormData>({
    record_type: 'checkup',
    title: '',
    date: new Date().toISOString().split('T')[0],
    vet_name: '',
    clinic: '',
    notes: '',
    medication_name: '',
    dosage: '',
    frequency: '',
    next_due: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pet, setPet] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      fetchPet(params.id as string, user.id)
    }
    getUser()
  }, [params.id])

  const fetchPet = async (petId: string, userId: string) => {
    try {
      const { data: petData, error: petError } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .eq('owner_id', userId)
        .single()

      if (petError || !petData) {
        router.push('/dashboard')
        return
      }
      setPet(petData)
    } catch (err) {
      console.error('Error fetching pet:', err)
      router.push('/dashboard')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!user || !pet) {
        router.push('/login')
        return
      }

      const recordData = {
        pet_id: pet.id,
        pet_uid: pet.pet_uid,
        record_type: formData.record_type,
        title: formData.title,
        performed_at: formData.date,
        vet_name: formData.vet_name || null,
        clinic_name: formData.clinic || null,
        notes: formData.notes || null,
        medication_name: ['medication'].includes(formData.record_type) ? formData.medication_name || null : null,
        dosage: ['medication'].includes(formData.record_type) ? formData.dosage || null : null,
        frequency: ['medication'].includes(formData.record_type) ? formData.frequency || null : null,
        next_followup: ['vaccination'].includes(formData.record_type) ? formData.next_due || null : null,
      }

      const { error: insertError } = await supabase
        .from('pet_medical_records')
        .insert(recordData)

      if (insertError) {
        console.error('Insert error:', insertError)
        setError('Failed to add health record. Please try again.')
        return
      }

      router.push(`/pets/${pet.id}`)
    } catch (err) {
      console.error('Error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const showMedicationFields = formData.record_type === 'medication'
  const showVaccinationFields = formData.record_type === 'vaccination'

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <span>←</span>
              <span>Back</span>
            </button>
            <h1 className="text-xl font-bold text-white">Add Health Record</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {pet && (
            <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-gray-400 text-sm">Adding health record for</p>
              <p className="text-white font-semibold text-lg">{pet.name}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Record Type */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Record Type</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { value: 'checkup', label: '🩺 Checkup', color: 'green' },
                  { value: 'vaccination', label: '💉 Vaccination', color: 'teal' },
                  { value: 'medication', label: '💊 Medication', color: 'blue' },
                  { value: 'procedure', label: '🔪 Procedure/Surgery', color: 'orange' },
                  { value: 'other', label: '📋 Other', color: 'gray' },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, record_type: type.value }))}
                    className={`py-3 px-4 rounded-xl font-medium transition-all ${
                      formData.record_type === type.value
                        ? type.color === 'teal' ? 'bg-teal-600 text-white'
                          : type.color === 'blue' ? 'bg-blue-600 text-white'
                          : type.color === 'orange' ? 'bg-orange-600 text-white'
                          : type.color === 'green' ? 'bg-green-600 text-white'
                          : 'bg-gray-600 text-white'
                        : 'bg-white/10 text-gray-400 hover:text-white hover:bg-white/20'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Details */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    placeholder={formData.record_type === 'checkup' ? 'e.g., Annual Checkup' : formData.record_type === 'vaccination' ? 'e.g., Rabies Vaccine' : formData.record_type === 'medication' ? 'e.g., Antibiotic Course' : formData.record_type === 'procedure' ? 'e.g., Dental Cleaning' : 'e.g., Health Certificate'}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    />
                  </div>

                  {showVaccinationFields && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Next Due Date</label>
                      <input
                        type="date"
                        name="next_due"
                        value={formData.next_due}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Medication Fields (conditional) */}
            {showMedicationFields && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">💊 Medication Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Medication Name</label>
                    <input
                      type="text"
                      name="medication_name"
                      value={formData.medication_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                      placeholder="e.g., Amoxicillin"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Dosage</label>
                      <input
                        type="text"
                        name="dosage"
                        value={formData.dosage}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                        placeholder="e.g., 50mg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Frequency</label>
                      <input
                        type="text"
                        name="frequency"
                        value={formData.frequency}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                        placeholder="e.g., Twice daily"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Veterinarian Information */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Veterinarian Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Veterinarian Name</label>
                  <input
                    type="text"
                    name="vet_name"
                    value={formData.vet_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    placeholder="e.g., Dr. Ahmad"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Clinic</label>
                  <input
                    type="text"
                    name="clinic"
                    value={formData.clinic}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    placeholder="e.g., PetCare Veterinary Clinic"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all resize-none"
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800 text-white font-semibold py-4 px-6 rounded-xl transition-all"
            >
              {loading ? 'Saving...' : 'Add Health Record'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
