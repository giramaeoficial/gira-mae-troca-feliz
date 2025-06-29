
-- Adicionar campo WhatsApp no perfil (se não existir)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS numero_whatsapp VARCHAR(20) DEFAULT '';

-- Constraint para formato brasileiro válido
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_whatsapp_format' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles 
        ADD CONSTRAINT check_whatsapp_format 
        CHECK (numero_whatsapp ~ '^[0-9]{10,11}$' OR numero_whatsapp = '');
    END IF;
END $$;

-- CRIAR SISTEMA DE TRACKING WHATSAPP (se não existir)
CREATE TABLE IF NOT EXISTS conversas_whatsapp_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reserva_id UUID NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
    usuario_iniciou UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    usuario_recebeu UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES itens(id) ON DELETE CASCADE,
    tipo_usuario TEXT NOT NULL CHECK (tipo_usuario IN ('vendedor', 'comprador')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance (se não existirem)
CREATE INDEX IF NOT EXISTS idx_whatsapp_log_reserva ON conversas_whatsapp_log(reserva_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_log_created ON conversas_whatsapp_log(created_at DESC);

-- Row Level Security
ALTER TABLE conversas_whatsapp_log ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (se não existirem)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'conversas_whatsapp_log' 
        AND policyname = 'Usuários podem inserir log WhatsApp'
    ) THEN
        CREATE POLICY "Usuários podem inserir log WhatsApp" ON conversas_whatsapp_log
            FOR INSERT TO authenticated
            WITH CHECK (usuario_iniciou = auth.uid());
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'conversas_whatsapp_log' 
        AND policyname = 'Admin pode ver logs WhatsApp'
    ) THEN
        CREATE POLICY "Admin pode ver logs WhatsApp" ON conversas_whatsapp_log
            FOR SELECT TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() 
                    AND email LIKE '%admin%'
                )
            );
    END IF;
END $$;

-- FUNCTION PARA REGISTRAR CONVERSAS WHATSAPP
CREATE OR REPLACE FUNCTION registrar_conversa_whatsapp(
    p_reserva_id UUID,
    p_usuario_recebeu UUID
) RETURNS VOID AS $$
DECLARE
    reserva_info RECORD;
    tipo_usuario_iniciou TEXT;
BEGIN
    -- Buscar informações da reserva
    SELECT r.usuario_reservou, i.id as item_id, i.publicado_por
    INTO reserva_info
    FROM reservas r
    JOIN itens i ON i.id = r.item_id
    WHERE r.id = p_reserva_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reserva não encontrada';
    END IF;
    
    -- Determinar tipo do usuário que iniciou
    IF auth.uid() = reserva_info.publicado_por THEN
        tipo_usuario_iniciou := 'vendedor';
    ELSIF auth.uid() = reserva_info.usuario_reservou THEN
        tipo_usuario_iniciou := 'comprador';
    ELSE
        RAISE EXCEPTION 'Usuário não autorizado';
    END IF;
    
    -- Inserir log (permite duplicatas para tracking completo)
    INSERT INTO conversas_whatsapp_log (
        reserva_id,
        usuario_iniciou,
        usuario_recebeu,
        item_id,
        tipo_usuario
    ) VALUES (
        p_reserva_id,
        auth.uid(),
        p_usuario_recebeu,
        reserva_info.item_id,
        tipo_usuario_iniciou
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
