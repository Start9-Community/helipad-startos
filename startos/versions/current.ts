import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const current = VersionInfo.of({
  version: '0.2.2:8',
  releaseNotes: {
    en_US: `- The unused network interface left behind by the StartOS 0.3.5 version of Helipad is removed and its port freed. The Web UI interface and its addresses are unchanged.
- Set/Reset Password asks for confirmation before it replaces an existing password.`,
    es_ES: `- Se elimina la interfaz de red sin uso que dejó la versión de Helipad para StartOS 0.3.5 y se libera su puerto. La interfaz web y sus direcciones no cambian.
- «Establecer/Restablecer contraseña» pide confirmación antes de reemplazar una contraseña existente.`,
    de_DE: `- Die ungenutzte Netzwerkschnittstelle, die die StartOS-0.3.5-Version von Helipad hinterlassen hatte, wird entfernt und ihr Port freigegeben. Die Weboberfläche und ihre Adressen bleiben unverändert.
- „Passwort setzen/zurücksetzen“ fragt nach einer Bestätigung, bevor es ein bestehendes Passwort ersetzt.`,
    pl_PL: `- Usunięto nieużywany interfejs sieciowy pozostawiony przez wersję Helipad dla StartOS 0.3.5 i zwolniono jego port. Interfejs webowy i jego adresy pozostają bez zmian.
- „Ustaw/Zresetuj hasło” prosi o potwierdzenie, zanim zastąpi istniejące hasło.`,
    fr_FR: `- L'interface réseau inutilisée laissée par la version de Helipad pour StartOS 0.3.5 est supprimée et son port libéré. L'interface web et ses adresses ne changent pas.
- « Définir/Réinitialiser le mot de passe » demande une confirmation avant de remplacer un mot de passe existant.`,
  },
  migrations: {
    up: async ({ effects }) => {
      await sdk.MultiHost.of(effects, 'main').retire()
    },
    down: IMPOSSIBLE,
  },
})
