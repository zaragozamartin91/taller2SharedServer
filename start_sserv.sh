#!/bin/bash
docker run --rm --name sserv --link some-postgres:postgres -e PORT=5001 -e PGHOST=postgres -p 5001:5001 sserv
