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

code() { curl -so /dev/null -m 12 -w '%{http_code}' "$1" 2>/dev/null || echo 000; }
# Three probes, three failure domains: landing (this box's nginx static), game
# (Cloudflare edge worker -> pages.dev), api (this box's nginx -> ledger/forward).
L=$(code https://agenttown.app/)
G=$(code https://agenttown.app/goldrush/)
A=$(code https://agenttown.app/api/stats)
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
BAD=""
{ [ "$L" = 200 ] && [ "$G" = 200 ] && [ "$A" = 200 ] && [ -z "$SVC_BAD" ]; } || BAD=1
[ "${DISK:-0}" -ge 95 ] && BAD=1

send_mail() { # $1 subject, $2 body — plain text, no user input, no quotes in EDGE
  [ -n "${RESEND_API_KEY:-}" ] || { echo "no RESEND_API_KEY; alert not sent: $1"; return 1; }
  curl -sS -m 15 https://api.resend.com/emails \
    -H "authorization: Bearer $RESEND_API_KEY" -H 'content-type: application/json' \
    -d "$(printf '{"from":"%s","to":["%s"],"subject":"%s","text":"%s"}' "$ALERT_FROM" "$ALERT_TO" "$1" "$2")" >/dev/null 2>&1
}

N=$(cat "$STATE" 2>/dev/null || echo 0)
case "$N" in (*[!0-9]*|'') N=0;; esac
if [ -n "$BAD" ]; then
  N=$((N + 1))
  if [ "$N" -eq 1 ] || [ $((N % 12)) -eq 0 ]; then
    send_mail "agenttown.app watch: DARK ($EDGE)" \
      "Probe: $EDGE\n${HEALED:+Self-heal: $HEALED\n}Runbook F-OUT-0829: ssh the box; systemctl status nginx goldrush-ledger goldrush-assay; journalctl -u nginx -n 30. This alert re-rings hourly while the condition persists; a recovery mail follows when it clears."
  fi
else
  [ "$N" -gt 0 ] && send_mail "agenttown.app watch: recovered ($EDGE)" "All probes green again. $EDGE"
  N=0
fi
echo "$N" > "$STATE"
echo "$(date -u +%FT%TZ) $EDGE bad=${BAD:-0} n=$N${HEALED:+ healed: $HEALED}"
