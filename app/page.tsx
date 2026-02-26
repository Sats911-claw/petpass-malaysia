'use client'

import { useState } from 'react'

export default function Home() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ name, email }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
      } else {
        setSubmitted(true)
      }
    } catch (err) {
      setError('Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-black">
      {/*-screen bg Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐾</span>
              <span className="text-xl font-bold text-white">PetPass Malaysia</span>
            </div>
            <a
              href="#waitlist"
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              Join Waitlist
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-300">Coming Soon</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Malaysia&apos;s First
            <br />
            <span className="text-teal-400">Digital Pet Passport</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            One QR code. Your pet&apos;s full medical history. Instant lost pet alerts.
          </p>

          {/* Waitlist Form */}
          {submitted ? (
            <div className="bg-teal-900/30 border border-teal-500/30 rounded-2xl p-8 max-w-md mx-auto">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-white mb-2">You&apos;re on the list!</h3>
              <p className="text-gray-400">We&apos;ll notify you when PetPass launches in Malaysia.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                  />
                </div>
                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] disabled:transform-none"
                >
                  {loading ? 'Joining...' : 'Join the Waitlist — It\'s Free'}
                </button>
              </div>
            </form>
          )}

          <p className="text-gray-500 text-sm mt-6">
            Join 500+ Malaysian pet owners on the waitlist
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-16">
            The Struggle is Real for Malaysian Pet Owners
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Problem 1 */}
            <div className="text-center p-8 rounded-2xl bg-black/30 border border-white/10">
              <div className="text-5xl mb-6">📋</div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Lost Vaccination Records
              </h3>
              <p className="text-gray-400">
                Paper booklets get lost, damaged, or faded. Finding a vet who can read your handwritten records is a nightmare.
              </p>
            </div>

            {/* Problem 2 */}
            <div className="text-center p-8 rounded-2xl bg-black/30 border border-white/10">
              <div className="text-5xl mb-6">🐕</div>
              <h3 className="text-xl font-semibold text-white mb-4">
                No Lost Pet Network
              </h3>
              <p className="text-gray-400">
                When your pet goes missing, you&apos;re on your own. There&apos;s no unified network to help find lost pets in Malaysia.
              </p>
            </div>

            {/* Problem 3 */}
            <div className="text-center p-8 rounded-2xl bg-black/30 border border-white/10">
              <div className="text-5xl mb-6">🗺️</div>
              <h3 className="text-xl font-semibold text-white mb-4">
                No Pet-Friendly Map
              </h3>
              <p className="text-gray-400">
                Want to find pet-friendly cafes, groomers, or vets near you? There&apos;s no comprehensive directory for Malaysia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-16">
            Everything You Need in One App
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/50 transition-colors">
              <div className="text-4xl mb-4">🐾</div>
              <h3 className="text-lg font-semibold text-white mb-2">PetPass Profile</h3>
              <p className="text-gray-400 text-sm">
                Complete digital profile for each pet with photos, breed, microchip, and all essential details.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/50 transition-colors">
              <div className="text-4xl mb-4">💉</div>
              <h3 className="text-lg font-semibold text-white mb-2">Vaccination Records</h3>
              <p className="text-gray-400 text-sm">
                Never lose track of vaccinations again. Digital records with automatic reminders for boosters.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/50 transition-colors">
              <div className="text-4xl mb-4">🚨</div>
              <h3 className="text-lg font-semibold text-white mb-2">Lost Pet Alert</h3>
              <p className="text-gray-400 text-sm">
                Instant alerts to all PetPass users when your pet goes missing. Community-powered finding.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/50 transition-colors">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-lg font-semibold text-white mb-2">Pet-Friendly Map</h3>
              <p className="text-gray-400 text-sm">
                Discover pet-friendly cafes, parks, groomers, and vets in your area across Malaysia.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/50 transition-colors">
              <div className="text-4xl mb-4">🩺</div>
              <h3 className="text-lg font-semibold text-white mb-2">Vet Finder</h3>
              <p className="text-gray-400 text-sm">
                Find trusted veterinarians near you with ratings, reviews, and clinic information.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/50 transition-colors">
              <div className="text-4xl mb-4">📜</div>
              <h3 className="text-lg font-semibold text-white mb-2">License Tracker</h3>
              <p className="text-gray-400 text-sm">
                Track and renew your pet&apos;s municipal license with automatic reminders before expiry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-teal-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">🇲🇾</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Built for Malaysian Pet Owners
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join 500+ Malaysian pet owners already on the waitlist
          </p>
          <a
            href="#waitlist"
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 px-8 rounded-full transition-all transform hover:scale-105"
          >
            Join the Waitlist
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐾</span>
              <span className="text-lg font-bold text-white">PetPass Malaysia</span>
            </div>
            <div className="text-gray-500 text-sm">
              © 2026 petpass.my | contact@petpass.my
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
