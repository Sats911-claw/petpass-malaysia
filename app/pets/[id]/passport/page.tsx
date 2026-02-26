'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
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

export default function PetPassportPage() {
  const [pet, setPet] = useState<Pet | null>(null)
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([])
  const [qrCode, setQrCode] = useState('')
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [params.id])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: petData } = await supabase.from('pets').select('*').eq('id', params.id).single()
    if (!petData || petData.owner_id !== user.id) { router.push('/dashboard'); return }
    setPet(petData)

    const { data: vacData } = await supabase.from('vaccinations').select('*').eq('pet_id', params.id).order('date_given', { ascending: false })
    setVaccinations(vacData || [])

    const qr = await QRCode.toDataURL(`${window.location.origin}/scan/${params.id}`, { width: 120, margin: 1 })
    setQrCode(qr)
    setLoading(false)
  }

  function formatDate(d: string) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function getAge(dob: string) {
    if (!dob) return null
    const years = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    return years < 1 ? '< 1 year' : `${years} year${years !== 1 ? 's' : ''}`
  }

  function getLicenseStatus() {
    if (!pet?.license_expiry) return null
    const days = Math.ceil((new Date(pet.license_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (days < 0) return { label: 'EXPIRED', color: '#ef4444' }
    if (days <= 30) return { label: `Expires in ${days} days`, color: '#f59e0b' }
    return { label: 'Valid', color: '#16a34a' }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8f6f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#666' }}>Loading passport...</div>
    </div>
  )

  if (!pet) return null

  const licenseStatus = getLicenseStatus()

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          @page { size: A4; margin: 12mm; }
        }
        @media screen {
          body { background: #e5e7eb; }
        }
      `}</style>

      {/* Top bar — screen only */}
      <div className="no-print" style={{ background: '#0a0a0a', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => router.back()} style={{ color: '#aaa', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14 }}>← Back</button>
        <button onClick={() => window.print()} style={{ background: '#0d9488', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          🖨️ Download / Print PDF
        </button>
      </div>

      {/* Passport Document */}
      <div style={{ maxWidth: 740, margin: '24px auto', background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', fontFamily: 'Georgia, serif' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0d9488 0%, #065f46 100%)', padding: '32px 40px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 4, fontFamily: 'system-ui', marginBottom: 4, opacity: 0.8 }}>MALAYSIA</div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'system-ui', marginBottom: 2 }}>PetPass</div>
            <div style={{ fontSize: 13, opacity: 0.85, fontFamily: 'system-ui' }}>Digital Pet Passport</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontFamily: 'system-ui', opacity: 0.8, marginBottom: 6 }}>Scan to verify</div>
            {qrCode && <img src={qrCode} alt="QR" style={{ width: 80, height: 80, background: '#fff', padding: 4, borderRadius: 4 }} />}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ padding: '32px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 32, marginBottom: 32 }}>

            {/* Photo */}
            <div>
              <div style={{ width: 140, height: 140, borderRadius: 8, overflow: 'hidden', border: '2px solid #e5e7eb', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {pet.photo_url
                  ? <img src={pet.photo_url} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ fontSize: 48 }}>{pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐱' : '🐾'}</div>}
              </div>
            </div>

            {/* Identity */}
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 4px', fontFamily: 'system-ui', color: '#0f172a' }}>{pet.name}</h1>
              <p style={{ color: '#0d9488', fontSize: 14, fontFamily: 'system-ui', margin: '0 0 20px', textTransform: 'capitalize' }}>{pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
                {[
                  { label: 'Date of Birth', value: formatDate(pet.dob) },
                  { label: 'Age', value: pet.dob ? getAge(pet.dob) : '—' },
                  { label: 'Weight', value: pet.weight_kg ? `${pet.weight_kg} kg` : '—' },
                  { label: 'Colour', value: pet.colour || '—' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'system-ui', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 14, color: '#0f172a', fontFamily: 'system-ui' }}>{value as string}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #e5e7eb', marginBottom: 24 }} />

          {/* Two column section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 24 }}>

            {/* Identification */}
            <div>
              <h3 style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 2, fontFamily: 'system-ui', margin: '0 0 12px' }}>Identification</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'system-ui' }}>
                <tbody>
                  {[
                    { label: 'Microchip', value: pet.microchip || 'Not registered' },
                    { label: 'Pet ID', value: pet.id.slice(0, 8).toUpperCase() },
                  ].map(({ label, value }) => (
                    <tr key={label} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '8px 0', color: '#6b7280', width: '40%' }}>{label}</td>
                      <td style={{ padding: '8px 0', color: '#0f172a', fontFamily: 'monospace', fontSize: 12 }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* License */}
            <div>
              <h3 style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 2, fontFamily: 'system-ui', margin: '0 0 12px' }}>Municipal License</h3>
              {pet.license_number ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'system-ui' }}>
                  <tbody>
                    {[
                      { label: 'License No.', value: pet.license_number },
                      { label: 'Authority', value: pet.license_authority || '—' },
                      { label: 'Expiry', value: formatDate(pet.license_expiry) },
                      { label: 'Status', value: licenseStatus?.label || 'Valid', color: licenseStatus?.color },
                    ].map(({ label, value, color }) => (
                      <tr key={label} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '8px 0', color: '#6b7280', width: '40%' }}>{label}</td>
                        <td style={{ padding: '8px 0', color: color || '#0f172a', fontWeight: color ? 700 : 400 }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#9ca3af', fontSize: 13, fontFamily: 'system-ui' }}>No license registered</p>
              )}
            </div>
          </div>

          {/* Vaccinations */}
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 24 }}>
            <h3 style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 2, fontFamily: 'system-ui', margin: '0 0 16px' }}>Vaccination Records</h3>
            {vaccinations.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: 13, fontFamily: 'system-ui' }}>No vaccination records</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'system-ui' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    {['Vaccine', 'Date Given', 'Next Due', 'Vet / Clinic'].map(h => (
                      <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vaccinations.map(v => (
                    <tr key={v.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '8px', color: '#0f172a', fontWeight: 600 }}>{v.vaccine_name}</td>
                      <td style={{ padding: '8px', color: '#374151' }}>{formatDate(v.date_given)}</td>
                      <td style={{ padding: '8px', color: v.next_due && new Date(v.next_due) < new Date() ? '#ef4444' : '#374151' }}>
                        {v.next_due ? formatDate(v.next_due) : '—'}
                      </td>
                      <td style={{ padding: '8px', color: '#374151' }}>{[v.vet_name, v.clinic].filter(Boolean).join(' · ') || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 32, paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'system-ui' }}>
              Generated by PetPass Malaysia · petpass.my<br />
              {new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'system-ui', textAlign: 'right' }}>
              {pet.owner_phone && <div>📞 {pet.owner_phone}</div>}
              {pet.owner_email && <div>✉ {pet.owner_email}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom spacer screen only */}
      <div className="no-print" style={{ height: 40 }} />
    </>
  )
}
