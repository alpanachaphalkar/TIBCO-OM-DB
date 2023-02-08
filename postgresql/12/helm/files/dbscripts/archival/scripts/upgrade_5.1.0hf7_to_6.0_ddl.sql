ALTER TABLE IF EXISTS orders_archive RENAME CONSTRAINT orders_archive_pkey1 TO orders_archive_pkey;
CREATE TABLE user_search
(
    name character varying(256) COLLATE "default" NOT NULL,
    criteria text,
	visibility character varying(20),
	owner character varying(40),
	tenant character varying(40),
	created_timestamp TIMESTAMP,
    CONSTRAINT "FILTERS_PK" PRIMARY KEY (name, owner , tenant) USING INDEX TABLESPACE :pg_tablespace
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

CREATE TABLE bulk_action
(
    partitiondate date,
	jobid character varying(256) NOT NULL,
	action character varying(256),
	order_ids text,
	requested_by character varying(256),
	creationdate timestamp without time zone,
	tenantid character varying(256) NOT NULL,
    CONSTRAINT sys_c0063478 PRIMARY KEY (jobid)
        USING INDEX TABLESPACE :pg_tablespace
)INHERITS (order_partition)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;
-- Copyright (c) 2017-2021. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.