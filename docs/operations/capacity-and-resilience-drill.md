# Capacity and Resilience Drill

This guide runs the accepted M6.3 evidence suite. It is intentionally local, on-demand, and isolated from ordinary development data. It does not establish a production capacity guarantee.

## Capacity scenario

Run the full five-minute scenario from the repository root:

```sh
bash scripts/run-capacity-scenario.sh
```

It creates 100 active games, holds 500 authenticated Socket.IO clients, and distributes legal moves for five minutes. The runner rebuilds the load-client image so the JSON report always reflects the checked-out scenario code. A JSON report is written to `artifacts/capacity/`; generated evidence is ignored by Git.

The report passes only when all requested sockets connected, valid move errors are below 1%, and client-observed p95 move latency is below 100 ms. Interpret those figures together with the recorded host and Docker environment.

The accepted M6.3 corrected-profile run retained 500 connections, accepted 1,100 moves with zero valid-command errors and zero socket disconnects, and reported 15 ms p50 / 21 ms p95 client-observed move latency. This is local reproducibility evidence, not a public production guarantee.

Clean up the isolated services and data after reviewing the report:

```sh
docker compose -p chess-ai-capacity -f compose.capacity.yaml down --volumes --remove-orphans
```

## Restart, reconnect, backup, and restore drill

Run this only from the repository root:

```sh
bash scripts/run-resilience-drill.sh
```

The script creates a timed game in the isolated capacity database, records the authoritative snapshot, creates a PostgreSQL custom-format backup, restores it into a second disposable database, restarts the API, reconnects both player sessions, and compares position, history, turn, status, version, time control, and clocks.

The script never targets the normal development Compose project or a production database. It leaves its generated JSON state and local backup under `artifacts/capacity/` for inspection. Remove the isolated project when finished:

```sh
docker compose -p chess-ai-resilience -f compose.capacity.yaml down --volumes --remove-orphans
```
