-- =====================================================================
-- El Papu Store — Alta de usuario admin
-- =====================================================================
-- Correr desde el SQL Editor de Supabase.
-- Da permisos de administrador a un usuario que YA existe en auth.users.
--
-- - Idempotente: si el usuario ya es admin, no hace nada.
-- - Para dar de alta OTRO usuario, reemplazá el UUID y el email.
-- =====================================================================

insert into elpapustore.admin_users (auth_user_id, email, full_name, role, is_active)
select
  '9c9bad7c-445e-4bbe-938d-9ec747af1e88',
  'nanolopez312@gmail.com',
  'Nano Lopez',
  'admin',
  true
where not exists (
  select 1 from elpapustore.admin_users
  where auth_user_id = '9c9bad7c-445e-4bbe-938d-9ec747af1e88'
);

-- Verificar que quedó creado
select id, auth_user_id, email, full_name, role, is_active, created_at
from elpapustore.admin_users
where auth_user_id = '9c9bad7c-445e-4bbe-938d-9ec747af1e88';
