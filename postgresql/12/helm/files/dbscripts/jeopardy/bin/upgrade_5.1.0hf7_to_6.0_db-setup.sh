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

PGUSER="${pg_jeopardy_user}";
PGPASSWORD="${pg_jeopardy_password}"; export PGPASSWORD;
psql -U "${pg_jeopardy_user}" -d "${pg_jeopardy_database}" -h "${PG_HOST}" -p "${PG_PORT}" -v pg_tablespace="${pg_jeopardy_tablespace}" -f $SCRIPTPATH/upgrade_5.1.0hf7_to_6.0_ddl.sql
# Copyright (c) 2018-2021. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
