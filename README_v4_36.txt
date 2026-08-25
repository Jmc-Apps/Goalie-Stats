Hockey Goalie Stats v4.36

Critical fixes:
- Removed earlier conflicting v4.31-v4.35 patch scripts and replaced them with one clean active-match controller.
- Restored Delete confirmation in Match Editor:
  - input placeholder: Type DELETE to confirm
  - red Delete Selected Match button
  - guarded against double delete
- Match tab no longer shows an old saved match timeline before a match starts.
- activeMatch() now returns only the active recording match, never the last saved match.
- Start / Save Match Details creates a new active match object only; it does not push to match history or rename existing saved matches.
- Recording shots writes only to the unique active match.
- Save Match Outcome & Prepare Next Match finalises the active match, saves it once to match history, clears active references, and resets the Match tab timeline.
- Match Editor loads saved matches only and remains the place for editing/deleting saved matches.
