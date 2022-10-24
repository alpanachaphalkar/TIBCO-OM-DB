/*
Usage: select drop_partition_by_name('2022-01-01');

*/

   
create or replace function drop_partition_by_name(part_name date)
returns void as $$
declare
	drop_query text;
	ordernumber integer;
	ordernum integer;
	table_name text;
	arr varchar[] := array[['orders_archive'],['orders_abstract']];
	m varchar[];
begin

	table_name = 'orders_abstract';
	
	/* Below query checks if order_abstract table for the given partition exists in the current schema */
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
		 if ordernum = 1
		 then
		    RAISE NOTICE 'continuing the cleanup for partition %', part_name ;
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
			        RAISE NOTICE 'Dropping data from table % ', m[1];
			        drop_query = 'delete from ' || m[1] || ' where partitiondate=''' || part_name||'''';
					execute drop_query;
			      	RAISE NOTICE 'Data from Table %  has been dropped', m[1];					 
			
			    ELSE  
			    	RAISE NOTICE 'Table % does not exists. No need to drop.', m[1];
			   END IF;
			end loop;	
    ELSE  
    	RAISE NOTICE 'There is no partition with the partition date of %', part_name;
   END IF;
end;
$$
language plpgsql;
-- Copyright (c) 2018-2022. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
