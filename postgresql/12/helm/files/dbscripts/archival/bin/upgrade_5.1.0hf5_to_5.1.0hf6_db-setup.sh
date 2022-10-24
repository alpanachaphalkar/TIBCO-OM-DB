#!/bin/sh

PROPERTY_FILE=postgres_archival_db.properties

getProperty () {
   PROP_KEY=$1
   PROP_VALUE=`cat $PROPERTY_FILE | grep -w "$PROP_KEY" | cut -d'=' -f2`
   echo $PROP_VALUE
}

echo "# Reading property from $PROPERTY_FILE"

PG_HOST=$(getProperty "PG_HOST")
PG_PORT=$(getProperty "PG_PORT")

pg_archival_user=$(getProperty "PG_ARCHIVAL_USER")
pg_archival_password=$(getProperty "PG_ARCHIVAL_PASSWORD")
pg_archival_database=$(getProperty "PG_ARCHIVAL_DATABASE")
pg_archival_tablespace=$(getProperty "PG_ARCHIVAL_TABLESPACE")

is_on_cloud=$(getProperty "IS_CLOUD_PLATFORM")

SCRIPTPATH=$(dirname "$SCRIPT")
SCRIPTPATH=$SCRIPTPATH/../scripts

if [ "$is_on_cloud" = true ] ; then
pg_archival_tablespace="pg_default"
fi


PGUSER="${pg_archival_user}";
PGPASSWORD="${pg_archival_password}"; export PGPASSWORD;

psql -U "${pg_archival_user}" -d "${pg_archival_database}" -h "${PG_HOST}" -p "${PG_PORT}" -v pg_tablespace="${pg_archival_tablespace}" -f $SCRIPTPATH/upgrade_5.1.0hf5_to_5.1.0hf6_archival_lock.sql
psql -U "${pg_archival_user}" -d "${pg_archival_database}" -h "${PG_HOST}" -p "${PG_PORT}" -v pg_tablespace="${pg_archival_tablespace}" -f $SCRIPTPATH/upgrade_5.1.0hf5_to_5.1.0hf6_ddl.sql
# Copyright (c) 2018-2021. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
