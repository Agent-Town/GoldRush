# Exact-base roster attribution

The roster batch has four passes and two failures: `e9-roster.spec.ts:184`, `plain Red Fields boot stays error-free without the debug harness`, on desktop and phone. Both expect `roster?.eraActive === true` and receive `false` during the ordinary Seed Run launch. This is the same profile/era activation fingerprint recorded on earlier E9 maps.

Both failures reproduce against this map's exact base: code `64c3661c60bd3d5b212efe36630f17507843ab79`, store `3c023c883f3d30179fbaef26a22629e31efe7df5`, engine `ba67e6db9a2d8b34e23fcb1bacdc4e00a8ce72e84c347d9d6bbf3f9975a5a66f`. Candidate files are restored byte-for-byte to engine `6b6c1185f0c23a0a2235502e69238db177900147ab630e66db1120c9cb30ada2`. [Receipt](base-roster.json). No gameplay, assertion or profile code was changed.

Own Devil's Alley relocation/plain boot and all SS-10 story checks pass **16/16**. Shared brightness/collision **16 pass / four opt-in skips**; census **4/4**. TypeScript, default/full builds, scoped render guards **34/34**, named guards **3/3**, loading **8/8**, repeat **2/2** and corrected dedicated six-cycle mount/dispose proof pass.
