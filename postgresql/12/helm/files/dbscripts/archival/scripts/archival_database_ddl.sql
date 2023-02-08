-- Table: oms_order_summary

-- DROP TABLE oms_order_summary;

CREATE TABLE oms_order_summary
(
	startdate character(8) not null,
	execution numeric(19,0),
    suspended numeric(19,0),
    complete numeric(19,0),
    canceled numeric(19,0),
    pqfailed numeric(19,0),
    feasibility numeric(19,0),
    withdrawn numeric(19,0),
	tenantid character varying(22) NOT NULL,
    CONSTRAINT sys_c0062477 PRIMARY KEY (startdate, tenantid)
        USING INDEX TABLESPACE :pg_tablespace
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

CREATE TABLE order_partition
(
    partitiondate date NOT NULL DEFAULT CURRENT_DATE
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;


CREATE TABLE orders_abstract
(
    -- Inherited from table order_partition: partitiondate date NOT NULL DEFAULT CURRENT_DATE,
    orderid character varying(255) NOT NULL,
    orderref character varying(125) NOT NULL,
    customerid character varying(64),
    subscriberid character varying(64),
	orderudfs text,
	orderlineudfs text,
	planid character varying(255),
	planitemstatuses text,
	processcomponentids text,
	processcomponentnames text,
	statuschanged timestamp without time zone,
    submitteddate timestamp without time zone,
    status character varying(22) NOT NULL,
	orderseqno character varying(222),
	planitemseqno text,
	isOrderAmended boolean,
	tenantid character varying(22) NOT NULL,
	orderdata bytea,
	plandata bytea,
	auditTrialdata bytea,
    CONSTRAINT sys_c0062449 PRIMARY KEY (orderid, tenantid)
        USING INDEX TABLESPACE :pg_tablespace
)
    INHERITS (order_partition)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

CREATE TABLE orders_archive
(
    orderachiveid character varying(255) NOT NULL,
    orderid character varying(255) NOT NULL,
    orderref character varying(125) NOT NULL,
    orderdata bytea,
    plandata bytea,
    auditTrialdata bytea,
	partitiondate date,
    tenantid character varying(22) NOT NULL,
    CONSTRAINT orders_archive_pkey PRIMARY KEY (orderachiveid)
        USING INDEX TABLESPACE :pg_tablespace
)INHERITS (order_partition)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

CREATE OR REPLACE VIEW orders AS
 SELECT orders_abstract.partitiondate,
    orders_abstract.orderid,
    orders_abstract.orderref,
    orders_abstract.customerid,
    orders_abstract.subscriberid,
	orders_abstract.orderudfs,
    orders_abstract.orderlineudfs,
	orders_abstract.planid,
	orders_abstract.planitemstatuses,
	orders_abstract.processcomponentids,
	orders_abstract.processcomponentnames,
    orders_abstract.submitteddate,
    orders_abstract.status,
	orders_abstract.statuschanged,
	orders_abstract.orderdata,
	orders_abstract.plandata,
	orders_abstract.auditTrialdata,
	orders_abstract.tenantid,
	orders_abstract.orderseqno,
	orders_abstract.planitemseqno,
	orders_abstract.isOrderAmended
   FROM orders_abstract;
-- Index: idx_ord_ordrfordid

-- DROP INDEX idx_ord_ordrfordid;

CREATE INDEX idx_ord_ordrfordid
    ON orders_abstract USING btree
    (orderref, orderid)
    TABLESPACE :pg_tablespace;
	

CREATE TABLE dead_notification
(
    orderid character varying(256) COLLATE "default" NOT NULL,
    messageid character varying(256) COLLATE "default" NOT NULL,
	messagetype character varying(10),
    message bytea,
    CONSTRAINT "DEAD_NOTIFICATION_PK" PRIMARY KEY (messageid, orderid) USING INDEX TABLESPACE :pg_tablespace
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

CREATE TABLE archival_lock
(
    hashindex numeric(5,0) NOT NULL
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

SELECT oms_seed_archivallock(11);

--Creating Table and schema for archival Service
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

-- Copyright (c) 2021-2021. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
