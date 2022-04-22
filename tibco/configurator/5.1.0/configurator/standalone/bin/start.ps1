# Java options and system properties to pass to the JVM when starting the service container
# Separate double-quoted options with a comma. For example:
# $jvmoptions = "-Xrs", "-Xms256m", "-Xmx384m", "-Dmy.system.property=/a folder with a space in it/"

#$java_home = "C:\Java\jdk1.8.0_101"

$jvmoptions = "-Dfile.encoding=UTF-8", "-DstartClass=com.tibco.fom.bootstrap.FOSConfiguratorApp"

$currentPath = Get-Location
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

$scriptPath = $PSScriptRoot

cd $scriptPath\..
$BASEDIR = Get-Location

$classpath = ".;config;bin"
$libFolder = ";lib\*"
$servicesFolder = ";services\fosconfigurator\*"
$className = "com.tibco.fom.bootstrap.FOSConfiguratorApp"

$classpath = $classpath + $libFolder + $servicesFolder

#foreach ($folder in Get-ChildItem -path $BASEDIR -recurse | ?{ $_.PSIsContainer } | Resolve-Path -relative | Where { $_ -match 'services*' })
#{
#    $classpath = $folder + ";" + $folder + "\*;" + $classpath	
#}
#echo $classpath
#echo $BASEDIR

$jvmoptions=$jvmoptions + "-DPLUGIN_HOME=$BASEDIR", "-Dlogging.config=$BASEDIR/config/logback.xml", "-DTIBCO_OM_HOME=$BASEDIR", "-DOM_HOME=$BASEDIR", "-DOMSServerLog4jConfigLocation=$BASEDIR/config/OMSServerLog4j.xml", "-DJeoMSLog4jConfigLocation=$BASEDIR/config/JeoMSLog4j.xml", "-DAOPDLog4jConfigLocation=$BASEDIR/config/AOPDLog4j.xml", "-DOPELog4jConfigLocation=$BASEDIR/config/OPELog4j.xml", "--illegal-access=deny", "-agentlib:jdwp=transport=dt_socket,address=9006,server=y,suspend=n"


$arguments = @()
foreach($arg in $args) {
    if ($arg -imatch "--server.port=""?[0-9]+") {
        $serverPort=$Matches[0]
    } elseif ($arg -imatch "-D.+") {
        $jvmoptions+=$arg
    } else {
		$arguments+=$arg
	}
}

$opens = "java.base/java.lang=ALL-UNNAMED"
Try
{
    & $java_run $jvmoptions --add-opens $opens -cp $classpath $className $arguments
}
Finally
{
    cd $currentPath
}
