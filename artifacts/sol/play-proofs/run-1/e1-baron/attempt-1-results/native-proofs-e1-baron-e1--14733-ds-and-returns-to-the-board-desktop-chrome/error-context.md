# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e1-baron.spec.ts >> e1-baron plays to its secure wave, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:501:5

# Error details

```
TimeoutError: locator.click: Timeout 2000ms exceeded.
Call log:
  - waiting for getByTestId('hud-build-tile-sentry_beacon')
    - locator resolved to <button type="button" role="menuitem" data-selected="false" data-asset-state="ready" data-icon-slug="sentry-beacon" data-buildable-id="sentry_beacon" data-slot="ui.build.icon.sentry_beacon" data-testid="hud-build-tile-sentry_beacon" class="hud-build-tile hud-build-tile--icon" title="Lights the dark and slows what it touches; radius 8wu.">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <section aria-hidden="false" data-testid="upgrade-overlay" aria-label="Patent Office choices" class="upgrade-overlay upgrade-overlay--visible">…</section> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <section aria-hidden="false" data-testid="upgrade-overlay" aria-label="Patent Office choices" class="upgrade-overlay upgrade-overlay--visible">…</section> intercepts pointer events
    - retrying click action
      - waiting 100ms
    4 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <section aria-hidden="false" data-testid="upgrade-overlay" aria-label="Patent Office choices" class="upgrade-overlay upgrade-overlay--visible">…</section> intercepts pointer events
    - retrying click action
      - waiting 500ms

```

```
Error: apiRequestContext._wrapApiCall: file data stream has unexpected number of bytes
```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic "Playable Three.js game canvas" [ref=e3]
  - generic:
    - generic "Wave status":
      - generic:
        - generic: Stake lights on the south bank!
    - region "Run vitals":
      - generic:
        - generic: HP
        - strong: 99 / 100
      - generic:
        - generic: Time
        - strong: 01:21
      - generic:
        - generic: Wave
        - strong: "3"
    - region "Gold pouch":
      - generic: Gold
      - strong: "25"
    - region "Active weapon":
      - generic: Weapon
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
        - generic [ref=e5]:
          - generic [ref=e6]: the Prospector
          - strong [ref=e7]: L3
          - generic [ref=e8]: autonomous-within-budget
        - generic [ref=e9]: 01:21 - Gathered 4 XP
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "5"
        - strong: 0 / 44 XP
    - region "Build":
      - generic [ref=e10]:
        - generic [ref=e11]:
          - status [ref=e12]:
            - strong [ref=e13]: Signal Turret
            - generic [ref=e14]: "Spark bolts, line-of-sight, 16wu range. T1: 52 damage at 1.1/s"
          - menuitem "1 Sentry Beacon 0/6 - 25g" [ref=e15]:
            - generic [ref=e17]:
              - text: "1"
              - generic [ref=e18]: Sentry Beacon
              - text: 0/6 - 25g
          - 'menuitem "2 Palisade 0/48 - 0g Palisade kit: 8 free" [ref=e19]':
            - generic [ref=e21]:
              - text: "2"
              - generic [ref=e22]: Palisade
              - generic [ref=e23]:
                - text: 0/48 - 0g
                - text: "Palisade kit: 8 free"
          - menuitem "3 Sluice Works 0/3 - 40g" [disabled] [ref=e24]:
            - generic [ref=e26]:
              - text: "3"
              - generic [ref=e27]: Sluice Works
              - text: 0/3 - 40g
          - menuitem "4 Stockpile Yard 0/2 - 60g" [disabled] [ref=e28]:
            - generic [ref=e30]:
              - text: "4"
              - generic [ref=e31]: Stockpile Yard
              - text: 0/2 - 60g
          - menuitem "5 Signal Turret 1/4 - 70g" [disabled] [ref=e32]:
            - generic [ref=e34]:
              - text: "5"
              - generic [ref=e35]: Signal Turret
              - text: 1/4 - 70g
          - menuitem "6 Assay Office 0/1 - 80g" [disabled] [ref=e36]:
            - generic [ref=e38]:
              - text: "6"
              - generic [ref=e39]: Assay Office
              - text: 0/1 - 80g
        - button "Build - Close" [expanded] [pressed] [ref=e40]
    - button "Pause the claim" [ref=e41]: P - catch your breath
  - region
  - region "Patent Office choices" [ref=e42]:
    - generic [ref=e43]:
      - paragraph [ref=e44]: Patent Office
      - heading "Choose an Invention" [level=1] [ref=e45]
      - paragraph [ref=e46]: First invention files automatically in 14s
      - generic [ref=e47]:
        - button "1 Spring Heels +12% move speed 1 mobility family stacks" [active] [ref=e48] [cursor=pointer]:
          - generic [ref=e49]: "1"
          - generic [ref=e50]: Spring Heels
          - generic [ref=e51]: +12% move speed
          - generic "1 mobility family stacks" [ref=e52]: I
        - button "2 Split Spark +1 spark per volley" [ref=e53] [cursor=pointer]:
          - generic [ref=e54]: "2"
          - generic [ref=e55]: Split Spark
          - generic [ref=e56]: +1 spark per volley
        - button "3 Double-Tap Coil +25% fire rate 2 firerate family stacks" [ref=e57] [cursor=pointer]:
          - generic [ref=e58]: "3"
          - generic [ref=e59]: Double-Tap Coil
          - generic [ref=e60]: +25% fire rate
          - generic "2 firerate family stacks" [ref=e61]: II
```