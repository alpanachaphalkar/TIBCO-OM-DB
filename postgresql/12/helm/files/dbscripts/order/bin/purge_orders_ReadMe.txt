
README FOR PURGE ORDERS SCRIPT
---------------------------

The purge_orders.sql allows the user to purge order-related records from orders database. The criteria for orders 
to be purged is a order submission date range and status.


1. Prerequisites 
---------------
A. PostgreSQL client is required for the scripts to execute successfully.

B. All related shell scripts must have 'execute' permission and the folder containing this utility must have 'write' permission as the utility creates a temporary file.

2.Purge Utility
-----------------

Run the purge utility as follows:

./purge-orders.sh [ORDER_STATUS] [FROM_DATE] [TO_DATE]
 
where:

[ORDER_STATUS] can be one of the following:
- COMPLETE
- CANCELLED

[FROM_DATE] and [TO_DATE] must be in the format "yyyy-mm-dd"
	
E.g.	./purge-orders.sh COMPLETE 2022-01-01 2022-12-10 
	

2. HOW TO RUN
----------------
Run the purge-orders.sh with below command

          ./purge-orders.sh COMPLETE 2022-01-01 2022-12-10 

Note that the purged order data is permanently lost. The script does not take any backup.

