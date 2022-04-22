--Setting up database and schema for archival Service
drop view if exists orders;

ALTER TABLE orders_abstract ALTER COLUMN orderudfs TYPE text;

ALTER TABLE orders_abstract ALTER COLUMN orderlineudfs TYPE text;

ALTER TABLE orders_abstract ALTER COLUMN planitemstatuses TYPE text;

ALTER TABLE orders_abstract ALTER COLUMN processcomponentids TYPE text;

ALTER TABLE orders_abstract ALTER COLUMN processcomponentnames TYPE text;

ALTER TABLE orders_abstract ALTER COLUMN planitemseqno TYPE text;

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


CREATE TABLE dead_notification
(
    orderid character varying(256) COLLATE "default" NOT NULL,
    messageid character varying(256) COLLATE "default" NOT NULL,
	messagetype character varying(10),
    message bytea,
    CONSTRAINT "DEAD_NOTIFICATION_PK" PRIMARY KEY (messageid, orderid) USING INDEX TABLESPACE :pg_tablespace
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;