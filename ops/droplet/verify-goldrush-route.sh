#!/usr/bin/env bash
# Run on the droplet after nginx reload, BEFORE removing the Worker route.
# Requires bash, curl, node and permission to run nginx -t. No credentials.
set -u -o pipefail
failed=0
row() {
    printf '| %-4s | %-28s | %s |\n' "$1" "$2" "$3"
    if [[ $1 == FAIL ]]; then failed=1; fi
}
printf '| Result | Check                        | Detail |\n'
printf '| ------ | ---------------------------- | ------ |\n'
for tool in nginx curl node; do
    if ! command -v "$tool" >/dev/null; then
        row FAIL prerequisite "$tool is not in PATH"
        exit 1
    fi
done
if nginx -t; then row PASS 'nginx -t' 'configuration accepted'; else
    row FAIL 'nginx -t' 'stop before cutover'; exit 1
fi
# Port 80 is intentionally redirect-only. Never follow it through public DNS.
if headers=$(curl --noproxy '*' --connect-timeout 10 --max-time 30 -sSI -H 'Host: agenttown.app' http://127.0.0.1/goldrush/) &&
    [[ $headers =~ HTTP/[^[:space:]]+[[:space:]]301 ]] &&
    printf '%s\n' "$headers" | tr -d '\r' | grep -qi '^location: https://agenttown.app/goldrush/$'; then
    row PASS 'local HTTP' '301 to HTTPS (expected)'
else row FAIL 'local HTTP' 'expected 301 to https://agenttown.app/goldrush/'; fi
local_curl() {
    curl --noproxy '*' --resolve agenttown.app:443:127.0.0.1 --connect-timeout 10 --max-time 30 -sS "$@"
}
header() { printf '%s\n' "$headers" | tr -d '\r' | grep -i "^$1:"; }
head_ok() {
    headers=''
    headers=$(local_curl -I "https://agenttown.app$1") &&
        [[ $headers =~ HTTP/[^[:space:]]+[[:space:]]200 ]]
}
if head_ok /goldrush/ && header content-type | grep -qi 'text/html' &&
    header cache-control | grep -qi 'no-cache'; then
    row PASS '/goldrush/' '200 HTML; no-cache'
else row FAIL '/goldrush/' 'expected 200 HTML with no-cache'; fi
build_id() {
    node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const b=JSON.parse(s).build;if(typeof b!=="string"||!/^([a-f0-9]{7,40})$/.test(b))throw Error();process.stdout.write(b)}catch{process.exitCode=1}})'
}
local_build=''; pages_build=''
if head_ok /goldrush/version.json &&
    local_build=$(local_curl -f https://agenttown.app/goldrush/version.json | build_id) &&
    pages_build=$(curl --noproxy '*' --connect-timeout 10 --max-time 30 -fsS https://gold-rush-3in.pages.dev/version.json | build_id) &&
    [[ $local_build == "$pages_build" ]]; then
    row PASS '/goldrush/version.json' "200; live build $local_build matches Pages"
else row FAIL '/goldrush/version.json' "invalid or different build (local=$local_build Pages=$pages_build)"; fi
if head_ok /goldrush/skill.md && ! header content-type | grep -qi 'text/html'; then
    row PASS '/goldrush/skill.md' '200; not HTML fallback'
else row FAIL '/goldrush/skill.md' 'expected 200, not HTML'; fi
# Discover a hashed JS entry from the actual served HTML, never a stale filename.
asset=$(local_curl -f https://agenttown.app/goldrush/ | node -e '
let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
 const m=s.match(/\bsrc=["\x27](?:\.\/|\/goldrush\/|\/)?(assets\/[A-Za-z0-9_/-]+-[A-Za-z0-9_-]{6,}\.js)["\x27]/);
 if(!m){process.exitCode=1;return}process.stdout.write("/goldrush/"+m[1]);
})') || asset=''
if [[ -n $asset ]] && head_ok "$asset" &&
    header content-type | grep -Eqi '(javascript|ecmascript)' &&
    header cache-control | grep -qi 'immutable' &&
    ! header cache-control | grep -Eqi 'no-cache|no-store|private|max-age=0([,[:space:]]|$)'; then
    row PASS 'hashed JavaScript' "200 immutable; $asset"
else row FAIL 'hashed JavaScript' "expected JS + immutable without cache veto; asset=$asset"; fi
if head_ok /api/stats && header content-type | grep -qi 'application/json' &&
    local_curl -f https://agenttown.app/api/stats | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const v=JSON.parse(s);if(!v||typeof v!=="object"||v.error||v.ok===false)throw Error()}catch{process.exitCode=1}})'; then
    row PASS '/api/stats' '200 JSON; no reported error'
else row FAIL '/api/stats' 'expected healthy 200 JSON'; fi
exit "$failed"
