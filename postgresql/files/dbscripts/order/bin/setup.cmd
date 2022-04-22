REM *****For Dev purpose Only*****
@echo off
SETLOCAL

REM ***********************************************************************************************

REM ------------------ Variables to be set by user ------------------------------------------------
CALL :GETPROPERTY "PG_HOME" PG_HOME
CALL :GETPROPERTY "PG_HOST" PG_HOST
CALL :GETPROPERTY "PG_PORT" PGPORT
CALL :GETPROPERTY "IS_CLOUD_PLATFORM" is_on_cloud
CALL :GETPROPERTY "PG_SUPER_USER_NAME" pg_super_user_name
CALL :GETPROPERTY "PG_SUPER_USER_PASSWORD" pg_super_user_password
CALL :GETPROPERTY "PG_SUPER_USER_DATABASE" pg_super_user_database

set PATH=%PG_HOME%;%PATH%

REM ------------------ Order Database User Inputs -------------------------------------------------
CALL :GETPROPERTY "PG_ORDER_USER" pg_orderds_user
CALL :GETPROPERTY "PG_ORDER_PASSWORD" pg_orderds_password
CALL :GETPROPERTY "PG_ORDER_DATABASE" pg_orderds_database
CALL :GETPROPERTY "PG_ORDER_SCHEMA" pg_orderds_schema
CALL :GETPROPERTY "PG_ORDER_TABLESPACE" pg_orderds_tablespace
CALL :GETPROPERTY "EXECUTE_DDL_DML_ONLY" execute_ddl_dml_only


REM --------------------- Note : Below directory structure should exist prior executing this script
CALL :GETPROPERTY "PG_ORDER_TABLESPACE_LOCATION" pg_orderds_tablespace_location
REM ------------------ End of variables to be set by user -----------------------------------------
REM ***********************************************************************************************

REM ******************** NOT TO BE MODIFIED BY USER ***********************************************
if "%is_on_cloud%" == "true" (
echo "in gcp setup"
set pg_orderds_tablespace=pg_default
)

set PGUSER=%pg_super_user_name%
set PGPASSWORD=%pg_super_user_password%

REM ------------------- DROP Order Data Source STARTS ------------------------------------------------
psql -U %PGUSER% -d %pg_super_user_database% -v pg_schema=%pg_orderds_schema% -h %PG_HOST% -p %PGPORT% -a -f ./drop_schema.sql
psql -U %PGUSER% -d %pg_super_user_database% -v pg_database=%pg_orderds_database% -h %PG_HOST% -p %PGPORT% -a -f ./drop_database.sql
if "%is_on_cloud%" == "false" ( 
psql -U %PGUSER% -v pg_tablespace=%pg_orderds_tablespace% -h %PG_HOST% -p %PGPORT% -f ./drop_tablespace.sql
)
psql -U %PGUSER% -d %pg_super_user_database% -v pg_user=%pg_orderds_user% -h %PG_HOST% -p %PGPORT% -f ./drop_user.sql
REM -------------------DROP ENDS ------------------------------------------------------------------

REM ------------------ Create Order Data Source Starts -----------------------------------------------
set PGUSER=%pg_super_user_name%
set PGPASSWORD=%pg_super_user_password%
psql -U %PGUSER% -d %pg_super_user_database% -v pg_user=%pg_orderds_user% -v pg_password='%pg_orderds_password%' -v pg_super_user=%PGUSER% -h %PG_HOST% -p %PGPORT% -f ./create_user.sql
if "%is_on_cloud%" == "false" ( 
psql -U %PGUSER% -v pg_tablespace=%pg_orderds_tablespace% -v pg_user=%pg_orderds_user% -v pg_tablespace_location='%pg_orderds_tablespace_location%' -h %PG_HOST% -p %PGPORT% -f ./create_tablespace.sql
psql -U %PGUSER% -v pg_database=%pg_orderds_database% -v pg_user=%pg_orderds_user% -v pg_tablespace=%pg_orderds_tablespace% -h %PG_HOST% -p %PGPORT% -f ./create_database.sql
)
if "%is_on_cloud%" == "true" ( 
psql -U %PGUSER% -d %pg_super_user_database% -v pg_database=%pg_orderds_database% -v pg_user=%pg_orderds_user% -v pg_tablespace=%pg_orderds_tablespace% -h %PG_HOST% -p %PGPORT% -f ./create_database_cp.sql
)
set PGUSER=%pg_orderds_user%
set PGPASSWORD=%pg_orderds_password%
psql -U %pg_orderds_user% -d %pg_orderds_database% -v pg_database=%pg_orderds_database% -v pg_schema=%pg_orderds_schema% -v pg_user=%pg_orderds_user% -h %PG_HOST% -p %PGPORT% -f ./create_schema.sql

REM ------------------ DDL and Seed Data Creation For Order Data Source---------------------------------------
set PGUSER=%pg_orderds_user%
set PGPASSWORD=%pg_orderds_password%
psql -U %pg_orderds_user% -d %pg_orderds_database% -h %PG_HOST% -p %PGPORT% -v pg_tablespace=%pg_orderds_tablespace% -f ./oms_seed_orderlock.sql
psql -U %pg_orderds_user% -d %pg_orderds_database% -h %PG_HOST% -p %PGPORT% -v pg_tablespace=%pg_orderds_tablespace% -f ./order_ds_ddl.sql
psql -U %pg_orderds_user% -d %pg_orderds_database% -h %PG_HOST% -p %PGPORT% -v pg_tablespace=%pg_orderds_tablespace% -v default_tenant=%default_tenant% -f ./order_ds_dml.sql

:GETPROPERTY
FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%~dp0\postgres_order_db.properties") DO (
	IF "%%A"=="%~1" (
		set "%~2=%%B"
	)
)
EXIT /B 0