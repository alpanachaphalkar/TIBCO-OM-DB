#!/bin/sh

DB_MOUNT_PATH="/bitnami/postgresql"
mkdir -p $DB_MOUNT_PATH/tablespaces/admintablespace && mkdir -p $DB_MOUNT_PATH/tablespaces/archivaltablespace && mkdir -p $DB_MOUNT_PATH/tablespaces/catalogtablespace && mkdir -p $DB_MOUNT_PATH/tablespaces/jeopardytablespace && mkdir -p $DB_MOUNT_PATH/tablespaces/orchtablespace && mkdir -p $DB_MOUNT_PATH/tablespaces/ordertablespace

cd $DB_MOUNT_PATH/dbscripts

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