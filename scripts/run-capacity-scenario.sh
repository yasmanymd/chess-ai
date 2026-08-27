#!/usr/bin/env bash
set -euo pipefail

project_name="chess-ai-capacity"
compose_file="compose.capacity.yaml"

docker compose -p "${project_name}" -f "${compose_file}" up --build --detach postgres migrate server caddy
docker compose -p "${project_name}" -f "${compose_file}" build load
docker compose -p "${project_name}" -f "${compose_file}" run --rm load
