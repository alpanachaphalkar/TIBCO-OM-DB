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




# --------------------------- DDL and Seed Data Creation For orderds --------------------------------
PGUSER="${pg_order_user}";
PGPASSWORD="${pg_order_password}"; export PGPASSWORD;

ORDERSTATUS=$1
FROMDATE=$2
TODATE=$3


printUsage(){
    echo " =========================== USAGE ================================";
	echo "   Usage: purge-orders.sh [ORDER_STATUS] [FROM_DATE] [TO_DATE]";
	echo "   E.g.:  purge-orders.sh COMPLETE 2022-01-01 2022-12-10 ";
	echo "	 [ORDER_STATUS] can be one of the following:";
	echo "	 COMPLETE / CANCELLED";
    echo "-------------------------------------------------------------------";
}

if [ -z "$ORDERSTATUS" ]; then
	printUsage;
	exit;
fi
if [ -z "$FROMDATE" ]; then
	printUsage;
	exit;
fi
if [ -z "$TODATE" ]; then
	printUsage;
	exit;
fi

case $ORDERSTATUS in
	"COMPLETE" | "CANCELLED" )
     psql -U "${pg_order_user}" -d "${pg_order_database}" -h "${PG_HOST}" -p "${PG_PORT}" -v pg_tablespace="${pg_order_tablespace}" -f $SCRIPTPATH/purge_orders.sql
	    echo "">purgefile.out
		echo "\set ECHO queries" >>purgefile.out
        echo "BEGIN TRANSACTION;" >>purgefile.out		
		echo "select PURGE_ORDERS('$ORDERSTATUS','$FROMDATE','$TODATE');" >>purgefile.out
        echo "COMMIT TRANSACTION;" >>purgefile.out		
		echo "\set ECHO none" >>purgefile.out		
		echo "\q" >>purgefile.out
		
		psql -U "${pg_order_user}" -d "${pg_order_database}" -h "${PG_HOST}" -p "${PG_PORT}" -v pg_tablespace="${pg_order_tablespace}" -f ./purgefile.out
		;;
    *)
		printUsage;
		exit;
		;;
esac
# Copyright (c) 2018-2021. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
