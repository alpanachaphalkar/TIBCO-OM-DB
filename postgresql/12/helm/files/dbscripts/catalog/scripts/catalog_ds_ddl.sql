CREATE TABLE product_model
(
    id character varying(255) NOT NULL,
    model text,
    tenantid character varying(255) NOT NULL,
	score double precision,
    CONSTRAINT product_model_pk PRIMARY KEY (id, tenantid)
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;


CREATE TABLE top_level_product
(
    id numeric NOT NULL,
	productid character varying(255) NOT NULL,	   
    tenantid character varying(255) NOT NULL,
    CONSTRAINT top_level_product_pk PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

CREATE TABLE planfragment_model
(
    id character varying(255) NOT NULL,
    model text,
    tenantid character varying(255) NOT NULL,
    CONSTRAINT planfragment_model_pk PRIMARY KEY (tenantid, id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

CREATE TABLE action_model
(
    id character varying(255) NOT NULL,
    model text,
    tenantid character varying(255) NOT NULL,
    CONSTRAINT action_model_pk PRIMARY KEY (tenantid, id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

CREATE SEQUENCE top_level_product_sequence
  INCREMENT 10
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;  
  
CREATE TABLE price_model
(
    id character varying(255) NOT NULL,
    model text,
    tenantid character varying(255) NOT NULL,
    CONSTRAINT price_model_pk PRIMARY KEY (id, tenantid)
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

CREATE TABLE discount_model
(
    id character varying(255) NOT NULL,
    model text,
    tenantid character varying(255) NOT NULL,
    CONSTRAINT discount_model_pk PRIMARY KEY (id, tenantid)
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

CREATE TABLE offerids_model
(
    id character varying(255) NOT NULL,
    model text,
    tenantid character varying(255) NOT NULL,
    CONSTRAINT offerids_model_pk PRIMARY KEY (id, tenantid)
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

CREATE TABLE rule_model
(
    id character varying(255) NOT NULL,
    model text,
    tenantid character varying(255) NOT NULL,
	ruleid character varying(255) NOT NULL,
    CONSTRAINT rule_model_pk PRIMARY KEY (id, tenantid, ruleid)
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

CREATE TABLE category_model
(
    id character varying(255) NOT NULL,
    model text,
    tenantid character varying(255) NOT NULL,
    CONSTRAINT category_model_pk PRIMARY KEY (id, tenantid)
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

CREATE TABLE filter_product
(
    id  numeric not null,
	filterid character varying(255) NOT NULL,
	productid character varying(255) NOT NULL,
    tenantid character varying(255) NOT NULL,
    CONSTRAINT filter_product_pk PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

CREATE TABLE segment_product
(
    id  numeric not null,
	segmentid character varying(255) NOT NULL,
	productid character varying(255) NOT NULL,
    tenantid character varying(255) NOT NULL,
    CONSTRAINT segment_product_pk PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

CREATE SEQUENCE filter_product_sequence
  INCREMENT 10
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1; 
   
CREATE SEQUENCE segment_product_sequence
  INCREMENT 10
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;  
  
  
 CREATE TABLE product_ledger
(
    id character varying(255) NOT NULL,
    score numeric,
    tenantid character varying(255) NOT NULL,
    CONSTRAINT product_ledger_pk PRIMARY KEY (id, tenantid)
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

CREATE TABLE price_ledger
(
    id character varying(255) NOT NULL,
    score numeric,
    tenantid character varying(255) NOT NULL,
    CONSTRAINT price_ledger_pk PRIMARY KEY (id, tenantid)
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

CREATE TABLE discount_ledger
(
    id character varying(255) NOT NULL,
    score numeric,
    tenantid character varying(255) NOT NULL,
    CONSTRAINT discount_ledger_pk PRIMARY KEY (id, tenantid)
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;
	
ALTER TABLE ONLY price_model
	add column score double precision;
	
ALTER TABLE ONLY discount_model
	add column score double precision;
  
-- Copyright (c) 2021-2021. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
