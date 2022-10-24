CREATE TABLE process_component
(
	id character varying(255) not null,
	processcomponent text,
	tenantid character varying(255) NOT NULL,
    CONSTRAINT process_component_pk PRIMARY KEY (id, tenantid)
        USING INDEX TABLESPACE :pg_tablespace
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

CREATE TABLE plan_instance
(
	planid character varying(255) not null,
	orderid character varying(255) not null,
	plan text,
	tenantid character varying(255) NOT NULL,
	riskregion character varying(255),
    CONSTRAINT plan_instance_pk PRIMARY KEY (planid, tenantid)
        USING INDEX TABLESPACE :pg_tablespace
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

CREATE TABLE time_window
(
    processcomponentid character varying(255) NOT NULL,
    timewindowid numeric(19, 0) NOT NULL,
    orderid character varying(255) NOT NULL,
    startmilestoneid character varying(255) NOT NULL,
    endmilestoneid character varying(255) NOT NULL,
    planid character varying(255) NOT NULL,
    planitemid character varying(255) NOT NULL,
    tenantid character varying(255) NOT NULL,
    CONSTRAINT time_window_pk PRIMARY KEY (planid, planitemid, processcomponentid, startmilestoneid, endmilestoneid, tenantid)
        USING INDEX TABLESPACE :pg_tablespace
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

CREATE TABLE rule_header
(
    ruleid character varying(255) NOT NULL,
    rulename character varying(255) NOT NULL,
    ruledesc character varying(255) ,
    rulegroup character varying(255) NOT NULL,
    status character varying(255) ,
    tenantid character varying(255) NOT NULL,
    createts timestamp(6) with time zone NOT NULL,
    modifiedts timestamp(6) with time zone NOT NULL,
    CONSTRAINT rule_header_pk PRIMARY KEY (ruleid, tenantid)
        USING INDEX TABLESPACE :pg_tablespace
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

CREATE TABLE rule_ui_details
(
    ruledtlid character varying(255) NOT NULL,
    ruleid character varying(255),
    key character varying(255),
    value text NOT NULL,
    tenantid character varying(255) NOT NULL,
    CONSTRAINT rule_ui_details_pkey PRIMARY KEY (ruledtlid)
        USING INDEX TABLESPACE :pg_tablespace
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

CREATE TABLE jeopardy_lock
(
    hashindex numeric(5,0) NOT NULL,
    tenantid character varying(128) NOT NULL
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

CREATE TABLE jeopardy_alert (
    id character varying(255) not null,
    submitted_date timestamp without time zone,
    alert_msg character varying(1024),
    tenantid character varying(255) NOT NULL,
    CONSTRAINT jeopardy_alert_pk PRIMARY KEY(id, tenantid) USING INDEX TABLESPACE :pg_tablespace
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

-- Copyright (c) 2021-2021. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
