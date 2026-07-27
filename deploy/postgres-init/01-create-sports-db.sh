#!/bin/sh
# Runs once on first Postgres boot. Creates the second database used by the
# sports app (routed via core.db_router). The primary DB is created by the
# image from POSTGRES_DB.
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE ${SPORTS_DB:-solakuti_sports} OWNER ${POSTGRES_USER};
EOSQL
