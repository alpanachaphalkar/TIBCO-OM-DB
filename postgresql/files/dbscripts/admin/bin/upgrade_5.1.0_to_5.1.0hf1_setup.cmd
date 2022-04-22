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
CALL :GETPROPERTY "PG_ADMIN_USER" pg_admin_user
CALL :GETPROPERTY "PG_ADMIN_PASSWORD" pg_admin_password
CALL :GETPROPERTY "PG_ADMIN_DATABASE" pg_admin_database
CALL :GETPROPERTY "PG_ADMIN_TABLESPACE" pg_admin_tablespace

REM ------------------ End of variables to be set by user -----------------------------------------
REM ***********************************************************************************************

if "%is_gcp%" == "true" (
echo "in gcp setup"
set pg_admin_tablespace=pg_default
)

REM ******************** NOT TO BE MODIFIED BY USER ***********************************************

set PGUSER=%pg_admin_user%
set PGPASSWORD=%pg_admin_password%
psql -U %pg_admin_user% -d %pg_admin_database% -h %PG_HOST% -p %PGPORT% -v pg_tablespace=%pg_admin_tablespace% -f ./upgrade_5.1.0_to_5.1.0hf1_ddl.sql

:GETPROPERTY
FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%~dp0\postgres_admin_db.properties") DO (
	IF "%%A"=="%~1" (
		set "%~2=%%B"
	)
)
EXIT /B 0