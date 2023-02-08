CREATE OR REPLACE FUNCTION PURGE_ORDERS (ORDER_STATUS IN VARCHAR, FROM_DATE IN date, TODATE IN date)
RETURNS VOID AS $$

DECLARE  
  PERFCOUNT       INTEGER := 0;
  k varchar;
  orderIds varchar[];
  deleteOrderRow text;
BEGIN

  -- Drop temporary table orders_temp if exists. If error outs ignore the error

    BEGIN
    EXECUTE 'DROP TABLE orders_temp';
	
    EXCEPTION
      WHEN OTHERS THEN

    END;
 

CREATE table orders_temp AS SELECT O.orderid FROM orders_abstract O WHERE O.partitiondate between FROM_DATE AND TODATE AND O.status= ORDER_STATUS;
  
  RAISE NOTICE 'Time: % - Temp Table created', to_char(current_timestamp, 'Dy DD-Mon-YYYY HH24:MI:SS');
  
  -- DROP THE orders_archive TABLE
  EXECUTE 'DELETE FROM orders_archive
  WHERE orderid IN (SELECT orderid FROM orders_temp)';
  
   ---DROP THE BULK_ACTION TABLE-----
  EXECUTE ('SELECT array_agg(orderid::varchar)FROM orders_temp')INTO orderIds;
  foreach k  in array orderIds
					loop
					
                   UPDATE bulk_action SET order_ids = array_to_string(array(SELECT e FROM unnest(string_to_array(order_ids,','))as e where e != ''||k||''),',') WHERE string_to_array(order_ids,',') @> string_to_array(''||k||'',',');
					 deleteOrderRow='delete from bulk_action where order_ids=''''';
					 EXECUTE deleteOrderRow;
					 
					end loop;
 -----------------------------------
  
  -- DROP THE orders_abstract TABLE 
  EXECUTE 'DELETE FROM orders_abstract
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
