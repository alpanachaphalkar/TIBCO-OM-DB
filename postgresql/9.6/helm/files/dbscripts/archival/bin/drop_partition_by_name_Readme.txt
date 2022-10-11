=======================================================================
README file for dropping existing partitions for ARCHIVAL related tables
=======================================================================
	This README is written to help drop any partition on ARCHIVAL related tables to cleanup database.

	
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
	Executing drop_partition_by_name first checks to see if there are any orders in the given partition and deletes all the order related data from the tables.
	Note: it deletes all the data even if the status of the order is not in completed state or suspended state.

=======
Verify:
=======
	Verify 
	1. The table with the given partition is not present in the database across all archival related tables.
	2. All the indexes are usable.


==============
Note for DBAs:
==============
	We recommend to run this script when database is under very minimal load.