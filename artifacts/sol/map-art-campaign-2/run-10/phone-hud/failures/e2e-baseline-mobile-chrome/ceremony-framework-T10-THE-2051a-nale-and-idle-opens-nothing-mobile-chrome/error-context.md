# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ceremony-framework.spec.ts >> T10 THE CHARTER PRESS: the E10 science ceiling opens the existing River finale and idle opens nothing
- Location: e2e/ceremony-framework.spec.ts:777:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByTestId('open-charter-press-site')
Expected: 0
Received: 1
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for getByTestId('open-charter-press-site')
    14 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic "Playable Three.js game canvas" [ref=e3]
  - region "Town square":
    - generic:
      - generic:
        - strong: Quartz Hill
      - generic [ref=e6]:
        - group [ref=e7]:
          - generic "Settings" [ref=e8] [cursor=pointer]
        - button "Exit" [ref=e9] [cursor=pointer]
    - status [ref=e10]:
      - text: The Charter Press is ready.
      - button "Enter the Charter Press" [ref=e11] [cursor=pointer]
```

# Test source

```ts
  722 | 
  723 |   const hand = page.getByTestId('ceremony-hand-input');
  724 |   await hand.dispatchEvent('pointerdown');
  725 |   await expect
  726 |     .poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 20_000, message: 'the tree seed never reached the Ark' })
  727 |     .not.toBe('carry-tree-seed');
  728 |   await hand.dispatchEvent('pointerup');
  729 |   await expect.poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 20_000 }).toBe('done');
  730 |   await shot(page, info, 't9-done');
  731 | 
  732 |   const done = await ceremonyDiagnostics(page);
  733 |   expect(done?.beats).toEqual(
  734 |     expect.arrayContaining(['t9-canals-running', 't9-departure-horn', 't9-ramps-close', 't9-the-generation-ark:kept-image']),
  735 |   );
  736 |   expect(done?.keptImage).toMatchObject({ captured: true, stored: true });
  737 |   expect(done?.armCount).toBe(1);
  738 |   expect(done?.armedEpochId).toBe(E10);
  739 |   expect(done?.armFailure).toBeNull();
  740 | 
  741 |   const keptImage = await page.evaluate(
  742 |     (key) => JSON.parse(localStorage.getItem(key) ?? 'null'),
  743 |     ceremonyKeptImageKey('t9-the-generation-ark'),
  744 |   );
  745 |   expect(keptImage).toMatchObject({
  746 |     version: 1,
  747 |     ceremonyId: 't9-the-generation-ark',
  748 |     epochId: E9,
  749 |     successorId: E10,
  750 |     caption: 'From the ramp: the basin green, the Digger working, one old man waving with a stopped watch in his other hand.',
  751 |     stored: true,
  752 |   });
  753 |   expect(keptImage.dataUrl).toMatch(/^data:image\/png/);
  754 | 
  755 |   expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(E10);
  756 |   expect(await page.evaluate((key) => localStorage.getItem(key), EPOCH_CEREMONY_KEY)).toBe(E10);
  757 |   expect(
  758 |     await page.evaluate(async (epoch) => {
  759 |       const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
  760 |       return registry.activateEpoch(epoch);
  761 |     }, E10),
  762 |   ).toBe(false);
  763 | 
  764 |   await page.reload();
  765 |   await expect(page.getByTestId('start-menu-enter-town')).toBeVisible();
  766 |   expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(E10);
  767 |   expect(await page.evaluate((key) => localStorage.getItem(key), EPOCH_CEREMONY_KEY)).toBe(E10);
  768 |   expect(
  769 |     await page.evaluate(async (epoch) => {
  770 |       const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
  771 |       return { active: registry.activeEpochId(), unlocked: registry.epochIsActive(epoch) };
  772 |     }, E10),
  773 |   ).toEqual({ active: E10, unlocked: true });
  774 |   expect(errors).toEqual({ console: [], page: [] });
  775 | });
  776 | 
  777 | test('T10 THE CHARTER PRESS: the E10 science ceiling opens the existing River finale and idle opens nothing', async ({ page }, info) => {
  778 |   test.setTimeout(120_000);
  779 |   const errors = watchErrors(page);
  780 |   await seed(page, { epochId: E10, scienceSteps: 23 });
  781 |   await openSchoolhouse(page);
  782 | 
  783 |   const door = page.getByTestId('t10-charter-press-door');
  784 |   await expect(door).toHaveAttribute('data-door-state', 'needs-science');
  785 |   await expect(door).toContainText('1 more science');
  786 |   await expect(page.getByTestId('open-charter-press')).toHaveCount(0);
  787 |   await page.waitForTimeout(1_000);
  788 |   await expect(page.getByTestId('e10-finale-layer')).toHaveCount(0);
  789 |   expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(E10);
  790 | 
  791 |   await page.evaluate(
  792 |     ({ key }) => {
  793 |       const state = JSON.parse(localStorage.getItem(key) ?? '{}');
  794 |       localStorage.setItem(key, JSON.stringify({ ...state, steps: 24 }));
  795 |     },
  796 |     { key: profileDataKey('robin', researchStateKey(E10)) },
  797 |   );
  798 |   await page.reload();
  799 |   await openSchoolhouse(page);
  800 |   await expect(door).toHaveAttribute('data-door-state', 'needs-research');
  801 |   await expect(page.getByTestId('open-charter-press')).toHaveCount(0);
  802 | 
  803 |   await page.evaluate(
  804 |     ({ key }) => {
  805 |       const state = JSON.parse(localStorage.getItem(key) ?? '{}');
  806 |       localStorage.setItem(key, JSON.stringify({ ...state, taken: ['charter_press'] }));
  807 |     },
  808 |     { key: profileDataKey('robin', researchStateKey(E10)) },
  809 |   );
  810 |   await page.reload();
  811 |   await openSchoolhouse(page);
  812 |   await expect(door).toHaveAttribute('data-door-state', 'ceremony-ready');
  813 |   await expect(page.getByTestId('epoch-megaproject-door')).toHaveCount(0);
  814 |   await shot(page, info, 't10-door-ready');
  815 | 
  816 |   await page.getByTestId('schoolhouse-close').click();
  817 |   await page.getByTestId('town-exit').click();
  818 |   await page.evaluate(() => history.replaceState(null, '', '/?terrain2d'));
  819 |   await page.getByTestId('start-menu-enter-town').click();
  820 |   await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  821 |   await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.teleport(13.6, 5.3));
> 822 |   await expect(page.getByTestId('open-charter-press-site')).toHaveCount(0);
      |                                                             ^ Error: expect(locator).toHaveCount(expected) failed
  823 | 
  824 |   await page.getByTestId('town-exit').click();
  825 |   await page.evaluate(() => history.replaceState(null, '', '/'));
  826 |   await page.getByTestId('start-menu-enter-town').click();
  827 |   await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  828 |   await page.waitForFunction(() => document.querySelector('canvas')?.dataset.town3dEraPropIds?.split(',').includes('e10-charter-press-northeast'), null, {
  829 |     timeout: 30_000,
  830 |   });
  831 |   await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.teleport(13.6, 5.3));
  832 |   await expect(page.getByTestId('open-charter-press-site')).toBeVisible();
  833 |   await page.evaluate(async () => {
  834 |     const { Balance } = (await Function('return import("/src/game/Balance.ts")')()) as typeof import('../src/game/Balance');
  835 |     const finale = Balance.e10Finale as { reinkSeconds: number; offerDelaySeconds: number };
  836 |     finale.reinkSeconds = 0.05;
  837 |     finale.offerDelaySeconds = 0;
  838 |   });
  839 |   const playerBeforeFinale = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.player);
  840 |   await page.getByTestId('open-charter-press-site').click();
  841 |   await expect(page.getByTestId('e10-finale-layer')).toContainText('THE RE-INKING');
  842 |   await expect(page.getByTestId('e10-river-lever')).toBeVisible();
  843 |   await page.keyboard.down('KeyA');
  844 |   await page.waitForTimeout(300);
  845 |   await page.keyboard.up('KeyA');
  846 |   expect(await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.player)).toEqual(playerBeforeFinale);
  847 |   await page.keyboard.press('Escape');
  848 |   await expect(page.getByTestId('e10-river-lever')).toBeVisible();
  849 |   await shot(page, info, 't10-four-hands-one-lever');
  850 |   expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(E10);
  851 | 
  852 |   await page.getByTestId('e10-river-lever').click();
  853 |   await page.waitForURL((url) => url.searchParams.get('contract') === 'the-claim' && url.searchParams.has('nowaves'));
  854 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  855 |   await expect(page.getByTestId('contract-briefing-name')).toHaveText('The River');
  856 |   expect(errors).toEqual({ console: [], page: [] });
  857 | });
  858 | 
  859 | test('the ceremony can be stepped out of before arming and replayed — the door is derived, never consumed', async ({ page }) => {
  860 |   test.setTimeout(90_000);
  861 |   const errors = watchErrors(page);
  862 |   await seed(page, { epochId: E4, scienceSteps: 12, completeMegaproject: 'the-boat' });
  863 |   await openSchoolhouse(page);
  864 |   await page.getByTestId('begin-ceremony').click();
  865 |   await expect(page.getByTestId('ceremony-layer')).toBeVisible();
  866 |   await page.getByTestId('ceremony-leave').click();
  867 |   await expect(page.getByTestId('ceremony-layer')).toBeHidden();
  868 |   expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(E4);
  869 |   expect((await ceremonyDiagnostics(page))?.armCount).toBe(0);
  870 | 
  871 |   // The door still stands; the ceremony replays from the top. The player is
  872 |   // still in the town beside the schoolhouse — reopen it where they stand.
  873 |   await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('schoolhouse');
  874 |   await page.getByTestId('town-open-schoolhouse').click();
  875 |   await expect(page.getByTestId('ceremony-epoch-door')).toHaveAttribute('data-door-state', 'ceremony-ready');
  876 |   await page.getByTestId('begin-ceremony').click();
  877 |   await expect(page.getByTestId('ceremony-layer')).toBeVisible();
  878 |   await expect.poll(async () => (await ceremonyDiagnostics(page))?.phase, { timeout: 5_000 }).toBe('haul');
  879 |   expect(errors).toEqual({ console: [], page: [] });
  880 | });
  881 | 
  882 | test('the T4 door reports missing science below the ceiling', async ({ page }) => {
  883 |   const errors = watchErrors(page);
  884 |   await seed(page, { epochId: E4, scienceSteps: 11, completeMegaproject: 'the-boat' });
  885 |   await openSchoolhouse(page);
  886 |   const door = page.getByTestId('ceremony-epoch-door');
  887 |   await expect(door).toHaveAttribute('data-door-state', 'needs-science');
  888 |   await expect(door).toContainText('1 more science');
  889 |   await expect(page.getByTestId('begin-ceremony')).toHaveCount(0);
  890 |   expect(errors).toEqual({ console: [], page: [] });
  891 | });
  892 | 
```