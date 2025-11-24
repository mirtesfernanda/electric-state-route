-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Profiles são visíveis para todos"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Função para criar perfil automaticamente ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Criar tabela de pontuações do jogo
CREATE TABLE public.game_scores (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 5),
  time_seconds INTEGER NOT NULL CHECK (time_seconds > 0),
  total_questions INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criar índice para melhor performance em queries de ranking
CREATE INDEX idx_game_scores_score_time ON public.game_scores(score DESC, time_seconds ASC);
CREATE INDEX idx_game_scores_user ON public.game_scores(user_id);
CREATE INDEX idx_game_scores_created_at ON public.game_scores(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para game_scores
CREATE POLICY "Pontuações são visíveis para todos"
  ON public.game_scores FOR SELECT
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir pontuações"
  ON public.game_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- View para top 10 ranking global
CREATE OR REPLACE VIEW public.global_ranking AS
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
LIMIT 10;