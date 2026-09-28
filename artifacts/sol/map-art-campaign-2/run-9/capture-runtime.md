# Run 9 capture and gate environment

- Native Mac checkout, Node 26 via `/opt/homebrew/bin`; Vite port 5303 only.
- Existing Playwright Chromium, desktop 1280x800 and phone 390x844, DPR 1. No browser installation.
- `GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5303`, both projects, `--workers=1` for browser gates.
- Image analysis uses Python with Pillow and NumPy. This session's available interpreter was `/Users/robin/.hermes/hermes-agent/venv/bin/python3`; putting Homebrew first also changes `python3`, so set the Node PATH for Node calls rather than accidentally selecting a Python without those libraries.
- `prepare-map.py` freezes exact compiled Terrain3dClaimPilot/Water modules and baseline GLBs in ignored `_raw/run-9/<map>-before/`. Before-arm routes use those bytes; only matching Vite dependency optimizer URLs are refreshed. Changed contract JSON is also frozen explicitly. After-arm uses the actual current source/assets.
- Plain boards use ordinary HUD, no debug query/test hook, unchanged spawn and 10-second game clock. Frozen stations, body masks, persistent-HUD masks and crops are diagnostic evidence and labelled separately.
- Performance uses four fresh browser boots per arm/width in alternating order, 180 retained frame intervals per boot. No build or other browser gate runs during the final performance measurement.
- Native gravel source is preserved unedited. Blender only resamples its embedded panorama copy to the existing 2048-square texture contract; terrain sampling uses the native PNG.
- Source and asset changes are committed separately from game code/evidence. The engine pin belongs to the drain.
