#!/bin/bash
version_greater_equal()
{
    printf '%s\n%s\n' "$2" "$1" | sort --check=quiet --version-sort
}

if type -p java; then
    echo found java executable in PATH
    _java=java
elif [[ -n "$JAVA_HOME" ]] && [[ -x "$JAVA_HOME/bin/java" ]];  then
    echo found java executable in JAVA_HOME
    _java="$JAVA_HOME/bin/java"
else
    echo "no java"
fi
requiredVersion="11.0.4"

if [[ "$_java" ]]; then
    currentVersion=$("$_java" -version 2>&1 | awk -F '"' '/version/ {print $2}')
    echo version "$currentVersion"
    version_greater_equal "${currentVersion}" "${requiredVersion}" || { echo "need ${requiredVersion} or above"; exit 1; }
fi
