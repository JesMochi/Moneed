-- ============================================================
-- MonedaRed - RPC para estadísticas comunitarias
-- Ejecutar en: Supabase > SQL Editor (DESPUÉS del schema.sql)
-- ============================================================

-- Función que devuelve stats globales sin restricción de RLS
-- Permite mostrar el impacto comunitario total en el dashboard
create or replace function get_community_stats()
returns json as $$
declare
  total_tx integer;
  total_nc numeric;
begin
  select count(*), coalesce(sum(amount), 0)
  into total_tx, total_nc
  from transactions;

  return json_build_object(
    'total_transacciones', total_tx,
    'total_nc', total_nc
  );
end;
$$ language plpgsql security definer;
