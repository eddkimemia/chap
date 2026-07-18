export function normalizeKenyanPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')
  if (cleaned.startsWith('07') && cleaned.length === 10) {
    return '+2547' + cleaned.slice(2)
  }
  if (cleaned.startsWith('7') && cleaned.length === 9) {
    return '+254' + cleaned
  }
  if (cleaned.startsWith('+2547') && cleaned.length === 13) {
    return cleaned
  }
  if (cleaned.startsWith('2547') && cleaned.length === 12) {
    return '+' + cleaned
  }
  return phone
}
