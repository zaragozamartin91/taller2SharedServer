#!/bin/bash
docker run --rm --name some-postgres -e POSTGRES_PASSWORD=root -e POSTGRES_USER=root -e POSTGRES_DB=sharedserv -p 5432:5432 -d postgres
