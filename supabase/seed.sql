-- ============================================================
-- MonedaRed - Datos demo para la presentación
-- IMPORTANTE: Ejecutar DESPUÉS del schema.sql
-- Estos negocios aparecen en el mapa
-- ============================================================

-- Actualizar negocios demo con ubicaciones (Monterrey, NL como ciudad ejemplo)
-- Reemplaza los UUIDs con los IDs reales de los usuarios registrados en la demo

-- Ejemplo de negocios con coordenadas (centro de Monterrey)
-- update profiles set
--   category = 'Cafetería',
--   lat = 25.6866,
--   lng = -100.3161
-- where id = 'UUID_DEL_NEGOCIO_1';

-- Datos hardcodeados para el mapa (sin necesidad de registrar usuarios)
-- Usado en BusinessMap.tsx como fallback de demo
-- Macroplaza Monterrey aproximado: lat 25.6692, lng -100.3098
