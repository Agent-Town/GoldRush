#!/usr/bin/env bash
# goldrush-edge-watch — the box watches its own public door (F-OUT-0829 follow-up).
# Owner, 2026-08-29, verbatim: "I am not sure this machine here will be available
# forever to check on things. We have a server, I think that should do this work.
# If that is down, we are screwed anyways." — so the authoritative watch lives HERE,
# not on the Mac. The residual risk (the box itself dying) is owner-accepted; the
# class this closes is a dead or misconfigured SERVICE on a healthy box, which the
# box can both detect and repair — exactly the F-OUT-0829 shape (nginx dead 2d18h).
#
# Runs every 5 min via goldrush-edge-watch.timer. Alerts by email through the same
# Resend account the ledger uses for login codes (RESEND_API_KEY, /etc/goldrush-ledger.env).
# Edge-triggered: one mail on the DOWN edge, a re-ring every ~1h while dark
# (12 passes x 5 min), one mail on recovery. State survives in /var/lib.
set -u
STATE_DIR=/var/lib/goldrush-edge-watch
mkdir -p "$STATE_DIR"
STATE="$STATE_DIR/state"
[ -n "${RESEND_API_KEY:-}" ] || . /etc/goldrush-ledger.env 2>/dev/null || true
# F-MAIL-0829 RESOLVED 2026-08-29: the owner verified agenttown.app in Resend
# (Cloudflare records auto-added), and `claim@agenttown.app` sends again — proven
# by mail id a51cf4da the moment verification landed. This same verification
# restored the game's sign-in code emails. Interim test-sender routing retired.
ALERT_TO="<owner-email>"
ALERT_FROM="Gold Rush <claim@agenttown.app>"

# F-2355-1: `curl -w '%{http_code}' ... || echo 000` CONCATENATES, it does not
# substitute. -w has already written the code to stdout by the time curl's exit
# status is known, so a request that receives a status and THEN fails mid-transfer
# captures both and yields an undocumented composite like `200000` — which line 45
# below read as "not 200" and mailed the owner as DARK, for a door that answered.
# Measured s2355 on the Mac against the live door; the rate from THIS box is
# unmeasured, but any nonzero rate mails a false outage on a 5-minute timer.
code() {  # -> 200 | 2xx-slow (answered, transfer missed the budget) | <code> | 000
  local c rc
  c=$(curl -so /dev/null -m 12 -w '%{http_code}' "$1" 2>/dev/null); rc=$?
  [ -n "$c" ] || c=000
  if [ "$rc" -eq 0 ]; then echo "$c"; return; fi
  case "$c" in
    2??) echo "$c-slow" ;;
    *)   echo "$c" ;;
  esac
}
# Three probes, three failure domains: landing (this box's nginx static), game
# (Cloudflare edge worker -> pages.dev), api (this box's nginx -> ledger/forward).
L=$(code https://agenttown.app/)
G=$(code https://agenttown.app/goldrush/)
A=$(code https://agenttown.app/api/stats)
DARK=""; SLOW=""
for v in "$L" "$G" "$A"; do
  case "$v" in
    200)    ;;
    *-slow) SLOW=1 ;;
    *)      DARK=1 ;;
  esac
done
SVC_BAD=""
for s in nginx goldrush-ledger goldrush-assay; do
  systemctl is-active --quiet "$s" || SVC_BAD="$SVC_BAD $s"
done
# The one self-heal: a dead nginx on a healthy box. Idempotent; the systemd
# Restart=on-failure drop-in usually beats this to it, this is the belt to that brace.
HEALED=""
if echo "$SVC_BAD" | grep -q nginx; then
  systemctl start nginx 2>/dev/null && HEALED="nginx started by edge-watch" || HEALED="nginx START FAILED"
