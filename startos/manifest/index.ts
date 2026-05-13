import { setupManifest } from '@start9labs/start-sdk'
import { lndDescription, long, short } from './i18n'

export const manifest = setupManifest({
  id: 'helipad',
  title: 'Helipad',
  license: 'MIT',
  packageRepo:
    'https://github.com/Podcastindex-org/helipad-startos',
  upstreamRepo: 'https://github.com/Podcastindex-org/helipad',
  marketingUrl: 'https://podcastindex.org',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    main: {
      source: {
        dockerTag: 'podcastindexorg/podcasting20-helipad:0.2.2',
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
        icon: 'https://raw.githubusercontent.com/Start9Labs/lnd-startos/f17336a10769efd8782a347662848c50c6270349/icon.svg',
      },
    },
  },
})
