#!/usr/bin/env bash

JVM_OPTIONS="-Xms512m -Xmx1024m -Dfile.encoding=UTF-8"

# set max size of request header to 64Kb
MAX_HTTP_HEADER_SIZE=--server.tomcat.max-http-header-size=65536

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "$DIR"

#Check if right java version installed and available in the path
cd -P -- "$(dirname -- $0)"
./checkJava.sh

BASEDIR=$DIR/../
CLASS_PATH=.:config:bin:lib/*
CLASS_NAME="com.tibco.fom.configShare.ShareConfiguration"
cd $BASEDIR

JVM_OPTIONS="$JVM_OPTIONS -Djava.security.egd=file:///dev/urandom -DPLUGIN_HOME=$BASEDIR -Dlogging.config=$BASEDIR/config/log4j2.xml -DTIBCO_OM_HOME=$BASEDIR -DOM_HOME=$BASEDIR  --illegal-access=deny"
ARGUMENTS=()
for ARG in $@
do
   if [[ $ARG =~ -D.+ ]]; then
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

echo $JAVA_OPTS

#java -agentlib:jdwp=transport=dt_socket,address=2001,server=y,suspend=n -cp

java  --add-opens java.base/java.lang=ALL-UNNAMED -cp $CLASS_PATH $JVM_OPTIONS $CLASS_NAME ${ARGUMENTS[@]}

# Copyright (c) 2018-2018. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
