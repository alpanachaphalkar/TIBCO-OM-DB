#!/bin/bash

JVM_OPTIONS="-Dfile.encoding=UTF-8 -DstartClass=com.tibco.fom.bootstrap.FOSConfiguratorApp"
#SERVER_PORT=--server.port=8084

# set max size of request header to 64Kb
#MAX_HTTP_HEADER_SIZE=--server.tomcat.max-http-header-size=65536

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "$DIR"

#Check if right java version installed and available in the path
cd -P -- "$(dirname -- $0)"
./checkJava.sh

BASEDIR=$DIR/../
CLASS_PATH=.:config:bin:lib/*
CLASS_NAME="com.tibco.fom.bootstrap.FOSConfiguratorApp"
PID_FILE="sdl-tibco-container.pid"
cd $BASEDIR
if [ -f $PID_FILE ]
  then
    if ps -p $(cat $PID_FILE) > /dev/null
        then
          echo "The service already started."
          echo "To start service again, run stop.sh first."
          exit 0
    fi
fi
PROCESS_START="BG";
JVM_OPTIONS="$JVM_OPTIONS -Djava.security.egd=file:///dev/urandom -DPLUGIN_HOME=$BASEDIR -Dlogging.config=$BASEDIR/config/logback.xml -DTIBCO_OM_HOME=$BASEDIR -DOM_HOME=$BASEDIR -DOMSServerLog4jConfigLocation=$BASEDIR/config/OMSServerLog4j.xml -DJeoMSLog4jConfigLocation=$BASEDIR/config/JeoMSLog4j.xml -DAOPDLog4jConfigLocation=$BASEDIR/config/AOPDLog4j.xml -DOPELog4jConfigLocation=$BASEDIR/config/OPELog4j.xml -DFOS_STARTER_LOG_LOCATION=$BASEDIR/logs/FOSStarter.log  -Djdk.tls.client.protocols="TLSv1,TLSv1.1,TLSv1.2"  --illegal-access=deny"
ARGUMENTS=()
for ARG in $@
do
    if [[ $ARG == --server\.port=* ]]
    then
      SERVER_PORT=$ARG
    elif [ $ARG == --run=FG ]; then
    	PROCESS_START="FG";
    elif [[ $ARG =~ -D.+ ]]; then
    	JVM_OPTIONS=$JVM_OPTIONS" "$ARG
    else
        ARGUMENTS+=($ARG)
    fi
done
ARGUMENTS+=($SERVER_PORT)
ARGUMENTS+=($MAX_HTTP_HEADER_SIZE)

for SERVICE_DIR in `find services -type d`
do
    CLASS_PATH=$SERVICE_DIR:$SERVICE_DIR/*:$CLASS_PATH
done

#java -agentlib:jdwp=transport=dt_socket,address=2001,server=y,suspend=n -cp
#echo "PROCESS_START=$PROCESS_START"

if [ $PROCESS_START == BG ]; then
echo "Starting service in Background."
java --add-opens java.base/java.lang=ALL-UNNAMED -cp $CLASS_PATH $JVM_OPTIONS $CLASS_NAME ${ARGUMENTS[@]} & echo $! > $PID_FILE
else
echo "Starting service in Foreground."
java --add-opens java.base/java.lang=ALL-UNNAMED -cp $CLASS_PATH $JVM_OPTIONS $CLASS_NAME ${ARGUMENTS[@]}
fi
# Copyright (c) 2018-2018. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
