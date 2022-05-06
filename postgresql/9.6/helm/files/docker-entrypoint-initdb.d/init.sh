#!/bin/sh

mkdir -p "/tablespaces/admintablespace" && mkdir -p "/tablespaces/archivaltablespace" && mkdir -p "/tablespaces/catalogtablespace" && mkdir -p "/tablespaces/jeopardytablespace" && mkdir -p "/tablespaces/orchtablespace" && mkdir -p "/tablespaces/ordertablespace"
pg_ctl -o "-c listen_addresses='localhost'" -w restart

cd /dbscripts

cd ./admin/bin && sh ./db-setup.sh
sh ./upgrade_5.1.0_to_5.1.0hf1_db-setup.sh
sh ./upgrade_5.1.0hf1_to_5.1.0hf2_db-setup.sh

cd ../../archival/bin && sh ./db-setup.sh
sh ./upgrade_5.1.0_to_5.1.0hf1_db-setup.sh

cd ../../catalog/bin && sh ./db-setup.sh
sh ./upgrade_5.1.0hf4_to_5.1.0hf5_db-setup.sh

cd ../../jeopardy/bin && sh ./db-setup.sh
sh ./upgrade_5.1.0hf3_to_5.1.0hf4_db-setup.sh

cd ../../order/bin && sh ./db-setup.sh
sh ./upgrade_5.1.0hf1_to_5.1.0hf2_db-setup.sh