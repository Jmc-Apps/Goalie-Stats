Hockey Goalie Stats v4.35

Critical fixes:
- Starting a new match now creates a clean active match object instead of reusing the last saved match.
- New active matches start with:
  - no shots
  - no goals/saves/angles
  - no End of Period markers
  - empty timeline
  - empty heat maps
- Finalising / saving match outcome now forces the active match to be saved to the goalie match history.
- After finalising:
  - active match references are cleared
  - timeline display is cleared
  - heat-map editing state is cleared
  - the next match cannot repopulate from the previous saved match
- All Match tab recordings now write to the unique active match ID.
- Match Timeline only displays the current active match.
- Inline Game Heat Map Editor behaviour from v4.34 is preserved.
