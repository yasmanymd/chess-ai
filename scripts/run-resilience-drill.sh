#!/usr/bin/env bash
set -euo pipefail

project_name="chess-ai-resilience"
compose_file="compose.capacity.yaml"
artifact_directory="artifacts/capacity"
state_file="${artifact_directory}/resilience-state.json"
backup_file="${artifact_directory}/resilience-backup.dump"

mkdir -p "${artifact_directory}"

docker compose -p "${project_name}" -f "${compose_file}" up --build --detach postgres migrate server caddy
docker compose -p "${project_name}" -f "${compose_file}" run --rm \
  -e RESILIENCE_PHASE=setup \
  -e RESILIENCE_STATE_FILE="/workspace/${state_file}" \
  load node apps/web/scripts/resilience.mjs

docker compose -p "${project_name}" -f "${compose_file}" exec -T postgres \
  pg_dump -U chess_ai -Fc chess_ai_capacity >"${backup_file}"
original_games="$(docker compose -p "${project_name}" -f "${compose_file}" exec -T postgres \
  psql -U chess_ai -d chess_ai_capacity -tAc 'select count(*) from active_games')"
docker compose -p "${project_name}" -f "${compose_file}" exec -T postgres \
  dropdb -U chess_ai --if-exists chess_ai_capacity_restore
docker compose -p "${project_name}" -f "${compose_file}" exec -T postgres \
  createdb -U chess_ai chess_ai_capacity_restore
docker compose -p "${project_name}" -f "${compose_file}" exec -T postgres \
  pg_restore -U chess_ai -d chess_ai_capacity_restore <"${backup_file}"
restored_games="$(docker compose -p "${project_name}" -f "${compose_file}" exec -T postgres \
  psql -U chess_ai -d chess_ai_capacity_restore -tAc 'select count(*) from active_games')"
test "${original_games}" = "${restored_games}"

docker compose -p "${project_name}" -f "${compose_file}" restart server
docker compose -p "${project_name}" -f "${compose_file}" run --rm \
  -e RESILIENCE_PHASE=verify \
  -e RESILIENCE_STATE_FILE="/workspace/${state_file}" \
  load node apps/web/scripts/resilience.mjs

echo "Resilience drill passed. Backup: ${backup_file}; state: ${state_file}"
