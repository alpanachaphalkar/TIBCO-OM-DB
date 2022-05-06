REM *****For Dev purpose Only*****
@echo off
SETLOCAL

REM ***********************************************************************************************
REM ------------------ Variables to be set by user ------------------------------------------------
CALL :GETPROPERTY "PG_HOME" PG_HOME
CALL :GETPROPERTY "PG_HOST" PG_HOST
CALL :GETPROPERTY "PG_PORT" PGPORT
CALL :GETPROPERTY "IS_CLOUD_PLATFORM" is_on_cloud
set PATH=%PG_HOME%;%PATH%

REM ------------------ Catalog Database User Inputs -------------------------------------------------
CALL :GETPROPERTY "PG_CATALOG_USER" pg_catalogds_user
CALL :GETPROPERTY "PG_CATALOG_PASSWORD" pg_catalogds_password
CALL :GETPROPERTY "PG_CATALOG_DATABASE" pg_catalogds_database
CALL :GETPROPERTY "PG_CATALOG_SCHEMA" pg_catalogds_schema
CALL :GETPROPERTY "PG_CATALOG_TABLESPACE" pg_catalogds_tablespace
CALL :GETPROPERTY "EXECUTE_DDL_DML_ONLY" execute_ddl_dml_only
REM ------------------ End of variables to be set by user -----------------------------------------
REM ***********************************************************************************************

if "%is_on_cloud%" == "true" (
	echo "in gcp setup"
	set pg_catalogds_tablespace=pg_default
)

REM ******************** NOT TO BE MODIFIED BY USER ***********************************************

set PGUSER=%pg_catalogds_user%
set PGPASSWORD=%pg_catalogds_password%
psql -U %pg_catalogds_user% -d %pg_catalogds_database% -h %PG_HOST% -p %PGPORT% -v pg_tablespace=%pg_catalogds_tablespace% -f ./upgrade-5.1.0hf4-to-5.1.0hf5.sql

:GETPROPERTY
FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%~dp0\postgres_catalog_db.properties") DO (
	IF "%%A"=="%~1" (
		set "%~2=%%B"
	)
)
EXIT /B 0