CREATE TABLE archival_lock
(
    hashindex numeric(5,0) NOT NULL
)
WITH (
    OIDS = FALSE
)
TABLESPACE :pg_tablespace;

SELECT oms_seed_archivallock(11);