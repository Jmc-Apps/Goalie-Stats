Hockey Goalie Stats v4.53

Fixes:
- Creates a new dedicated Game Heat Map Editor card from scratch after the Recorded Order card.
- Does not rely on finding or replacing the old broken Game Heat Map Editor card.
- Uses unique v4.53 IDs:
  - v453GameHeatMapEditorCard
  - v453DHeatMap
  - v453GoalHeatMap
  - v453Controls
  - v453ActionRow
- Hides old Game Heat Map Editor cards if they still exist.
- Includes maps, legend, counts, all four action controls, and status in one permanent card.
- Actions:
  - Place Save
  - Place Goal
  - Place Angle Closed Off
  - Remove Placement
- Actions are grey by default and colour only when selected.
- Clicking the same selected action again unselects it.
- Placement updates existing recorded shots only.
- Remove Placement removes only the clicked map point.
