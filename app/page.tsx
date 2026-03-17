'use client'

export default function Home() {
  return (
    <div className="min-h-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐾</span>
              <span className="text-xl font-bold text-white">PetPass Malaysia</span>
            </div>
            <a
              href="https://clinic.petpass.my"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-teal-500 hover:bg-teal-400 text-black px-4 py-2 rounded-full text-sm font-semibold transition-colors border border-teal-400"
            >
              🏥 PetPass Clinic Portal
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-500/30 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
            <span className="text-sm text-teal-300">Now Live in Malaysia</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Malaysia&apos;s First
            <br />
            <span className="text-teal-400">Digital Pet Passport</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            One QR code. Your pet&apos;s full medical history. Instant lost pet alerts.
          </p>

          {/* Sign Up CTA */}
          <div className="max-w-md mx-auto">
            <a
              href="/login"
              className="block w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] text-center"
            >
              🐾 Sign Up Free — Start Managing Your Pet
            </a>
            <p className="text-gray-500 text-sm mt-4">
              Already have an account? <a href="/login" className="text-teal-400 hover:underline">Log in</a>
            </p>
          </div>
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

      {/* Solution Section */}
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
              <p className="text-gray-400 text-sm">Complete digital profile for each pet with photos, breed, microchip, and all essential details.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/50 transition-colors">
              <div className="text-4xl mb-4">💉</div>
              <h3 className="text-lg font-semibold text-white mb-2">Vaccination Records</h3>
              <p className="text-gray-400 text-sm">Never lose track of vaccinations again. Digital records with automatic reminders for boosters.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/50 transition-colors">
              <div className="text-4xl mb-4">🚨</div>
              <h3 className="text-lg font-semibold text-white mb-2">Lost Pet Alert</h3>
              <p className="text-gray-400 text-sm">Instant alerts to all PetPass users when your pet goes missing. Community-powered finding.</p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/50 transition-colors">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-lg font-semibold text-white mb-2">Pet-Friendly Map</h3>
              <p className="text-gray-400 text-sm">Discover pet-friendly cafes, parks, groomers, and vets in your area across Malaysia.</p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/50 transition-colors">
              <div className="text-4xl mb-4">🩺</div>
              <h3 className="text-lg font-semibold text-white mb-2">Vet Finder</h3>
              <p className="text-gray-400 text-sm">Find trusted veterinarians near you with ratings, reviews, and clinic information.</p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/50 transition-colors">
              <div className="text-4xl mb-4">📜</div>
              <h3 className="text-lg font-semibold text-white mb-2">License Tracker</h3>
              <p className="text-gray-400 text-sm">Track and renew your pet&apos;s municipal license with automatic reminders before expiry.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-teal-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">🇲🇾</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Built for Malaysian Pet Owners</h2>
          <p className="text-gray-400 text-lg mb-8">Join thousands of Malaysian pet owners already using PetPass</p>
          <a 
            href="/login" 
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 px-8 rounded-full transition-all transform hover:scale-105"
          >
            Get Started Free
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
            <div className="text-gray-500 text-sm">© 2026 petpass.my | contact@petpass.my</div>
          </div>
          <div className="mt-8 flex justify-start">
            <a href="/admin" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/50 text-gray-400 hover:text-white px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium">
              <span>🔐</span>
              <span>Admin Portal</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
