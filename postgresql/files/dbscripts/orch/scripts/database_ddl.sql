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
   
CREATE TABLE dead_order_event
(
    orderid character varying(128) NOT NULL,
    eventid character varying(128) NOT NULL,
    tenantid character varying(128) NOT NULL
)  TABLESPACE :pg_tablespace;

ALTER TABLE ONLY dead_order_event ADD CONSTRAINT dead_order_event_pk PRIMARY KEY (orderid, eventid, tenantid);
-- Copyright (c) 2017-2021. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
