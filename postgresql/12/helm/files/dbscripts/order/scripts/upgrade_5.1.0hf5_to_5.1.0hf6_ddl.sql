
alter table order_data add column partitiondate date;

---get partitiondate from plancreation DATE
update order_data t1 set partitiondate = TO_DATE(( with temp as
 (select substr(plan_ser,
                POSITION('"planCreationDate"' in plan_ser )+20
               ) planCreationDate
     from ORDER_DATA where orderid =t1.orderid
  )
  select substr(planCreationDate,1,
                POSITION( '","' in planCreationDate)-1) result
   from temp),'yyyy-mm-dd' )
where orderid in (with temp1 as
 (select substr(plan_ser,
                POSITION('"orderId"' in plan_ser )+11
               ) orderId
     from ORDER_DATA where orderid =t1.orderid
  )
  select substr(orderId,1,
                POSITION( '","' in orderId)-1) result
   from temp1);

-- Parent table for all partitioned tables to get partitiondate column 
create table order_partition (
     partitiondate date not null default current_date
)tablespace :pg_tablespace;

----create new order_data table to transfer data 
CREATE TABLE order_data_interim
(
    orderid character varying(128) NOT NULL,
    orderref character varying(128) ,
    order_ser text ,
    plan_ser text ,
    data bytea,
    org_order_ser text ,
    tenantid character varying(128) NOT NULL,
    CONSTRAINT order_data_pk1 PRIMARY KEY (orderid, tenantid)
        USING INDEX TABLESPACE :pg_tablespace
)inherits (order_partition)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

---transfer all data from old table to new interim table and delete the old table
INSERT INTO order_data_interim(orderid,orderref,order_ser,plan_ser,data,org_order_ser,tenantid,partitiondate)SELECT  orderid,orderref,order_ser,plan_ser,data,org_order_ser,tenantid,partitiondate from order_data;
ALTER TABLE order_data RENAME TO order_data_interim1;
ALTER TABLE order_data_interim RENAME TO order_data;
DROP TABLE order_data_interim1;


alter table notification add column partitiondate date;

---get partitiondate from plancreation DATE
update notification t1 set partitiondate = TO_DATE(( with temp as
 (select substr(plan_ser,
                POSITION('"planCreationDate"' in plan_ser )+20
               ) planCreationDate
     from ORDER_DATA where orderid =t1.orderid
  )
  select substr(planCreationDate,1,
                POSITION( '","' in planCreationDate)-1) result
   from temp),'yyyy-mm-dd' )
where orderid in (with temp1 as
 (select substr(plan_ser,
                POSITION('"orderId"' in plan_ser )+11
               ) orderId
     from ORDER_DATA where orderid =t1.orderid
  )
  select substr(orderId,1,
                POSITION( '","' in orderId)-1) result
   from temp1);
 
----create new notification table to transfer data
CREATE TABLE notification_interim
(
    id character varying(512) NOT NULL,
    orderid character varying(128) NOT NULL,
    key character varying(64) NOT NULL,
    value character varying(64) NOT NULL,
    tenantid character varying(128) NOT NULL,
    CONSTRAINT notification_pk1 PRIMARY KEY (id, tenantid)
        USING INDEX TABLESPACE :pg_tablespace
)inherits (order_partition)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

---transfer all data from old table to new interim table and delete the old table
INSERT INTO notification_interim(id,orderid,key,value,tenantid,partitiondate)SELECT  id,orderid,key,value,tenantid,partitiondate from notification;
ALTER TABLE notification RENAME TO notification_interim1;
ALTER TABLE notification_interim RENAME TO notification;
DROP TABLE notification_interim1;


alter table order_amendment add column partitiondate date;

---get partitiondate from plancreation DATE
update order_amendment t1 set partitiondate = TO_DATE(( with temp as
 (select substr(plan_ser,
                POSITION('"planCreationDate"' in plan_ser )+20
               ) planCreationDate
     from ORDER_DATA where orderid =t1.orderid
  )
  select substr(planCreationDate,1,
                POSITION( '","' in planCreationDate)-1) result
   from temp),'yyyy-mm-dd' )
