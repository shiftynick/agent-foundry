# Bundled agent-headless

- Upstream: `https://github.com/shiftynick/agent-headless`
- Version: `0.4.0`
- CLI artifact: `dist/cli.js`
- CLI SHA-256: `21d222115368dc707c05b683ffcc3f4cb16902a58d2e2e448589c45f8c3c4c2d`
- Library artifact: `dist/index.js`
- Library SHA-256: `0718a678640befa9efa6923271469c415694b7d818728d224c9fc3fe03babef0`
- Public base commit: `7600ff8cc6a0e158dbbe7835daed05862aac3810`
- Source commit: `eaa32c49734d55af94e31ac769f383a2a03a7706`
- Source patches:
  - `source/0001-feat-harden-unified-runner-for-Node-20-consumers.patch.b64`: `a23f3f15a13024043761ffe54adc4360d2c5fb4f1a7eff806de07ca7f63bb07b`
  - `source/0002-fix-tighten-least-privilege-and-cancellation-contrac.patch.b64`: `bd04083e8f3ea06f09edfd844b5fd8828160822a0b1cc31682330a2a4193f01e`
  - `source/0003-fix-separate-unreadable-output-from-provider-failure.patch.b64`: `46a1fd2ce46a7ef6c2834bf37a8d016492f9d001d00857860c0f88766776e966`
  - `source/0004-fix-locate-an-isolated-worktree-by-construction-not-.patch.b64`: `8b4e70415f140fed67133f54d603a0636c13a6e3aa50a4f535942874ba56e0f6`
  - `source/0005-fix-derive-worktree-paths-only-for-real-repositories.patch.b64`: `bcfd3d4c4c48b0b0453efa5b597581b38f56edf6235fb8ef9fc036f4a563de0c`
  - `source/0006-fix-probe-git-with-the-run-s-own-environment.patch.b64`: `15f05032dafa3e2c57617f62c4bcaba19c99316eed445239e65733003578c56e`
  - `source/0007-fix-key-environment-caches-by-effective-resolution-n.patch.b64`: `336df876cf058b22f4fe2503a15c10a607651bedfe9060f7b96128ffe1b23409`
  - `source/0008-fix-read-environments-the-way-Windows-does-everywher.patch.b64`: `a7bfb077cf65b958906f0918761f3a3bdb55d6545f3b9781cc15d6ab43ae3ec7`
  - `source/0009-fix-case-variant-duplicates-resolve-last-wins-in-eve.patch.b64`: `b8d68f97e7984b1ae3a1d727877b17b987799a58f3874d46becadf463c525df8`
  - `source/0010-refactor-one-matcher-for-every-environment-read.patch.b64`: `ff8bc3847fa06bdc777a75044f7c4fc0799896aba871a45d6527daa9b6360752`
  - `source/0011-refactor-single-source-the-environment-name-fold.patch.b64`: `46c120d04030af4b7eba6f6cc156278c1feeae968c58c797a3602f1a973c0119`
  - `source/0012-feat-curated-supported-model-lists-for-Claude-Codex-and-Cursor.patch.b64`: `2cb28ade1c3e5532d997a85a29297421f1b1bcb161d1f1a13766b692c14e3c49`
- License: `MIT` (see adjacent `LICENSE`)
- Runtime: Node.js 20+

Foundry 0.36.0 overlaid the Cursor Grok 4.6 allowlist and default onto the
CLI and library artifacts. Source patches still reconstruct upstream 0.4.0.

The source commit need not already be published: base64-decode and apply the
listed patches in order to the public base commit to reconstruct it. Foundry validation verifies
all artifact and patch hashes. The runtime is dependency-free; refresh it only
through a Foundry release after upstream tests, license review, dependency
audit, and review of relevant Node security advisories.
