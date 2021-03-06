#!/bin/sh

PROPERTY_FILE=postgres_catalog_db.properties

getProperty () {
   PROP_KEY=$1
   PROP_VALUE=`cat $PROPERTY_FILE | grep -w "$PROP_KEY" | cut -d'=' -f2`
   echo $PROP_VALUE
}

echo "# Reading  property from $PROPERTY_FILE"

PG_HOST=$(getProperty "PG_HOST")
PG_PORT=$(getProperty "PG_PORT")

pg_catalogds_user=$(getProperty "PG_CATALOG_USER")
pg_catalogds_password=$(getProperty "PG_CATALOG_PASSWORD")
pg_catalogds_database=$(getProperty "PG_CATALOG_DATABASE")
pg_catalogds_schema=$(getProperty "PG_CATALOG_SCHEMA")
pg_catalogds_tablespace=$(getProperty "PG_CATALOG_TABLESPACE")
is_on_cloud=$(getProperty "IS_CLOUD_PLATFORM")
execute_ddl_dml_only=$(getProperty "EXECUTE_DDL_DML_ONLY")

SCRIPTPATH=$(dirname "$SCRIPT")
SCRIPTPATH=$SCRIPTPATH/../scripts

if [ "$is_on_cloud" = true ] ; then
	pg_catalogds_tablespace="pg_default"
fi


PGUSER="${pg_catalogds_user}";
PGPASSWORD="${pg_catalogds_password}"; export PGPASSWORD;

psql -U "${pg_catalogds_user}" -d "${pg_catalogds_database}" -h "${PG_HOST}" -p "${PG_PORT}" -v pg_tablespace="${pg_catalogds_tablespace}" -f $SCRIPTPATH/upgrade-5.1.0hf4-to-5.1.0hf5.sql
# Copyright (c) 2018-2021. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
