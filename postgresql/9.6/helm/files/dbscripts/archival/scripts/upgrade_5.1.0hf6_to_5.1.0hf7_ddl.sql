alter table orders_archive add column partitiondate date;

update orders_archive t1 set partitiondate = TO_DATE(( with temp as
 (select substr( encode(orders_archive.plandata, 'escape') ,
                POSITION('"planCreationDate"' in plandata )+20
               ) planCreationDate
     from orders_archive where orderid =t1.orderid
  )
  select substr(planCreationDate,1,
                POSITION( '","' in planCreationDate)-1) result
   from temp),'yyyy-mm-dd' )
   where orderid in (with temp1 as
 (select substr(encode(orders_archive.plandata, 'escape'),
                POSITION('"orderID"' in plandata )+11
               ) orderId
     from orders_archive where orderid =t1.orderid
  )
  select substr(orderId,1,
                POSITION( '","' in orderID)-1) result
   from temp1);


CREATE TABLE orders_archive_interim
(
    orderachiveid character varying(255) NOT NULL,
    orderid character varying(255) NOT NULL,
    orderref character varying(125) NOT NULL,
    orderdata bytea,
    plandata bytea,
    auditTrialdata bytea,
    tenantid character varying(22) NOT NULL,
    CONSTRAINT orders_archive_pkey1 PRIMARY KEY (orderachiveid)
    USING INDEX TABLESPACE :pg_tablespace
)inherits (order_partition)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

---transfer all data from old table to new interim table and delete the old table
INSERT INTO orders_archive_interim(orderachiveid,orderid,orderref,orderdata,plandata,auditTrialdata,tenantid,partitiondate)SELECT orderachiveid,orderid,orderref,orderdata,plandata,auditTrialdata,tenantid,partitiondate from orders_archive;
ALTER TABLE orders_archive RENAME TO orders_archive_interim1;
ALTER TABLE orders_archive_interim RENAME TO orders_archive;
DROP TABLE orders_archive_interim1;