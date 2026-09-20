#!/bin/zsh
cd "/Users/robin/Claude/Projects/Gold Rush" || exit 1
S=/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/portraits
ANCHOR='Gold Rush townsfolk portrait, engraved-sepia plate hand: warm etched bust on NEUTRAL AGED PARCHMENT ground, shoulders-up, no letters, no gore, reads at 120px.'
BACK='The background is plain aged parchment paper filling the whole frame, warm honey-tan sepia like sun-aged survey-map paper, uniformly warm with no cool greys and no white; no sky, no sea, no coloured light spill, no scene behind the figure; the era lives only in the clothing, tools and the light on the face. Fine sepia engraved linework and hatching, muted warm colors, illustrated, not photoreal; warm, never grim; no firearms, no letters, no numbers, no logos.'
TEA='Warm sepia and ochre only; the paper behind the figure is the colour of weak tea.'
LOG=$S/batch.log
while IFS=$'\t' read -r slug role; do
  [ -z "$slug" ] && continue
  if [ -f "assets/raw/$slug.png" ]; then echo "$slug already present, skip" >> $LOG; continue; fi
  for attempt in 1 2 3 4 5 6 7 8 9 10; do
    P="$ANCHOR $BACK $role $TEA"
    higgsfield generate create gpt_image_2 --prompt "$P" --aspect_ratio 1:1 --resolution 1k --quality high --wait > $S/$slug.attempt$attempt.out 2>&1
    U=$(grep -oE "https://[^ \"']+\.png[^ \"']*" $S/$slug.attempt$attempt.out | head -1)
    if [ -z "$U" ]; then echo "$slug attempt $attempt: no url ($(head -c 120 $S/$slug.attempt$attempt.out | tr '\n' ' '))" >> $LOG; continue; fi
    F=$S/$slug.attempt$attempt.png; curl -sL "$U" -o "$F"
    STAT=$(/opt/homebrew/bin/node -e 'const s=require("sharp");(async()=>{const f=process.argv[1];const {data,info}=await s(f).raw().toBuffer({resolveWithObject:true});const w=info.width,ch=info.channels;const st=(x0,y0)=>{let r=0,b=0,n=0;for(let y=y0;y<y0+60;y++)for(let x=x0;x<x0+60;x++){const i=(y*w+x)*ch;r+=data[i];b+=data[i+2];n++}return (r-b)/n};const tl=st(0,0),tr=st(w-60,0);const mean=(tl+tr)/2;const ok=tl>120&&tr>120&&mean>=124&&mean<=145;console.log(`${info.width}x${info.height} ${info.channels}ch TL ${tl.toFixed(1)} TR ${tr.toFixed(1)} mean ${mean.toFixed(1)} ${ok?"IN-BAND":"retake"}`)})()' "$F" 2>&1)
    echo "$slug attempt $attempt: $STAT" >> $LOG
    case "$STAT" in *IN-BAND*) cp "$F" "assets/raw/$slug.png"; echo "$slug KEPT attempt $attempt -> assets/raw/$slug.png" >> $LOG; break;; esac
  done
done < $S/roles.tsv
echo "=== batch done $(date -u +%H:%M:%SZ) ===" >> $LOG
higgsfield account status 2>&1 | grep -oE "[0-9.]+ credits" >> $LOG
