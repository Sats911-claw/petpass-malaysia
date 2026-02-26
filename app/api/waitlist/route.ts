import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { Resend } from 'resend'

// Initialize Resend (will use env var when available)
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json()

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Create server-side Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Insert into waitlist table
    const { error: supabaseError } = await supabase
      .from('waitlist')
      .insert([{ name, email }])

    if (supabaseError) {
      if (supabaseError.code === '23505') {
        return NextResponse.json(
          { error: 'You\'re already on the waitlist!' },
          { status: 409 }
        )
      }
      console.error('Supabase error:', supabaseError)
      return NextResponse.json(
        { error: 'Failed to join waitlist' },
        { status: 500 }
      )
    }

    // Send confirmation email via Resend
    if (resend) {
      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're on the list! 🐾 PetPass Malaysia</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #111111; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <span style="font-size: 48px;">🐾</span>
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 16px 0 0 0;">PetPass Malaysia</h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 20px 40px;">
              <p style="color: #e5e5e5; font-size: 18px; margin: 0;">Hi ${name},</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 10px 40px 30px 40px;">
              <p style="color: #e5e5e5; font-size: 18px; line-height: 1.6; margin: 0;">
                You're officially on the <strong style="color: #0d9488;">PetPass Malaysia</strong> waitlist!
              </p>
            </td>
          </tr>
          
          <!-- Pitch Box -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0d9488; border-radius: 12px; padding: 24px;">
                <tr>
                  <td>
                    <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0;">
                      Malaysia's first digital pet passport — manage health records, generate QR codes, and get found if your pet ever gets lost.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <p style="color: #a3a3a3; font-size: 16px; margin: 0;">
                We'll notify you the moment we launch.
              </p>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 40px 40px; text-align: center;">
              <a href="https://petpass.my" style="display: inline-block; background-color: #0d9488; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 32px; border-radius: 8px;">
                Visit petpass.my
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #262626; text-align: center;">
              <p style="color: #525252; font-size: 14px; margin: 0;">
                PetPass Malaysia | <a href="https://petpass.my" style="color: #0d9488; text-decoration: none;">petpass.my</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

      try {
        await resend.emails.send({
          from: 'PetPass Malaysia <hello@petpass.my>',
          to: email,
          subject: "You're on the list! 🐾 PetPass Malaysia",
          html: emailHtml,
        })
      } catch (emailError) {
        // Log but don't fail - the waitlist entry was created successfully
        console.error('Failed to send confirmation email:', emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Waitlist API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
