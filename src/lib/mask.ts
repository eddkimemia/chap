export function maskContact(value: string): string {
  if (!value) return ''
  if (value.length <= 4) return value
  const visible = value.slice(0, 2)
  const masked = '*'.repeat(value.length - 4)
  const end = value.slice(-2)
  return `${visible}${masked}${end}`
}
