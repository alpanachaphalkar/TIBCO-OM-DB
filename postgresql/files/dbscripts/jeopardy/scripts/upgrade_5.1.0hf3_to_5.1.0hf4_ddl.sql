-- Drop Column from Jeopardy_lock
ALTER TABLE JEOPARDY_LOCK DROP COLUMN TENANTID;

-- Drop old function from
drop function oms_seed_jeopardylock(int,character varying);

-- EXECUTING THE FUNCTION
SELECT oms_seed_jeopardylock(11);