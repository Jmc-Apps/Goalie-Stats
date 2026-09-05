Hockey Goalie Stats - Main App Package

Version 5.65 adds controlled period selection and preserves historical teams in reporting.

Version 5.65 additions:

- Number of Periods is now selected from 1, 2, 4 or Custom in Match setup.
- Match Editor uses the same 1, 2, 4 or Custom period selector.
- Custom period totals are recalculated from the match's End Period markers.
- Adding, deleting or reordering period markers keeps Custom matches current.
- Team reports list both the goalie's current profile teams and every home team retained in saved matches.
- Removing a team from the goalie profile no longer removes that team's historical reporting option.
- Duplicate and blank team names are removed from the report selector.

Version 5.64 applies safe interface, cache and maintainability cleanup without changing match data or video calculations.

Version 5.64 additions:

- Reduced the main banner to 75% of its previous displayed size.
- Removed nonessential instructional descriptions while retaining errors, warnings, progress and empty states.
- Restyled Camera Run break controls as compact professional dividers.
- Locked waveform sync-marker pills to 25% opacity with a solid centre alignment line.
- Corrected sync-point colour cycling to use the complete eight-colour palette.
- Corrected the offline service-worker fallback.
- Preserved all v5.63 progressive waveform and authoritative period-marker improvements.

Version 5.63 additions:
- Waveform rows appear immediately instead of waiting for every large clip to decode.
- Each clip waveform is added progressively with visible generation progress.
- Missing video access and audio decoding failures now show a clear status.
- Stale waveform work from another Camera Run cannot replace the selected run.
- Visible waveforms refresh automatically after external-drive videos reconnect.
- Period-end markers now determine each shot's authoritative period everywhere.
- Match Timeline, shot export selector, video-linked clip lists and exported overlays use the same period.

Version 5.62 fixes Camera Run-local scrubbing and playback after seeking.

Version 5.62 additions:
- The master playback clock is calculated from the selected Camera Run only.
- Durations from earlier Camera Runs are never added to the selected run's current time.
- Releasing the timeline or pressing Play no longer snaps Camera Run 2 back to its endpoint.
- Timeline seeks remain locked until the source video confirms the requested position.
- Same-clip seeking and seeking across clip boundaries use the same confirmed-seek workflow.
- Playback and time-update events preserve the corrected Camera Run-local position.

Version 5.61 per-Camera-Run state additions retained:
- Every angle stores its clip, source position and unified playhead separately for each Camera Run.
- Returning to a Camera Run restores that run's own saved position instead of another run's endpoint.
- New Camera Runs open at their first available frame when they do not yet have a saved position.
- Timeline dragging keeps the requested position locked while the video seeks or changes clips.
- Playback updates cannot push the slider back while the user is dragging it.
- Seeking inside the current clip changes its source time directly instead of reloading the clip.
- Crossing a clip boundary loads only the required clip and resumes playback after the seek completes.
- Framing is stored separately for every angle and Camera Run.
- Playback, second-screen viewing and export all use the selected run's framing.

Version 5.60 Camera Run timeline corrections retained:
- Changing Camera Runs resets the unified playhead to the selected run's first available frame.
- The previous Camera Run can no longer supply a sync anchor to the newly selected run.
- Clip durations are resolved before the selected Camera Run's start and endpoint are finalized.
- The timeline draws only clips from the selected Camera Run.
- Shot markers are filtered to the selected Camera Run, including older saved shots when their clip can identify the run.
- Newly saved video-linked shots record their Camera Run explicitly.
- Main-window and second-screen time displays are clamped to the selected Camera Run's valid range.

Version 5.59 second-screen additions retained:
- Open Second-Screen Player appears beside the existing Full Screen control.
- The separate resizable player window mirrors the exact reframed video shown in the main player.
- Playback position, play/pause, Camera Run, active angle, speed, volume and framing stay synchronized.
- The second-screen window includes its own playback controls, unified timeline, Camera Run selector and angle buttons.
- Zoom, reset framing and fullscreen controls are available in the second-screen window.
- Closing and reopening the player reconnects it to the current match and playback state.
- Chrome pop-up blocking is detected with a clear instruction to allow the window.
- Deleting an End of Period marker now uses a normal confirmation instead of a six-digit code.

Version 5.58 Switch Angles additions retained:
- A separate collapsible Switch Angles panel appears at the top of Video Angles.
- One full-width button is shown for every loaded angle, using the angle's name.
- The currently playing angle is clearly highlighted.
- Switching angles keeps the same unified timeline position and preserves playback state, speed and volume.
- If an angle has no footage at the current time, its existing no-footage state is shown without moving the timeline.
- The collapsed Switch Angles header shows the active angle name.

Version 5.57 sidebar additions retained:
- Add and Batch Videos, External Video Library and Loaded Video Angles are separate collapsible panels.
- Each panel collapses to its section header and compact live summary.
- Header chevrons show whether a panel will expand or collapse.
- External Video Library shows Connected, Working, Access Required or Drive Unavailable in its collapsed header.
- Loaded Video Angles shows the current angle and clip totals.
- Collapsed panel choices persist when returning to Video Stats Review or opening another match.
- Collapsing a panel does not pause playback, remove video URLs or disconnect the external drive.

