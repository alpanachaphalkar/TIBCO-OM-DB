create or replace FUNCTION OMS_Seed_OrderLock( IN EXPONENT int, IN tenant_id character varying) returns void 
LANGUAGE plpgsql
AS	$$
DECLARE
  
   v_rowcount integer;
   v_PERFCOUNT integer = 0;
  
  
BEGIN
    --Start time
    raise notice 'Start time: %', to_char(current_timestamp, 'Dy DD-Mon-YYYY HH24:MI:SS');
	
	IF(EXPONENT < 7 or EXPONENT > 12 ) THEN 
	raise notice 'EXPONENT SHOULD BE >=7 AND <=12';
	  
	  RETURN;
	END IF;

	delete from ORDER_LOCK where TENANTID = tenant_id;
	raise notice'Removed old entries for the hash indexes';

	  v_rowcount := POWER( 2, EXPONENT );
	  FOR i in 0 .. v_rowcount-1 LOOP
		   
		   insert into ORDER_LOCK(HASHINDEX,TENANTID) values (i,tenant_id);
		   v_PERFCOUNT := v_PERFCOUNT + 1;
	  END LOOP;
	 
	--End time
	raise notice 'End time: %. % rows inserted', to_char(current_timestamp, 'Dy DD-Mon-YYYY HH24:MI:SS'),v_PERFCOUNT;
 
EXCEPTION WHEN OTHERS THEN
  	raise notice 'An error occured while seeding order address';

END; 
$$
-- Copyright (c) 2017-2021. TIBCO Software Inc. All Rights Reserved. Confidential & Proprietary.
