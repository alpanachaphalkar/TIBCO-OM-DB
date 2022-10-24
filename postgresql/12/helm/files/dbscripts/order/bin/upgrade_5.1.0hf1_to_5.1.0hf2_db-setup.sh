#!/bin/sh

PROPERTY_FILE=postgres_order_db.properties

getProperty () {
   PROP_KEY=$1
   PROP_VALUE=`cat $PROPERTY_FILE | grep -w "$PROP_KEY" | cut -d'=' -f2`
   echo $PROP_VALUE
}

echo "# Reading  property from $PROPERTY_FILE"

PG_HOST=$(getProperty "PG_HOST")
PG_PORT=$(getProperty "PG_PORT")

pg_order_user=$(getProperty "PG_ORDER_USER")
pg_order_password=$(getProperty "PG_ORDER_PASSWORD")
pg_order_database=$(getProperty "PG_ORDER_DATABASE")
pg_order_tablespace=$(getProperty "PG_ORDER_TABLESPACE")

is_on_cloud=$(getProperty "IS_CLOUD_PLATFORM")

SCRIPTPATH=$(dirname "$SCRIPT")
SCRIPTPATH=$SCRIPTPATH/../scripts

if [ "$is_on_cloud" = true ] ; then
pg_order_tablespace="pg_default"
fi


PGUSER="${pg_order_user}";
PGPASSWORD="${pg_order_password}"; export PGPASSWORD;
psql -U "${pg_order_user}" -d "${pg_order_database}" -h "${PG_HOST}" -p "${PG_PORT}" -v pg_tablespace="${pg_order_tablespace}" -f $SCRIPTPATH/upgrade_5.1.0hf1_to_5.1.0hf2_ddl.sql
# Copyright (c) 2018-2021. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
