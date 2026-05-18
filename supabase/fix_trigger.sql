-- ============================================================
-- MonedaRed - Fix del trigger de registro
-- Problema: "Database error saving new user"
-- Ejecutar en: Supabase > SQL Editor
-- ============================================================

-- Reemplaza la función del trigger con una versión robusta:
-- 1. set search_path = public  → evita el error de permisos en Supabase
-- 2. on conflict do nothing    → tolerante a duplicados
-- 3. exception when others     → nunca bloquea el registro por un fallo de perfil

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role, balance, category)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Usuario'),
    coalesce(new.raw_user_meta_data->>'role', 'consumer'),
    100,
    new.raw_user_meta_data->>'category'
  )
  on conflict (id) do nothing;

  return new;
exception when others then
  -- Si el perfil falla, el registro de auth igual se completa
  return new;
end;
$$ language plpgsql security definer set search_path = public;
