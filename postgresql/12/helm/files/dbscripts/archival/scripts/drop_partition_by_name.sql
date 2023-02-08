/*
Usage: select drop_partition_by_name('2022-01-01');

*/

   
create or replace function drop_partition_by_name(part_name date)
returns void as $$
declare
	drop_query text;
	getOrderIds_query text;
	checkOrderIds_query text;
	deleteOrderIds text;
	deleteOrderRow text;
	order_count integer;
	ord_count integer;
	ordernumber integer;
	ordernum integer;
	table_name text;
	arr varchar[] := array[['bulk_action'],['orders_archive'],['orders_abstract']];
	m varchar[];
	k varchar;
	orderIds varchar[];
	orderIdCount integer;
	orderIdsCountinRow integer;
begin

	table_name = 'orders_abstract';
	
	/* Below query checks if orders_abstract table for the given partition exists in the current schema */
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
		 EXECUTE ('SELECT count(*) FROM orders_abstract where  partitiondate='''||part_name||'''') INTO order_count;
		 if order_count >0 then
		EXECUTE ('SELECT count(*) FROM orders_abstract where status not in (''COMPLETE'',''CANCELLED'') AND partitiondate='''||part_name||'''') INTO ord_count;
		IF ord_count > 0 THEN
		    RAISE NOTICE 'There are % order(s) in non completed status in table %', ord_count, table_name;
		    RAISE NOTICE 'All the orders in the given partition need to be in either COMPLETED or CANCELLED status. aborting ...';
		
		ELSE
		    RAISE NOTICE 'All orders in the partition % are in their logical end statuses, continuing the cleanup', part_name ;
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
				IF ordernumber= 1
				then
		           if m[1]='bulk_action'
				   THEN
				    RAISE NOTICE 'Dropping data from table % ', m[1];
					EXECUTE ('SELECT array_agg(orderid::varchar)FROM orders_abstract where partitiondate=''' || part_name||'''')INTO orderIds;
					foreach k in array orderIds
					loop
					
                   UPDATE bulk_action SET order_ids = array_to_string(array(SELECT e FROM unnest(string_to_array(order_ids,','))as e where e != ''||k||''),',') WHERE string_to_array(order_ids,',') @> string_to_array(''||k||'',',');
				    deleteOrderRow='delete from bulk_action where order_ids=''''';
					 EXECUTE deleteOrderRow;
					 
					end loop;
				   ELSE
			        RAISE NOTICE 'Dropping data from table % ', m[1];
			        drop_query = 'delete from ' || m[1] || ' where partitiondate=''' || part_name||'''';
					execute drop_query;
			      	RAISE NOTICE 'Data from Table %  has been dropped', m[1];					 
			        END IF;
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
end;
$$
language plpgsql;
-- Copyright (c) 2018-2022. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
