#!/bin/sh

PROPERTY_FILE=postgres_admin_db.properties

getProperty () {
   PROP_KEY=$1
   PROP_VALUE=`cat $PROPERTY_FILE | grep -w "$PROP_KEY" | cut -d'=' -f2`
   echo $PROP_VALUE
}

echo "#  Reading property from $PROPERTY_FILE"

PG_HOST=$(getProperty "PG_HOST")
PG_PORT=$(getProperty "PG_PORT")
pg_super_user_database=$(getProperty "PG_SUPER_USER_DATABASE")

pg_admin_user=$(getProperty "PG_ADMIN_USER")
pg_admin_password=$(getProperty "PG_ADMIN_PASSWORD")
pg_admin_database=$(getProperty "PG_ADMIN_DATABASE")
pg_admin_schema=$(getProperty "PG_ADMIN_SCHEMA")
pg_admin_tablespace=$(getProperty "PG_ADMIN_TABLESPACE")

pg_admin_tablespace_location=$(getProperty "PG_ADMIN_TABLESPACE_LOCATION")
is_on_cloud=$(getProperty "IS_CLOUD_PLATFORM")
execute_ddl_dml_only=$(getProperty "EXECUTE_DDL_DML_ONLY")

SCRIPTPATH=$(dirname "$SCRIPT")
SCRIPTPATH=$SCRIPTPATH/../scripts

if [ "$is_on_cloud" = true ] ; then
	pg_admin_tablespace="pg_default"
fi

# --------------------------- DDL and Seed Data Creation For Admin --------------------------------
PGUSER="${pg_admin_user}";
PGPASSWORD="${pg_admin_password}"; export PGPASSWORD;

psql -U "${pg_admin_user}" -d "${pg_admin_database}" -h "${PG_HOST}" -p "${PG_PORT}" -v pg_tablespace="${pg_admin_tablespace}" -f $SCRIPTPATH/upgrade_5.1.0_to_6.0_ddl.sql
psql -U "${pg_admin_user}" -d "${pg_admin_database}" -h "${PG_HOST}" -p "${PG_PORT}" -v pg_tablespace="${pg_admin_tablespace}" -f $SCRIPTPATH/proc_app_properties_change.sql
psql -U "${pg_admin_user}" -d "${pg_admin_database}" -h "${PG_HOST}" -p "${PG_PORT}" -v pg_tablespace="${pg_admin_tablespace}" -f $SCRIPTPATH/proc_get_timestamp.sql
# Copyright (c) 2018-2021. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
