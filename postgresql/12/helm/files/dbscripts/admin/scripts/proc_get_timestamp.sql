CREATE TRIGGER app_properties_change
AFTER INSERT OR UPDATE OR DELETE ON app_properties
FOR EACH ROW EXECUTE FUNCTION app_properties_change();