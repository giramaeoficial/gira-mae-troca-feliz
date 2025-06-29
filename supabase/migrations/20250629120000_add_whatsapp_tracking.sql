
-- Função para registrar tracking de conversas WhatsApp
CREATE OR REPLACE FUNCTION registrar_conversa_whatsapp(
  p_reserva_id UUID,
  p_tipo_usuario TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reserva RECORD;
  v_usuario_iniciou UUID;
  v_usuario_recebeu UUID;
BEGIN
  -- Buscar dados da reserva
  SELECT * INTO v_reserva FROM reservas WHERE id = p_reserva_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Definir quem iniciou e quem recebeu baseado no tipo
  IF p_tipo_usuario = 'vendedor' THEN
    v_usuario_iniciou := v_reserva.usuario_item;
    v_usuario_recebeu := v_reserva.usuario_reservou;
  ELSE
    v_usuario_iniciou := v_reserva.usuario_reservou;
    v_usuario_recebeu := v_reserva.usuario_item;
  END IF;
  
  -- Registrar no log
  INSERT INTO conversas_whatsapp_log (
    reserva_id,
    item_id,
    usuario_iniciou,
    usuario_recebeu,
    tipo_usuario
  ) VALUES (
    p_reserva_id,
    v_reserva.item_id,
    v_usuario_iniciou,
    v_usuario_recebeu,
    p_tipo_usuario
  );
END;
$$;
