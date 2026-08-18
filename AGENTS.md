# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Freshly scaffolded? Work the
[New Package Checklist](../start-technologies/projects/start-sdk/docs/src/new-package-checklist.md)
(or <https://docs.start9.com/packaging/new-package-checklist.html>) from top to bottom. It is a
guide page, not a file in this repo — read it, don't copy it in.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes.

**Bugs and feature requests are GitHub issues on this repo** — file them as you find them.
Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- **The `setup` oneshot copies LND's macaroon onto this package's volume, and has to.** The original is root-owned `0600` on a read-only mount and Helipad runs unprivileged, so it cannot be read in place. The same oneshot installs LND's `tls.cert` into the container trust store — dropping either step leaves the daemon unable to reach LND. Note the consequence: full LND authority then lives on this volume and in every backup of it.
- **`main` throws rather than starting when the password or LND's address is missing.** That is what makes the password task genuinely blocking, and what stops the service coming up disconnected. LND publishes its gRPC binding only after a first wallet unlock, so the `.const()` heals at that point.
- **The password is stored and passed in plaintext because Helipad takes a password, not a hash.** There is nothing to hash it into; don't add one.
- **Import LND's host id and port from `lnd-startos/startos/interfaces`** rather than hardcoding, so a change on LND's side is a compile error here.
