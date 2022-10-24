CREATE TABLE users (
    username character varying(45) NOT NULL,
    password character varying(60) NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    tenantid character varying DEFAULT 'TIBCO'::character varying NOT NULL,
    roles character varying(45) NOT NULL
) TABLESPACE :pg_tablespace;

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (username, tenantid);

CREATE TABLE app_properties
(
    key character varying(4096) NOT NULL,
    value character varying(4096) NOT NULL,
    application character varying(128) NOT NULL,
    profile character varying(128) ,
    label character varying(128) ,
    istenantproperty boolean DEFAULT false,
    CONSTRAINT app_properties_pkey PRIMARY KEY (key, application)
) TABLESPACE :pg_tablespace;

CREATE TABLE configuration (
	filename   character varying(100),
	application character varying(128),
	content    bytea,
	version    double precision
) TABLESPACE :pg_tablespace;

ALTER TABLE ONLY configuration
   ADD CONSTRAINT configuration_pk PRIMARY KEY (filename,application);
   
CREATE SEQUENCE seq_revision
  START 1201
  INCREMENT 1
  MAXVALUE 9223372036854775807
  NO MINVALUE
  NO CYCLE
  CACHE 20;
 
CREATE TABLE datasource (
  datasourceid character varying(10) NOT NULL,
  name character varying(100)
) TABLESPACE :pg_tablespace;

ALTER TABLE ONLY datasource
    ADD CONSTRAINT datasource_pk PRIMARY KEY (datasourceid);

CREATE TABLE datasource_properties (
  datasourceid character varying(10) NOT NULL,
  key character varying(100) NOT NULL,
  value character varying(200)
) TABLESPACE :pg_tablespace;

CREATE UNIQUE INDEX datasource_properties_uni_idx ON datasource_properties USING btree (datasourceid, key) TABLESPACE :pg_tablespace;

ALTER TABLE ONLY datasource_properties
    ADD CONSTRAINT datasource_properties_pk PRIMARY KEY (datasourceid, key);

CREATE TABLE edit_lock (
	sessionid varchar(60) not null,
    lockowner character varying(60) not null,
    tenantid character varying(45) not null,
    acquiretimestamp timestamptz not null
)tablespace :pg_tablespace;

ALTER TABLE ONLY edit_lock
    ADD CONSTRAINT LOCK_PKEY PRIMARY KEY (lockowner, tenantid);


CREATE TABLE time_scheduler (
  id  numeric not null,
  eventid character varying(100) not null,
  orderid character varying(200) not null,
  timestamp timestamp without time zone,
  tenantid character varying(255) NOT NULL

)tablespace :pg_tablespace;

ALTER TABLE  time_scheduler ADD CONSTRAINT time_scheduler_pk PRIMARY KEY (id);


CREATE TABLE time_scheduler_error (
  id  numeric not null,
  eventid character varying(100) not null,
  orderid character varying(200) not null,
  timestamp timestamp without time zone,
  tenantid character varying(255) NOT NULL

)tablespace :pg_tablespace;

ALTER TABLE  time_scheduler_error ADD CONSTRAINT time_scheduler_error_pk PRIMARY KEY (id);

CREATE SEQUENCE seq_cluster_seq_number
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;
  
CREATE SEQUENCE sequence_timedep
  INCREMENT 100
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;
  
 CREATE SEQUENCE sequence_timedep_error
  INCREMENT 10
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1; 
   
 CREATE TABLE domain (
    domainid character varying(128) NOT NULL,
    description character varying(416),
    backingstore character varying(3) NOT NULL,
    heartbeatinterval double precision NOT NULL,
    manageractivationinterval double precision NOT NULL,
    ftthresholdinterval double precision NOT NULL,
    handlefailednodeevents double precision NOT NULL	
) TABLESPACE :pg_tablespace;

ALTER TABLE ONLY domain
    ADD CONSTRAINT domainidprimarykey PRIMARY KEY (domainid);
	
CREATE UNIQUE INDEX domainid_uni_idx ON domain USING btree (domainid) TABLESPACE :pg_tablespace;

CREATE TABLE domainmembers (
    memberid character varying(128) NOT NULL,
    description character varying(416),
    domainid character varying(128) NOT NULL,
    clusterid character varying(100),
    isclustermanager character varying(100),
    seqnumber double precision,
    heartbeattimestamp timestamp without time zone,
    lastupdatetimestamp timestamp without time zone,
    status character varying(100),
	backup_memberid character varying(128),
	transactionid double precision,
	tranupdatestamp timestamp without time zone,
	is_static double precision DEFAULT 0 NOT NULL
) TABLESPACE :pg_tablespace;

ALTER TABLE ONLY domainmembers
    ADD CONSTRAINT sys_c0062559 PRIMARY KEY (memberid);
	
ALTER TABLE ONLY domainmembers
    ADD CONSTRAINT fkc6yt32v8822xz72v FOREIGN KEY (domainid) REFERENCES domain(domainid);

-- Copyright (c) 2017-2021. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
