Goalie Stats Recorder v1.29

Updated for Hockey Goalie Stats v5.14 compatibility:
- Adds separate Shot Situation and Shot Type fields.
- Shot Situation values: Normal Game Play, Penalty Corner, Penalty Stroke, 8 Second 1v1.
- Shot Type values: 1st Shot, Rebound, In Game 1v1, Own Goal, Other.
- Uses main-app matching Out Numbered values: Not Out Numbered, 2 vs 1, 3 vs 1, 4+ vs 1.
- Uses main-app matching Rebound Result values: No rebound, Safe, Dangerous.
- Penalty Stroke automatically fixes D Heat Map placement to the approved P spot: x=50, y=36.7.
- Angle Closed Off records D Heat Map placement only and does not require a goal-box placement.
- Exports shotSituation, situation, type, shotType, outnumbered, rebound, notes, heat-map positions and timeline data.
- Adds simplified shootout recording:
  - Home attempt at opposition goalie: Not Taken, Goal, Save only.
  - Opponent attempt at our goalie: Result, Save Method, Note.
  - Shooter name removed from shootout data collection and export.
- Exports main-app-compatible shootout rounds/attempts with no shooter fields.
- Updates export metadata to target Hockey Goalie Stats v5.14 / targetMajorVersion 5.
- Preserves periods/timeline/order data.
- Migrates/defaults older saved recorder data to the new field values.
- Fixes iPhone PWA icon packaging with versioned apple-touch-icon/icon filenames and a v1.29 service-worker cache.
- Hidden force refresh: tap the version badge five times to clear the recorder cache and reload.
