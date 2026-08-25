Hockey Goalie Stats v4.33

Fixes:
- Match tab now has a reliable Match Timeline display.
- Shots recorded in the Match tab are added to the selected match order and timeline.
- Match Timeline shows:
  - S for Save
  - G for Goal
  - A for Angle Closed Off
  - ▲ for End of Period
- Match Timeline rebuilds from the shared order used by Match Editor.
- End of Period from the Match tab creates a period marker, order item, and timeline event.
- Delete Match is guarded:
  - deletes only the match selected at the moment DELETE was confirmed
  - clears the DELETE confirmation field
  - blocks double-click/double-fire from deleting the next match
  - asks for an extra confirmation with the match label before deletion
