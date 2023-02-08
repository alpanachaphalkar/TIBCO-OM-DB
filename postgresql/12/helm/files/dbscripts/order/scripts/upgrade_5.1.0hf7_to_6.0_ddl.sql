ALTER TABLE IF EXISTS order_data
    ADD COLUMN status character varying(128);
	
ALTER TABLE IF EXISTS order_data
	RENAME CONSTRAINT order_data_pk1 TO order_data_pk;
	
ALTER TABLE IF EXISTS audit_trail
	ADD COLUMN partitiondate date NOT NULL DEFAULT CURRENT_DATE,
	INHERIT order_partition;
	
ALTER TABLE IF EXISTS notification
	RENAME CONSTRAINT notification_pk1 TO notification_pk;

ALTER TABLE IF EXISTS order_amendment
	RENAME CONSTRAINT order_amendment_pk1 TO order_amendment_pk;

ALTER TABLE IF EXISTS order_event
	RENAME CONSTRAINT order_event_pk1 TO order_event_pk;

ALTER TABLE IF EXISTS order_in_play
	RENAME CONSTRAINT order_in_play_pk1 TO order_in_play_pk;
	
CREATE TABLE order_messages
(
    orderid character varying(128) NOT NULL,
    tenantid character varying(128) NOT NULL,
    messages text,
    CONSTRAINT order_messages_pkey PRIMARY KEY (orderid, tenantid)
        USING INDEX TABLESPACE :pg_tablespace
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

