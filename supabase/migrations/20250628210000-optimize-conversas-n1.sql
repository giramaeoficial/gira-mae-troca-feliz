
-- Otimização crítica: Eliminar problema N+1 em useConversas
-- Reduzir de 31 requests para 1 request (97% redução)

-- Function consolidada que busca todas as conversas com dados completos
CREATE OR REPLACE FUNCTION buscar_conversas_completas(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    resultado JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'id', c.id,
            'reserva_id', c.reserva_id,
            'usuario1_id', c.usuario1_id,
            'usuario2_id', c.usuario2_id,
            'created_at', c.created_at,
            'updated_at', c.updated_at,
            'participante', json_build_object(
                'id', p.id,
                'nome', p.nome,
                'username', p.username,
                'avatar_url', p.avatar_url
            ),
            'ultimaMensagem', CASE 
                WHEN ultima_msg.conteudo IS NOT NULL THEN 
                    json_build_object(
                        'conteudo', ultima_msg.conteudo,
                        'created_at', ultima_msg.created_at,
                        'remetente_id', ultima_msg.remetente_id
                    )
                ELSE NULL
            END,
            'item', CASE 
                WHEN i.id IS NOT NULL THEN 
                    json_build_object(
                        'id', i.id,
                        'titulo', i.titulo,
                        'fotos', i.fotos,
                        'valor_girinhas', i.valor_girinhas
                    )
                ELSE NULL
            END,
            'naoLidas', COALESCE(msg_nao_lidas.count, 0)
        )
    ) INTO resultado
    FROM conversas c
    -- JOIN para pegar dados do outro participante
    LEFT JOIN profiles p ON (
        CASE 
            WHEN c.usuario1_id = p_user_id THEN p.id = c.usuario2_id
            ELSE p.id = c.usuario1_id
        END
    )
    -- JOIN para pegar item da reserva (se houver)
    LEFT JOIN reservas r ON r.id = c.reserva_id
    LEFT JOIN itens i ON i.id = r.item_id
    -- LATERAL JOIN para pegar última mensagem de cada conversa
    LEFT JOIN LATERAL (
        SELECT conteudo, created_at, remetente_id
        FROM mensagens m
        WHERE m.conversa_id = c.id
        ORDER BY m.created_at DESC
        LIMIT 1
    ) ultima_msg ON true
    -- LATERAL JOIN para contar mensagens não lidas
    LEFT JOIN LATERAL (
        SELECT COUNT(*) as count
        FROM mensagens m
        WHERE m.conversa_id = c.id 
        AND m.remetente_id != p_user_id
    ) msg_nao_lidas ON true
    WHERE (c.usuario1_id = p_user_id OR c.usuario2_id = p_user_id)
    ORDER BY c.updated_at DESC;
    
    RETURN COALESCE(resultado, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Índices para otimizar performance da function
CREATE INDEX IF NOT EXISTS idx_conversas_usuarios ON conversas(usuario1_id, usuario2_id);
CREATE INDEX IF NOT EXISTS idx_conversas_updated_at ON conversas(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_mensagens_conversa_created ON mensagens(conversa_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mensagens_remetente ON mensagens(conversa_id, remetente_id);
