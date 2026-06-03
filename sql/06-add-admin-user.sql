-- =====================================================================
-- El Papu Store — Alta de usuario admin
-- =====================================================================
-- Correr desde el SQL Editor de Supabase.
-- Da permisos de administrador a un usuario que YA existe en auth.users.
--
-- - El email y el nombre se toman automáticamente de auth.users
--   (no hace falta tipearlos).
-- - Idempotente: si el usuario ya es admin, no hace nada.
-- - Para dar de alta OTRO usuario, reemplazá el UUID en los dos lugares.
-- =====================================================================

insert into elpapustore.admin_users (auth_user_id, email, full_name, role, is_active)
select
  u.id,
  u.email,
  coalesce(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1)
  ),
  'admin',
  true
from auth.users u
where u.id = '9c9bad7c-445e-4bbe-938d-9ec747af1e88'
  and not exists (
    select 1 from elpapustore.admin_users a where a.auth_user_id = u.id
  );

-- Verificar que quedó creado
select id, auth_user_id, email, full_name, role, is_active, created_at
from elpapustore.admin_users
where auth_user_id = '9c9bad7c-445e-4bbe-938d-9ec747af1e88';
