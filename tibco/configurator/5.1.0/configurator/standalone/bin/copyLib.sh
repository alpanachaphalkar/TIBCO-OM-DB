#!/bin/bash
# Copyright (c) 2021. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
#### Download load the external libraries from the provided links
#### Copy jar files (extract if required from the above) into OPE_HOME/externalLib directory
#### Or set an environment variable EXTERNAL_LIB_PATH and set the directory path where files are placed

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
#echo "$DIR"
BASEDIR=$DIR/../
set -e
warn () {
    echo "$0:" "$@" >&2
}
die () {
    rc=$1
    shift
    warn "$@"
    exit $rc
}

copyFile() {
  var=$1
  if (test -a $var ); then echo "Copying ${var}"; cp $var $BASEDIR/lib/;
  else die 127 "${var} file is required and does not exists"; fi
}

### If user defines EXTERNAL_LIB_PATH read from there; otherwise use OPE_HOME/externalLib
if (test ! -v $EXTERNAL_LIB_PATH ); then echo "Using the custom library path"; else  EXTERNAL_LIB_PATH=$DIR/../../../../externalLib ; echo "Using default externalLib directory"; fi

antlr=${EXTERNAL_LIB_PATH}/antlr-2.7.7.jar
dom4j=${EXTERNAL_LIB_PATH}/dom4j-2.1.1.jar
hibernateCommon=${EXTERNAL_LIB_PATH}/hibernate-commons-annotations-5.0.1.Final.jar
hibernateCore=${EXTERNAL_LIB_PATH}/hibernate-core-5.0.12.Final.jar
hibernateEntityManager=${EXTERNAL_LIB_PATH}/hibernate-entitymanager-5.0.12.Final.jar
hibernateJpa=${EXTERNAL_LIB_PATH}/hibernate-jpa-2.1-api-1.0.0.Final.jar

(test ! -v $EXTERNAL_LIB_PATH && test -d $EXTERNAL_LIB_PATH) || die 127 "EXTERNAL_LIB_PATH environment variable is not defined or not a directory"

copyFile $antlr
copyFile $dom4j
copyFile $hibernateCommon
copyFile $hibernateCore
copyFile $hibernateEntityManager
copyFile $hibernateJpa

if (test ! -v $EMS_HOME ); then
    jmsJar=$EMS_HOME/lib/jms-2.0.jar
    tibjmsJar=$EMS_HOME/lib/tibjms.jar
    echo "Copying from EMS library "
    if (test -a $jmsJar); then cp $jmsJar $BASEDIR/lib/; else echo "Couldn't found ${jmsJar}"; fi
    if (test -a $tibjmsJar); then cp $tibjmsJar $BASEDIR/lib/; else echo "Couldn't found ${tibjmsJar}"; fi
else
    echo "Using default externalLib directory"
    copyFile $EXTERNAL_LIB_PATH/jms-2.0.jar
    copyFile $EXTERNAL_LIB_PATH/tibjms.jar
fi

if (test ! -v $EXTERNAL_LIB_PATH && test -a $EXTERNAL_LIB_PATH/ojdbc*.jar); then
  echo "Copying oracle driver from externalLib"
  cp $EXTERNAL_LIB_PATH/ojdbc*.jar $BASEDIR/lib/
else
  echo "Couldn't find oracle driver, ignoring"
fi
