Hockey Goalie Stats v4.17

Fix:
- Fixes report stat cards at the real generator level instead of adding patched cards after rendering.
- Defence Rate is now part of the normal statCards output directly after Save Rate.
- All report summary cards now use the same .stat card structure and styling.
- Text is darker for better readability.
- Defence Rate formula:
  (Total Saves + Total Angles Closed Off) / Total Shot Records
  where Total Shot Records = Saves + Goals + Angle Closed Off.
