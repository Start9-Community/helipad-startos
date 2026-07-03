export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Web Interface': 0,
  'Helipad is ready': 1,
  'Helipad is not ready': 2,
  'LND is not yet reachable on the internal network': 11,

  // interfaces.ts
  'Web UI': 3,
  'The Helipad web interface': 4,

  // actions/getPassword.ts
  'Set/Reset Password': 5,
  'Generate a new Helipad login password': 6,
  'Helipad Password': 7,
  'Save this password. You will need it to log in to Helipad.': 8,
  Password: 9,

  // init/initializeService.ts
  'Set your Helipad password': 10,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
