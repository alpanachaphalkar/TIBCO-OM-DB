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
	orderudfs character varying(255),
	orderlineudfs character varying(255),
	planid character varying(255),
	planitemstatuses character varying(255),
	processcomponentids character varying(255),
	processcomponentnames character varying(255),
	statuschanged timestamp without time zone,
    submitteddate timestamp without time zone,
    status character varying(22) NOT NULL,
	orderseqno character varying(222),
	planitemseqno character varying(255),
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
    tenantid character varying(22) NOT NULL,
    CONSTRAINT orders_archive_pkey PRIMARY KEY (orderachiveid)
        USING INDEX TABLESPACE :pg_tablespace
)
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
-- Copyright (c) 2021-2021. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
