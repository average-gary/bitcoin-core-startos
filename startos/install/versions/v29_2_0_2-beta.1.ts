import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { bitcoinConfFile } from '../../fileModels/bitcoin.conf'
import { bitcoinConfDefaults } from '../../utils'
import { storeJson } from '../../fileModels/store.json'
import { sdk } from '../../sdk'
import { mainMounts } from '../../main'
// const { whitebind, bind } = bitcoinConfDefaults // Removed - now passed as CLI args

export const v29_2_0_2 = VersionInfo.of({
  version: '29.2:2-beta.0',
  releaseNotes: 'Revamped for StartOS 0.4.0',
  migrations: {
    up: async ({ effects }) => {
      await sdk.SubContainer.withTemp(
        effects,
        { imageId: 'bitcoind' },
        mainMounts,
        'nocow',
        async (subc) => {
          await subc.execFail(['chattr', '-R', '+C', '/.bitcoin'])
        },
      )
      const store = await storeJson.read().once()

      if (!store) {
        await storeJson.write(effects, {
          reindexBlockchain: false,
          reindexChainstate: false,
          fullySynced: false,
          snapshotInUse: false,
        })
      }
      const existingConf = await bitcoinConfFile.read().once()

      if (existingConf) {
        await bitcoinConfFile.merge(effects, {
          rpcuser: undefined,
          rpcpassword: undefined,
          // bind, // Removed - now passed as CLI arg
          // whitebind, // Removed - now passed as CLI arg
          whitelist: undefined,
        })
        return
      } // Only write conf defaults if no existing bitcoin.conf found

      await bitcoinConfFile.write(effects, bitcoinConfDefaults)
    },
    down: IMPOSSIBLE,
  },
})
