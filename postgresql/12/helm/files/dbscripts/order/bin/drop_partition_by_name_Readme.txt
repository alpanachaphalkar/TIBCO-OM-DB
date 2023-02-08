=======================================================================
README file for dropping existing partitions for ORDER related tables
=======================================================================
	This README is written to help drop any partition on ORDER related tables to cleanup database.

	
========================
Prerequisites:
========================

PostgreSQL client is required for the scripts to execute successfully. we cant run this from terminal.

Make Sure
---------
	1. The Postgres database is in partitioned form.


==============
How to run:
==============
	1. Identify what partition needs to be dropped. The partition name will be a date like 2022-01-01.
	2. Once the partition is identified, execute the drop_partition_by_name procedure from psql or from UI and call the procedure using following command.
	select drop_partition_by_name('2022-01-01');

=======
Process:
=======
    Executing drop_partition_by_name first checks to see if there are any orders in the given partition which are not yet COMPLETE or CANCELLED.
	If there are OPEN orders
	------------------------
	If there are orders which are not yet COMPLETE or CANCELLED, drop partition procedure stops and does not let that partition to be dropped.
	Note: If DBA wants to still cleanup partition when there are OPEN orders in the system, they can run OMS_purge_orders.sh script to cleanup orders based on FROM_DATE and TO_DATE range. Please check the documentation for details.
	
	If there are NO OPEN orders
	---------------------------
	If all orders are in either COMPLETE or CANCELLED status, procedure drops given partition one at a time from all order related tables.

=======
Verify:
=======
	Verify 
	1. The table with the given partition is not present in the database across all ORDER related tables.
	2. All the indexes are usable.


==============
Note for DBAs:
==============
	We recommend to run this script when database is under very minimal load.