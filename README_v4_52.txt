Hockey Goalie Stats v4.52

Fixes:
- Rebuilds the Game Heat Map Editor using new unique IDs:
  - v452DHeatMap
  - v452GoalHeatMap
  - v452Controls
  - v452ActionRow
- Uses styled action controls instead of normal app button elements so old scripts cannot remove them.
- Shows all four actions in the same visible control block:
  - Place Save
  - Place Goal
  - Place Angle Closed Off
  - Remove Placement
- Actions are grey by default.
- Selected actions change colour:
  - Save green
  - Goal red
  - Angle yellow
  - Remove orange
- Clicking the same selected action again unselects it.
- Map click with no selected action shows “Select a placement button first.”
- Placement updates existing recorded shots only.
- Remove Placement removes only the clicked map point.
- Match-tab End of Period button is retained.
