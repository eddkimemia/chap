const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@chapke.co.ke'

export async function sendEmail({
  to, subject, html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: EMAIL_FROM, to, subject, html }),
      })
      if (!res.ok) {
        const err = await res.text()
        console.error('[EMAIL] Resend error:', err)
      }
      return res.ok
    } catch (err) {
      console.error('[EMAIL] Failed to send:', err)
      return false
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV EMAIL] To: ${to}`)
    console.log(`[DEV EMAIL] Subject: ${subject}`)
    console.log(`[DEV EMAIL] Body: ${html.replace(/<[^>]*>/g, '')}`)
  }
  return true
}
