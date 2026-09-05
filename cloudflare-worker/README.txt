Hockey Goalie Stats Benchmark Worker v1.0

The live Worker must contain the supplied benchmark API before app v5.80 can upload benchmark data.

Cloudflare dashboard deployment:

1. Open Workers & Pages, then hgs-benchmark-api.
2. Replace the current Worker code with worker.js and deploy it.
3. Open D1, select hgs-benchmarks-prod, open Console and run schema.sql.
4. In the Worker's Settings, confirm the D1 binding variable is DB and points to hgs-benchmarks-prod.
5. Open https://hgs-benchmark-api.datadrivendevelopmenthgs.workers.dev/api/v1/health
6. Confirm the response says {"ok":true,"database":"connected"}.
7. Open app v5.80, opt in and select Upload Data & Refresh Benchmarks.

Duplicate protection:

- Each anonymous goalkeeper has a permanent goalkeeper_id.
- Each match has a permanent benchmark_match_id.
- The database primary key is goalkeeper_id plus benchmark_match_id.
- Re-uploading replaces the saved version of that match and its shots.
- Matches removed from the authoritative eligible upload are removed centrally.

Privacy:

- The app sends no goalkeeper names, team names, opponent names or match names.
- Opting out removes the anonymous goalkeeper, matches and shots from the central database.
