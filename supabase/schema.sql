-- ============================================================
-- MonedaRed - Esquema de base de datos
-- Ejecutar en: Supabase > SQL Editor
-- ============================================================

-- Tabla de perfiles de usuario
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  role text check (role in ('consumer', 'business')) default 'consumer',
  balance numeric default 100,
  category text,
  lat numeric,
  lng numeric,
  created_at timestamp with time zone default now()
);

-- Tabla de transacciones
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references profiles(id),
  receiver_id uuid references profiles(id),
  amount numeric not null,
  note text,
  created_at timestamp with time zone default now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

alter table profiles enable row level security;
alter table transactions enable row level security;

-- Políticas para profiles
create policy "Usuario ve su propio perfil"
  on profiles for select
  using (auth.uid() = id);

create policy "Usuario actualiza su propio perfil"
  on profiles for update
  using (auth.uid() = id);

create policy "Usuario inserta su propio perfil"
  on profiles for insert
  with check (auth.uid() = id);

-- Negocios son visibles para todos (para el mapa)
create policy "Negocios visibles para todos"
  on profiles for select
  using (role = 'business');

-- Políticas para transactions
create policy "Usuario ve sus transacciones"
  on transactions for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- ============================================================
-- Función RPC para transferencias seguras (sin race conditions)
-- ============================================================

create or replace function transfer_nocoins(
  sender uuid,
  receiver uuid,
  amount numeric,
  note text default null
)
returns void as $$
begin
  -- Validar que no se transfiera a sí mismo
  if sender = receiver then
    raise exception 'No puedes transferirte a ti mismo';
  end if;

  -- Validar monto positivo
  if amount <= 0 then
    raise exception 'El monto debe ser mayor a 0';
  end if;

  -- Validar saldo suficiente
  if (select balance from profiles where id = sender) < amount then
    raise exception 'Saldo insuficiente';
  end if;

  -- Descontar al sender
  update profiles set balance = balance - amount where id = sender;

  -- Acreditar al receiver
  update profiles set balance = balance + amount where id = receiver;

  -- Registrar transacción
  insert into transactions (sender_id, receiver_id, amount, note)
  values (sender, receiver, amount, note);
end;
$$ language plpgsql security definer;

-- ============================================================
-- Trigger: crear perfil automáticamente al registrarse
-- ============================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name, role, balance)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Usuario'),
    coalesce(new.raw_user_meta_data->>'role', 'consumer'),
    100
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
