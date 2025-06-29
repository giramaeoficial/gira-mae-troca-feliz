
-- Corrigir a função registrar_conversa_whatsapp para aceitar o parâmetro p_tipo_usuario
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

-- Atualizar a função do feed para incluir telefone do vendedor
CREATE OR REPLACE FUNCTION carregar_dados_feed_paginado(
  p_user_id UUID,
  p_page INTEGER DEFAULT 0,
  p_limit INTEGER DEFAULT 20,
  p_busca TEXT DEFAULT '',
  p_cidade TEXT DEFAULT '',
  p_categoria TEXT DEFAULT 'todas',
  p_subcategoria TEXT DEFAULT 'todas', 
  p_genero TEXT DEFAULT 'todos',
  p_tamanho TEXT DEFAULT 'todos',
  p_preco_min DECIMAL DEFAULT 0,
  p_preco_max DECIMAL DEFAULT 200,
  p_mostrar_reservados BOOLEAN DEFAULT true
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offset INTEGER;
  v_itens JSONB;
  v_total_count INTEGER;
  v_has_more BOOLEAN;
  v_configuracoes JSONB;
  v_profile JSONB;
BEGIN
  v_offset := p_page * p_limit;
  
  -- Buscar itens com telefone do vendedor incluído
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', i.id,
      'titulo', i.titulo,
      'descricao', i.descricao,
      'categoria', i.categoria,
      'subcategoria', i.subcategoria,
      'genero', i.genero,
      'tamanho_categoria', i.tamanho_categoria,
      'tamanho_valor', i.tamanho_valor,
      'estado_conservacao', i.estado_conservacao,
      'valor_girinhas', i.valor_girinhas,
      'fotos', i.fotos,
      'status', i.status,
      'publicado_por', i.publicado_por,
      'created_at', i.created_at,
      'updated_at', i.updated_at,
      'endereco_bairro', p.bairro,
      'endereco_cidade', p.cidade,
      'endereco_estado', p.estado,
      'aceita_entrega', p.aceita_entrega_domicilio,
      'raio_entrega_km', p.raio_entrega_km,
      'publicado_por_profile', jsonb_build_object(
        'nome', p.nome,
        'avatar_url', p.avatar_url,
        'reputacao', p.reputacao,
        'telefone', p.telefone  -- ADICIONAR TELEFONE AQUI
      )
    )
  ) INTO v_itens
  FROM itens i
  JOIN profiles p ON i.publicado_por = p.id
  WHERE (p_busca = '' OR i.titulo ILIKE '%' || p_busca || '%' OR i.descricao ILIKE '%' || p_busca || '%')
    AND (p_cidade = '' OR p.cidade ILIKE '%' || p_cidade || '%')
    AND (p_categoria = 'todas' OR i.categoria = p_categoria)
    AND (p_subcategoria = 'todas' OR i.subcategoria = p_subcategoria)
    AND (p_genero = 'todos' OR i.genero = p_genero)
    AND (p_tamanho = 'todos' OR i.tamanho_valor = p_tamanho)
    AND i.valor_girinhas BETWEEN p_preco_min AND p_preco_max
    AND (p_mostrar_reservados OR i.status = 'disponivel')
    AND i.publicado_por != p_user_id
  ORDER BY i.created_at DESC
  LIMIT p_limit
  OFFSET v_offset;

  -- Contar total
  SELECT COUNT(*) INTO v_total_count
  FROM itens i
  JOIN profiles p ON i.publicado_por = p.id
  WHERE (p_busca = '' OR i.titulo ILIKE '%' || p_busca || '%' OR i.descricao ILIKE '%' || p_busca || '%')
    AND (p_cidade = '' OR p.cidade ILIKE '%' || p_cidade || '%')
    AND (p_categoria = 'todas' OR i.categoria = p_categoria)
    AND (p_subcategoria = 'todas' OR i.subcategoria = p_subcategoria)
    AND (p_genero = 'todos' OR i.genero = p_genero)
    AND (p_tamanho = 'todos' OR i.tamanho_valor = p_tamanho)
    AND i.valor_girinhas BETWEEN p_preco_min AND p_preco_max
    AND (p_mostrar_reservados OR i.status = 'disponivel')
    AND i.publicado_por != p_user_id;

  v_has_more := (v_offset + p_limit) < v_total_count;

  -- Buscar configurações (primeira página apenas)
  IF p_page = 0 THEN
    SELECT jsonb_build_object(
      'categorias', (
        SELECT jsonb_agg(jsonb_build_object('codigo', codigo, 'nome', nome, 'icone', icone, 'ordem', ordem))
        FROM categorias WHERE ativo = true ORDER BY ordem
      ),
      'subcategorias', (
        SELECT jsonb_agg(jsonb_build_object('id', id, 'nome', nome, 'categoria_pai', categoria_pai, 'icone', icone, 'ordem', ordem))
        FROM subcategorias WHERE ativo = true ORDER BY ordem
      )
    ) INTO v_configuracoes;

    -- Profile essencial
    SELECT jsonb_build_object(
      'id', id,
      'nome', nome,
      'cidade', cidade,
      'estado', estado,
      'bairro', bairro,
      'avatar_url', avatar_url
    ) INTO v_profile
    FROM profiles WHERE id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'itens', COALESCE(v_itens, '[]'::jsonb),
    'configuracoes', v_configuracoes,
    'profile_essencial', v_profile,
    'has_more', v_has_more,
    'total_count', v_total_count
  );
END;
$$;
