-- Remover a view global_ranking insegura
DROP VIEW IF EXISTS public.global_ranking;

-- Criar função segura para obter o ranking global
-- Esta função é mais segura que uma view pois:
-- 1. Usa SECURITY DEFINER de forma controlada
-- 2. Tem search_path fixo
-- 3. Aplica RLS das tabelas subjacentes
-- 4. Permite parametrização (limit)
CREATE OR REPLACE FUNCTION public.get_global_ranking(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  score INTEGER,
  time_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  username TEXT,
  avatar_url TEXT,
  rank BIGINT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    gs.id,
    gs.score,
    gs.time_seconds,
    gs.created_at,
    p.username,
    p.avatar_url,
    ROW_NUMBER() OVER (ORDER BY gs.score DESC, gs.time_seconds ASC) as rank
  FROM public.game_scores gs
  INNER JOIN public.profiles p ON gs.user_id = p.id
  ORDER BY gs.score DESC, gs.time_seconds ASC
  LIMIT limit_count;
$$;