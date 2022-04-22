#!/usr/bin/env bash

$JVM_OPTIONS="-Xms512m", "-Xmx1024m", "-Dfile.encoding=UTF-8"

# set max size of request header to 64Kb
$MAX_HTTP_HEADER_SIZE = "--server.tomcat.max-http-header-size=8192"

#DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
$CURRENTPATH = Get-Location

######################################--JRE11 Changes--#####################################
	$testPath = "$currentPath\..\..\..\..\..\..\tibcojre64\11"
	if(Test-Path $testPath ){
		$java_home = $testPath
	}else {
		$java_home = (get-item env:"JAVA_HOME").Value
	}	
	$java_run = $java_home + "\bin\java.exe"

	echo "******************************************************************************************"
	echo "******************************************************************************************"
	echo "Current JAVA_HOME $java_home"
	& $java_run -version
	echo "******************************************************************************************"
	echo "******************************************************************************************"
######################################--JRE11 Changes End--#################################

$BASEDIR="$CURRENTPATH/../"
$CLASS_PATH=".;config;bin;lib/*"
$CLASS_NAME="com.tibco.fom.configShare.ShareConfiguration"
cd $BASEDIR

$JVM_OPTIONS=$JVM_OPTIONS + "-Djava.security.egd=file:///dev/urandom", "-DPLUGIN_HOME=$BASEDIR", "-Dlogging.config=$BASEDIR/config/log4j2.xml", "-DTIBCO_OM_HOME=$BASEDIR", "-DOM_HOME=$BASEDIR", "--illegal-access=deny"
$arguments = @()
foreach ($ARG in $args){

   if ($ARG -imatch "-D.+"){
    	$JVM_OPTIONS=$JVM_OPTIONS+" "+$ARG}
    else{
        $ARGUMENTS+=($ARG)
		}		
}
$ARGUMENTS+=($SERVER_PORT)
$ARGUMENTS+=($MAX_HTTP_HEADER_SIZE)

foreach ($SERVICE_DIR in Get-ChildItem -path $BASEDIR -recurse | ?{ $_.PSIsContainer } | Resolve-Path -relative | Where { $_ -match 'services*' }){
    $CLASS_PATH = $SERVICE_DIR+";"+$SERVICE_DIR+"/*;"+$CLASS_PATH
}

$opens = "java.base/java.lang=ALL-UNNAMED"
java --add-opens $opens -cp $CLASS_PATH $JVM_OPTIONS $CLASS_NAME ${ARGUMENTS[@]}


