/*
Usage: select drop_partition_by_name('2022-01-01');

*/

   
create or replace function drop_partition_by_name(part_name date)
returns void as $$
declare
	drop_query text;
	order_count integer;
	ord_count integer;
	ordernumber integer;
	ordernum integer;
	table_name text;
	arr varchar[] := array[['audit_trail'],['notification'],['order_amendment'],['order_event'],['order_in_play'],['order_data']];
	m varchar[];
begin

	table_name = 'order_data';
	
	BEGIN
    EXECUTE 'DROP TABLE orders_temp';
	
    EXCEPTION
      WHEN OTHERS THEN

    END;
	
	/* Below query checks if order_data table for the given partition exists in the current schema */
	select case
     WHEN EXISTS (
      SELECT 1
      FROM   pg_catalog.pg_class c
      JOIN   pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      WHERE  n.nspname = ANY(current_schemas(FALSE))
      AND    n.nspname NOT LIKE 'pg_%'
      AND    c.relname =  table_name
      AND    c.relkind = 'r')
	then 1
     else 0
         end  into ordernum;
		 if ordernum = 1 THEN
		 EXECUTE ('SELECT count(*) FROM order_data where  partitiondate='''||part_name||'''') INTO order_count;
		 if order_count >0 then
		EXECUTE ('SELECT count(*) FROM order_data where status not in (''COMPLETE'',''CANCELLED'') AND partitiondate='''||part_name||'''') INTO ord_count;
		IF ord_count > 0 THEN
		    RAISE NOTICE 'There are % order(s) in non completed status in table %', ord_count, table_name;
		    RAISE NOTICE 'All the orders in the given partition need to be in either COMPLETED or CANCELLED status. aborting ...';
		
		ELSE
		    RAISE NOTICE 'All orders in the partition % are in their logical end statuses, continuing the cleanup', part_name ;
			CREATE table orders_temp AS SELECT O.orderid FROM order_data O WHERE O.partitiondate=part_name;
		    foreach m slice 1 in array arr
			loop
			   /* Below query checks if the tables in the array exists in the current schema */
			   select case
				WHEN EXISTS (
			      SELECT 1
			      FROM   pg_catalog.pg_class c
			      JOIN   pg_catalog.pg_namespace n ON n.oid = c.relnamespace
			      WHERE  n.nspname = ANY(current_schemas(FALSE))
			      AND    n.nspname NOT LIKE 'pg_%'
			      AND    c.relname =  m[1] 
			      AND    c.relkind = 'r')
			    THEN 1
				ELSE 0
				end  into ordernumber;
				if ordernumber= 1
				then
				      EXECUTE 'DELETE FROM ' || m[1] || ' WHERE orderid IN (SELECT orderid FROM orders_temp)';
			        RAISE NOTICE 'Dropping data from table % ', m[1];
			      	RAISE NOTICE 'Data from Table %  has been dropped', m[1];				
			
			    ELSE  
			    	RAISE NOTICE 'Table % does not exists. No need to drop.', m[1];
			   END IF;
			end loop;
        END IF;	
     ELSE  
    	RAISE NOTICE 'There is no partition with the partition date of %', part_name;
     END IF;		
    ELSE  
    	RAISE NOTICE 'order_data table for the given partition exists in the wrong schema';
   END IF;         
EXECUTE 'DROP TABLE orders_temp';
END;
$$
language plpgsql;
-- Copyright (c) 2018-2022. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
