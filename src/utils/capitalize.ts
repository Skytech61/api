/** converts the first character of the string to capital (uppercase) letter */
export function capitalize (s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}