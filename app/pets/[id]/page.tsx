'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import QRCode from 'qrcode'

interface Pet {
  id: string
  name: string
  species: string
  breed: string
  dob: string
  weight_kg: number
  colour: string
  microchip: string
  photo_url: string
  is_lost: boolean
  show_contact_public: boolean
  owner_phone: string
  owner_email: string
  owner_id: string
  license_number: string
  license_expiry: string
  license_authority: string
}

interface Vaccination {
  id: string
  vaccine_name: string
  date_given: string
  next_due: string
  vet_name: string
  clinic: string
  notes: string
}

export default function PetProfilePage() {
  const [pet, setPet] = useState<Pet | null>(null)
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([])
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [updating, setUpdating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        fetchPet(params.id as string, user.id)
      } else {
        // Allow public viewing for QR scan
        fetchPet(params.id as string, null)
      }
    }
    getUser()
  }, [params.id])

  const fetchPet = async (petId: string, userId: string | null) => {
    try {
      const { data: petData, error: petError } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single()

      if (petError) throw petError
      setPet(petData)

      // Generate QR code
      const scanUrl = `${window.location.origin}/scan/${petId}`
      const qrDataUrl = await QRCode.toDataURL(scanUrl, {
        width: 250,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
      setQrCodeUrl(qrDataUrl)

      // Fetch vaccinations (only for owner)
      if (userId && petData?.owner_id === userId) {
        const { data: vaccData } = await supabase
          .from('vaccinations')
          .select('*')
          .eq('pet_id', petId)
          .order('date_given', { ascending: false })
        setVaccinations(vaccData || [])
      }
    } catch (err) {
      console.error('Error fetching pet:', err)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const toggleLostStatus = async () => {
    if (!pet) return
    setUpdating(true)
    
    try {
      const { error } = await supabase
        .from('pets')
        .update({ is_lost: !pet.is_lost })
        .eq('id', pet.id)

      if (error) throw error
      setPet({ ...pet, is_lost: !pet.is_lost })
    } catch (err) {
      console.error('Error updating lost status:', err)
    } finally {
      setUpdating(false)
    }
  }

  const deletePet = async () => {
    if (!pet) return
    
    try {
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', pet.id)

      if (error) throw error
      router.push('/dashboard')
    } catch (err) {
      console.error('Error deleting pet:', err)
    }
  }

  const downloadQR = () => {
    if (!qrCodeUrl) return
    const link = document.createElement('a')
    link.download = `${pet?.name}-qrcode.png`
    link.href = qrCodeUrl
    link.click()
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

  const isOwner = user && pet?.owner_id === user.id

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">Pet not found</p>
      </div>
    )
  }

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
            <h1 className="text-xl font-bold text-white">{pet.name}</h1>
            {isOwner ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-400 text-sm hover:text-red-300"
              >
                Delete
              </button>
            ) : (
              <div className="w-16"></div>
            )}
          </div>
        </div>
      </header>

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Pet Photo & Lost Banner */}
          <div className="relative">
            {pet.is_lost && (
              <div className="absolute top-4 left-4 z-10 bg-red-600 text-white font-bold px-4 py-2 rounded-full animate-pulse">
                🚨 THIS PET IS LOST
              </div>
            )}
            <div className="aspect-video max-h-80 bg-white/10 rounded-2xl overflow-hidden">
              {pet.photo_url ? (
                <img
                  src={pet.photo_url}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">
                  {getSpeciesEmoji(pet.species)}
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Pet Info */}
            <div className="space-y-6">
              {/* Basic Info Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Pet Information</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name</span>
                    <span className="text-white font-medium">{pet.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Species</span>
                    <span className="text-white capitalize">{pet.species}</span>
                  </div>
                  {pet.breed && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Breed</span>
                      <span className="text-white">{pet.breed}</span>
                    </div>
                  )}
                  {pet.dob && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date of Birth</span>
                      <span className="text-white">{formatDate(pet.dob)}</span>
                    </div>
                  )}
                  {pet.weight_kg && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Weight</span>
                      <span className="text-white">{pet.weight_kg} kg</span>
                    </div>
                  )}
                  {pet.colour && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Colour</span>
                      <span className="text-white">{pet.colour}</span>
                    </div>
                  )}
                  {pet.microchip && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Microchip</span>
                      <span className="text-white font-mono text-sm">{pet.microchip}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* License Card */}
              {pet.license_number && (() => {
                const today = new Date()
                const expiry = pet.license_expiry ? new Date(pet.license_expiry) : null
                const daysLeft = expiry ? Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null
                const isExpired = daysLeft !== null && daysLeft < 0
                const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 30
                const statusColor = isExpired ? '#ef4444' : isExpiringSoon ? '#f59e0b' : '#0d9488'
                const statusLabel = isExpired ? '⚠️ EXPIRED' : isExpiringSoon ? `⏳ Expires in ${daysLeft}d` : '✅ Valid'
                return (
                  <div className="bg-white/5 border rounded-2xl p-6" style={{ borderColor: statusColor + '44' }}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-white">🪪 Municipal License</h2>
                      <span style={{ background: statusColor + '22', color: statusColor, fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 6 }}>
                        {statusLabel}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">License No.</span>
                        <span className="text-white font-mono text-sm">{pet.license_number}</span>
                      </div>
                      {pet.license_authority && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Issued by</span>
                          <span className="text-white">{pet.license_authority}</span>
                        </div>
                      )}
                      {expiry && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Expires</span>
                          <span style={{ color: statusColor }}>{expiry.toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                      )}
                    </div>
                    {(isExpired || isExpiringSoon) && (
                      <div style={{ marginTop: 12, padding: '10px 14px', background: statusColor + '15', borderRadius: 8, fontSize: 13, color: statusColor }}>
                        {isExpired ? '⚠️ This license has expired. Renew with your local council to avoid fines.' : `⏳ License expires in ${daysLeft} days. Renew soon to avoid fines.`}
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Owner Actions (only for owner) */}
              {isOwner && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-white">Owner Actions</h2>

                  <a
                    href={`/pets/${pet.id}/passport`}
                    target="_blank"
                    className="w-full py-3 px-4 rounded-xl font-medium transition-all bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-2"
                  >
                    🖨️ Export Pet Passport (PDF)
                  </a>
                  
                  <button
                    onClick={toggleLostStatus}
                    disabled={updating}
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                      pet.is_lost 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {pet.is_lost ? 'Mark as Found' : 'Mark as Lost'}
                  </button>

                  <Link
                    href={`/pets/${pet.id}/vaccinations/new`}
                    className="block w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white text-center rounded-xl font-medium transition-all"
                  >
                    Add Vaccination Record
                  </Link>
                </div>
              )}
            </div>

            {/* QR Code & Vaccinations */}
            <div className="space-y-6">
              {/* QR Code Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">PetPass QR Code</h2>
                <div ref={qrRef} className="flex justify-center mb-4">
                  {qrCodeUrl && (
                    <img src={qrCodeUrl} alt="QR Code" className="rounded-lg" />
                  )}
                </div>
                <p className="text-gray-400 text-sm text-center mb-4">
                  Scan this code to view pet info
                </p>
                {isOwner && (
                  <button
                    onClick={downloadQR}
                    className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all text-sm"
                  >
                    Download QR Code
                  </button>
                )}
              </div>

              {/* Vaccinations */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Vaccination Records</h2>
                {vaccinations.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">
                    {isOwner ? 'No vaccination records yet' : 'No public vaccination records'}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {vaccinations.map((vacc) => (
                      <div key={vacc.id} className="border-b border-white/10 pb-4 last:border-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-white font-medium">{vacc.vaccine_name}</h3>
                          <span className="text-xs text-gray-500">
                            {vacc.next_due && new Date(vacc.next_due) < new Date() ? '⚠️ Due' : ''}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">
                          Given: {formatDate(vacc.date_given)}
                        </p>
                        {vacc.next_due && (
                          <p className="text-gray-400 text-sm">
                            Next due: {formatDate(vacc.next_due)}
                          </p>
                        )}
                        {(vacc.vet_name || vacc.clinic) && (
                          <p className="text-gray-500 text-xs mt-1">
                            {vacc.vet_name && `Dr. ${vacc.vet_name}`}
                            {vacc.clinic && ` @ ${vacc.clinic}`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Delete Pet?</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete {pet.name}&apos;s profile? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={deletePet}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
