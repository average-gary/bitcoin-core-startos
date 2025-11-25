import { VersionInfo } from '@start9labs/start-sdk'
import { storeJson } from '../../fileModels/store.json'
import { bitcoinConfFile } from '../../fileModels/bitcoin.conf'
import { bitcoinConfDefaults, rootDir } from '../../utils'
import { sdk } from '../../sdk'
import { mainMounts } from '../../main'

export const v30_0_0_1_beta3 = VersionInfo.of({
  version: '30.0.0:1-beta.3',
  releaseNotes: 'Revamped for StartOS 0.4.0. Added IPC socket binding support for inter-process communication. Configured for testnet4.',
  migrations: {
    up: async ({ effects }) => {
      // Add enableIpc to store.json (not bitcoin.conf)
      await storeJson.merge(effects, {
        enableIpc: bitcoinConfDefaults.enableIpc,
      })

      // Remove bind and whitebind from bitcoin.conf using sed
      // (they're now passed as CLI args for testnet4 compatibility)
      await sdk.SubContainer.withTemp(
        effects,
        { imageId: 'bitcoind' },
        mainMounts,
        'cleanup-config',
        async (subc) => {
          // Remove bind= and whitebind= lines from bitcoin.conf
          await subc.exec([
            'sed',
            '-i',
            '/^bind=/d; /^whitebind=/d',
            `${rootDir}/bitcoin.conf`,
          ])
        },
      )

      // Also rewrite the config through the FileHelper to ensure consistency
      const existingConf = await bitcoinConfFile.read().once()
      if (existingConf) {
        await bitcoinConfFile.write(effects, existingConf)
      }
    },
    down: async ({ effects }) => {},
  },
})
