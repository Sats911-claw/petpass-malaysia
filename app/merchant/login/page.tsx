'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MerchantLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function login() {
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      // Query merchant_users table for matching credentials
      // In production, use proper password hashing
      const { data: merchantUser, error: queryError } = await supabase
        .from('merchant_users')
        .select(`
          *,
          merchants (*)
        `)
        .eq('email', email.toLowerCase())
        .single()

      if (queryError || !merchantUser) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      // Check if merchant is active
      if (merchantUser.merchants?.status !== 'active') {
        setError('Your account is not active. Please contact support.')
        setLoading(false)
        return
      }

      // Simple password check (in production, use proper bcrypt comparison)
      // For demo: accepts 'petpass911' as password
      const isValidPassword = merchantUser.password_hash.includes('demo') && password === 'petpass911'
      
      if (!isValidPassword) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      // Store merchant session
      sessionStorage.setItem('merchant_id', merchantUser.merchant_id)
      sessionStorage.setItem('merchant_user_id', merchantUser.id)
      sessionStorage.setItem('merchant_name', merchantUser.merchants?.name || 'Merchant')
      sessionStorage.setItem('merchant_authed', 'true')
      
      router.push('/merchant/dashboard')
    } catch (err) {
      setError('An error occurred. Please try again.')
    }
    
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: 40, width: 380 }}>
        <div style={{ fontSize: 40, marginBottom: 12, textAlign: 'center' }}>🏪</div>
        <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 4, textAlign: 'center' }}>Merchant Login</h1>
        <p style={{ color: '#666', fontSize: 14, marginBottom: 28, textAlign: 'center' }}>PetPass Merchant Portal</p>
        
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', padding: '14px 16px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 15, marginBottom: 12, boxSizing: 'border-box' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          style={{ width: '100%', padding: '14px 16px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 15, marginBottom: 12, boxSizing: 'border-box' }}
        />
        
        {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        
        <button 
          onClick={login} 
          disabled={loading}
          style={{ width: '100%', padding: '14px', background: loading ? '#0a7a70' : '#0d9488', border: 'none', borderRadius: 8, color: '#fff', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 20 }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div style={{ textAlign: 'center' }}>
          <Link href="/admin" style={{ color: '#666', fontSize: 13, textDecoration: 'none' }}>
            ← Back to Admin
          </Link>
        </div>
      </div>
    </div>
  )
}
