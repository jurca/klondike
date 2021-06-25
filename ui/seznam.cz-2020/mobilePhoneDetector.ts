export function isMobilePhoneOrAndroidTablet() {
  return (
    typeof navigator === 'object' &&
    navigator &&
    /(?:\(iPhone;| Android )/.test(navigator.userAgent)
  )
}
