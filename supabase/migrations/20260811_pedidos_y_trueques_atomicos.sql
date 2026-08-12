-- Ejecutar después de 20260811_add_producto_condicion.sql.
-- Centraliza las operaciones críticas para que inventario, pedidos y trueques
-- no queden parcialmente guardados cuando ocurre un error.

create or replace function public.confirmar_pedido_actual()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_usuario uuid := auth.uid();
  v_carrito uuid;
  v_pedido uuid;
  v_total numeric(10, 2) := 0;
  v_item record;
begin
  if v_usuario is null then
    raise exception 'Debés iniciar sesión para confirmar el pedido';
  end if;

  select id_carrito into v_carrito
  from carrito
  where id_usuario = v_usuario
  for update;

  if v_carrito is null then
    raise exception 'No existe un carrito activo';
  end if;

  for v_item in
    select ci.id_item, ci.id_producto, ci.cantidad, p.precio, p.stock, p.estado, p.id_usuario
    from carrito_item ci
    join producto p on p.id_producto = ci.id_producto
    where ci.id_carrito = v_carrito
    order by ci.id_producto
    for update of ci, p
  loop
    if v_item.estado <> 'publicado' or v_item.stock < v_item.cantidad then
      raise exception 'El producto % ya no tiene suficiente stock', v_item.id_producto;
    end if;
    if v_item.id_usuario = v_usuario then
      raise exception 'No podés comprar tu propio producto';
    end if;
    v_total := v_total + (v_item.cantidad * v_item.precio);
  end loop;

  if v_total = 0 then
    raise exception 'El carrito está vacío';
  end if;

  insert into pedido (id_usuario, precio_total, estado)
  values (v_usuario, v_total, 'pendiente')
  returning id_pedido into v_pedido;

  for v_item in
    select ci.id_producto, ci.cantidad, p.precio
    from carrito_item ci
    join producto p on p.id_producto = ci.id_producto
    where ci.id_carrito = v_carrito
  loop
    insert into detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario)
    values (v_pedido, v_item.id_producto, v_item.cantidad, v_item.precio);

    update producto
    set stock = stock - v_item.cantidad,
        estado = case when stock - v_item.cantidad = 0 then 'agotado' else 'publicado' end
    where id_producto = v_item.id_producto;
  end loop;

  delete from carrito_item where id_carrito = v_carrito;
  return v_pedido;
end;
$$;

create or replace function public.responder_trueque(p_id_trueque uuid, p_aceptar boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_usuario uuid := auth.uid();
  v_trueque trueque%rowtype;
  v_disponibles integer;
begin
  select * into v_trueque
  from trueque
  where id_trueque = p_id_trueque
  for update;

  if not found or v_trueque.id_usuario_receptor <> v_usuario then
    raise exception 'No tenés permiso para responder este trueque';
  end if;
  if v_trueque.estado <> 'pendiente' then
    raise exception 'Esta propuesta ya fue respondida';
  end if;

  if not p_aceptar then
    update trueque set estado = 'rechazado' where id_trueque = p_id_trueque;
    return;
  end if;

  perform id_producto
  from producto
  where id_producto in (v_trueque.id_producto_ofrecido, v_trueque.id_producto_solicitado)
  order by id_producto
  for update;

  select count(*) into v_disponibles
  from producto
  where id_producto in (v_trueque.id_producto_ofrecido, v_trueque.id_producto_solicitado)
    and estado = 'publicado';

  if v_disponibles <> 2 then
    raise exception 'Uno de los productos ya no está disponible';
  end if;

  update producto
  set estado = 'intercambiado', stock = 0
  where id_producto in (v_trueque.id_producto_ofrecido, v_trueque.id_producto_solicitado);

  update trueque
  set estado = 'aceptado'
  where id_trueque = p_id_trueque;

  update trueque
  set estado = 'rechazado'
  where estado = 'pendiente'
    and id_trueque <> p_id_trueque
    and (
      id_producto_ofrecido in (v_trueque.id_producto_ofrecido, v_trueque.id_producto_solicitado)
      or id_producto_solicitado in (v_trueque.id_producto_ofrecido, v_trueque.id_producto_solicitado)
    );
end;
$$;

revoke all on function public.confirmar_pedido_actual() from public;
revoke all on function public.responder_trueque(uuid, boolean) from public;
grant execute on function public.confirmar_pedido_actual() to authenticated;
grant execute on function public.responder_trueque(uuid, boolean) to authenticated;
