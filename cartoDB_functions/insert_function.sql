DROP FUNCTION IF EXISTS insert_bikeways_data(text,text,text,text);
--Assumes only one value being inserted

CREATE OR REPLACE FUNCTION insert_bikeways_data (
    _geojson TEXT,
    _description TEXT,
    _drawingType TEXT,
    _name TEXT )
--Has to return something in order to be used in a "SELECT" statement
RETURNS integer
AS $$
DECLARE
    _the_geom GEOMETRY;
BEGIN
    --Convert the GeoJSON to a geometry type for insertion.
    _the_geom := ST_SetSRID(ST_GeomFromGeoJSON(_geojson),4326);

    EXECUTE ' INSERT INTO table_16_093 (the_geom, description, drawingType, name)
            VALUES ($1, $2, $3, $4)
            ' USING _the_geom, _description, _drawingType, _name;

    RETURN 1;
END;
$$
LANGUAGE plpgsql SECURITY DEFINER ;

--Grant access to the public user
GRANT EXECUTE ON FUNCTION insert_bikeways_data(text,text,text,text) TO publicuser;
