#!/bin/sh

PROPERTY_FILE=postgres_admin_db.properties

getProperty () {
   PROP_KEY=$1
   PROP_VALUE=`cat $PROPERTY_FILE | grep -w "$PROP_KEY" | cut -d'=' -f2`
   echo $PROP_VALUE
}

echo "# Reading  property from $PROPERTY_FILE"

PG_HOST=$(getProperty "PG_HOST")
PG_PORT=$(getProperty "PG_PORT")

pg_admin_user=$(getProperty "PG_ADMIN_USER")
pg_admin_password=$(getProperty "PG_ADMIN_PASSWORD")
pg_admin_database=$(getProperty "PG_ADMIN_DATABASE")
pg_admin_tablespace=$(getProperty "PG_ADMIN_TABLESPACE")

is_on_cloud=$(getProperty "IS_CLOUD_PLATFORM")

SCRIPTPATH=$(dirname "$SCRIPT")
SCRIPTPATH=$SCRIPTPATH/../scripts

if [ "$is_on_cloud" = true ] ; then
pg_admin_tablespace="pg_default"
fi


PGUSER="${pg_admin_user}";
PGPASSWORD="${pg_admin_password}"; export PGPASSWORD;

psql -U "${pg_admin_user}" -d "${pg_admin_database}" -h "${PG_HOST}" -p "${PG_PORT}" -v pg_tablespace="${pg_admin_tablespace}" -f $SCRIPTPATH/upgrade_5.1.0hf5_to_5.1.0hf6_ddl.sql
# Copyright (c) 2018-2021. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
