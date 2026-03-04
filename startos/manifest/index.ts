import { setupManifest } from '@start9labs/start-sdk'
import { lndDescription, short, long } from './i18n'

export const manifest = setupManifest({
  id: 'helipad',
  title: 'Helipad',
  license: 'MIT',
  packageRepo: 'https://github.com/Podcastindex-org/helipad-startos/tree/update/040',
  upstreamRepo: 'https://github.com/Podcastindex-org/helipad',
  marketingUrl: 'https://podcastindex.org',
  donationUrl: null,
  docsUrls: ['https://github.com/Podcastindex-org/helipad'],
  description: { short, long },
  volumes: ['main'],
  images: {
    main: {
      source: {
        dockerTag: 'podcastindexorg/podcasting20-helipad:0.2.1',
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {
    lnd: {
      description: lndDescription,
      optional: false,
      metadata: {
        title: 'LND',
        icon: 'https://raw.githubusercontent.com/Start9Labs/lnd-startos/573b224e4f7ccbb0c009fa19e4c4eb50f2d51e61/icon.svg',
      },
    },
  },
})
