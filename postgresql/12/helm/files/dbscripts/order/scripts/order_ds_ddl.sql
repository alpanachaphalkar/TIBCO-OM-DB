CREATE TABLE order_data
(
    orderid character varying(128) NOT NULL,
    orderref character varying(128) ,
    order_ser text ,
    plan_ser text ,
    data bytea,
    org_order_ser text ,
    tenantid character varying(128) NOT NULL,
    CONSTRAINT order_data_pk PRIMARY KEY (orderid, tenantid)
        USING INDEX TABLESPACE :pg_tablespace
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;
	

CREATE TABLE audit_trail
(
    id character varying(128) NOT NULL,
    orderid character varying(128) NOT NULL,
    message character varying(256) NOT NULL,
    tenantid character varying(128) NOT NULL,
    CONSTRAINT audit_trail_pk PRIMARY KEY (id, orderid, tenantid)
        USING INDEX TABLESPACE :pg_tablespace
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;
	
-- Table: notification

-- DROP TABLE notification;

CREATE TABLE notification
(
    id character varying(128) NOT NULL,
    orderid character varying(128) NOT NULL,
    key character varying(64) NOT NULL,
    value character varying(64) NOT NULL,
    tenantid character varying(128) NOT NULL,
    CONSTRAINT notification_pk PRIMARY KEY (id, tenantid)
        USING INDEX TABLESPACE :pg_tablespace
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;
	
-- Table: order_amendment

-- DROP TABLE order_amendment;

CREATE TABLE order_amendment
(
    seq character varying(128) NOT NULL,
    orderid character varying(128) NOT NULL,
    order_ser text ,
    tenantid character varying(128) NOT NULL,
    CONSTRAINT order_amendment_pk PRIMARY KEY (seq, orderid, tenantid)
        USING INDEX TABLESPACE :pg_tablespace
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

-- Table: order_event

-- DROP TABLE order_event;

CREATE TABLE order_event
(
    orderid character varying(128) NOT NULL,
    eventid character varying(128) NOT NULL,
    tenantid character varying(128) NOT NULL,
	timestampinepoch numeric(250),
    CONSTRAINT order_event_pk PRIMARY KEY (tenantid, eventid, orderid)
        USING INDEX TABLESPACE :pg_tablespace
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;
	
-- Table: order_in_play

-- DROP TABLE order_in_play;

CREATE TABLE order_in_play
(
    customerkey character varying(128) NOT NULL,
    tenantid character varying(128) NOT NULL,
    orderid character varying(128) ,
    CONSTRAINT order_in_play_pk PRIMARY KEY (customerkey, tenantid)
        USING INDEX TABLESPACE :pg_tablespace
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;
	
-- Table: order_in_sequence

-- DROP TABLE order_in_sequence;

CREATE TABLE order_in_sequence
(
    customerkey character varying(128) NOT NULL,
    tenantid character varying(128) NOT NULL,
    orderidlist bytea,
    CONSTRAINT order_in_sequence_pk PRIMARY KEY (tenantid, customerkey)
        USING INDEX TABLESPACE :pg_tablespace
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

-- Table: order_lock

-- DROP TABLE order_lock;

CREATE TABLE order_lock
(
    hashindex numeric(5,0) NOT NULL,
    tenantid character varying(128) NOT NULL
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;


-- Copyright (c) 2021-2021. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
