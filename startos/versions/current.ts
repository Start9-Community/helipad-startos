import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { access, readdir, rename, rmdir } from 'node:fs/promises'
import { sdk } from '../sdk'

const exists = (path: string) =>
  access(path).then(
    () => true,
    () => false,
  )

export const current = VersionInfo.of({
  version: '0.2.2:11',
  releaseNotes: {
    en_US: `Moves Helipad's database from where the StartOS 0.3.5 version kept it (\`db/database.db\`) to where this version reads it (\`database.db\`). Until now, updating from StartOS 0.3.5 started Helipad on a new, empty database: boosts came back from LND, but triggers (sounds and webhooks) and settings did not.

If you already updated from StartOS 0.3.5 and your triggers or settings are missing, your old database is still on the volume at \`db/database.db\`. This update leaves it alone, because Helipad has written a new database since. See https://github.com/Podcastindex-org/helipad/issues/165 for how to copy your triggers and settings back.`,
    es_ES: `Mueve la base de datos de Helipad de donde la guardaba la versión para StartOS 0.3.5 (\`db/database.db\`) a donde la lee esta versión (\`database.db\`). Hasta ahora, al actualizar desde StartOS 0.3.5, Helipad arrancaba con una base de datos nueva y vacía: los boosts volvían desde LND, pero los disparadores (sonidos y webhooks) y los ajustes no.

Si ya actualizaste desde StartOS 0.3.5 y te faltan disparadores o ajustes, tu base de datos anterior sigue en el volumen, en \`db/database.db\`. Esta actualización no la toca, porque Helipad ha escrito una base de datos nueva desde entonces. Consulta https://github.com/Podcastindex-org/helipad/issues/165 para copiar de nuevo tus disparadores y ajustes.`,
    de_DE: `Verschiebt die Datenbank von Helipad von dort, wo die Version für StartOS 0.3.5 sie ablegte (\`db/database.db\`), dorthin, wo diese Version sie liest (\`database.db\`). Bisher startete Helipad nach einem Update von StartOS 0.3.5 mit einer neuen, leeren Datenbank: Die Boosts kamen aus LND zurück, die Trigger (Sounds und Webhooks) und Einstellungen jedoch nicht.

Wenn Sie bereits von StartOS 0.3.5 aktualisiert haben und Ihnen Trigger oder Einstellungen fehlen, liegt Ihre alte Datenbank noch auf dem Volume unter \`db/database.db\`. Dieses Update lässt sie unverändert, weil Helipad seitdem eine neue Datenbank geschrieben hat. Wie Sie Ihre Trigger und Einstellungen zurückkopieren, steht unter https://github.com/Podcastindex-org/helipad/issues/165.`,
    pl_PL: `Przenosi bazę danych Helipad z miejsca, w którym trzymała ją wersja dla StartOS 0.3.5 (\`db/database.db\`), do miejsca, z którego czyta ją ta wersja (\`database.db\`). Dotąd po aktualizacji ze StartOS 0.3.5 Helipad uruchamiał się z nową, pustą bazą danych: boosty wracały z LND, ale wyzwalacze (dźwięki i webhooki) oraz ustawienia nie.

Jeśli aktualizacja ze StartOS 0.3.5 jest już za tobą i brakuje wyzwalaczy lub ustawień, stara baza danych nadal leży na woluminie w \`db/database.db\`. Ta aktualizacja jej nie rusza, ponieważ Helipad zapisał od tego czasu nową bazę danych. Jak skopiować wyzwalacze i ustawienia z powrotem, opisano w https://github.com/Podcastindex-org/helipad/issues/165.`,
    fr_FR: `Déplace la base de données de Helipad de l'endroit où la version pour StartOS 0.3.5 la gardait (\`db/database.db\`) vers celui où cette version la lit (\`database.db\`). Jusqu'ici, une mise à jour depuis StartOS 0.3.5 faisait démarrer Helipad sur une base de données neuve et vide : les boosts revenaient depuis LND, mais pas les déclencheurs (sons et webhooks) ni les réglages.

Si vous avez déjà fait la mise à jour depuis StartOS 0.3.5 et que des déclencheurs ou des réglages manquent, votre ancienne base de données se trouve toujours sur le volume, dans \`db/database.db\`. Cette mise à jour n'y touche pas, car Helipad a écrit une nouvelle base de données depuis. Consultez https://github.com/Podcastindex-org/helipad/issues/165 pour recopier vos déclencheurs et réglages.`,
  },
  migrations: {
    up: async ({ effects }) => {
      // The StartOS 0.3.5 package pointed HELIPAD_DATABASE_DIR at
      // db/database.db; this one points it at database.db, and Helipad
      // creates an empty database wherever it finds none. Boosts refill from
      // LND, but triggers and settings live only in the old file.
      const main = sdk.volumes.main
      if (!(await exists(main.subpath('db/database.db')))) return
      // Helipad has already started on the new path, so both files hold data
      // and nothing here can tell which one the user wants. Leave both.
      if (await exists(main.subpath('database.db'))) return

      // A hot rollback journal from an unclean stop must travel with its
      // database, and ahead of it, so an interrupted move is resumable.
      for (const file of ['database.db-journal', 'database.db']) {
        if (await exists(main.subpath(`db/${file}`))) {
          await rename(main.subpath(`db/${file}`), main.subpath(file))
        }
      }
      if ((await readdir(main.subpath('db'))).length === 0) {
        await rmdir(main.subpath('db'))
      }
    },
    down: IMPOSSIBLE,
  },
})
