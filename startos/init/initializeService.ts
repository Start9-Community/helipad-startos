import { setPassword } from '../actions/setPassword'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const initializeService = sdk.setupOnInit(async (effects) => {
  if (!(await storeJson.read((s) => s.password).const(effects))) {
    await sdk.action.createOwnTask(effects, setPassword, 'critical', {
      reason: i18n('Set your Helipad password'),
    })
  }
})
