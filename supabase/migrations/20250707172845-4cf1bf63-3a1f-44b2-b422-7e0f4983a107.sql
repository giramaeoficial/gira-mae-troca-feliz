-- Criar perfil para o usuário que está logado mas não tem perfil
INSERT INTO public.profiles (
  id,
  username,
  email,
  cadastro_status,
  cadastro_step,
  created_at,
  updated_at
) VALUES (
  'c4dd0129-061d-4eac-b84b-264a01f526e1',
  'user_' || substring('c4dd0129-061d-4eac-b84b-264a01f526e1', 1, 8),
  'user@example.com',
  'incompleto',
  'phone',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Criar carteira para o usuário
INSERT INTO public.carteiras (
  user_id,
  saldo_atual,
  total_recebido,
  total_gasto,
  created_at,
  updated_at
) VALUES (
  'c4dd0129-061d-4eac-b84b-264a01f526e1',
  0.00,
  0.00,
  0.00,
  now(),
  now()
) ON CONFLICT (user_id) DO NOTHING;

-- Criar metas para o usuário
INSERT INTO public.metas_usuarios (
  user_id,
  tipo_meta,
  trocas_necessarias,
  girinhas_bonus,
  trocas_realizadas,
  conquistado,
  created_at,
  updated_at
) VALUES 
  ('c4dd0129-061d-4eac-b84b-264a01f526e1', 'bronze', 10, 5, 0, false, now(), now()),
  ('c4dd0129-061d-4eac-b84b-264a01f526e1', 'prata', 25, 10, 0, false, now(), now()),
  ('c4dd0129-061d-4eac-b84b-264a01f526e1', 'ouro', 50, 25, 0, false, now(), now()),
  ('c4dd0129-061d-4eac-b84b-264a01f526e1', 'diamante', 100, 50, 0, false, now(), now())
ON CONFLICT (user_id, tipo_meta) DO NOTHING;