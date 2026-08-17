# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (technical reference for an AI support or administering agent) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **The `setup` oneshot copies LND's macaroon onto this package's volume, and has to.** The original is root-owned `0600` on a read-only mount and Helipad runs unprivileged, so it cannot be read in place. The same oneshot installs LND's `tls.cert` into the container trust store — dropping either step leaves the daemon unable to reach LND. Note the consequence: full LND authority then lives on this volume and in every backup of it.
- **`main` throws rather than starting when the password or LND's address is missing.** That is what makes the password task genuinely blocking, and what stops the service coming up disconnected. LND publishes its gRPC binding only after a first wallet unlock, so the `.const()` heals at that point.
- **The password is stored and passed in plaintext because Helipad takes a password, not a hash.** There is nothing to hash it into; don't add one.
- **Import LND's host id and port from `lnd-startos/startos/interfaces`** rather than hardcoding, so a change on LND's side is a compile error here.
