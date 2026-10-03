# Operator Plugin

Standardizes daily CNC operation (origin restore, startup sequence, probing,
safety checklist, routine mode) so part-time operators can run the machine
safely. Design doc: `docs/spec/07_OperatorPlugin.md`.

## Branch policy

Development happens on `integration/dev-ja` only. This plugin is not
backported to `master` (which has no Plugin SDK) and is never included in
`contrib/*` branches aimed at upstream. Once the plugin is field-ready,
a tested `integration/dev-ja`-based branch will be promoted to the next
production release — that call is the client's, not an automatic merge to
`master`.

## Status

T1: scaffolding and SDK connectivity check only (connection status, `$#`
WCS query, storage round-trip). The full feature set (origin slots, probe
G-code generation, startup workflow, safety checklist, routine mode) lands
in T2–T7 per `docs/spec/07_OperatorPlugin.md`.

## Local development

See `plugins/README.md` ("Local development") — this plugin builds
automatically with `npm run dev` / `npm run dev:electron` from the repo
root, same as the other `plugins/*` examples.
