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
CALL :GETPROPERTY "PG_JEOPARDY_USER" pg_jeopardy_user
CALL :GETPROPERTY "PG_JEOPARDY_PASSWORD" pg_jeopardy_password
CALL :GETPROPERTY "PG_JEOPARDY_DATABASE" pg_jeopardy_database
CALL :GETPROPERTY "PG_JEOPARDY_TABLESPACE" pg_jeopardy_tablespace

REM ------------------ End of variables to be set by user -----------------------------------------
REM ***********************************************************************************************

if "%is_gcp%" == "true" (
echo "in gcp setup"
set pg_jeopardy_tablespace=pg_default
)

REM ******************** NOT TO BE MODIFIED BY USER ***********************************************

set PGUSER=%pg_jeopardy_user%
set PGPASSWORD=%pg_jeopardy_password%
psql -U %pg_jeopardy_user% -d %pg_jeopardy_database% -h %PG_HOST% -p %PGPORT% -v pg_tablespace=%pg_jeopardy_tablespace% -f ./upgrade_5.1.0hf3_to_5.1.0hf4_jeopardy_lock.sql
psql -U %pg_jeopardy_user% -d %pg_jeopardy_database% -h %PG_HOST% -p %PGPORT% -v pg_tablespace=%pg_jeopardy_tablespace% -f ./upgrade_5.1.0hf3_to_5.1.0hf4_ddl.sql

:GETPROPERTY
FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%~dp0\postgres_jeopardy_db.properties") DO (
	IF "%%A"=="%~1" (
		set "%~2=%%B"
	)
)
EXIT /B 0

cmd /k