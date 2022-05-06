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
pg_super_user_database=$(getProperty "PG_SUPER_USER_DATABASE")

pg_order_user=$(getProperty "PG_ORDER_USER")
pg_order_password=$(getProperty "PG_ORDER_PASSWORD")
pg_order_database=$(getProperty "PG_ORDER_DATABASE")
pg_order_schema=$(getProperty "PG_ORDER_SCHEMA")
pg_order_tablespace=$(getProperty "PG_ORDER_TABLESPACE")

pg_order_tablespace_location=$(getProperty "PG_ORDER_TABLESPACE_LOCATION")
is_on_cloud=$(getProperty "IS_CLOUD_PLATFORM")
default_tenant=$(getProperty "default_tenant")
execute_ddl_dml_only=$(getProperty "EXECUTE_DDL_DML_ONLY")

SCRIPTPATH=$(dirname "$SCRIPT")
SCRIPTPATH=$SCRIPTPATH/../scripts

if [ "$is_on_cloud" = true ] ; then
	pg_order_tablespace="pg_default"
fi

if [ "$execute_ddl_dml_only" = false ] ; then
	pg_super_user_name=$(getProperty "PG_SUPER_USER_NAME")
	pg_super_user_password=$(getProperty "PG_SUPER_USER_PASSWORD")
	PGUSER="${pg_super_user_name}";
	PGPASSWORD="${pg_super_user_password}"; export PGPASSWORD;

	# --------------------- DROP orderds Database STARTS ------------------------------------------------
	psql -U "${PGUSER}" -d "${pg_super_user_database}" -v pg_schema="${pg_order_schema}" -h "${PG_HOST}" -p "${PG_PORT}" -a -f $SCRIPTPATH/drop_schema.sql
	psql -U "${PGUSER}" -d "${pg_super_user_database}" -v pg_database="${pg_order_database}" -h "${PG_HOST}" -p "${PG_PORT}" -a -f $SCRIPTPATH/drop_database.sql
	if [ "$is_on_cloud" = false ] ; then
	psql -U "${PGUSER}" -v pg_tablespace="${pg_order_tablespace}" -h "${PG_HOST}" -p "${PG_PORT}" -f $SCRIPTPATH/drop_tablespace.sql
	fi
	psql -U "${PGUSER}" -d "${pg_super_user_database}" -v pg_user="${pg_order_user}" -h "${PG_HOST}" -p "${PG_PORT}" -f $SCRIPTPATH/drop_user.sql
	# ---------------------DROP ENDS ------------------------------------------------------------------

	# ---------------------------- Create orchestrator Database Starts ---------------------------------------
	PGUSER="${pg_super_user_name}";
	PGPASSWORD="${pg_super_user_password}"; export PGPASSWORD;
	psql -U "${PGUSER}" -d "${pg_super_user_database}" -v pg_user="${pg_order_user}" -v pg_password="'${pg_order_password}'" -v pg_super_user="${PGUSER}" -h "${PG_HOST}" -p "${PG_PORT}" -f $SCRIPTPATH/create_user.sql
	if [ "$is_on_cloud" = false ] ; then
	psql -U "${PGUSER}" -v pg_tablespace="${pg_order_tablespace}" -v pg_user="${pg_order_user}" -v pg_tablespace_location="'${pg_order_tablespace_location}'" -h "${PG_HOST}" -p "${PG_PORT}" -f $SCRIPTPATH/create_tablespace.sql
	psql -U "${PGUSER}" -v pg_database="${pg_order_database}" -v pg_user="${pg_order_user}" -v pg_tablespace="${pg_order_tablespace}" -h "${PG_HOST}" -p "${PG_PORT}" -f $SCRIPTPATH/create_database.sql
	else
	psql -U "${PGUSER}" -d "${pg_super_user_database}" -v pg_database="${pg_order_database}" -v pg_user="${pg_order_user}" -v pg_tablespace="${pg_order_tablespace}" -h "${PG_HOST}" -p "${PG_PORT}" -f $SCRIPTPATH/create_database_cp.sql
	fi
	PGUSER="${pg_order_user}";
	PGPASSWORD="${pg_order_password}"; export PGPASSWORD;
	psql -U "${pg_order_user}" -d "${pg_order_database}" -v pg_database="${pg_order_database}" -v pg_schema="${pg_order_schema}" -v pg_user="${pg_order_user}" -h "${PG_HOST}" -p "${PG_PORT}" -f $SCRIPTPATH/create_schema.sql
fi

# --------------------------- DDL and Seed Data Creation For orderds --------------------------------
PGUSER="${pg_order_user}";
PGPASSWORD="${pg_order_password}"; export PGPASSWORD;
psql -U "${pg_order_user}" -d "${pg_order_database}" -h "${PG_HOST}" -p "${PG_PORT}" -v pg_tablespace="${pg_order_tablespace}" -f $SCRIPTPATH/oms_seed_orderlock.sql
psql -U "${pg_order_user}" -d "${pg_order_database}" -h "${PG_HOST}" -p "${PG_PORT}" -v pg_tablespace="${pg_order_tablespace}" -f $SCRIPTPATH/order_ds_ddl.sql
psql -U "${pg_order_user}" -d "${pg_order_database}" -h "${PG_HOST}" -p "${PG_PORT}" -v pg_tablespace="${pg_order_tablespace}" -v default_tenant="${default_tenant}" -f $SCRIPTPATH/order_ds_dml.sql
# Copyright (c) 2018-2021. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
