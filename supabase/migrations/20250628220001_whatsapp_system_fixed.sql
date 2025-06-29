
-- REMOVER SISTEMA DE CHAT ANTIGO
DROP TABLE IF EXISTS mensagens CASCADE;
DROP TABLE IF EXISTS conversas CASCADE;
DROP TABLE IF EXISTS chat_participants CASCADE;
DROP TABLE IF EXISTS message_reads CASCADE;
DROP TABLE IF EXISTS mencoes_mensagens CASCADE;

-- REMOVER FUNCTIONS ANTIGAS
DROP FUNCTION IF EXISTS buscar_conversas_completas(UUID);
DROP FUNCTION IF EXISTS obter_ou_criar_conversa_livre(UUID, UUID);
DROP FUNCTION IF EXISTS enviar_mensagem_inicial_reserva(UUID, UUID);
DROP FUNCTION IF EXISTS marcar_mensagem_como_lida(UUID, UUID);
DROP FUNCTION IF EXISTS contar_mensagens_nao_lidas(UUID);
DROP FUNCTION IF EXISTS notify_new_message();
DROP FUNCTION IF EXISTS create_notification(UUID, TEXT, TEXT, TEXT, JSONB);

-- REMOVER ÍNDICES ANTIGOS
DROP INDEX IF EXISTS idx_conversas_usuarios;
DROP INDEX IF EXISTS idx_conversas_updated_at;
DROP INDEX IF EXISTS idx_mensagens_conversa_created;
DROP INDEX IF EXISTS idx_mensagens_remetente;

-- ADICIONAR WHATSAPP OBRIGATÓRIO NO PERFIL
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS numero_whatsapp VARCHAR(20) NOT NULL DEFAULT '';

-- Constraint para formato brasileiro
ALTER TABLE profiles 
ADD CONSTRAINT check_whatsapp_format 
CHECK (numero_whatsapp ~ '^[0-9]{10,11}$' OR numero_whatsapp = '');

-- Para usuários existentes, permitir temporariamente vazio
UPDATE profiles SET numero_whatsapp = '' WHERE numero_whatsapp IS NULL;

-- CRIAR TABELA SIMPLES PARA TRACKING
CREATE TABLE conversas_whatsapp_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reserva_id UUID NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
    usuario_iniciou UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    usuario_recebeu UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES itens(id) ON DELETE CASCADE,
    tipo_usuario TEXT NOT NULL CHECK (tipo_usuario IN ('vendedor', 'comprador')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices básicos
CREATE INDEX idx_whatsapp_log_reserva ON conversas_whatsapp_log(reserva_id);
CREATE INDEX idx_whatsapp_log_created ON conversas_whatsapp_log(created_at DESC);

-- RLS
ALTER TABLE conversas_whatsapp_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem inserir log WhatsApp" ON conversas_whatsapp_log
    FOR INSERT TO authenticated
    WITH CHECK (usuario_iniciou = auth.uid());
    
CREATE POLICY "Admin pode ver logs WhatsApp" ON conversas_whatsapp_log
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND email LIKE '%admin%'
        )
    );

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
