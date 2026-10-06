

## Fresh neutral brand test — 2026-10-06
Allbirds generated from a fresh URL, with 24 source images and no manual post edits. A real browser check found that neutral source actions were rejected by palette extraction, allowing unrelated navy CSS to become the button colour. Explicit observed action roles now override vivid-colour inference, including black and white. Added a regression check for both. An older test was updated to supply explicit text roles, consistent with the existing removal of dark-accent-as-text inference.

Regenerated through the normal app flow. Instagram slides 2/3 and LinkedIn slides 2/3 retain warm grey, black typography, genuine large shoe photography, compact feature copy, and white actions. Static previews reviewed. Source body computed colour is #ece9e2 with black text, Geograph; source hero actions are white with dark text. Pack UI reports Files checked. 90 tests, both typechecks and production build pass. No deployment/push. Source action radius is still approximated and was not fully reproduced; this is improved brand fidelity, not a universal pixel match.
