# Art direction — desktop scale, ink motion

## Evidence

The root reviewer played the original [Xiao Xiao 9 on Stickpage](https://www.stickpage.com/xiao9play.shtml) and supplied an actual gameplay capture on 2026-09-07. The capture is retained outside this project and is not redistributed. The [creator's Newgrounds page](https://www.newgrounds.com/portal/view/65694) credits Zhu and identifies the work as Xiao Xiao 9. [Stickpage's introduction](https://www.stickpage.com/xiao9.shtml) also credits Zhu and describes a belt-scrolling style fight with a boss.

Six directly observed visual features:

1. The fight takes place on a **woodgrain computer desktop**, not an empty white arena.
2. A giant beige CRT fills the rear. Its screen shows a timeline/animation editing application, with little fighting figures inside the screen.
3. A large blue cup/speaker, little globe, mouse/cables and white keyboard establish that the fighters are tiny compared with ordinary desk props.
4. The player is black ink; opponents are saturated purple ink. Limbs bend and extend into readable leaning kicks rather than static V-shaped poses.
5. Yellow starburst impacts punctuate contact. The scene does not use permanent particles or a giant abstract glow.
6. Yellow/red health meters, score/time and enemy information sit along the top. The action floor remains open underneath.

## Committed visual decisions

- **Layout:** a single 16:9 game surface, desktop-era beveled playback chrome, compact yellow/red battle HUD. No anthology portal, feature-card landing page or common Rangers interface.
- **Color:** warm wood, gray-beige CRT, blue desk objects. Black player and purple opponents are intentional source-game grammar; pink beaks and a small ochre head ribbon mark the Flamingo parody. Purple is not used as a default website theme.
- **Typeface:** local Galmuri11 for Korean early-PC game text. The title's brush-like Chinese characters and the frame-editor window are scene-specific choices, not a modern marketing template.
- **Character construction:** eleven hand-authored body/limb joints; a curved flamingo neck and small hooked beak replace a generic circular stick head. Back limbs precede torso and front limbs. Ground shadows remain on the desk while the character jumps.
- **Motion:** discrete authored anticipation/contact/recovery keys, interpolated continuously. Attack windows follow those contact keys. The code has separate jab, cross, roundhouse, flying kick, guard, hit, down, rise and boss uppercut poses. No sprite ripped from the original is used.
- **Depth:** movement along two axes; attack requires matching depth, correct facing and physical range. Fighters render in depth order. The three areas are discrete desk arenas, not a claim that the full original scrolling map was reproduced.
- **Parody scope:** three new desk views, twelve opponents, a final guard, frame-editor mirror, guard/parry/counter mechanics and original timing. This is an adaptation of the visual/play language, not source-game emulation.

The unslop-ui skill was used to reject a generic fighting dashboard and lock the design to the observed desk scale, ink silhouettes and top-edge HUD. A regex scanner cannot evaluate animation or reference fidelity, so its score is not presented as a visual quality verdict.
