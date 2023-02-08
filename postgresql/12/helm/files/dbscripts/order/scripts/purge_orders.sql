CREATE OR REPLACE FUNCTION PURGE_ORDERS (ORDER_STATUS IN VARCHAR, FROM_DATE IN date, TODATE IN date)
RETURNS VOID AS $$

DECLARE  
  PERFCOUNT       INTEGER := 0;
BEGIN

  -- Drop temporary table orders_temp if exists. If error outs ignore the error

    BEGIN
    EXECUTE 'DROP TABLE orders_temp';
	
    EXCEPTION
      WHEN OTHERS THEN

    END;
 

CREATE table orders_temp AS SELECT O.orderid FROM order_data O WHERE O.partitiondate between FROM_DATE AND TODATE AND O.status= ORDER_STATUS;
  
  RAISE NOTICE 'Time: % - Temp Table created', to_char(current_timestamp, 'Dy DD-Mon-YYYY HH24:MI:SS');
  
  -- DROP THE notification TABLE
  EXECUTE 'DELETE FROM notification
  WHERE orderid IN (SELECT orderid FROM orders_temp)';
  
  -- DROP THE order_amendment TABLE 
  EXECUTE 'DELETE FROM order_amendment
  WHERE orderid IN (SELECT orderid FROM orders_temp)';
  
  -- DROP THE order_event TABLE
   EXECUTE 'DELETE FROM order_event
  WHERE orderid IN (SELECT orderid FROM orders_temp)';

  -- DROP THE order_in_play TABLE
  EXECUTE 'DELETE FROM order_in_play
  WHERE orderid IN (SELECT orderid FROM orders_temp)'; 
  
   -- DROP THE order_data TABLE
  EXECUTE 'DELETE FROM order_data
  WHERE orderid IN (SELECT orderid FROM orders_temp)'; 
  
  EXECUTE 'DELETE FROM audit_trail 
  WHERE orderid IN (SELECT orderid FROM orders_temp)'; 
 
  GET DIAGNOSTICS PERFCOUNT = ROW_COUNT;

  RAISE NOTICE 'Time: % - Final commit after all the tables are cleaned', to_char(current_timestamp, 'Dy DD-Mon-YYYY HH24:MI:SS');
  
  
  EXECUTE 'DROP TABLE orders_temp';
  
  RAISE NOTICE 'Purge order count: %',PERFCOUNT;

  RAISE NOTICE 'End time: %', to_char(current_timestamp, 'Dy DD-Mon-YYYY HH24:MI:SS');  

EXCEPTION
      WHEN OTHERS THEN
            
                  RAISE NOTICE 'Rolling back transaction';
		  RAISE NOTICE '%',SQLSTATE; 
                  RAISE NOTICE '%',SQLERRM;                                  
                  
           

END;
$$
LANGUAGE plpgsql;
-- Copyright (c) 2017-2018. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
