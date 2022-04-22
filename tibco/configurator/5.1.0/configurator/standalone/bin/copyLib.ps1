if ( -not (Test-Path env:EMS_JAR_PATH_tibjms)) { $env:EMS_JAR_PATH_tibjms = $env:OM_HOME+"\lib\tibjms.jar" }
if ( -not (Test-Path env:EMS_JAR_PATH_jms)) { $env:EMS_JAR_PATH_jms = $env:OM_HOME+"\lib\jms-2.0.jar" }
if ( -not (Test-Path env:HIBERNATE_CORE_JAR_PATH)) { $env:HIBERNATE_CORE_JAR_PATH = $env:OM_HOME+"\lib\hibernateLibs\hibernate-core-5.2.0.Final.jar" }
if ( -not (Test-Path env:HIBERNATE_COMMOMNS_JAR_PATH)) { $env:HIBERNATE_COMMOMNS_JAR_PATH = $env:OM_HOME+"\lib\hibernateLibs\hibernate-commons-annotations-5.0.1.Final.jar" }
if ( -not (Test-Path env:HIBERNATE_ENTITYMANAGER_JAR_PATH)) { $env:HIBERNATE_ENTITYMANAGER_JAR_PATH = $env:OM_HOME+"\lib\hibernateLibs\hibernate-entitymanager-5.0.12.Final.jar" }
if ( -not (Test-Path env:HIBERNATE_JPA_JAR_PATH)) { $env:HIBERNATE_JPA_JAR_PATH = $env:OM_HOME+"\lib\hibernateLibs\hibernate-jpa-2.1-api-1.0.0.Final.jar" }
if ( -not (Test-Path env:HIBERNATE_DOM4J_JAR_PATH)) { $env:HIBERNATE_DOM4J_JAR_PATH = $env:OM_HOME+"\lib\hibernateLibs\dom4j-2.1.1.jar" }
if ( -not (Test-Path env:HIBERNATE_ANTLR_JAR_PATH)) { $env:HIBERNATE_ANTLR_JAR_PATH = $env:OM_HOME+"\lib\hibernateLibs\antlr-2.7.7.jar" }
if ( -not (Test-Path env:JAVA_ASSIST_JAR_PATH)) { $env:JAVA_ASSIST_JAR_PATH = $env:OM_HOME+"\lib\hibernateLibs\javassist-3.21.0-GA.jar" }
if ( -not (Test-Path env:JDBC_JAR_PATH)) { $env:JDBC_JAR_PATH = 'C:\TEMP\delete\roles\thirdpartylib\ojdbc7.jar' }


#echo $PSScriptRoot

copy $env:EMS_JAR_PATH_tibjms $PSScriptRoot/../lib/.
echo "copied $env:EMS_JAR_PATH_tibjms to $PSScriptRoot/lib/."
copy $env:EMS_JAR_PATH_jms $PSScriptRoot/../lib/.
echo "copied $env:EMS_JAR_PATH_jms to $PSScriptRoot/lib/."
copy $env:HIBERNATE_CORE_JAR_PATH $PSScriptRoot/../lib/.
echo "copied $env:HIBERNATE_CORE_JAR_PATH to $PSScriptRoot/lib/."
copy $env:HIBERNATE_COMMOMNS_JAR_PATH $PSScriptRoot/../lib/.
echo "copied $env:HIBERNATE_COMMOMNS_JAR_PATH to $PSScriptRoot/lib/."
copy $env:HIBERNATE_ENTITYMANAGER_JAR_PATH $PSScriptRoot/../lib/.
echo "copied $env:HIBERNATE_ENTITYMANAGER_JAR_PATH to $PSScriptRoot/lib/."
copy $env:HIBERNATE_JPA_JAR_PATH $PSScriptRoot/../lib/.
echo "copied $env:HIBERNATE_JPA_JAR_PATH to $PSScriptRoot/lib/."
copy $env:HIBERNATE_DOM4J_JAR_PATH $PSScriptRoot/../lib/.
echo "copied $env:HIBERNATE_DOM4J_JAR_PATH to $PSScriptRoot/lib/."
copy $env:HIBERNATE_ANTLR_JAR_PATH $PSScriptRoot/../lib/.
echo "copied $env:HIBERNATE_ANTLR_JAR_PATH to $PSScriptRoot/lib/."
copy $env:JAVA_ASSIST_JAR_PATH $PSScriptRoot/../lib/.
echo "copied $env:JAVA_ASSIST_JAR_PATH to $PSScriptRoot/lib/."
copy $env:JDBC_JAR_PATH $PSScriptRoot/../lib/.
echo "copied $env:JDBC_JAR_PATH to $PSScriptRoot/lib/."
# Copyright (c) 2021-2021. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
