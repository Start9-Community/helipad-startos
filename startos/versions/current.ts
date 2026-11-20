import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'node:fs/promises'
import { sdk } from '../sdk'

export const current = VersionInfo.of({
  version: '0.2.2:13',
  releaseNotes: {
    en_US: `Requires StartOS 0.4.2 or later. Helipad no longer keeps a copy of LND's admin macaroon on its own volume, so its backups no longer carry a credential for your Lightning node. The copy left by earlier versions is deleted on update.`,
    es_ES: `Requiere StartOS 0.4.2 o posterior. Helipad ya no guarda una copia del macaroon de administración de LND en su propio volumen, por lo que sus copias de seguridad ya no contienen una credencial de tu nodo Lightning. La copia que dejaron las versiones anteriores se elimina al actualizar.`,
    de_DE: `Erfordert StartOS 0.4.2 oder neuer. Helipad speichert keine Kopie des Admin-Macaroons von LND mehr auf seinem eigenen Volume, daher enthalten seine Backups keine Zugangsdaten für Ihren Lightning-Knoten mehr. Die von früheren Versionen hinterlassene Kopie wird beim Update gelöscht.`,
    pl_PL: `Wymaga StartOS 0.4.2 lub nowszego. Helipad nie przechowuje już kopii macaroona administratora LND na własnym woluminie, więc jego kopie zapasowe nie zawierają już danych uwierzytelniających do twojego węzła Lightning. Kopia pozostawiona przez wcześniejsze wersje jest usuwana podczas aktualizacji.`,
    fr_FR: `Nécessite StartOS 0.4.2 ou ultérieur. Helipad ne conserve plus de copie du macaron administrateur de LND sur son propre volume, si bien que ses sauvegardes ne contiennent plus d'identifiant pour votre nœud Lightning. La copie laissée par les versions précédentes est supprimée lors de la mise à jour.`,
  },
  migrations: {
    up: async () => {
      await rm(sdk.volumes.main.subpath('admin.macaroon'), { force: true })
    },
    down: IMPOSSIBLE,
  },
})
