-- Ejecutar después de las dos migraciones anteriores.
-- Reputación, métricas de uso e imágenes adicionales para SchoolSwap.

alter table public.producto
  add column if not exists visitas integer not null default 0;

create table if not exists public.producto_imagen (
  id_imagen uuid primary key default gen_random_uuid(),
  id_producto uuid not null references public.producto(id_producto) on delete cascade,
  url text not null,
  orden smallint not null check (orden between 1 and 3),
  created_at timestamptz not null default now(),
  unique (id_producto, orden)
);

alter table public.producto_imagen enable row level security;

drop policy if exists "imagenes publicas de productos" on public.producto_imagen;
create policy "imagenes publicas de productos"
on public.producto_imagen for select using (true);

drop policy if exists "dueno administra imagenes del producto" on public.producto_imagen;
create policy "dueno administra imagenes del producto"
on public.producto_imagen for all
using (exists (
  select 1 from public.producto
  where producto.id_producto = producto_imagen.id_producto
    and producto.id_usuario = auth.uid()
))
with check (exists (
  select 1 from public.producto
  where producto.id_producto = producto_imagen.id_producto
    and producto.id_usuario = auth.uid()
));

create or replace function public.registrar_visita_producto(p_id_producto uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update producto
  set visitas = visitas + 1
  where id_producto = p_id_producto and estado = 'publicado';
end;
$$;

create or replace function public.obtener_reputacion_usuario(p_id_usuario uuid)
returns table(productos_publicados integer, ventas_completadas integer, trueques_aceptados integer)
language sql
security definer
set search_path = public
as $$
  select
    (select count(*)::integer from producto where id_usuario = p_id_usuario),
    (select count(*)::integer
      from detalle_pedido dp
      join pedido pe on pe.id_pedido = dp.id_pedido
      join producto pr on pr.id_producto = dp.id_producto
      where pr.id_usuario = p_id_usuario and pe.estado = 'completado'),
    (select count(*)::integer
      from trueque
      where estado = 'aceptado'
        and (id_usuario_oferta = p_id_usuario or id_usuario_receptor = p_id_usuario));
$$;

revoke all on function public.registrar_visita_producto(uuid) from public;
revoke all on function public.obtener_reputacion_usuario(uuid) from public;
grant execute on function public.registrar_visita_producto(uuid) to anon, authenticated;
grant execute on function public.obtener_reputacion_usuario(uuid) to authenticated;
