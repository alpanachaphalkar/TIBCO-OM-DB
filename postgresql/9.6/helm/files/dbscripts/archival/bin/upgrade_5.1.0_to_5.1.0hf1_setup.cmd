REM *****For Dev purpose Only*****
@echo off
SETLOCAL

REM ***********************************************************************************************
REM ------------------ Variables to be set by user ------------------------------------------------
CALL :GETPROPERTY "PG_HOME" PG_HOME
CALL :GETPROPERTY "PG_HOST" PG_HOST
CALL :GETPROPERTY "PG_PORT" PGPORT
CALL :GETPROPERTY "IS_CLOUD_PLATFORM" is_gcp

set PATH=%PG_HOME%;%PATH%

REM ------------------ Admin Database User Inputs -------------------------------------------------
CALL :GETPROPERTY "PG_ARCHIVAL_USER" pg_archival_user
CALL :GETPROPERTY "PG_ARCHIVAL_PASSWORD" pg_archival_password
CALL :GETPROPERTY "PG_ARCHIVAL_DATABASE" pg_archival_database
CALL :GETPROPERTY "PG_ARCHIVAL_TABLESPACE" pg_archival_tablespace

REM ------------------ End of variables to be set by user -----------------------------------------
REM ***********************************************************************************************

if "%is_gcp%" == "true" (
echo "in gcp setup"
set pg_archival_tablespace=pg_default
)

REM ******************** NOT TO BE MODIFIED BY USER ***********************************************

set PGUSER=%pg_archival_user%
set PGPASSWORD=%pg_archival_password%
psql -U %pg_archival_user% -d %pg_archival_database% -h %PG_HOST% -p %PGPORT% -v pg_tablespace=%pg_archival_tablespace% -f ./upgrade_5.1.0_to_5.1.0hf1_ddl.sql

:GETPROPERTY
FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%~dp0\postgres_archival_db.properties") DO (
	IF "%%A"=="%~1" (
		set "%~2=%%B"
	)
)
EXIT /B 0