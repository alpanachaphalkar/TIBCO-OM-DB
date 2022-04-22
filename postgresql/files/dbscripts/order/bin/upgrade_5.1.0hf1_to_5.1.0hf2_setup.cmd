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
CALL :GETPROPERTY "PG_ORDER_USER" pg_order_user
CALL :GETPROPERTY "PG_ORDER_PASSWORD" pg_order_password
CALL :GETPROPERTY "PG_ORDER_DATABASE" pg_order_database
CALL :GETPROPERTY "PG_ORDER_TABLESPACE" pg_order_tablespace

REM ------------------ End of variables to be set by user -----------------------------------------
REM ***********************************************************************************************

if "%is_gcp%" == "true" (
echo "in gcp setup"
set pg_order_tablespace=pg_default
)

REM ******************** NOT TO BE MODIFIED BY USER ***********************************************

set PGUSER=%pg_order_user%
set PGPASSWORD=%pg_order_password%
psql -U %pg_order_user% -d %pg_order_database% -h %PG_HOST% -p %PGPORT% -v pg_tablespace=%pg_order_tablespace% -f ./upgrade_5.1.0hf1_to_5.1.0hf2_ddl.sql

:GETPROPERTY
FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%~dp0\postgres_order_db.properties") DO (
	IF "%%A"=="%~1" (
		set "%~2=%%B"
	)
)
EXIT /B 0