-- Ejecutar una sola vez en Supabase SQL Editor antes de publicar esta versión.
-- Los productos existentes se conservan y se marcan como "usado" por defecto.
alter table public.producto
  add column if not exists condicion text not null default 'usado';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'producto_condicion_valida'
      and conrelid = 'public.producto'::regclass
  ) then
    alter table public.producto
      add constraint producto_condicion_valida
      check (condicion in ('nuevo', 'usado'));
  end if;
end $$;
