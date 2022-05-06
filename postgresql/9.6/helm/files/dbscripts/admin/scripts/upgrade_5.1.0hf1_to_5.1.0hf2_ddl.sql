--Dropping an existing app_properties
DROP TABLE app_properties;

--Creating a table of app_properties with new coloumns
CREATE TABLE app_properties
(
    key character varying(4096) NOT NULL,
    value character varying(4096) NOT NULL,
    application character varying(128) NOT NULL,
    description text,
    categoryname text,
    categorydescription text,
    categoryvisibility character varying(255),
    propertyvisibility character varying(255),
    istenantproperty boolean,
    appdescription text,
    CONSTRAINT app_properties_pkey PRIMARY KEY (key, application)
) TABLESPACE :pg_tablespace;