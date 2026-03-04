import { utils } from '@start9labs/start-sdk'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'

export const setPassword = sdk.Action.withoutInput(
  'set-password',

  async ({ effects }) => ({
    name: i18n('Set/Reset Password'),
    description: i18n('Generate a new Helipad login password'),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const password = utils.getDefaultString({
      charset: 'a-z,A-Z,0-9',
      len: 22,
    })
    await storeJson.merge(effects, { password })

    return {
      version: '1',
      title: i18n('Helipad Password'),
      message: i18n(
        'Save this password. You will need it to log in to Helipad.',
      ),
      result: {
        type: 'single',
        name: i18n('Password'),
        description: null,
        value: password,
        masked: true,
        copyable: true,
        qr: false,
      },
    }
  },
)