Version 5.56 interface corrections retained:

Version 5.56 interface corrections:
- The Match Folder Name field now uses the full available width.
- Copy Folder Name is a full-width horizontal pill beneath the folder-name field.
- Choose Video Library Folder, Use Existing Match Folder, Import Match Folder to Library and Allow Video Access each occupy a separate full-width row.
- Video-library button labels remain on one line and no longer form oversized circular controls.
- Save Video-Linked Shot and Clear Shot now appear beneath the D and Goal Box heat maps.
- End Period remains at the top of Record Shot.

Version 5.55 external-drive video library retained:

Version 5.55 video-library additions:
- Choose a Video Library Folder on an internal or external drive.
- Chrome stores the selected folder handle and reopens the match folder when permission remains available.
- Allow Video Access restores saved folder permission without selecting every clip again.
- Batch Add Videos connects an existing match folder directly.
- Use Existing Match Folder finds the current match inside the selected Video Library Folder.
- Import Match Folder to Library copies a complete match folder into the selected library using streamed file writes.
- Import never deletes the original files.
- Matching destination files with the same filename and size are not copied again.
- A read-only Match Folder Name field provides the correct folder-safe match name.
- Copy Folder Name copies that name and confirms completion.
- Each first-level folder in the match folder becomes an angle using the folder's exact name.
- Numbered folders inside an angle, such as 1, 2, 3 and 4, become Camera Runs in numeric order.
- Clips inside every Camera Run use natural filename ordering.
- Angle folders without numbered subfolders continue to load as Camera Run 1.
- Disconnecting an external drive does not erase the saved match or clip information.

Version 5.54 export and playback corrections retained:
- Playback and export use the same source-pixel crop calculation.
- Each angle stores normalized crop centre and zoom values independently of screen size.
- Portrait footage can be reframed into a landscape crop without exporting the unused portrait area.
- Export freezes the angle's normalized crop and playback aspect ratio before loading the source range.
- Existing angle zoom and pan values are migrated into the normalized crop model when video dimensions become available.
- Selecting an older shot no longer replaces the angle's current framing.
- Pan and zoom changes are saved to that angle and restored when returning to it.
- Source audio is merged into the exported recording independently of the playback volume control.
- The complete app logo is embedded at export-safe resolution and drawn without cropping.
- Newly recorded video-linked shots appear immediately in Shot to Export and are automatically selected.
- The overlay shows the period without displaying a potentially inaccurate gameplay time.
- Overlay rows now show Situation, Shot Type, Outnumbered and Rebound without inferring one field from another.
- Set Clip In and Set Clip Out update immediately, persist their positions and validate that Out is later than In.
- The Video Stats Review banner is displayed at 75% of its previous width.
- A new match clears the loaded player, angles, clips, Camera Runs, sync state, waveforms and export selection from the active workspace.
- Finalizing a match resets the active Video Stats Review workspace.

Export updates:
- The app logo is embedded in the export renderer so overlay exports remain origin-clean.
- Exported clips use the selected angle's playback zoom and pan.
- Shot to Export lists every video-linked shot and drives single-shot export.
- The single-shot action is labelled Export Selected Shot - Current Angle.

Playback and match updates:
- Speaker/mute button, 0-100 volume slider, percentage readout and saved volume.
- Playback volume remains consistent across clips and angles.
- Record Shot selection pills visibly highlight the current choices.
- End Period remains at the top of Record Shot.
- New and finalized matches receive a clean active Video Stats Review workspace.

Included:
- index.html
- goalie_stats_app_v5_65.html
- app icons and PWA manifest
- service worker
- app assets
- resources/Data_Driven_Development_Theory.pdf
- resources/FIH_Rules_of_Hockey_2026.pdf
- resources/Hockey_Goalie_Stats_Main_App_User_Manual.pdf
- resources/Goalie_Stats_Recorder_User_Manual.pdf

Current build notes:
- Video Review controls are grouped by purpose.
- Prev and Next clip buttons were removed.
- The Reports shortcut button was removed from Video Stats Review.
- Angle cards now show Edit Videos instead of listing all clips.
- Edit Videos lets users add, remove and reorder clips for that angle.
- Batch clip export now warns that browsers may ask permission to allow multiple downloads.
- Same-day duplicate matches against the same opponent are numbered from 2 upward.
- Existing reports, resources, print-safe timelines and single README packaging are preserved.

Recommended use:
- Back up app data before replacing an installed copy.
- Refresh the browser or clear the PWA cache after updating if the old version remains visible.
- For reliable automatic video reload, use Chrome or an installed Chrome PWA and grant access to the selected Video Library Folder.
- Keep the external drive connected when opening a match. If Chrome requests access again, select Allow Video Access.