fi
DISK=$(df --output=pcent / 2>/dev/null | tail -1 | tr -dc 0-9)
EDGE="landing=$L game=$G api=$A svc=${SVC_BAD:-ok} disk=${DISK:-?}%"
# F-2355-1: a dead service, a full disk and a non-200 door are all DARK and page
# at once, exactly as before. A door that answered 200 and then missed the
# transfer budget is degraded, not down, and pages only once it has persisted
# (see the mail policy below) — an outage alarm that cries wolf on ordinary
# transient slowness is one nobody reads by the time it matters (F-1460-1).
[ -n "$SVC_BAD" ] && DARK=1
[ "${DISK:-0}" -ge 95 ] && DARK=1
BAD=""
{ [ -z "$DARK" ] && [ -z "$SLOW" ]; } || BAD=1

send_mail() { # $1 subject, $2 body — plain text, no user input, no quotes in EDGE
  [ -n "${RESEND_API_KEY:-}" ] || { echo "no RESEND_API_KEY; alert not sent: $1"; return 1; }
  curl -sS -m 15 https://api.resend.com/emails \
    -H "authorization: Bearer $RESEND_API_KEY" -H 'content-type: application/json' \
    -d "$(printf '{"from":"%s","to":["%s"],"subject":"%s","text":"%s"}' "$ALERT_FROM" "$ALERT_TO" "$1" "$2")" >/dev/null 2>&1
}

# F-2356-1: DARK and SLOW need SEPARATE CLOCKS. F-2355-1 split the branches and
# the mails but left ONE counter, incremented BEFORE the branch is chosen — so a
# dark door inherited the slow condition's banked passes and `[ N -eq 1 ]` could
# not fire. This box is the worse of the two watchers because it is the one that
# MAILS: measured s2356, one slow pass then dark = 50 min of silence, two = 45,
# on a genuinely dark public door. `load -> slow -> down` is the ordinary way a
# box fails, so this is the likely sequence, not an exotic one. Per-condition
# clocks make every transition start at 1 and page at once, as the comment above
# already promises. State is now two fields, "<dark> <slow>"; anything else —
# including a single-number file written by the previous revision — resets to
# 0 0, which fails toward paging.
DARKN=0
SLOWN=0
STATE_RAW=$(cat "$STATE" 2>/dev/null || echo '')
case "$STATE_RAW" in
  *[!0-9\ ]*|'') ;;                       # non-numeric or empty: keep 0 0
  *)
    set -- $STATE_RAW
    if [ $# -eq 2 ]; then DARKN=$1; SLOWN=$2; fi
    ;;
esac
if [ -n "$BAD" ]; then
  if [ -n "$DARK" ]; then
    DARKN=$((DARKN + 1)); SLOWN=0
    if [ "$DARKN" -eq 1 ] || [ $((DARKN % 12)) -eq 0 ]; then
      send_mail "agenttown.app watch: DARK ($EDGE)" \
        "Probe: $EDGE\n${HEALED:+Self-heal: $HEALED\n}Runbook F-OUT-0829: ssh the box; systemctl status nginx goldrush-ledger goldrush-assay; journalctl -u nginx -n 30. This alert re-rings hourly while the condition persists; a recovery mail follows when it clears."
    fi
  else
    SLOWN=$((SLOWN + 1)); DARKN=0
    if [ "$SLOWN" -eq 3 ] || [ $((SLOWN % 12)) -eq 0 ]; then
      send_mail "agenttown.app watch: SLOW ($EDGE)" \
        "Probe: $EDGE\nThe door ANSWERED but the transfer missed the budget on $SLOWN consecutive passes (~$((SLOWN * 5)) min). This is degradation, not an outage — check droplet load and nginx worker saturation before reaching for the F-OUT-0829 runbook. A recovery mail follows when it clears."
    fi
  fi
else
  # Recover only from an episode that actually mailed: dark mails on pass 1, slow
  # on pass 3. Without this an unalarmed one-pass slow blip still sends an
  # all-clear for an alert the owner never got.
  if [ "$DARKN" -gt 0 ] || [ "$SLOWN" -ge 3 ]; then
    send_mail "agenttown.app watch: recovered ($EDGE)" "All probes green again. $EDGE"
  fi
  DARKN=0; SLOWN=0
fi
echo "$DARKN $SLOWN" > "$STATE"
echo "$(date -u +%FT%TZ) $EDGE bad=${BAD:-0} dark=$DARKN slow=$SLOWN${HEALED:+ healed: $HEALED}"
