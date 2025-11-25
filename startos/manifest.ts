import { setupManifest } from '@start9labs/start-sdk'
import { SDKImageInputSpec } from '@start9labs/start-sdk/base/lib/types/ManifestTypes'

const BUILD = process.env.BUILD || ''

const arch =
  BUILD === 'x86_64' || BUILD === 'aarch64' ? [BUILD] : ['x86_64', 'aarch64']

export const manifest = setupManifest({
  id: 'bitcoind-testnet4',
  title: 'Bitcoin Core Testnet4',
  license: 'MIT',
  donationUrl: null,
  wrapperRepo: 'https://github.com/Start9Labs/bitcoind-testnet4-startos',
  upstreamRepo: 'https://github.com/bitcoin/bitcoin',
  supportSite: 'https://github.com/bitcoin/bitcoin/issues',
  marketingSite: 'https://bitcoincore.org/',
  docsUrl:
    'https://github.com/Start9Labs/bitcoind-testnet4-startos/blob/update/040/instructions.md',
  description: {
    short: 'A Bitcoin Testnet4 Full Node by Bitcoin Core',
    long: 'Bitcoin Testnet4 is the fourth iteration of Bitcoin\'s test blockchain network. This service runs a full Bitcoin Core node on the testnet4 network, which is used for testing and development without risking real bitcoin. Testnet4 provides a safe environment to experiment with Bitcoin transactions, smart contracts, and application development. Bitcoin is an innovative payment network and a new kind of money that uses peer-to-peer technology to operate with no central authority or banks.',
  },
  volumes: ['main', 'proxy', 'ipc'],
  images: {
    bitcoind: {
      source: {
        dockerBuild: {
          workdir: './',
          dockerfile: 'Dockerfile',
        },
      },
      arch,
    } as SDKImageInputSpec,
    proxy: {
      source: {
        dockerTag: 'ghcr.io/start9labs/btc-rpc-proxy',
      },
      arch,
    } as SDKImageInputSpec,
    python: {
      source: {
        dockerTag: 'python:3.13.2-alpine',
      },
      arch,
    } as SDKImageInputSpec,
  },
  hardwareRequirements: { arch },
  alerts: {
    install: null,
    update: null,
    uninstall:
      "Uninstalling Bitcoin Core Testnet4 will result in permanent loss of data. Without a backup, any testnet funds stored on your node's default hot wallet will be lost forever. If you are unsure, we recommend making a backup, just to be safe.",
    restore:
      'Restoring Bitcoin Core Testnet4 will overwrite its current data. You will lose any transactions recorded in watch-only wallets, and any testnet funds you have received to the hot wallet, since the last backup.',
    start: null,
    stop: null,
  },
  dependencies: {},
})
