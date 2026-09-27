# CaseGrid Visual Assets & Art Direction Specification

This document provides the complete, authoritative inventory and art direction guide for all visual assets in CaseGrid.

This specification tracks the replacement of the original initials badges, emoji glyphs, and CSS outlines with original SVG artwork. The first delivery includes shared brand and gameplay assets, all 20 environmental object types, and all six Case 001 portraits. The second delivery adds all 26 portraits for Cases 002–005. Portraits for Cases 006–020 and scene textures remain pending.

---

## Delivery status — 2026-09-27

- [x] 6 brand assets: wordmark, compact mark, favicon, closed seal, accused emblem, solved star.
- [x] 10 gameplay assets integrated: exclusions, active/selected cell frames, clue notes, conflict shield, timer, mistakes, restart, back.
- [x] `icon-hint.svg` artwork created; reserved and **not shown** because the game has no hint feature.
- [x] All 20 environmental object illustrations integrated by object type across the catalog.
- [x] All 6 Case 001 portraits integrated in the character tray, occupied cells, and accusation choices.
- [x] All 26 Case 002–005 portraits integrated in the character tray, occupied cells, and accusation choices.
- [ ] Case 006–020 portraits.
- [ ] All 10 scene/background textures.

**69 distinct assets created, 68 integrated.** SVGs live under `apps/web/public/assets/`, with portraits in `characters/case-001/` through `characters/case-005/`; the favicon is also copied to `apps/web/public/favicon.svg`. All are original, editable vector artwork. Lettering in the logo and seal is outlined and requires no font download.

Portraits use the existing optional `Character.avatar` field in puzzle JSON, with case-specific paths such as `/assets/characters/case-001/avatar-beatrice.svg`. IDs repeat across cases: Beatrice Finch's portrait must never become Sister Beatrice's portrait. Missing or failed portrait images retain initials; object and character names remain readable control labels. Puzzle rules and saved progress formats are unchanged.

The [Cases 002–005 portrait review sheet](art/portraits-cases-002-005.png) shows the new cast at 112 px and 32 px; [portrait direction](art/portrait-direction.md) records the visual approach. These 26 SVGs total about 80 KiB uncompressed and load only when their case is opened.

**Table legend:** ✓ Done = created and integrated; ✓ Created = artwork available but unused; unmarked = pending.

---

## Table of Contents

