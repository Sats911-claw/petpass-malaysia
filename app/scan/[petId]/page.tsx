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

export default function ScanPage() {
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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
