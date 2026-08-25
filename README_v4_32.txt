Hockey Goalie Stats v4.32

Fixes:
- Game Heat Map Editor primed add flow now saves new shots into the selected match.
- Confirm Add now adds the shot to:
  - match.shots
  - match.orderItems
  - match.timeline
  - Match Editor ordered list
  - Game Heat Map Editor dots
- Match Timeline is rebuilt from the shared order of shots and End of Period markers.
- Match tab shot recording functions are wrapped so newly recorded shots are added into the shared order/timeline.
- Match tab End of Period functions are wrapped when present so period ends are added into the shared order/timeline.
- Period markers remain reorderable like shots.
- Match tab still keeps Periods inside the main match details area and does not show the separate Match Periods card.
- Match editing/deleting remains only in Match Editor.
