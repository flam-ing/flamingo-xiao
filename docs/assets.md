# Asset ledger and prompt set

All assets referenced by the game are local. Original reference screenshots are outside the project. They were used for observation, **not** as edit inputs, textures or sprite sources.

| Path | Origin |
|---|---|
| `public/art/monitor-desk.png` | Built-in image generation, original empty desk/CRT illustration. The code draws its own moving frame editor into the blank screen. |
| `public/art/speaker-desk.png` | Built-in image generation, original speaker-and-cable desk corner. |
| `public/art/keyboard-desk.png` | Built-in image generation, original keyboard-end arena. |
| `src/poses.js` | Original joint coordinates, pose tracks, body strokes, S-curve neck, beak and accessories. No bitmap character sprites. |
| `src/draw.js` | Original HUD, frame-editor scene, shadows, impact bursts, labels and rendering order. |
| Galmuri11 | `galmuri@2.40.3` from the lockfile; only its WOFF2 is emitted in the browser build. [Official font source](https://github.com/quiple/galmuri). Original SIL OFL and copyright shipped in `public/licenses/Galmuri-OFL.txt`. |
| `docs/cpu-previews/` | Offline renders of the same game renderer and an explicit joint-track sheet. Not source-game images and not browser captures. |
| Sound | Short original synthesized oscillator impacts. No recording, music sample or external audio file. Off by default. |

All three raster assets were created through the **built-in image tool**, not the fallback CLI/API path, then copied into `public/art`. Final generation prompts are recorded below. There are no source-game logos, original named characters or extracted model files in the images.

## Monitor desk prompt

> Use case: stylized-concept. Asset type: original 2D beat-em-up game background, 1536×864 wide. Tiny fighter's eye view across a polished honey-brown WOODGRAIN COMPUTER DESKTOP in a 2001 home study. Giant beige CRT monitor centered in upper half, broad blank dark gray-green screen, molded curved plastic frame and round power button; oversized cobalt-blue plastic drinking cup and small colorful desk globe to left; beige computer speaker to right; white keyboard peeking along bottom right edge and coiled blue cable at far rear. Muted gray wall beyond. The entire LOWER 40% must be a CLEAR open wood desktop fighting floor with no obstacles or characters. Monitor base ends at 55% image height. Eye-height perspective looking slightly down on tabletop, not top-down. Original hand-painted early-2000s Flash mixed-media look: softly shaded detailed everyday props, actual woodgrain texture, no pixel art and no flat geometric placeholder. Clean silhouette separation. NO characters, no text, no logos, no interface labels, no watermark. This is an empty playable stage, not game screenshot. Warm table contrasted with blue cup and cool gray CRT.

## Speaker corner prompt

> Use case: stylized-concept. Asset type: original 2D beat-em-up game stage background, 16:9 wide. Tiny fighter's low eye view over a honey-brown WOODGRAIN COMPUTER DESKTOP, the cable-and-speaker corner of a 2001 home study. Massive black and beige stereo speakers at upper left with a round woofer, a blue ceramic cup with three pencils upper right, stacked plain floppy disks and a translucent green computer mouse along the back edge; thick audio and mouse wires curve between rear props. A small desk lamp casts a warm circle from upper right. Pale gray wall, soft morning light. All props occupy upper 55%; the LOWER 40% is clear empty polished wood floor for fighters with subtle grain and light reflection. The frontmost edge includes a narrow cable at bottom corners, never obstructing central playing floor. Detailed softly shaded early-2000s Flash mixed-media everyday props, hand-painted texture and grounded shadows. No fighters, no people, no text, no logos, no UI, no watermark. Not a room-wide view: desk objects are giant relative to tiny players. This is a different playable arena in the same warm wooden desk world.

## Keyboard arena prompt

> Use case: stylized-concept. Asset type: original 2D martial-arts beat-em-up final arena background, 16:9 wide. Tiny fighter eye view across a golden WOODGRAIN COMPUTER DESKTOP at night, in front of a gigantic late-1990s beige mechanical keyboard stretching across the UPPER HALF. Low desk perspective, not a top-down view. Oversized raised ivory keys with NO letters or symbols, coiled cream cable, a small silver desk clock at upper right, tall stack of worn sketchbooks at upper left. Warm tungsten desk light and faint cool monitor light create dimension. Middle-to-lower 45% is CLEAR empty polished wood fight floor, subtle desk edge strip at the very bottom. Detailed hand-painted mixed-media early Flash background, realistic materials softened into illustration, grounded shadows and visible wood grain. All props are large relative to tiny stick fighters. No characters, no people, no brand names, no logos, no visible writing, no HUD, no watermark. Cohesive warm 2001 computer-desktop world.

The requested image dimensions were prompt guidance; the selected native outputs are 1672×941 and are displayed at the game's 1200×675 stage aspect. No claim is made that the generator returned the exact prompted pixel dimensions.
