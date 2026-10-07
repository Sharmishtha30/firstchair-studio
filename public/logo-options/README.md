# FirstChair logo options

Independent font-set wordmarks, not traced or adapted from Relay lettering. The live header is unchanged.

1. Pacifico, regular 400 — https://fonts.google.com/specimen/Pacifico
2. Dancing Script, semibold 600 — https://fonts.google.com/specimen/Dancing+Script
3. Caveat, semibold 600 — https://fonts.google.com/specimen/Caveat
4. Satisfy, regular 400 — https://fonts.google.com/specimen/Satisfy

Every option has white (#ffffff) and deep indigo (#201047) SVG and PNG exports. SVGs contain shaped outlines, no external fonts. PNGs are 1200 pixels wide with transparent backgrounds. SVG intrinsic dimensions correspond to 19px type, matching the current header font size, with small padding to avoid clipped curves.

Original font files and their licenses are in fonts/. Pacifico, Dancing Script and Caveat use the SIL Open Font License; Satisfy uses Apache License 2.0. Sources: https://github.com/google/fonts/tree/main/ofl/pacifico , https://github.com/google/fonts/tree/main/ofl/dancingscript , https://github.com/google/fonts/tree/main/ofl/caveat , https://github.com/google/fonts/tree/main/apache/satisfy .

Rebuild SVGs with scripts/generate-logo-options.py using fonttools and uharfbuzz. PNGs are rendered from the SVGs with the project's sharp library.
