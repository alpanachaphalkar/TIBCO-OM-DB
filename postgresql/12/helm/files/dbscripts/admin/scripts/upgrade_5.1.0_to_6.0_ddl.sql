ALTER TABLE IF EXISTS app_properties
    ALTER COLUMN value DROP NOT NULL;
	
CREATE TABLE application_metadata
(
    applicationid character varying(255) NOT NULL,
    applicationdescription character varying(255) NOT NULL,
    applicationpropertiesfile character varying(255) NOT NULL,
    configurationfiles character varying(255),
    CONSTRAINT application_metadata_pkey PRIMARY KEY (applicationid)
        USING INDEX TABLESPACE :pg_tablespace
)
TABLESPACE :pg_tablespace;

CREATE TABLE IF NOT EXISTS app_properties_events
(
    key character varying(4096) COLLATE pg_catalog."default" NOT NULL,
    value character varying(4096) COLLATE pg_catalog."default" NOT NULL,
    application character varying(128) COLLATE pg_catalog."default" NOT NULL,
    valuetype character varying(128) COLLATE pg_catalog."default" NOT NULL,
    propertydescription text COLLATE pg_catalog."default",
    category character varying(4096) COLLATE pg_catalog."default" NOT NULL,
    istenantproperty boolean,
    appdescription text COLLATE pg_catalog."default",
    allowedvalues text COLLATE pg_catalog."default",
    event character varying(20) COLLATE pg_catalog."default" NOT NULL,
    "timestamp" numeric(25,0),
	lastmodifiedbyuser character varying(20) COLLATE pg_catalog."default"
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;


ALTER TABLE app_properties ADD COLUMN lastmodifiedbyuser character varying(20);

-- Copyright (c) 2017-2021. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.