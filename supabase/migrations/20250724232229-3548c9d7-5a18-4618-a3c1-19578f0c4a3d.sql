-- Criar tabela de denúncias
CREATE TABLE public.denuncias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.itens(id) ON DELETE CASCADE,
  denunciante_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  motivo TEXT NOT NULL,
  descricao TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'analisada', 'rejeitada', 'aceita')),
  analisada_por UUID REFERENCES auth.users(id),
  data_analise TIMESTAMP WITH TIME ZONE,
  observacoes_admin TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_denuncias_item_id ON public.denuncias(item_id);
CREATE INDEX idx_denuncias_denunciante_id ON public.denuncias(denunciante_id);
CREATE INDEX idx_denuncias_status ON public.denuncias(status);
CREATE INDEX idx_denuncias_created_at ON public.denuncias(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.denuncias ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem criar suas próprias denúncias" 
ON public.denuncias 
FOR INSERT 
WITH CHECK (denunciante_id = auth.uid());

CREATE POLICY "Usuários podem ver suas próprias denúncias" 
ON public.denuncias 
FOR SELECT 
USING (denunciante_id = auth.uid());

CREATE POLICY "Admins podem ver todas as denúncias" 
ON public.denuncias 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE user_id = auth.uid()
));

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_denuncias_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_denuncias_updated_at
  BEFORE UPDATE ON public.denuncias
  FOR EACH ROW
  EXECUTE FUNCTION update_denuncias_updated_at();