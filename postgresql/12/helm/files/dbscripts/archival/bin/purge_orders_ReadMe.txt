
README FOR PURGE ORDERS SCRIPT
---------------------------

The purge_orders.sql allows the user to purge order-related records from archival database. The criteria for orders 
to be purged is a order submission date range.


1. Prerequisites 
---------------

PostgreSQL client is required for the scripts to execute successfully. we cant run this from terminal.
	

2. HOW TO RUN
----------------
Run the purge_orders.sql

then run  <select PURGE_ORDERS('startdate','todate');>

Note that the purged order data is permanently lost. The script does not take any backup.

