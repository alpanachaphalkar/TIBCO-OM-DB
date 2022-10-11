--select PURGE_ORDERS('2022-01-01','2022-01-03');
   


CREATE OR REPLACE FUNCTION PURGE_ORDERS (FROM_DATE IN date, TO_DATE IN date)
RETURNS VOID AS $$

DECLARE 

BEGIN

    RAISE NOTICE 'Start time: %', to_char(current_timestamp, 'Dy DD-Mon-YYYY HH24:MI:SS');
    RAISE NOTICE 'Initiated purge with FROM_DATE: % , TO_DATE: %',FROM_DATE,TO_DATE;
    

  EXECUTE 'DELETE FROM orders_archive 
  WHERE partitiondate>='''||FROM_DATE||''' AND partitiondate<='''||TO_DATE||''''; 
  
  EXECUTE 'DELETE FROM orders_abstract
  WHERE partitiondate>='''||FROM_DATE ||'''AND partitiondate<='''||TO_DATE||''''; 
 
 
 

  RAISE NOTICE 'Time: % - Final commit after all the tables are cleaned', to_char(current_timestamp, 'Dy DD-Mon-YYYY HH24:MI:SS');


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
