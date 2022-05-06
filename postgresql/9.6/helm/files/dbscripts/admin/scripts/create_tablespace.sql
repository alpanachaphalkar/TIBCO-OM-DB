CREATE TABLESPACE :pg_tablespace OWNER :pg_user LOCATION :pg_tablespace_location;
GRANT ALL PRIVILEGES ON TABLESPACE :pg_tablespace TO :pg_user WITH GRANT OPTION;
-- Copyright (c) 2017-2021. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
