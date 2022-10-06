#!/bin/sh

PROPERTY_FILE=postgres_jeopardy_db.properties

getProperty () {
   PROP_KEY=$1
   PROP_VALUE=`cat $PROPERTY_FILE | grep -w "$PROP_KEY" | cut -d'=' -f2`
   echo $PROP_VALUE
}

echo "# Reading  property from $PROPERTY_FILE"

PG_HOST=$(getProperty "PG_HOST")
PG_PORT=$(getProperty "PG_PORT")
pg_super_user_database=$(getProperty "PG_SUPER_USER_DATABASE")

pg_jeopardy_user=$(getProperty "PG_JEOPARDY_USER")
pg_jeopardy_password=$(getProperty "PG_JEOPARDY_PASSWORD")
pg_jeopardy_database=$(getProperty "PG_JEOPARDY_DATABASE")
pg_jeopardy_schema=$(getProperty "PG_JEOPARDY_SCHEMA")
pg_jeopardy_tablespace=$(getProperty "PG_JEOPARDY_TABLESPACE")

pg_jeopardy_tablespace_location=$(getProperty "PG_JEOPARDY_TABLESPACE_LOCATION")
is_on_cloud=$(getProperty "IS_CLOUD_PLATFORM")
default_tenant=$(getProperty "default_tenant")
execute_ddl_dml_only=$(getProperty "EXECUTE_DDL_DML_ONLY")

SCRIPTPATH=$(dirname "$SCRIPT")
SCRIPTPATH=$SCRIPTPATH/../scripts

if [ "$is_on_cloud" = true ] ; then
	pg_jeopardy_tablespace="pg_default"
fi
if [ "$execute_ddl_dml_only" = false ] ; then
	pg_super_user_name=$(getProperty "PG_SUPER_USER_NAME")
	pg_super_user_password=$(getProperty "PG_SUPER_USER_PASSWORD")
	PGUSER="${pg_super_user_name}";
	PGPASSWORD="${pg_super_user_password}"; export PGPASSWORD;
echo "# --------------------- DROP jeopardy Database STARTS ------------------------------------------------"
	psql -U "${PGUSER}" -d "${pg_super_user_database}" -v pg_schema="${pg_jeopardy_schema}" -h "${PG_HOST}" -p "${PG_PORT}" -a -f $SCRIPTPATH/drop_schema.sql
	psql -U "${PGUSER}" -d "${pg_super_user_database}" -v pg_database="${pg_jeopardy_database}" -h "${PG_HOST}" -p "${PG_PORT}" -a -f $SCRIPTPATH/drop_database.sql
	if [ "$is_on_cloud" = false ] ; then
	  psql -U "${PGUSER}" -v pg_tablespace="${pg_jeopardy_tablespace}" -h "${PG_HOST}" -p "${PG_PORT}" -f $SCRIPTPATH/drop_tablespace.sql
	fi
	psql -U "${PGUSER}" -d "${pg_super_user_database}" -v pg_user="${pg_jeopardy_user}" -h "${PG_HOST}" -p "${PG_PORT}" -f $SCRIPTPATH/drop_user.sql
echo "# ---------------------DROP ENDS ------------------------------------------------------------------"

echo "# ---------------------------- Create jeopardy Database Starts ---------------------------------------"
	PGUSER="${pg_super_user_name}";
	PGPASSWORD="${pg_super_user_password}"; export PGPASSWORD;
	psql -U "${PGUSER}" -d "${pg_super_user_database}" -v pg_user="${pg_jeopardy_user}" -v pg_password="'${pg_jeopardy_password}'" -v pg_super_user="${PGUSER}" -h "${PG_HOST}" -p "${PG_PORT}" -f $SCRIPTPATH/create_user.sql
	if [ "$is_on_cloud" = false ] ; then
	  psql -U "${PGUSER}" -v pg_tablespace="${pg_jeopardy_tablespace}" -v pg_user="${pg_jeopardy_user}" -v pg_tablespace_location="'${pg_jeopardy_tablespace_location}'" -h "${PG_HOST}" -p "${PG_PORT}" -f $SCRIPTPATH/create_tablespace.sql
	  psql -U "${PGUSER}" -v pg_database="${pg_jeopardy_database}" -v pg_user="${pg_jeopardy_user}" -v pg_tablespace="${pg_jeopardy_tablespace}" -h "${PG_HOST}" -p "${PG_PORT}" -f $SCRIPTPATH/create_database.sql
	else
	  psql -U "${PGUSER}" -d "${pg_super_user_database}" -v pg_database="${pg_jeopardy_database}" -v pg_user="${pg_jeopardy_user}" -v pg_tablespace="${pg_jeopardy_tablespace}" -h "${PG_HOST}" -p "${PG_PORT}" -f $SCRIPTPATH/create_database_cp.sql
	fi
	PGUSER="${pg_jeopardy_user}";
	PGPASSWORD="${pg_jeopardy_password}"; export PGPASSWORD;
	psql -U "${pg_jeopardy_user}" -d "${pg_jeopardy_database}" -v pg_database="${pg_jeopardy_database}" -v pg_schema="${pg_jeopardy_schema}" -v pg_user="${pg_jeopardy_user}" -h "${PG_HOST}" -p "${PG_PORT}" -f $SCRIPTPATH/create_schema.sql
fi

echo "# --------------------------- DDL and Seed Data Creation For jeopardy --------------------------------"
PGUSER="${pg_jeopardy_user}";
PGPASSWORD="${pg_jeopardy_password}"; export PGPASSWORD;
psql -U "${pg_jeopardy_user}" -d "${pg_jeopardy_database}" -h "${PG_HOST}" -p "${PG_PORT}" -v pg_tablespace="${pg_jeopardy_tablespace}" -f $SCRIPTPATH/oms_seed_jeopardylock.sql
psql -U "${pg_jeopardy_user}" -d "${pg_jeopardy_database}" -h "${PG_HOST}" -p "${PG_PORT}" -v pg_tablespace="${pg_jeopardy_tablespace}" -f $SCRIPTPATH/jeopardy_database_ddl.sql
psql -U "${pg_jeopardy_user}" -d "${pg_jeopardy_database}" -h "${PG_HOST}" -p "${PG_PORT}" -v pg_tablespace="${pg_jeopardy_tablespace}" -v default_tenant="${default_tenant}" -f $SCRIPTPATH/jeopardy_database_dml.sql
# Copyright (c) 2018-2021. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
