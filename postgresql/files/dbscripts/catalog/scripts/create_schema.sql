CREATE SCHEMA :pg_schema AUTHORIZATION :pg_user;
ALTER DATABASE :pg_database SET search_path TO :pg_schema;
-- Copyright (c) 2017-2021. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
