CREATE TABLE product_model
(
    id character varying(255) NOT NULL,
    model text,
    tenantid character varying(255) NOT NULL,
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
  
-- Copyright (c) 2021-2021. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
