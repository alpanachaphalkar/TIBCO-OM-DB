REM *****For Dev purpose Only*****
@echo off
SETLOCAL

REM ***********************************************************************************************

REM ------------------ Variables to be set by user ------------------------------------------------
CALL :GETPROPERTY "PG_HOME" PG_HOME
CALL :GETPROPERTY "PG_HOST" PG_HOST
CALL :GETPROPERTY "PG_PORT" PGPORT
CALL :GETPROPERTY "IS_CLOUD_PLATFORM" is_gcp
CALL :GETPROPERTY "PG_SUPER_USER_NAME" pg_super_user_name
CALL :GETPROPERTY "PG_SUPER_USER_PASSWORD" pg_super_user_password
CALL :GETPROPERTY "PG_SUPER_USER_DATABASE" pg_super_user_database

set PATH=%PG_HOME%;%PATH%

REM ------------------ orch Database User Inputs -------------------------------------------------
CALL :GETPROPERTY "PG_ORCH_USER" pg_orch_user
CALL :GETPROPERTY "PG_ORCH_PASSWORD" pg_orch_password
CALL :GETPROPERTY "PG_ORCH_DATABASE" pg_orch_database
CALL :GETPROPERTY "PG_ORCH_SCHEMA" pg_orch_schema
CALL :GETPROPERTY "PG_ORCH_TABLESPACE" pg_orch_tablespace
CALL :GETPROPERTY "EXECUTE_DDL_DML_ONLY" execute_ddl_dml_only

REM --------------------- Note : Below directory structure should exist prior executing this script
CALL :GETPROPERTY "PG_ORCH_TABLESPACE_LOCATION" pg_orch_tablespace_location
REM ------------------ End of variables to be set by user -----------------------------------------
REM ***********************************************************************************************

if "%is_gcp%" == "true" (
	echo "in gcp setup"
	set pg_orch_tablespace=pg_default
)

REM ******************** NOT TO BE MODIFIED BY USER ***********************************************
set PGUSER=%pg_super_user_name%
set PGPASSWORD=%pg_super_user_password%

REM ------------------- DROP orch Database STARTS ------------------------------------------------
psql -U %PGUSER% -d %pg_super_user_database% -v pg_schema=%pg_orch_schema% -h %PG_HOST% -p %PGPORT% -a -f ./drop_schema.sql
psql -U %PGUSER% -d %pg_super_user_database% -v pg_database=%pg_orch_database% -h %PG_HOST% -p %PGPORT% -a -f ./drop_database.sql
if "%is_gcp%" == "false" (
	psql -U %PGUSER% -v pg_tablespace=%pg_orch_tablespace% -h %PG_HOST% -p %PGPORT% -f ./drop_tablespace.sql
)
psql -U %PGUSER% -d %pg_super_user_database% -v pg_user=%pg_orch_user% -h %PG_HOST% -p %PGPORT% -f ./drop_user.sql
REM -------------------DROP ENDS ------------------------------------------------------------------

REM ------------------ Create orch Database Starts -----------------------------------------------
set PGUSER=%pg_super_user_name%
set PGPASSWORD=%pg_super_user_password%
psql -U %PGUSER% -d %pg_super_user_database% -v pg_user=%pg_orch_user% -v pg_password='%pg_orch_password%' -v pg_super_user=%PGUSER% -h %PG_HOST% -p %PGPORT% -f ./create_user.sql
if "%is_gcp%" == "false" ( 
	psql -U %PGUSER% -v pg_tablespace=%pg_orch_tablespace% -v pg_user=%pg_orch_user% -v pg_tablespace_location='%pg_orch_tablespace_location%' -h %PG_HOST% -p %PGPORT% -f ./create_tablespace.sql
	psql -U %PGUSER% -v pg_database=%pg_orch_database% -v pg_user=%pg_orch_user% -v pg_tablespace=%pg_orch_tablespace% -h %PG_HOST% -p %PGPORT% -f ./create_database.sql
)
if "%is_gcp%" == "true" ( 
	psql -U %PGUSER% -d %pg_super_user_database% -v pg_database=%pg_orch_database% -v pg_user=%pg_orch_user% -v pg_tablespace=%pg_orch_tablespace% -h %PG_HOST% -p %PGPORT% -f ./create_database_gcp.sql
)
set PGUSER=%pg_orch_user%
set PGPASSWORD=%pg_orch_password%
psql -U %pg_orch_user% -d %pg_orch_database% -v pg_database=%pg_orch_database% -v pg_schema=%pg_orch_schema% -v pg_user=%pg_orch_user% -h %PG_HOST% -p %PGPORT% -f ./create_schema.sql

REM ------------------ DDL and Seed Data Creation For orch ---------------------------------------
set PGUSER=%pg_orch_user%
set PGPASSWORD=%pg_orch_password%
psql -U %pg_orch_user% -d %pg_orch_database% -h %PG_HOST% -p %PGPORT% -v pg_tablespace=%pg_orch_tablespace% -f ./database_ddl.sql

:GETPROPERTY
FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%~dp0\postgres_orch_db.properties") DO (
	IF "%%A"=="%~1" (
		set "%~2=%%B"
	)
)
EXIT /B 0