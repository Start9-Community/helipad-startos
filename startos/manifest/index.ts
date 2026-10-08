import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'helipad',
  title: 'Helipad',
  license: 'MIT',
  packageRepo: 'https://github.com/Start9-Community/helipad-startos',
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
      emulateMissing: false,
    },
  },
})