1. [Art Direction & Design System](#1-art-direction--design-system)
2. [Brand & Global UI Assets](#2-brand--global-ui-assets)
3. [Gameplay Placeholders & Board Elements](#3-gameplay-placeholders--board-elements)
4. [Environmental Objects (Blocked Cell Tokens)](#4-environmental-objects-blocked-cell-tokens)
5. [Character Portrait Avatars (Cases 1–20)](#5-character-portrait-avatars-cases-120)
   - [Case 1: The Rosewood Parlor](#case-001-the-rosewood-parlor)
   - [Case 2: The Grand Antiquary](#case-002-the-grand-antiquary)
   - [Case 3: The Midnight Express](#case-003-the-midnight-express)
   - [Case 4: The Saltmarsh Beacon](#case-004-the-saltmarsh-beacon)
   - [Case 5: The Blackwood Playhouse](#case-005-the-blackwood-playhouse)
   - [Case 6: The Whispering Cloister](#case-006-the-whispering-cloister)
   - [Case 7: The Botanical Conservatory](#case-007-the-botanical-conservatory)
   - [Case 8: The Gilded Casino](#case-008-the-gilded-casino)
   - [Case 9: The Clockwork Workshop](#case-009-the-clockwork-workshop)
   - [Case 10: The Nile Steamer](#case-010-the-nile-steamer)
   - [Case 11: The Alchemist's Laboratory](#case-011-the-alchemists-laboratory)
   - [Case 12: The Imperial Opera House](#case-012-the-imperial-opera-house)
   - [Case 13: The Highclere Observatory](#case-013-the-highclere-observatory)
   - [Case 14: The Sunken Galleon Salvage](#case-014-the-sunken-galleon-salvage)
   - [Case 15: The Royal Antiquities Vault](#case-015-the-royal-antiquities-vault)
   - [Case 16: The Venice Masquerade](#case-016-the-venice-masquerade)
   - [Case 17: The Fogbound Depot](#case-017-the-fogbound-depot)
   - [Case 18: The High-Alpine Sanitarium](#case-018-the-high-alpine-sanitarium)
   - [Case 19: The Sovereign Airship](#case-019-the-sovereign-airship)
   - [Case 20: The Obsidian Citadel](#case-020-the-obsidian-citadel)
6. [Scene & Background Textures](#6-scene--background-textures)
7. [Code Component Replacement Mapping](#7-code-component-replacement-mapping)

---

## 1. Art Direction & Design System

CaseGrid embraces a **warm, tactile, editorial mystery-board aesthetic**. It should evoke classic mid-20th century investigative deduction, vintage architectural blueprints, high-grade linen board games, and bespoke printing press stationery.

### Aesthetic Principles
- **No Generic SaaS Look**: Avoid sterile card-dashboards, glassmorphism, floating blur drops, or cold blue tech gradients.
- **No Dark Horror/Gore**: Keep the tone intellectual, literary, and intriguing—focused on clues, character tension, and deduction rather than macabre violence.
- **Physicality & Tactility**: Assets should feel like wooden or enameled game tokens, archival ink prints, stamped wax seals, and textured paper dossiers.

### Core Color Palette Reference
| Role | Color Name | Hex Code | Description & Usage |
|---|---|---|---|
| Background Base | Antique Vellum | `#faf6ee` | Main app background, warm textured paper |
| Board Surface | Archival Parchment | `#f3ecdc` | Grid background, blueprint floorplans |
| Line & Text | Deep India Ink | `#1b2228` | Primary linework, typography, and borders |
| Board Borders | Walnut Trim | `#4a3828` | Area dividers, outer grid bevels |
| Victim Accent | Vintage Burgundy | `#8f2d20` | Murder victim tokens, crime scene markers |
| Suspect Accent 1 | Verdigris Slate | `#23594e` | Suspect token palette A |
| Suspect Accent 2 | Admiralty Navy | `#2b3e58` | Suspect token palette B |
| Suspect Accent 3 | Burnt Ochre | `#9e5927` | Suspect token palette C |
| Suspect Accent 4 | Imperial Plum | `#58436e` | Suspect token palette D |
| Suspect Accent 5 | Weathered Olive | `#5e5c32` | Suspect token palette E |
| Success / Closed | Wax Crimson | `#a32617` | "CASE CLOSED" rubber stamp, verified check |
| Caution / Warning | Brass Amber | `#b8860b` | Clue conflicts, unplaced suspect alerts |

---

## 2. Brand & Global UI Assets

| Asset Filename | Format | Target Dimensions | Visual Art Brief | Status |
|---|---|---|---|---|
| `logo-casegrid.svg` | SVG | 320x80 | Full wordmark with integrated mark: an architectural floor grid perspective interwoven with a brass magnifying loupe. Serif lettering with subtle ink trap details. | ✓ Done |
| `logo-mark.svg` | SVG | 64x64 | Compact standalone icon: four interlocking grid squares where one square reveals a detective loupe silhouette. | ✓ Done |
| `favicon.svg` | SVG | 32x32 | High-contrast version of `logo-mark.svg` optimized for browser tabs down to 16px. | ✓ Done |
| `badge-case-closed.svg` | SVG | 200x200 | Circular vintage rubber-stamp or embossed wax seal. Distressed outer ring, text reading `CASE CLOSED` in bold serif, centered scales of justice or crossed skeleton keys. | ✓ Done |
| `badge-accused.svg` | SVG | 120x120 | Dramatic spotlight emblem with silhouette of an accused suspect in profile, framed by a vintage magnifying bezel. | ✓ Done |
| `badge-solved-star.svg` | SVG | 32x32 | Eight-pointed archival star used for completed case cards on the catalog list. | ✓ Done |

### Sharing and link-preview images (Epic 2)

| Asset | Format | Dimensions | Brief | Status |
|---|---|---|---|---|
| `public/og/casegrid.png` | PNG | 1200x630 | Home link preview: tagline card beside a tilted, generic four-room board motif. Generated by `pnpm --filter @casegrid/web generate:og` using Lora and Work Sans (OFL). | ✓ Generated placeholder |
| `public/og/case-00N.png` | PNG | 1200x630 | One per published case. Shows the case number, difficulty, title, subtitle, and "Can you solve this case?". Built from catalog copy only; the board motif is generic, not the case's layout. | ✓ Generated placeholder |
| Share card (runtime) | PNG | 1080x1080 | Drawn in the browser by `src/services/shareCard.ts`: CASE CLOSED rubber stamp, the player's time, mistakes, and nudges. No names or board. | ✓ Code-drawn |

**Artwork wanted:** an original illustrated scene per case, without characters or clue-revealing details, to replace the generic board motif in the link previews. Also a hand-inked CASE CLOSED stamp texture for the share card.

---

## 3. Gameplay Placeholders & Board Elements

These assets replace in-line ASCII, emoji, and CSS-generated indicators in the game loop.

| Asset Filename | Current Placeholder | Target Size | Visual Description | Status |
|---|---|---|---|---|
| `icon-cell-excluded.svg` | Text `✕` in red badge | 24x24 | Hand-stamped red wax cross with subtle ink bleed, signifying the player has excluded a suspect from that cell. | ✓ Done |
| `frame-cell-active.svg` | CSS dashed green outline | 80x80 | Vintage brass-corner drafting brackets with a warm golden highlight, indicating the cell is a valid drop/tap target. | ✓ Done |
| `frame-cell-selected.svg` | CSS solid ring | 80x80 | Thick dual-line ink border with diamond corner pips marking the currently focused grid cell. | ✓ Done |
| `icon-clue-unresolved.svg` | Plain HTML checkbox | 20x20 | Square parchment checkbox with deckled ink border and empty center. | ✓ Done |
| `icon-clue-resolved.svg` | Checked HTML checkbox | 20x20 | Parchment checkbox with a bold crimson quill checkmark striking through. | ✓ Done |
| `badge-clue-conflict.svg` | Orange alert banner | 28x28 | Embossed brass shield with an exclamation mark, indicating conflicting suspect arrangements. | ✓ Done |
| `icon-timer.svg` | Text "Time:" | 20x20 | Ornate brass pocket watch with ticking Roman numeral markers. | ✓ Done |
| `icon-mistakes.svg` | Text "Mistakes:" | 20x20 | Red ink smudge / quill blot indicating deduction errors. | ✓ Done |
| `icon-hint.svg` | Text "Hints" | 20x20 | Antique gas lamp or flickering candle emblem. | ✓ Created |
| `icon-restart.svg` | Text "Restart" | 24x24 | Ouroboros-style brass arrow loop for case reset. | ✓ Done |
| `icon-back.svg` | Text "← Cases" | 24x24 | Hand-drawn ink arrow pointing left with feathered tail. | ✓ Done |

---

## 4. Environmental Objects (Blocked Cell Tokens)

Environmental objects block character placement and anchor spatial clues (`character_adjacent_to_object`). All object tokens should be crafted in **isometric or 2.5D top-down perspective** (30° isometric projection), enclosed within an unplaced 64x64 or 80x80 bounding box so they fit neatly inside square grid cells.

| Object ID / Type | Filename | Used in Cases | Visual Description | Status |
|---|---|---|---|---|
| `fountain` | `obj-fountain.svg` | Cases 1, 6, 7, 11, 16, 18 | Carved stone garden fountain with tiered basins, gentle concentric water ripples, and weathered moss. | ✓ Done |
| `globe` | `obj-globe.svg` | Cases 1, 10, 13 | Antique brass armillary sphere and mahogany floor globe with engraved celestial longitude rings. | ✓ Done |
| `bookshelf` | `obj-bookshelf.svg` | Cases 1, 6, 9, 11, 15 | Heavy dark oak bookcase filled with variegated leather-bound tomes, rolled scrolls, and bookends. | ✓ Done |
| `billiard_table` | `obj-billiard-table.svg` | Cases 1, 8, 12, 16, 20 | Felt-topped gaming table (green felt for billiards, burgundy velvet for high-stakes casino poker). | ✓ Done |
| `fireplace` | `obj-fireplace.svg` | Cases 1, 4, 6, 9, 11, 17, 18 | Carved marble hearth or cast-iron stove with glowing orange embers, iron grate, and carved mantle. | ✓ Done |
| `clock` | `obj-clock.svg` | Cases 1, 7, 8, 9, 12, 13, 16 | Freestanding grandfather clock with glass door, brass pendulum, and ornamental filigree crest. | ✓ Done |
| `t_rex_skull` | `obj-t-rex-skull.svg` | Case 2 | Enormous fossilized tyrannosaur skull mounted on a brass museum pedestal with museum plaque. | ✓ Done |
| `display_case` | `obj-display-case.svg` | Cases 2, 7, 10, 11, 13, 14, 15 | Glass and brass museum vitrine exhibiting glittering gemstones, rare relics, or antiquities. | ✓ Done |
| `sarcophagus` | `obj-sarcophagus.svg` | Cases 2, 15 | Gilded Egyptian pharaonic sarcophagus with turquoise and lapis lazuli inlays and crossed flail and crook. | ✓ Done |
| `desk` | `obj-desk.svg` | Cases 2, 3, 5, 6, 8, 9, 14, 17, 19, 20 | Heavy rolltop executive desk or scholar workbench with papers, magnifying glass, and inkwell. | ✓ Done |
| `piano` | `obj-piano.svg` | Cases 3, 5, 12 | Lacquered black concert grand piano with propped lid, visible gold harp strings, and ivory keyboard. | ✓ Done |
| `couch` | `obj-couch.svg` | Cases 3, 7, 10, 16, 18 | Tufted Chesterfield leather sofa or ornate velvet divan with carved mahogany legs. | ✓ Done |
| `prop_trunk` | `obj-prop-trunk.svg` | Cases 3, 5, 12, 20 | Reinforced brass-banded traveling trunk with luggage tags, theater stickers, or halberd weapons. | ✓ Done |
| `lighthouse_lamp` | `obj-lighthouse-lamp.svg` | Case 4 | Enormous tiered Fresnel glass beacon lens radiating a soft amber beam. | ✓ Done |
| `telegraph` | `obj-telegraph.svg` | Cases 4, 15, 17, 19 | Brass telegraph key and ticker-tape receiver on oak mount with copper coil relays. | ✓ Done |
| `steam_engine` | `obj-steam-engine.svg` | Cases 4, 10, 13, 14, 17 | Riveted iron boiler with brass pressure gauges, steam escape valves, and turning drive shafts. | ✓ Done |
| `window` | `obj-window.svg` | Cases 5, 19 | Arched multi-pane bay window overlooking rain-swept grounds or cloud banks aloft. | ✓ Done |
| `safe` | `obj-safe.svg` | Cases 8, 18, 20 | Heavy black cast-iron vault safe with polished brass combination dial and spoke handle. | ✓ Done |
| `curtain` | `obj-curtain.svg` | Case 12 | Heavy draped crimson velvet theatrical stage curtain tied back with braided gold rope. | ✓ Done |
| `nautical_wheel` | `obj-nautical-wheel.svg` | Cases 14, 19 | Brass-hubbed ship's helm with eight turned wood spokes, mounted on steering binnacle. | ✓ Done |

---

## 5. Character Portrait Avatars (Cases 1–20)

Every character token in CaseGrid is rendered as an 80x80 circle or rounded squircle. 

### Avatar Design Requirements
1. **Silhouette Clarity**: Distinct hair shapes, hats, collars, or spectacles so characters are identifiable even at 32px thumbnail size.
2. **Victim Distinction**: Victims feature a distinct **Burgundy badge border** and solemn, static posture.
3. **Suspect Expressions**: Suspects feature expressive eyes, defensive postures, and distinct role-appropriate costuming.
4. **Style Consistency**: 1.5px clean charcoal linework, flat gouache-style shading, and muted period clothing.

---

### Case 001: The Rosewood Parlor
*Setting: English Country Estate Conservatory & Library*

| ID | Filename | Role | Name | Visual Brief | Status |
|---|---|---|---|---|---|
| `reginald` | `avatar-reginald.svg` | **Victim** | Lord Reginald | Elderly patriarch with parted silver hair, neat mustache, gold monocle on cord, and deep burgundy velvet smoking jacket. | ✓ Done |
| `evelyn` | `avatar-evelyn.svg` | **Suspect** | Evelyn Rosewood | Ambitious younger sister, arched dark eyebrows, high-collared emerald Edwardian dress, double pearl necklace. | ✓ Done |
| `arthur` | `avatar-arthur.svg` | **Suspect** | Arthur Vance | Cautious solicitor, wireframe spectacles, receding brown hair, stiff white collar, holding leather document folder. | ✓ Done |
| `clara` | `avatar-clara.svg` | **Suspect** | Clara Mercer | Literature collector with curly auburn hair pinned into a Gibson roll, warm amber scarf, holding brass reading loupe. | ✓ Done |
| `julian` | `avatar-julian.svg` | **Suspect** | Dr. Julian Sterling | Family physician, sideburns, focused gaze, herringbone tweed vest over rolled sleeves, holding doctor bag strap. | ✓ Done |
| `beatrice` | `avatar-beatrice.svg` | **Suspect** | Beatrice Finch | Observant head housekeeper, silver hair under lace cap, crisp charcoal dress, ring of heavy brass keys on collar. | ✓ Done |

---

### Case 002: The Grand Antiquary
*Setting: Natural History Museum Fossil Hall*

| ID | Filename | Role | Name | Visual Brief | Status |
|---|---|---|---|---|---|
| `alistair` | `avatar-alistair.svg` | **Victim** | Prof. Alistair Pembroke | Chief curator, disheveled white hair, spectacles slipping down nose, tweed jacket with leather elbow patches. | ✓ Done |
| `nadia` | `avatar-nadia.svg` | **Suspect** | Dr. Nadia Rostova | Visiting paleontologist, sharp jawline, short bobbed hair, safari field vest with specimen pen clips. | ✓ Done |
| `marcus` | `avatar-marcus.svg` | **Suspect** | Marcus Bennett | Night security guard, peaked navy visor cap, firm square jaw, brass flashlight strap across shoulder. | ✓ Done |
| `elena` | `avatar-elena.svg` | **Suspect** | Elena Cruz | Antiquities dealer, glamorous silk headscarf, dark sunglasses resting on brow, tailored charcoal trench coat. | ✓ Done |
| `henry` | `avatar-henry.svg` | **Suspect** | Henry Thorpe | Museum trustee, rotund build, well-groomed handlebar mustache, pinstripe waistcoat with gold pocket-watch fob. | ✓ Done |
| `sylvia` | `avatar-sylvia.svg` | **Suspect** | Sylvia Chen | Conservator, hair tied in high bun, jeweler's magnifying loupe headband tilted up, cotton lab apron. | ✓ Done |

---

### Case 003: The Midnight Express
*Setting: Alpine Trans-Continental Luxury Train*

| ID | Filename | Role | Name | Visual Brief | Status |
|---|---|---|---|---|---|
| `baroness` | `avatar-baroness.svg` | **Victim** | Baroness von Brandt | Aristocratic heiress, platinum waves under a cloche hat with veil, silver fur stole, emerald earring. | ✓ Done |
| `dimitri` | `avatar-dimitri.svg` | **Suspect** | Dimitri Petrov | Disgraced financier, nervous stubble, loose black bow tie, slicked dark hair, smoking cigarette holder. | ✓ Done |
| `viktor` | `avatar-viktor.svg` | **Suspect** | Viktor Kroll | Veteran conductor, double-breasted navy uniform with gold piping, silver pocket watch chain, stern walrus mustache. | ✓ Done |
| `charlotte` | `avatar-charlotte.svg` | **Suspect** | Charlotte Dubois | Investigative journalist, trench coat with turned-up lapels, beret, reporter notebook and pencil tucked behind ear. | ✓ Done |
| `gwen` | `avatar-gwen.svg` | **Suspect** | Gwen Montgomery | Traveling companion, demure posture, wool traveling cloak with hood, clutching small velvet jewelry reticule. | ✓ Done |
| `otto` | `avatar-otto.svg` | **Suspect** | Otto Becker | Luggage steward, striped porter vest, flat cap, heavy canvas gloves, smudges of luggage grease on collar. | ✓ Done |

---

### Case 004: The Saltmarsh Beacon
*Setting: Isolated Rocky Coastal Lighthouse*

| ID | Filename | Role | Name | Visual Brief | Status |
|---|---|---|---|---|---|
| `thaddeus` | `avatar-thaddeus.svg` | **Victim** | Capt. Thaddeus Ward | Veteran lighthouse keeper, bushy white sea-captain beard, heavy knit cable sweater, squinting weathered eyes. | ✓ Done |
| `mira` | `avatar-mira.svg` | **Suspect** | Mira Gable | Apprentice keeper, windblown braided red hair, heavy oilskin sou'wester coat with brass snap buttons. | ✓ Done |
| `lydia` | `avatar-lydia.svg` | **Suspect** | Lydia Cross | Radio operator, bakelite headphones clamped over short curls, wool cardigan, pencil gripped in hand. | ✓ Done |
| `caleb` | `avatar-caleb.svg` | **Suspect** | Caleb Morrow | Lobster fisherman, faded yellow slicker, knit watch cap, scarred cheek, calloused forearms. | ✓ Done |
| `jonas` | `avatar-jonas.svg` | **Suspect** | Jonas Vane | Naval surveyor, brass navigational dividers in hand, pea coat with naval buttons, rolled parchment chart under arm. | ✓ Done |
| `samuel` | `avatar-samuel.svg` | **Suspect** | Samuel Drake | Harbor inspector, tailored navy reefer coat, clipboard with harbor stamps, stern bureaucratic frown. | ✓ Done |
| `eleanor` | `avatar-eleanor.svg` | **Suspect** | Eleanor Ashby | Naturalist, field binoculars around neck, tweed field jacket, sketchpad with feather specimen tucked into page. | ✓ Done |

---

### Case 005: The Blackwood Playhouse
*Setting: Grand Victorian Theater & Backstage*

| ID | Filename | Role | Name | Visual Brief | Status |
|---|---|---|---|---|---|
| `vincent` | `avatar-vincent.svg` | **Victim** | Vincent Harrow | Tyrannical director, flamboyant silk cravat, swept-back graying mane, sharp eagle nose, velvet capelet. | ✓ Done |
| `camilla` | `avatar-camilla.svg` | **Suspect** | Camilla Fontaine | Prima donna soprano, extravagant feathered headdress, theatrical stage makeup, dramatic haughty gaze. | ✓ Done |
| `julian_v` | `avatar-julian_v.svg` | **Suspect** | Julian Marsh | Young tenor, youthful cleft chin, ruffled poetic shirt open at throat, wavy romantic locks. | ✓ Done |
| `rowan` | `avatar-rowan.svg` | **Suspect** | Rowan Shaw | Rigging flyman, bandana tied over hair, muscular build, coiled hemp rope slung over shoulder. | ✓ Done |
| `vivian` | `avatar-vivian.svg` | **Suspect** | Vivian Cole | Wardrobe designer, measuring tape draped around neck, pincushion wristband, tortoiseshell cat-eye glasses. | ✓ Done |
| `dorian` | `avatar-dorian.svg` | **Suspect** | Dorian Hale | Acerbic theater critic, silver-topped cane, monocle, sharp satirical smirk, silk opera scarf. | ✓ Done |
| `seraphina` | `avatar-seraphina.svg` | **Suspect** | Seraphina Lane | Concertmaster violinist, sleek black concert gown, rosin dust on lapel, violin bow held poised. | ✓ Done |

---

### Case 006: The Whispering Cloister
*Setting: Saint Jude's Medieval Abbey*

| ID | Filename | Role | Name | Visual Brief |
|---|---|---|---|---|
| `augustine` | `avatar-augustine.svg` | **Victim** | Abbot Augustine | Frail elderly abbot, woolen monk cowl, wooden pectoral cross, deeply creased serene features. |
| `bernard` | `avatar-bernard.svg` | **Suspect** | Brother Bernard | Cellarer monk, stout build, iron ledger book under arm, heavy bunch of cellar keys, cunning sideways glance. |
| `thomas` | `avatar-thomas.svg` | **Suspect** | Brother Thomas | Manuscript scribe, ink stains on fingertips and cuff, tonsured hair, squinting eyes behind wire spectacles. |
| `beatrice` | `avatar-beatrice.svg` | **Suspect** | Sister Beatrice | Convent herbalist, white wimple and dark veil, apron pocket bulging with dried lavender and belladonna vials. |
| `anselm` | `avatar-anselm.svg` | **Suspect** | Father Anselm | Elderly scholar monk, long gray beard, embroidered ceremonial stole over brown habit, magnifying glass. |
| `stephen` | `avatar-stephen.svg` | **Suspect** | Prior Stephen | Second-in-command, lean ascetic face, sharp dark eyes, clasped hands concealing a nervous tension. |

---

### Case 007: The Botanical Conservatory
*Setting: Royal Victorian Glasshouse*

| ID | Filename | Role | Name | Visual Brief |
|---|---|---|---|---|
| `humphrey` | `avatar-humphrey.svg` | **Victim** | Sir Humphrey Vance | Director of botanic gardens, tropical pith helmet tilted back, linen three-piece suit, rare orchid pinned to lapel. |
| `florence` | `avatar-florence.svg` | **Suspect** | Florence Croft | Orchid specialist, dark hair tied back with velvet ribbon, canvas gardening gloves, brass pruning shears. |
| `basil` | `avatar-basil.svg` | **Suspect** | Dr. Basil Thorn | Toxicologist botanist, narrow spectacles, leather botanist specimen case, stained leather gloves. |
| `dahlia` | `avatar-dahlia.svg` | **Suspect** | Lady Dahlia Sterling | High-society patron, grand parasol with lace frills, floral hat adorned with silk blossoms, pearl choker. |
| `arthur_b` | `avatar-arthur_b.svg` | **Suspect** | Arthur Finch | Landscape designer, rolled architectural park schematics, waistcoat covered in soil smudges, pencil tucked behind ear. |
| `clara_h` | `avatar-clara_h.svg` | **Suspect** | Clara Hayes | Greenhouse caretaker, sturdy work apron, watering can at side, determined practical expression. |

---

### Case 008: The Gilded Casino
*Setting: Monte Carlo Private High-Roller Salon*

| ID | Filename | Role | Name | Visual Brief |
|---|---|---|---|---|
| `montefiore` | `avatar-montefiore.svg` | **Victim** | Baron Montefiore | Decadent nobleman, white tuxedo with silk lapels, diamond pinky ring, crystal champagne flute in hand. |
| `nadia_c` | `avatar-nadia_c.svg` | **Suspect** | Countess Nadia | Elite card player, crimson backless evening dress, feather boa, sharp calculating gaze, holding hand of cards. |
| `luc` | `avatar-luc.svg` | **Suspect** | Luc Duvall | Head croupier, impeccable black vest, arm garters, slicked black hair, blank poker face. |
| `orlov` | `avatar-orlov.svg` | **Suspect** | General Orlov | Decorated military officer, medal-laden dress tunic with gold epaulets, heavy graying mustache, snifter of cognac. |
| `vanessa` | `avatar-vanessa.svg` | **Suspect** | Vanessa Valmont | Lounge singer, emerald sequin gown, long satin opera gloves, vintage art-deco microphone silhouette. |
| `vance_det` | `avatar-vance_det.svg` | **Suspect** | Inspector Vance | Discreet off-duty detective, dark suit, fedora shadowing eyes, watchful analytical expression. |

---

### Case 009: The Clockwork Workshop
*Setting: Master Horologist's Tower Atelier*

| ID | Filename | Role | Name | Visual Brief |
|---|---|---|---|---|
| `elias` | `avatar-elias.svg` | **Victim** | Elias Vance | Master clockmaker, brass jeweler's loupe affixed to forehead, leather apron with tweezer slots, silver hair. |
| `tobias` | `avatar-tobias.svg` | **Suspect** | Tobias Webb | Rival horologist, sharp narrow mustache, bespoke frock coat with gear-shaped pocket watch, envious scowl. |
| `nora` | `avatar-nora.svg` | **Suspect** | Nora Sterling | Gifted daughter, braided hair with miniature gear hairpin, rolled sleeves, delicate brass escapement in hand. |
| `leo` | `avatar-leo.svg` | **Suspect** | Leo Baxter | Nervous apprentice, oversize work apron, smudged cheeks with clock oil, clutching a brass pendulum rod. |
| `croft` | `avatar-croft.svg` | **Suspect** | Inspector Croft | City municipal auditor, dark wool coat, bowler hat, ledger with clock tower maintenance seals. |
| `brigitte` | `avatar-brigitte.svg` | **Suspect** | Madame Brigitte | Wealthy patron, extravagant fox-fur collar, velvet bonnet with jet beads, lorgnette raised to examine wares. |

---

### Case 010: The Nile Steamer
*Setting: Paddle Steamer S.S. Karnak*

| ID | Filename | Role | Name | Visual Brief |
|---|---|---|---|---|
| `sterling_lord` | `avatar-sterling_lord.svg` | **Victim** | Lord Sterling | British antiquarian, linen suit with Panama hat, gold-headed walking cane, sun-bronzed skin. |
| `farouk` | `avatar-farouk.svg` | **Suspect** | Captain Farouk | River steamer captain, crisp white naval tunic with brass buttons, gold braided captain cap, stern dignified gaze. |
| `lady_margaret` | `avatar-lady_margaret.svg` | **Suspect** | Lady Margaret | Aristocratic traveler, cream linen motoring coat, large straw sun hat tied with silk scarf, ivory fan. |
| `carter` | `avatar-carter.svg` | **Suspect** | Dr. Howard Callow | Archaeologist, khaki field shirt, dust-covered spectacles, notebook filled with Egyptian hieroglyphs. |
| `davies` | `avatar-davies.svg` | **Suspect** | Miss Evelyn Davies | Private secretary, modest tailored blouse, leather stenographer pad and fountain pen, sharp observant eyes. |
| `tariq` | `avatar-tariq.svg` | **Suspect** | Steward Tariq | Head cabin steward, embroidered traditional Egyptian gallabeya with gold trim, brass serving tray. |

---

### Case 011: The Alchemist's Laboratory
*Setting: Renaissance Tower Crucible & Athanor*

| ID | Filename | Role | Name | Visual Brief |
|---|---|---|---|---|
| `paracelsus` | `avatar-paracelsus.svg` | **Victim** | Paracelsus Kane | Alchemist, dark velvet robes lined with astrological symbols, long white beard, holding crystal vial of red tincture. |
| `cornelius` | `avatar-cornelius.svg` | **Suspect** | Cornelius Blackwood | Former apprentice, scorched leather blacksmith apron, chemical burn scar along temple, brooding resentful scowl. |
| `ursula` | `avatar-ursula.svg` | **Suspect** | Ursula Vance | Toxicologist, velvet doublet, glass distillation flask in hand, braided dark hair intertwined with dried herbs. |
| `silas_a` | `avatar-silas_a.svg` | **Suspect** | Silas Drake | Lab assistant, protective leather goggles with green lenses, heavy bellows slung across shoulder. |
| `hawke` | `avatar-hawke.svg` | **Suspect** | Guildmaster Hawke | Guild auditor, heavy gold guild chain across broad chest, velvet beret with osprey quill, scale weights in hand. |
| `genevieve` | `avatar-genevieve.svg` | **Suspect** | Lady Genevieve | Noble patroness, ermine-trimmed gown, elaborate braided hennin headdress, holding gold bullion test coin. |

---

### Case 012: The Imperial Opera House
*Setting: Vienna Royal Opera House*

| ID | Filename | Role | Name | Visual Brief |
|---|---|---|---|---|
| `leopold` | `avatar-leopold.svg` | **Victim** | Maestro Leopold | Chief conductor, black tails coat, silver conductor baton, white silk bowtie, intense dramatic visage. |
| `rosa` | `avatar-rosa.svg` | **Suspect** | Prima Donna Rosa | Dramatic soprano, diamond tiara, red velvet ball gown with gold embroidery, holding sheet music to Carmen. |
| `antonio` | `avatar-antonio.svg` | **Suspect** | Tenor Antonio | Rising Italian star, open silk collar, theatrical stage mustache, hand dramatically clutching chest. |
| `otto` | `avatar-otto.svg` | **Suspect** | Otto the Stage Manager | Backstage manager, leather headset tube, dark vest with pockets bulging with wrenches and stage cues. |
| `helena` | `avatar-helena.svg` | **Suspect** | Baroness Helena | Opera benefactress, jeweled lorgnette, silk opera gloves, towering powdered wig with floral accents. |
| `giselle` | `avatar-giselle.svg` | **Suspect** | Giselle Moreau | Understudy, ballet slippers draped over shoulder, simple practice gown, hungry ambitious gaze. |
| `meyer` | `avatar-meyer.svg` | **Suspect** | Herr Meyer | Stage union steward, sturdy tweed coat, thick walrus mustache, holding signed performer contract ledger. |

---

### Case 013: The Highclere Observatory
*Setting: Alpine Mountaintop Celestial Telescope*

| ID | Filename | Role | Name | Visual Brief |
|---|---|---|---|---|
| `thaddeus` | `avatar-thaddeus.svg` | **Victim** | Dr. Thaddeus Vance | Pioneer astronomer, wool greatcoat, thick scarf, brass star-chart compass in hand, visionary far-off gaze. |
| `lyra` | `avatar-lyra.svg` | **Suspect** | Lyra Sterling | Calculator assistant, hair pinned neatly, knitted fingerless gloves, arm full of star transit calculation sheets. |
| `brandt_prof` | `avatar-brandt_prof.svg` | **Suspect** | Professor Brandt | German astrophysicist, heavy round spectacles, thick wool cardigan, holding glass photographic star plate. |
| `clive` | `avatar-clive.svg` | **Suspect** | Clive Hawkins | Dome technician, mechanics cap, oil-stained coveralls, heavy brass spanner wrench in tool belt. |
| `iris` | `avatar-iris.svg` | **Suspect** | Iris Finch | Cartographer, tailored woolen jacket, star map cylinder slung over back, India ink stains on fingers. |
| `roland` | `avatar-roland.svg` | **Suspect** | Roland Cross | Royal society auditor, dark bowler hat, stiff necktie, leather audit portfolio stamped with crown seal. |
| `aris` | `avatar-aris.svg` | **Suspect** | Dr. Aris Thorne | Meteorologist, sheepskin flight jacket, brass barometer in hand, windburned weathered cheeks. |

---

### Case 014: The Sunken Galleon Salvage
*Setting: Maritime Salvage Barge Neptune*

| ID | Filename | Role | Name | Visual Brief |
|---|---|---|---|---|
| `hawke_capt` | `avatar-hawke_capt.svg` | **Victim** | Captain Hawke | Salvage master, scarred brow, naval bridge coat with weathered gold lace, gold Spanish doubloon around neck. |
| `mateo` | `avatar-mateo.svg` | **Suspect** | Mateo Cruz | Deep sea diver, heavy wool under-suit with rubber collar gasket, strong square jaw, coiled diver air hose. |
| `silas_q` | `avatar-silas_q.svg` | **Suspect** | Silas Drake | Quartermaster, knitted sailor cap, marlinspike hung from rope belt, grizzled gray beard, pipe clenched in teeth. |
| `eleanor` | `avatar-eleanor.svg` | **Suspect** | Eleanor Vance | Marine historian, oilskin jacket, reading magnifying loupe, holding waterlogged parchment wreck map. |
| `rory` | `avatar-rory.svg` | **Suspect** | Rory Quinn | Deckhand, sleeveless striped jersey, anchor tattoo on forearm, nervous young features. |
| `greta` | `avatar-greta.svg` | **Suspect** | Greta Lind | Ship engineer, welder's goggles around neck, smudged soot on cheek, heavy leather work apron. |
| `bram` | `avatar-bram.svg` | **Suspect** | Bram Thorne | Crane winch operator, heavy woolen peacoat, thick leather gloves, stern imposing silhouette. |

---

### Case 015: The Royal Antiquities Vault
*Setting: Subterranean Bank & Museum Vaults*

| ID | Filename | Role | Name | Visual Brief |
|---|---|---|---|---|
| `percival` | `avatar-percival.svg` | **Victim** | Percival Graves | Chief archivist, velvet skullcap, gold rimless spectacles, keys to the master reliquary on heavy ring. |
| `morgan` | `avatar-morgan.svg` | **Suspect** | Dr. Morgan Blake | Senior conservator, sharp clean-shaven jaw, forensic tweezers and camelhair brush in breast pocket, discreet glance. |
| `drake_sec` | `avatar-drake_sec.svg` | **Suspect** | Drake Holloway | Head of vault security, dark uniform with silver star badge, leather holster, vigilant watchful stance. |
| `vivienne` | `avatar-vivienne.svg` | **Suspect** | Lady Vivienne | High-society heiress, dark silk veil, tailored evening suit with diamond brooch, claiming private lockbox. |
| `kenneth` | `avatar-kenneth.svg` | **Suspect** | Kenneth Shaw | Gem appraiser, brass calipers and loupe in pocket, pinstripe vest, calculating appraiser smirk. |
| `maeve` | `avatar-maeve.svg` | **Suspect** | Maeve Sinclair | Scribe cataloger, ink-dipped quill pen, wool cardigan, holding catalog ledger of Roman coins. |
| `silas_j` | `avatar-silas_j.svg` | **Suspect** | Silas Vance | Vault custodian, heavy brass master key ring, denim boiler suit, quiet stoic expression. |

---

### Case 016: The Venice Masquerade
*Setting: Palazzo Bellini on the Grand Canal*

| ID | Filename | Role | Name | Visual Brief |
|---|---|---|---|---|
| `bernardo` | `avatar-bernardo.svg` | **Victim** | Duca Bernardo | Venetian patriarch, ornate velvet doge-style cloak with ermine collar, gold filigree mask pushed up on brow. |
| `francesca` | `avatar-francesca.svg` | **Suspect** | Contessa Francesca | Cousin, black lace Colombina mask with peacock feathers, emerald gown, holding delicate ivory fan. |
| `matteo_g` | `avatar-matteo_g.svg` | **Suspect** | Gondolier Matteo | Private boatman, striped sailor jersey with red sash, straw boater hat with ribbon, muscular build. |
| `armand` | `avatar-armand.svg` | **Suspect** | Diplomat Armand | French ambassador, gold-braided diplomatic uniform, white Medico della Peste (Plague Doctor) mask at belt. |
| `lucia` | `avatar-lucia.svg` | **Suspect** | Lucia the Maskmaker | Artisan, paint-flecked apron, hair swept up with wooden sticks, holding unpainted papier-mâché mask. |
| `silvio` | `avatar-silvio.svg` | **Suspect** | Silvio Moretti | Spice merchant, heavy brocade doublet with gold chain, velvet cap with pearl, goblet of Valpolicella. |
| `cosima` | `avatar-cosima.svg` | **Suspect** | Cosima Bellini | Prima ballerina, glittering Harlequin mask, silver tulle ballet dress, delicate poised dancer stance. |

---

### Case 017: The Fogbound Depot
*Setting: Victorian London Railway Freight Yard*

| ID | Filename | Role | Name | Visual Brief |
|---|---|---|---|---|
| `archibald` | `avatar-archibald.svg` | **Victim** | Archibald Reed | Yardmaster, dark railway frock coat with brass station buttons, pocket watch, stern uncompromising jaw. |
| `sean` | `avatar-sean.svg` | **Suspect** | Switchman Sean | Yard switchman, heavy canvas mackintosh, brass railroad lantern in hand, defiant gaze. |
| `clara_d` | `avatar-clara_d.svg` | **Suspect** | Clara Briggs | Night telegraph dispatcher, green celluloid eye-shade visor, sleeve garters, holding yellow telegram slips. |
| `hank` | `avatar-hank.svg` | **Suspect** | Hank Miller | Locomotive stoker, soot-blackened brow and arms, flat cloth cap, heavy coal shovel propped at side. |
| `inspector_m` | `avatar-inspector_m.svg` | **Suspect** | Inspector Miller | Railway police detective, dark greatcoat with silver police badge, notebook and pencil, piercing eyes. |
| `donald` | `avatar-donald.svg` | **Suspect** | Donald Pike | Warehouse porter, burlap apron, heavy lifting hook hooked over shoulder, shifty nervous posture. |
| `greg` | `avatar-greg.svg` | **Suspect** | Foreman Greg | Engine roundhouse foreman, bib overalls, brass oilcan in hand, grease smudge across forehead. |

---

### Case 018: The High-Alpine Sanitarium
*Setting: Berghof Clavadel Swiss Mountain Clinic*

| ID | Filename | Role | Name | Visual Brief |
|---|---|---|---|---|
| `victor` | `avatar-victor.svg` | **Victim** | Dr. Victor Klaus | Clinic director, crisp white doctor tunic with high buttoned collar, stethoscope around neck, rimless glasses. |
| `gretchen` | `avatar-gretchen.svg` | **Suspect** | Nurse Gretchen | Head nurse, stiffly starched white nun-style nursing cap, pristine white apron, ring of medicine cabinet keys. |
| `hans` | `avatar-hans.svg` | **Suspect** | Dr. Hans Meyer | Junior doctor, youthful features, lab coat with clinical thermometer in pocket, defensive guarded expression. |
| `sonja` | `avatar-sonja.svg` | **Suspect** | Baroness Sonja | Wealthy patient, silk quilted bed jacket, cashmere blanket draped over shoulders, delicate coughing pose. |
| `lucas` | `avatar-lucas.svg` | **Suspect** | Lucas Vance | Convalescent writer, corduroy smoking jacket, loose cravat, holding leather journal with fountain pen. |
| `karl` | `avatar-karl.svg` | **Suspect** | Karl the Pharmacist | Dispensary keeper, brown work coat, small brass medicine scales in hand, amber apothecary bottles in rack. |
| `bruno` | `avatar-bruno.svg` | **Suspect** | Bruno the Orderly | Heavy-set orderly, white clinical smock with rolled sleeves, wool sweater beneath, stoic impassive face. |

---

### Case 019: The Sovereign Airship
*Setting: Rigid Zephyr Airship in Flight*

| ID | Filename | Role | Name | Visual Brief |
|---|---|---|---|---|
| `thorne` | `avatar-thorne.svg` | **Victim** | Marshall Thorne | Air fleet commander, navy dress tunic with gold wings insignia, high stand-up collar, silver temples. |
| `victoria` | `avatar-victoria.svg` | **Suspect** | First Officer Victoria | Senior navigator, brass navigation sextant in hand, tailored aviation uniform with flight breeches and boots. |
| `baxter` | `avatar-baxter.svg` | **Suspect** | Chief Engineer Baxter | Engine specialist, leather flight helmet with goggles pushed up, grease-streaked sheepskin jacket. |
| `ilona` | `avatar-ilona.svg` | **Suspect** | Countess Ilona | Traveling diplomat, fur-lined traveling cloak, veiled cloche hat, cigarette holder held with poised elegance. |
| `vance_pilot` | `avatar-vance_pilot.svg` | **Suspect** | Flight Lieutenant Vance | Junior helmsman, flight goggles around neck, brown leather bomber jacket with shearling collar. |
| `knox` | `avatar-knox.svg` | **Suspect** | Radio Officer Knox | Telegraphist, bakelite headphones clamped to ears, pencil poised over telegraph decode log. |
| `jean` | `avatar-jean.svg` | **Suspect** | Steward Jean | Chief purser, white steward jacket with brass buttons, linen napkin draped over arm, watchful eyes. |

---

### Case 020: The Obsidian Citadel
*Setting: Secret Alpine Mountain Fortress Council*

| ID | Filename | Role | Name | Visual Brief |
|---|---|---|---|---|
| `marcus_v` | `avatar-marcus_v.svg` | **Victim** | Chancellor Marcus Vane | High Chancellor, heavy black fur mantle with silver chain of office, iron signet ring, stern ruler's gaze. |
| `vespera` | `avatar-vespera.svg` | **Suspect** | Lady Vespera | Shadow councilor, dark hooded cowl with silver embroidery, obsidian dagger sheath at belt, sharp enigmatic eyes. |
| `kael` | `avatar-kael.svg` | **Suspect** | General Kael | Citadel garrison commander, scarred warrior face, burnished steel breastplate with lion crest, red officer sash. |
| `lyanna` | `avatar-lyanna.svg` | **Suspect** | Spymaster Lyanna | Master of whispers, sleek dark silk tunic, leather wrist bracers, holding rolled parchment cipher code. |
| `morath` | `avatar-morath.svg` | **Suspect** | Inquisitor Morath | Zealot judge, stark gray robes, iron pendant of the balance scales, severe unblinking stare. |
| `zephyr` | `avatar-zephyr.svg` | **Suspect** | Envoy Zephyr | Southern ambassador, embroidered saffron and gold robes, jeweled turban with falcon feather. |
| `theresa` | `avatar-theresa.svg` | **Suspect** | Archivist Theresa | Citadel archivist, heavy leather book clasp, scholar spectacles, ink-smudged wool gown. |
| `silas_guard` | `avatar-silas_guard.svg` | **Suspect** | Commander Silas | Personal guard captain, blackened iron helm held under arm, studded leather armor, loyal stone-jawed profile. |

---

## 6. Scene & Background Textures

To enhance visual atmosphere without cluttering gameplay, each case setting utilizes a subtle vector floor texture (rendered as an SVG `<pattern>` or background overlay at 3–5% opacity):

1. `pat-manor-parquet.svg`: Herringbone oak floorboards for manor and estate cases (Cases 1, 8).
2. `pat-museum-marble.svg`: Classic checkered marble tile for museum halls and galleries (Cases 2, 12, 16).
3. `pat-train-carpet.svg`: Art-deco geometric carpet pattern for passenger trains (Case 3).
4. `pat-granite-flagstone.svg`: Weathered stone flagstones for lighthouses, cloisters, and citadels (Cases 4, 6, 11, 20).
5. `pat-stage-planks.svg`: Dark worn theater stage timber with footlight glow (Case 5).
6. `pat-conservatory-mosaic.svg`: Terracotta and tessellated tile pattern for botanical glasshouses (Case 7).
7. `pat-deck-timber.svg`: Weathered teak deck planks with caulk lines for steamers and salvage barges (Cases 10, 14, 19).
8. `pat-industrial-rivets.svg`: Crosshatched metal floorplates and rivets for depots and engine rooms (Cases 9, 17).
9. `pat-observatory-rotunda.svg`: Concentric circular stone ring engraving for domes (Case 13).
10. `pat-sanitarium-linoleum.svg`: Clean geometric checker tile for alpine clinical suites (Cases 15, 18).

---

## 7. Code Component Replacement Mapping

The table below records the current integration. All images are decorative alongside named controls or visible labels; SVG artwork does not alter puzzle constraints.

| Component | Replacement | Status |
|---|---|---|
| `CharacterPortrait.tsx`, `CharacterToken.tsx`, `AccusationView.tsx` | `Character.avatar` from puzzle JSON, shared portrait display with initials fallback | Case 001 done; Cases 002–020 pending |
| `ObjectToken.tsx` | Explicit object-type mapping to `/assets/objects/obj-*.svg`; object labels retained | All 20 types done |
| `HomePage.tsx`, `CaseGridMark.tsx`, `favicon.svg` | Full wordmark, compact loupe mark, tab icon | Done |
| `HomePage.tsx` | Solved star and timer icon in completed case entries | Done |
| `Cell.tsx`, `index.css` | Exclusion stamp, brass drop brackets, selected-cell ink frame | Done |
| `CluePanel.tsx` | Unresolved/resolved note icons; existing button semantics retained | Done |
| `ResultView.tsx` | Closed seal with reduced-motion-aware reveal and text caption | Done |
| `AccusationView.tsx` | Accused emblem and conflict shield | Done |
| `FeedbackBanner.tsx` | Conflict shield and success check | Done |
| `GameHeader.tsx`, `CharacterTray.tsx` | Timer, mistakes, reset, back, exclusion-note icons | Done |
| `HomePage.tsx`, board textures | Scene pattern backgrounds | Pending |
| No consuming component | `icon-hint.svg` | Created; reserved |

Validation for this delivery: lint, typecheck, 63 unit tests, 20 puzzle validations, eight desktop/mobile Playwright checks, production build, SVG XML/path checks, and rendered desktop/320px visual review. The existing solver lint warning about an unnecessary spread is unrelated to these assets.
