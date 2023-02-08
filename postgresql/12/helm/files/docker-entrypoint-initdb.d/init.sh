#!/bin/sh

pg_ctl -o "-c listen_addresses='localhost'" -w restart
mkdir -p "/tablespaces/admintablespace" && mkdir -p "/tablespaces/archivaltablespace" && mkdir -p "/tablespaces/catalogtablespace" && mkdir -p "/tablespaces/jeopardytablespace" && mkdir -p "/tablespaces/orchtablespace" && mkdir -p "/tablespaces/ordertablespace"

cd /dbscripts

cd ./admin/bin && sh ./db-setup.sh

cd ../../archival/bin && sh ./db-setup.sh

cd ../../catalog/bin && sh ./db-setup.sh

cd ../../jeopardy/bin && sh ./db-setup.sh

cd ../../order/bin && sh ./db-setup.sh