# Playtester Defect Observations

None observed. The claim was secured successfully on the first run.

**Key findings from development (not defects):**
1. Build origin is the PROSPECTOR, not the hero — buildings must be within 6wu of prospector position.
2. HARVEST walks the prospector to the seam; if BUILD comes after HARVEST in the order array, the prospector has already left center and BUILD fails with "out_of_zone".
3. Solution: submit BUILD orders BEFORE HARVEST orders in the array.
4. Each HARVEST yields 5g per tick; stacking 6 HARVESTs per seam depletes the 30g capacity.
5. First submission (wave 0) should be all HARVESTs + HOLD to build initial capital without interference.