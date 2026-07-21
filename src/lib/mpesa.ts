const MPESA_ENV = process.env.MPESA_ENV || 'sandbox'
const BASE_URL = MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke'

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || ''
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || ''
const PASSKEY = process.env.MPESA_PASSKEY || ''
const SHORTCODE = process.env.MPESA_SHORTCODE || '174379'

function getTimestamp(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const h = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  return `${y}${m}${d}${h}${min}${s}`
}

function getPassword(): string {
  const timestamp = getTimestamp()
  return Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64')
}

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64')
  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    method: 'GET',
    headers: { Authorization: `Basic ${auth}` },
  })
  if (!res.ok) throw new Error(`M-Pesa auth failed: ${res.status}`)
  const data = await res.json()
  return data.access_token
}

interface StkPushRequest {
  phone: string
  amount: number
  accountReference: string
  transactionDesc: string
  callbackUrl: string
}

interface StkPushResponse {
  MerchantRequestID: string
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage: string
}

export async function stkPush(req: StkPushRequest): Promise<StkPushResponse> {
  const token = await getAccessToken()
  const timestamp = getTimestamp()
  const password = getPassword()

  const phone = req.phone.replace(/^0+/, '254').replace(/^\+/, '')
  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(req.amount),
      PartyA: phone,
      PartyB: SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: req.callbackUrl,
      AccountReference: req.accountReference.slice(0, 12),
      TransactionDesc: req.transactionDesc.slice(0, 13),
    }),
  })

  if (!res.ok) throw new Error(`M-Pesa STK Push failed: ${res.status}`)
  return res.json()
}

interface StkQueryResponse {
  ResponseCode: string
  ResponseDescription: string
  MerchantRequestID: string
  CheckoutRequestID: string
  ResultCode: string
  ResultDesc: string
}

export async function stkPushQuery(checkoutRequestID: string): Promise<StkQueryResponse> {
  const token = await getAccessToken()
  const timestamp = getTimestamp()
  const password = getPassword()

  const res = await fetch(`${BASE_URL}/mpesa/stkpushquery/v1/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID,
    }),
  })

  if (!res.ok) throw new Error(`M-Pesa query failed: ${res.status}`)
  return res.json()
}

export function formatPhone(phone: string): string {
  return phone.replace(/^0+/, '254').replace(/^\+/, '').replace(/\s/g, '')
}
