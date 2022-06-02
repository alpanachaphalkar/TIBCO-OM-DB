ALTER TABLE IF EXISTS app_properties DROP COLUMN IF EXISTS categorydescription;

ALTER TABLE IF EXISTS app_properties DROP COLUMN IF EXISTS categoryvisibility;

ALTER TABLE IF EXISTS app_properties DROP COLUMN IF EXISTS propertyvisibility;

ALTER TABLE IF EXISTS app_properties RENAME description TO propertydescription;

ALTER TABLE IF EXISTS app_properties RENAME categoryname TO category;

ALTER TABLE IF EXISTS app_properties ADD COLUMN IF NOT EXISTS valuetype character varying(128);

ALTER TABLE IF EXISTS app_properties ADD COLUMN IF NOT EXISTS allowedvalues text;