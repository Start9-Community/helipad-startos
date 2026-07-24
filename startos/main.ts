import {
  gRPCHostId as lndGrpcHostId,
  gRPCPort as lndGrpcPort,
} from 'lnd-startos/startos/interfaces'
import { manifest as lndManifest } from 'lnd-startos/startos/manifest'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiPort } from './utils'
import { storeJson } from './fileModels/store.json'

export const main = sdk.setupMain(async ({ effects }) => {
  const password = await storeJson.read((s) => s.password).const(effects)
  if (!password) {
    throw new Error('No password')
  }

  // LND's gRPC over the LXC bridge — LND terminates its own TLS, whose
  // StartOS-issued cert covers the bridge address (pinned via the mounted
  // tls.cert). The mapped value tracks LND's assigned external port, so this
  // .const() heals on LND's first wallet unlock (when the gRPC binding lands)
  // and then stays constant across lock/unlock cycles and LND updates.
  const lndUrl = await sdk.host
    .getBridgeAddress(effects, {
      packageId: 'lnd',
      hostId: lndGrpcHostId,
      internalPort: lndGrpcPort,
    })
    .const()
  if (!lndUrl) {
    throw new Error(i18n('LND is not yet reachable on the internal network'))
  }

  const appSub = sdk.SubContainer.of(
    effects,
    { imageId: 'main' },
    sdk.Mounts.of()
      .mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: '/data',
        readonly: false,
      })
      .mountDependency<typeof lndManifest>({
        dependencyId: 'lnd',
        volumeId: 'main',
        subpath: null,
        mountpoint: '/mnt/lnd',
        readonly: true,
      }),
    'helipad-sub',
  )

  return sdk.Daemons.of(effects)
    .addOneshot('setup', {
      subcontainer: appSub,
      exec: {
        command: [
          'sh',
          '-c',
          'chown -R helipad:helipad /data && cp /mnt/lnd/data/chain/bitcoin/mainnet/admin.macaroon /data/admin.macaroon && chown helipad:helipad /data/admin.macaroon && cp /mnt/lnd/tls.cert /usr/local/share/ca-certificates/lnd.crt && update-ca-certificates',
        ],
        user: 'root',
      },
      requires: [],
    })
    .addDaemon('primary', {
      subcontainer: appSub,
      exec: {
        command: sdk.useEntrypoint(),
        env: {
          HELIPAD_DATABASE_DIR: '/data/database.db',
          HELIPAD_LISTEN_PORT: String(uiPort),
          HELIPAD_RUNAS_USER: 'helipad',
          HELIPAD_PASSWORD: password,
          LND_ADMINMACAROON: '/data/admin.macaroon',
          LND_TLSCERT: '/mnt/lnd/tls.cert',
          LND_URL: lndUrl,
        },
      },
      ready: {
        display: i18n('Web Interface'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: i18n('Helipad is ready'),
            errorMessage: i18n('Helipad is not ready'),
          }),
      },
      requires: ['setup'],
    })
})
