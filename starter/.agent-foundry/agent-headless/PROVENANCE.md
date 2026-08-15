# Bundled agent-headless

- Upstream: `https://github.com/shiftynick/agent-headless`
- Version: `0.5.2`
- CLI artifact: `dist/cli.js`
- CLI SHA-256: `8982ccda31f4fd65d0e9aff45ec1aedce631ac07188454858ecaf82310e75b78`
- Library artifact: `dist/index.js`
- Library SHA-256: `0f3e63581704e197646b97d9b12319dc0a1d6c04a57e212eed86ad59681e2a68`
- Public base commit: `0bacff0ec2ea63dc5dd4930824966bcc6d2ca8ce`
- Source commit: `c0586780227e6dd17e071cca7ce5215a970bf5ef`
- Source patches:
  - `source/0013-fix-discover-standard-windows-agy-install.patch.b64`: `411ad85361491e8a36daa6235d521473e334384679bef260d04adf0de4b01539`
  - `source/0014-fix-pass-through-antigravity-live-catalog-models.patch.b64`: `cc77afad4f8862f15481d98379e49523b758b33dd0fa35368fd21848a6571e34`
  - `source/0015-overlay-cursor-grok-4.6-for-foundry.patch.b64`: `dd28dc4fb2486682ab61661f8800bf14ac084f34802d221644a535c31210bf4e`
- License: `MIT` (see adjacent `LICENSE`)
- Runtime: Node.js 20+

The final source patch records Foundry's Cursor Grok 4.6 overlay. The complete
patch series reconstructs the shipped artifact source and hashes cover those
shipped artifacts.

Validate the shipped artifact hashes with `node scripts/validate-foundry.mjs`.
Validate the source chain with `node scripts/verify-vendor-reconstruction.mjs
<path-to-agent-headless-clone>`. To reproduce from the public base, clone
`https://github.com/shiftynick/agent-headless`, which contains
[`0bacff0`](https://github.com/shiftynick/agent-headless/commit/0bacff0ec2ea63dc5dd4930824966bcc6d2ca8ce),
then pass that clone to the reconstruction command.

The source commit need not already be published: base64-decode and apply the
listed patches in order to the public base commit to reconstruct it. Foundry validation verifies
all artifact and patch hashes. The runtime is dependency-free; refresh it only
through a Foundry release after upstream tests, license review, dependency
audit, and review of relevant Node security advisories.
