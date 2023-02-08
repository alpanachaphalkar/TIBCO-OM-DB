#!/bin/sh

PROPERTY_FILE=postgres_archival_db.properties

getProperty () {
   PROP_KEY=$1
   PROP_VALUE=`cat $PROPERTY_FILE | grep -w "$PROP_KEY" | cut -d'=' -f2`
   echo $PROP_VALUE
}

echo "# Reading  property from $PROPERTY_FILE"

PG_HOST=$(getProperty "PG_HOST")
PG_PORT=$(getProperty "PG_PORT")
pg_super_user_database=$(getProperty "PG_SUPER_USER_DATABASE")

pg_archival_user=$(getProperty "PG_ARCHIVAL_USER")
pg_archival_password=$(getProperty "PG_ARCHIVAL_PASSWORD")
pg_archival_database=$(getProperty "PG_ARCHIVAL_DATABASE")
pg_archival_schema=$(getProperty "PG_ARCHIVAL_SCHEMA")
pg_archival_tablespace=$(getProperty "PG_ARCHIVAL_TABLESPACE")

pg_archival_tablespace_location=$(getProperty "PG_ARCHIVAL_TABLESPACE_LOCATION")
is_on_cloud=$(getProperty "IS_CLOUD_PLATFORM")
default_tenant=$(getProperty "default_tenant")
execute_ddl_dml_only=$(getProperty "EXECUTE_DDL_DML_ONLY")

SCRIPTPATH=$(dirname "$SCRIPT")
SCRIPTPATH=$SCRIPTPATH/../scripts




# --------------------------- DDL and Seed Data Creation For orderds --------------------------------
PGUSER="${pg_archival_user}";
PGPASSWORD="${pg_archival_password}"; export PGPASSWORD;

ORDERSTATUS=$1
FROMDATE=$2
TODATE=$3


printUsage(){
    echo " =========================== USAGE ================================";
	echo "   Usage: purge_orders.sh [ORDER_STATUS] [FROM_DATE] [TO_DATE] ";
	echo "   E.g.: purge-orders.sh COMPLETE 2022-01-01 2022-12-10 ";
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
     psql -U "${pg_archival_user}" -d "${pg_archival_database}" -h "${PG_HOST}" -p "${PG_PORT}" -v pg_tablespace="${pg_archival_tablespace}" -f $SCRIPTPATH/purge_orders.sql	
		##echo "\o purgefile.out" >>purge_orders.sql
		echo "" >purgefile.out
		echo "\set ECHO queries" >>purgefile.out
        echo "BEGIN TRANSACTION;" >>purgefile.out		
		echo "select PURGE_ORDERS('$ORDERSTATUS','$FROMDATE','$TODATE');" >>purgefile.out
        echo "COMMIT TRANSACTION;" >>purgefile.out		
		echo "\set ECHO none" >>purgefile.out		
		echo "\q" >>purgefile.out
		
		psql -U "${pg_archival_user}" -d "${pg_archival_database}" -h "${PG_HOST}" -p "${PG_PORT}" -v pg_tablespace="${pg_archival_tablespace}" -f ./purgefile.out
		;;
    *)
		printUsage;
		exit;
		;;
esac
# Copyright (c) 2018-2021. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
