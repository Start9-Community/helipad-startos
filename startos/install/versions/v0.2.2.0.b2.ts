import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v_0_2_2_0_b2 = VersionInfo.of({
  version: '0.2.2:0-beta.2',
  releaseNotes: {
    en_US: 'Update to StartOS SDK beta.65',
    es_ES: 'Actualización a StartOS SDK beta.65',
    de_DE: 'Update auf StartOS SDK beta.65',
    pl_PL: 'Aktualizacja do StartOS SDK beta.65',
    fr_FR: 'Mise à jour vers StartOS SDK beta.65',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