where orderid in (with temp1 as
 (select substr(plan_ser,
                POSITION('"orderId"' in plan_ser )+11
               ) orderId
     from ORDER_DATA where orderid =t1.orderid
  )
  select substr(orderId,1,
                POSITION( '","' in orderId)-1) result
   from temp1);
 
----create new order_amendment table to transfer data
CREATE TABLE order_amendment_interim
(
    seq character varying(128) NOT NULL,
    orderid character varying(128) NOT NULL,
    order_ser text ,
    tenantid character varying(128) NOT NULL,
    CONSTRAINT order_amendment_pk1 PRIMARY KEY (seq, orderid, tenantid)
        USING INDEX TABLESPACE :pg_tablespace
)inherits (order_partition)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

---transfer all data from old table to new interim table and delete the old table
INSERT INTO order_amendment_interim(seq,orderid,order_ser,tenantid,partitiondate)SELECT  seq,orderid,order_ser,tenantid,partitiondate from order_amendment;
ALTER TABLE order_amendment RENAME TO order_amendment_interim1;
ALTER TABLE order_amendment_interim RENAME TO order_amendment;
DROP TABLE order_amendment_interim1;


alter table order_event add column partitiondate date;

---get partitiondate from plancreation DATE
update order_event t1 set partitiondate = TO_DATE(( with temp as
 (select substr(plan_ser,
                POSITION('"planCreationDate"' in plan_ser )+20
               ) planCreationDate
     from ORDER_DATA where orderid =t1.orderid
  )
  select substr(planCreationDate,1,
                POSITION( '","' in planCreationDate)-1) result
   from temp),'yyyy-mm-dd' )
where orderid in (with temp1 as
 (select substr(plan_ser,
                POSITION('"orderId"' in plan_ser )+11
               ) orderId
     from ORDER_DATA where orderid =t1.orderid
  )
  select substr(orderId,1,
                POSITION( '","' in orderId)-1) result
   from temp1);

----create new order_event table to transfer data 
CREATE TABLE order_event_interim
(
    orderid character varying(128) NOT NULL,
    eventid character varying(128) NOT NULL,
    tenantid character varying(128) NOT NULL,
	timestampinepoch numeric(250),
    CONSTRAINT order_event_pk1 PRIMARY KEY (tenantid, eventid, orderid)
        USING INDEX TABLESPACE :pg_tablespace
)inherits (order_partition)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

---transfer all data from old table to new interim table and delete the old table
INSERT INTO order_event_interim(orderid,eventid,tenantid,timestampinepoch,partitiondate)SELECT  orderid,eventid,tenantid,timestampinepoch,partitiondate from order_event;
ALTER TABLE order_event RENAME TO order_event_interim1;
ALTER TABLE order_event_interim RENAME TO order_event;
DROP TABLE order_event_interim1;


alter table order_in_play add column partitiondate date;

---get partitiondate from plancreation DATE
update order_in_play t1 set partitiondate = TO_DATE(( with temp as
 (select substr(plan_ser,
                POSITION('"planCreationDate"' in plan_ser )+20
               ) planCreationDate
     from ORDER_DATA where orderid =t1.orderid
  )
  select substr(planCreationDate,1,
                POSITION( '","' in planCreationDate)-1) result
   from temp),'yyyy-mm-dd' )
where orderid in (with temp1 as
 (select substr(plan_ser,
                POSITION('"orderId"' in plan_ser )+11
               ) orderId
     from ORDER_DATA where orderid =t1.orderid
  )
  select substr(orderId,1,
                POSITION( '","' in orderId)-1) result
   from temp1);


----create new order_in_play table to transfer data 
CREATE TABLE order_in_play_interim
(
    customerkey character varying(128) NOT NULL,
    tenantid character varying(128) NOT NULL,
    orderid character varying(128) ,
    CONSTRAINT order_in_play_pk1 PRIMARY KEY (customerkey, tenantid)
        USING INDEX TABLESPACE :pg_tablespace
)inherits (order_partition)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

---transfer all data from old table to new interim table and delete the old table
INSERT INTO order_in_play_interim(customerkey,tenantid,orderid,partitiondate)SELECT  customerkey,tenantid,orderid,partitiondate from order_in_play;
ALTER TABLE order_in_play RENAME TO order_in_play_interim1;
ALTER TABLE order_in_play_interim RENAME TO order_in_play;
DROP TABLE order_in_play_interim1;



