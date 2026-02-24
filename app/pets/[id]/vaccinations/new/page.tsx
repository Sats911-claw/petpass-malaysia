'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

interface FormData {
  vaccine_name: string
  date_given: string
  next_due: string
  vet_name: string
  clinic: string
  notes: string
}

export default function NewVaccinationPage() {
  const [formData, setFormData] = useState<FormData>({
    vaccine_name: '',
    date_given: '',
    next_due: '',
    vet_name: '',
    clinic: '',
    notes: '',
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

      const { error: insertError } = await supabase
        .from('vaccinations')
        .insert({
          pet_id: pet.id,
          vaccine_name: formData.vaccine_name,
          date_given: formData.date_given,
          next_due: formData.next_due || null,
          vet_name: formData.vet_name,
          clinic: formData.clinic,
          notes: formData.notes,
        })

      if (insertError) {
        console.error('Insert error:', insertError)
        setError('Failed to add vaccination record. Please try again.')
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

  const commonVaccines = [
    'DHPP (Distemper, Hepatitis, Parvo, Parainfluenza)',
    'Rabies',
    'Bordetella (Kennel Cough)',
    'Leptospirosis',
    'Lyme Disease',
    'FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)',
    'FeLV (Feline Leukemia)',
    'FCV (Feline Calicivirus)',
    'Other',
  ]

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
            <h1 className="text-xl font-bold text-white">Add Vaccination</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {pet && (
            <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-gray-400 text-sm">Adding vaccination for</p>
              <p className="text-white font-semibold text-lg">{pet.name}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Vaccination Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Vaccine Name *</label>
                  <select
                    name="vaccine_name"
                    value={formData.vaccine_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                  >
                    <option value="">Select vaccine</option>
                    {commonVaccines.map((vaccine) => (
                      <option key={vaccine} value={vaccine}>
                        {vaccine}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Date Given *</label>
                    <input
                      type="date"
                      name="date_given"
                      value={formData.date_given}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    />
                  </div>

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
                </div>
              </div>
            </div>

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
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800 text-white font-semibold py-4 px-6 rounded-xl transition-all"
            >
              {loading ? 'Saving...' : 'Add Vaccination Record'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
