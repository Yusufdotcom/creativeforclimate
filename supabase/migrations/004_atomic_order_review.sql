-- Review an order and update its artwork reservation in a single transaction.
create or replace function public.review_hormuud_order(
  p_order_id uuid,
  p_decision text,
  p_reviewed_by text
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_artwork public.artworks;
  v_payment_status text;
  v_order_status text;
  v_inventory_status text;
begin
  if p_decision not in ('approve', 'reject') then
    raise exception 'Invalid order review decision';
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found';
  end if;

  if v_order.order_status <> 'pending' then
    raise exception 'Order already reviewed';
  end if;

  select * into v_artwork
  from public.artworks
  where id = v_order.artwork_id
  for update;

  if not found or v_artwork.inventory_status <> 'reserved' then
    raise exception 'Artwork reservation is no longer active';
  end if;

  if p_decision = 'approve' then
    v_payment_status := 'verified';
    v_order_status := 'approved';
    v_inventory_status := 'sold';
  else
    v_payment_status := 'rejected';
    v_order_status := 'rejected';
    v_inventory_status := 'available';
  end if;

  update public.orders
  set payment_status = v_payment_status,
      order_status = v_order_status,
      reviewed_by = p_reviewed_by,
      reviewed_at = now()
  where id = p_order_id
  returning * into v_order;

  update public.artworks
  set inventory_status = v_inventory_status
  where id = v_order.artwork_id;

  return v_order;
end;
$$;

revoke all on function public.review_hormuud_order(uuid, text, text) from public;
grant execute on function public.review_hormuud_order(uuid, text, text) to service_role;
