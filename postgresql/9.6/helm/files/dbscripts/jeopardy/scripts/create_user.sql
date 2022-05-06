CREATE ROLE :pg_user WITH PASSWORD :pg_password NOSUPERUSER NOCREATEDB CREATEROLE INHERIT LOGIN;
GRANT :pg_user TO :pg_super_user;
-- Copyright (c) 2017-2021. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
