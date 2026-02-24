'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Pet {
  id: string
  name: string
  species: string
  breed: string
  photo_url: string
  is_lost: boolean
}

export default function DashboardPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      fetchPets(user.id)
    }
    getUser()
  }, [router, supabase])

  const fetchPets = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPets(data || [])
    } catch (err) {
      console.error('Error fetching pets:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🐾</span>
              <span className="text-xl font-bold text-white">PetPass Malaysia</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 hidden sm:block">
                {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">My Pets</h1>
              <p className="text-gray-400 mt-1">Manage your furry family members</p>
            </div>
            <Link
              href="/pets/new"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
            >
              <span>+</span> Add New Pet
            </Link>
          </div>

          {/* Pets Grid */}
          {pets.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-6xl mb-4">🐾</div>
              <h2 className="text-xl font-semibold text-white mb-2">No pets yet</h2>
              <p className="text-gray-400 mb-6">Add your first pet to get started</p>
              <Link
                href="/pets/new"
                className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
              >
                Add Your First Pet
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet) => (
                <Link
                  key={pet.id}
                  href={`/pets/${pet.id}`}
                  className="block group"
                >
                  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-teal-500/50 transition-all">
                    {/* Pet Photo */}
                    <div className="aspect-square bg-white/10 relative">
                      {pet.photo_url ? (
                        <img
                          src={pet.photo_url}
                          alt={pet.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          {getSpeciesEmoji(pet.species)}
                        </div>
                      )}
                      {pet.is_lost && (
                        <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                          LOST
                        </div>
                      )}
                    </div>
                    
                    {/* Pet Info */}
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-white group-hover:text-teal-400 transition-colors">
                        {pet.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {pet.species} {pet.breed && `• ${pet.breed}`}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
