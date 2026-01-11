@echo off
REM Export data from local PostgreSQL database
echo Exporting data from local database...

REM Set your PostgreSQL credentials
set PGUSER=postgres
set PGPASSWORD=sharma2059
set PGHOST=localhost
set PGPORT=5432
set PGDATABASE=next_auth

REM Export only data (not schema) as INSERT statements
pg_dump -U %PGUSER% -d %PGDATABASE% --data-only --inserts --column-inserts -f data_export.sql

echo.
echo ✓ Data exported to: data_export.sql
echo.
echo Next steps:
echo 1. Go to Neon SQL Editor
echo 2. Copy the content of data_export.sql
echo 3. Paste and run it in Neon
echo.
pause
