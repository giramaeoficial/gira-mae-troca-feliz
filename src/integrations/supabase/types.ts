export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      acoes_missoes: {
        Row: {
          ativo: boolean | null
          condicoes: Json | null
          created_at: string | null
          id: string
          missao_id: string | null
          parametros: Json | null
          tipo_evento: string
        }
        Insert: {
          ativo?: boolean | null
          condicoes?: Json | null
          created_at?: string | null
          id?: string
          missao_id?: string | null
          parametros?: Json | null
          tipo_evento: string
        }
        Update: {
          ativo?: boolean | null
          condicoes?: Json | null
          created_at?: string | null
          id?: string
          missao_id?: string | null
          parametros?: Json | null
          tipo_evento?: string
        }
        Relationships: [
          {
            foreignKeyName: "acoes_missoes_missao_id_fkey"
            columns: ["missao_id"]
            isOneToOne: false
            referencedRelation: "missoes"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_missoes: {
        Row: {
          detalhes: Json | null
          evento: string
          id: string
          missao_id: string | null
          segmento_aplicado: Json | null
          timestamp_evento: string | null
          user_id: string | null
        }
        Insert: {
          detalhes?: Json | null
          evento: string
          id?: string
          missao_id?: string | null
          segmento_aplicado?: Json | null
          timestamp_evento?: string | null
          user_id?: string | null
        }
        Update: {
          detalhes?: Json | null
          evento?: string
          id?: string
          missao_id?: string | null
          segmento_aplicado?: Json | null
          timestamp_evento?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_missoes_missao_id_fkey"
            columns: ["missao_id"]
            isOneToOne: false
            referencedRelation: "missoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_missoes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          avaliado_id: string
          avaliador_id: string
          comentario: string | null
          created_at: string
          id: string
          item_id: string
          rating: number
          reserva_id: string
          tipo_avaliacao: string
          updated_at: string
        }
        Insert: {
          avaliado_id: string
          avaliador_id: string
          comentario?: string | null
          created_at?: string
          id?: string
          item_id: string
          rating: number
          reserva_id: string
          tipo_avaliacao: string
          updated_at?: string
        }
        Update: {
          avaliado_id?: string
          avaliador_id?: string
          comentario?: string | null
          created_at?: string
          id?: string
          item_id?: string
          rating?: number
          reserva_id?: string
          tipo_avaliacao?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_avaliado_id_fkey"
            columns: ["avaliado_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_avaliador_id_fkey"
            columns: ["avaliador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
        ]
      }
      carteiras: {
        Row: {
          created_at: string
          id: string
          saldo_atual: number
          total_gasto: number
          total_recebido: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          saldo_atual?: number
          total_gasto?: number
          total_recebido?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          saldo_atual?: number
          total_gasto?: number
          total_recebido?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      compras_girinhas: {
        Row: {
          created_at: string
          girinhas_recebidas: number
          id: string
          pacote_id: string | null
          payment_id: string | null
          status: string
          updated_at: string
          user_id: string
          valor_pago: number
        }
        Insert: {
          created_at?: string
          girinhas_recebidas: number
          id?: string
          pacote_id?: string | null
          payment_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
          valor_pago: number
        }
        Update: {
          created_at?: string
          girinhas_recebidas?: number
          id?: string
          pacote_id?: string | null
          payment_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          valor_pago?: number
        }
        Relationships: [
          {
            foreignKeyName: "compras_girinhas_pacote_id_fkey"
            columns: ["pacote_id"]
            isOneToOne: false
            referencedRelation: "pacotes_girinhas"
            referencedColumns: ["id"]
          },
        ]
      }
      config_categorias: {
        Row: {
          ativo: boolean
          categoria: string
          created_at: string
          descricao: string | null
          id: string
          updated_at: string
          valor_maximo: number
          valor_minimo: number
        }
        Insert: {
          ativo?: boolean
          categoria: string
          created_at?: string
          descricao?: string | null
          id?: string
          updated_at?: string
          valor_maximo?: number
          valor_minimo?: number
        }
        Update: {
          ativo?: boolean
          categoria?: string
          created_at?: string
          descricao?: string | null
          id?: string
          updated_at?: string
          valor_maximo?: number
          valor_minimo?: number
        }
        Relationships: []
      }
      config_sistema: {
        Row: {
          chave: string
          valor: Json | null
        }
        Insert: {
          chave: string
          valor?: Json | null
        }
        Update: {
          chave?: string
          valor?: Json | null
        }
        Relationships: []
      }
      configuracoes_bonus: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          tipo_bonus: string
          updated_at: string
          valor_girinhas: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          tipo_bonus: string
          updated_at?: string
          valor_girinhas: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          tipo_bonus?: string
          updated_at?: string
          valor_girinhas?: number
        }
        Relationships: []
      }
      conversas: {
        Row: {
          created_at: string
          id: string
          reserva_id: string | null
          updated_at: string
          usuario1_id: string
          usuario2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reserva_id?: string | null
          updated_at?: string
          usuario1_id: string
          usuario2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reserva_id?: string | null
          updated_at?: string
          usuario1_id?: string
          usuario2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversas_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversas_usuario1_id_fkey"
            columns: ["usuario1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversas_usuario2_id_fkey"
            columns: ["usuario2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cotacao_girinhas: {
        Row: {
          cotacao_atual: number
          created_at: string | null
          id: string
          updated_at: string | null
          volume_24h: number | null
        }
        Insert: {
          cotacao_atual?: number
          created_at?: string | null
          id?: string
          updated_at?: string | null
          volume_24h?: number | null
        }
        Update: {
          cotacao_atual?: number
          created_at?: string | null
          id?: string
          updated_at?: string | null
          volume_24h?: number | null
        }
        Relationships: []
      }
      escolas_inep: {
        Row: {
          categoria_administrativa: string | null
          categoria_escola_privada: string | null
          codigo_inep: number
          conveniada_poder_publico: string | null
          dependencia_administrativa: string | null
          endereco: string | null
          escola: string | null
          etapas_e_modalidade_de_ensino_oferecidas: string | null
          latitude: string | null
          localidade_diferenciada: string | null
          localizacao: string | null
          longitude: string | null
          municipio: string | null
          outras_ofertas_educacionais: string | null
          porte_da_escola: string | null
          regulamentacao_pelo_conselho_de_educacao: string | null
          restricao_de_atendimento: string | null
          telefone: string | null
          uf: string | null
        }
        Insert: {
          categoria_administrativa?: string | null
          categoria_escola_privada?: string | null
          codigo_inep: number
          conveniada_poder_publico?: string | null
          dependencia_administrativa?: string | null
          endereco?: string | null
          escola?: string | null
          etapas_e_modalidade_de_ensino_oferecidas?: string | null
          latitude?: string | null
          localidade_diferenciada?: string | null
          localizacao?: string | null
          longitude?: string | null
          municipio?: string | null
          outras_ofertas_educacionais?: string | null
          porte_da_escola?: string | null
          regulamentacao_pelo_conselho_de_educacao?: string | null
          restricao_de_atendimento?: string | null
          telefone?: string | null
          uf?: string | null
        }
        Update: {
          categoria_administrativa?: string | null
          categoria_escola_privada?: string | null
          codigo_inep?: number
          conveniada_poder_publico?: string | null
          dependencia_administrativa?: string | null
          endereco?: string | null
          escola?: string | null
          etapas_e_modalidade_de_ensino_oferecidas?: string | null
          latitude?: string | null
          localidade_diferenciada?: string | null
          localizacao?: string | null
          longitude?: string | null
          municipio?: string | null
          outras_ofertas_educacionais?: string | null
          porte_da_escola?: string | null
          regulamentacao_pelo_conselho_de_educacao?: string | null
          restricao_de_atendimento?: string | null
          telefone?: string | null
          uf?: string | null
        }
        Relationships: []
      }
      extensoes_validade: {
        Row: {
          created_at: string | null
          custo_extensao: number
          data_expiracao_nova: string
          data_expiracao_original: string
          dias_adicionados: number
          id: string
          transacao_id: string
          user_id: string
          valor_original: number
        }
        Insert: {
          created_at?: string | null
          custo_extensao: number
          data_expiracao_nova: string
          data_expiracao_original: string
          dias_adicionados: number
          id?: string
          transacao_id: string
          user_id: string
          valor_original: number
        }
        Update: {
          created_at?: string | null
          custo_extensao?: number
          data_expiracao_nova?: string
          data_expiracao_original?: string
          dias_adicionados?: number
          id?: string
          transacao_id?: string
          user_id?: string
          valor_original?: number
        }
        Relationships: [
          {
            foreignKeyName: "extensoes_validade_transacao_id_fkey"
            columns: ["transacao_id"]
            isOneToOne: true
            referencedRelation: "transacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extensoes_validade_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favoritos: {
        Row: {
          created_at: string
          id: string
          item_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens"
            referencedColumns: ["id"]
          },
        ]
      }
      fila_espera: {
        Row: {
          created_at: string
          id: string
          item_id: string
          posicao: number
          updated_at: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          posicao: number
          updated_at?: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          posicao?: number
          updated_at?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fila_espera_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fila_espera_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      filhos: {
        Row: {
          created_at: string
          data_nascimento: string
          escola_id: number | null
          id: string
          mae_id: string
          nome: string
          sexo: string | null
          tamanho_calcados: string | null
          tamanho_roupas: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_nascimento: string
          escola_id?: number | null
          id?: string
          mae_id: string
          nome: string
          sexo?: string | null
          tamanho_calcados?: string | null
          tamanho_roupas?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_nascimento?: string
          escola_id?: number | null
          id?: string
          mae_id?: string
          nome?: string
          sexo?: string | null
          tamanho_calcados?: string | null
          tamanho_roupas?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "filhos_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas_inep"
            referencedColumns: ["codigo_inep"]
          },
          {
            foreignKeyName: "filhos_mae_id_fkey"
            columns: ["mae_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_cotacao: {
        Row: {
          cotacao: number
          created_at: string | null
          evento: string | null
          id: string
          volume_periodo: number | null
        }
        Insert: {
          cotacao: number
          created_at?: string | null
          evento?: string | null
          id?: string
          volume_periodo?: number | null
        }
        Update: {
          cotacao?: number
          created_at?: string | null
          evento?: string | null
          id?: string
          volume_periodo?: number | null
        }
        Relationships: []
      }
      indicacoes: {
        Row: {
          bonus_cadastro_pago: boolean | null
          bonus_pago: boolean | null
          bonus_primeira_compra_pago: boolean | null
          bonus_primeiro_item_pago: boolean | null
          created_at: string
          data_cadastro_indicado: string | null
          data_primeira_compra: string | null
          data_primeiro_item: string | null
          id: string
          indicado_id: string
          indicador_id: string
        }
        Insert: {
          bonus_cadastro_pago?: boolean | null
          bonus_pago?: boolean | null
          bonus_primeira_compra_pago?: boolean | null
          bonus_primeiro_item_pago?: boolean | null
          created_at?: string
          data_cadastro_indicado?: string | null
          data_primeira_compra?: string | null
          data_primeiro_item?: string | null
          id?: string
          indicado_id: string
          indicador_id: string
        }
        Update: {
          bonus_cadastro_pago?: boolean | null
          bonus_pago?: boolean | null
          bonus_primeira_compra_pago?: boolean | null
          bonus_primeiro_item_pago?: boolean | null
          created_at?: string
          data_cadastro_indicado?: string | null
          data_primeira_compra?: string | null
          data_primeiro_item?: string | null
          id?: string
          indicado_id?: string
          indicador_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "indicacoes_indicado_id_fkey"
            columns: ["indicado_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicacoes_indicador_id_fkey"
            columns: ["indicador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      itens: {
        Row: {
          categoria: string
          cidade_manual: string | null
          created_at: string
          descricao: string
          estado_conservacao: string
          estado_manual: string | null
          filho_id: string | null
          fotos: string[] | null
          id: string
          publicado_por: string
          status: string
          tamanho: string | null
          titulo: string
          updated_at: string
          valor_girinhas: number
        }
        Insert: {
          categoria: string
          cidade_manual?: string | null
          created_at?: string
          descricao: string
          estado_conservacao: string
          estado_manual?: string | null
          filho_id?: string | null
          fotos?: string[] | null
          id?: string
          publicado_por: string
          status?: string
          tamanho?: string | null
          titulo: string
          updated_at?: string
          valor_girinhas: number
        }
        Update: {
          categoria?: string
          cidade_manual?: string | null
          created_at?: string
          descricao?: string
          estado_conservacao?: string
          estado_manual?: string | null
          filho_id?: string | null
          fotos?: string[] | null
          id?: string
          publicado_por?: string
          status?: string
          tamanho?: string | null
          titulo?: string
          updated_at?: string
          valor_girinhas?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_filho_id_fkey"
            columns: ["filho_id"]
            isOneToOne: false
            referencedRelation: "filhos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_publicado_por_fkey"
            columns: ["publicado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      limites_missoes_usuarios: {
        Row: {
          created_at: string | null
          id: string
          limite_maximo: number | null
          periodo_inicio: string | null
          proximo_reset: string | null
          total_girinhas_coletadas: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          limite_maximo?: number | null
          periodo_inicio?: string | null
          proximo_reset?: string | null
          total_girinhas_coletadas?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          limite_maximo?: number | null
          periodo_inicio?: string | null
          proximo_reset?: string | null
          total_girinhas_coletadas?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mencoes_mensagens: {
        Row: {
          created_at: string
          id: string
          mensagem_id: string
          usuario_mencionado_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mensagem_id: string
          usuario_mencionado_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mensagem_id?: string
          usuario_mencionado_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mencoes_mensagens_mensagem_id_fkey"
            columns: ["mensagem_id"]
            isOneToOne: false
            referencedRelation: "mensagens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mencoes_mensagens_usuario_mencionado_id_fkey"
            columns: ["usuario_mencionado_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens: {
        Row: {
          conteudo: string
          conversa_id: string
          created_at: string
          id: string
          remetente_id: string
          tipo: string
        }
        Insert: {
          conteudo: string
          conversa_id: string
          created_at?: string
          id?: string
          remetente_id: string
          tipo?: string
        }
        Update: {
          conteudo?: string
          conversa_id?: string
          created_at?: string
          id?: string
          remetente_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "conversas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_remetente_id_fkey"
            columns: ["remetente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      metas_usuarios: {
        Row: {
          conquistado: boolean | null
          created_at: string
          data_conquista: string | null
          girinhas_bonus: number
          id: string
          tipo_meta: string
          trocas_necessarias: number
          trocas_realizadas: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          conquistado?: boolean | null
          created_at?: string
          data_conquista?: string | null
          girinhas_bonus: number
          id?: string
          tipo_meta: string
          trocas_necessarias: number
          trocas_realizadas?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          conquistado?: boolean | null
          created_at?: string
          data_conquista?: string | null
          girinhas_bonus?: number
          id?: string
          tipo_meta?: string
          trocas_necessarias?: number
          trocas_realizadas?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      missoes: {
        Row: {
          acoes_eventos: Json | null
          ativo: boolean | null
          categoria: string
          condicoes: Json
          configuracao_temporal: Json | null
          created_at: string | null
          criterios_segmentacao: Json | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string
          icone: string | null
          id: string
          limite_por_usuario: number | null
          prazo_dias: number | null
          recompensa_girinhas: number
          tipo_missao: string
          titulo: string
          updated_at: string | null
          usuarios_elegíveis_cache: number | null
          validade_recompensa_meses: number | null
        }
        Insert: {
          acoes_eventos?: Json | null
          ativo?: boolean | null
          categoria: string
          condicoes: Json
          configuracao_temporal?: Json | null
          created_at?: string | null
          criterios_segmentacao?: Json | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao: string
          icone?: string | null
          id?: string
          limite_por_usuario?: number | null
          prazo_dias?: number | null
          recompensa_girinhas: number
          tipo_missao: string
          titulo: string
          updated_at?: string | null
          usuarios_elegíveis_cache?: number | null
          validade_recompensa_meses?: number | null
        }
        Update: {
          acoes_eventos?: Json | null
          ativo?: boolean | null
          categoria?: string
          condicoes?: Json
          configuracao_temporal?: Json | null
          created_at?: string | null
          criterios_segmentacao?: Json | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string
          icone?: string | null
          id?: string
          limite_por_usuario?: number | null
          prazo_dias?: number | null
          recompensa_girinhas?: number
          tipo_missao?: string
          titulo?: string
          updated_at?: string | null
          usuarios_elegíveis_cache?: number | null
          validade_recompensa_meses?: number | null
        }
        Relationships: []
      }
      missoes_usuarios: {
        Row: {
          created_at: string | null
          data_coletada: string | null
          data_completada: string | null
          data_expiracao: string | null
          data_inicio: string | null
          id: string
          missao_id: string
          progresso_atual: number | null
          progresso_necessario: number
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_coletada?: string | null
          data_completada?: string | null
          data_expiracao?: string | null
          data_inicio?: string | null
          id?: string
          missao_id: string
          progresso_atual?: number | null
          progresso_necessario: number
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_coletada?: string | null
          data_completada?: string | null
          data_expiracao?: string | null
          data_inicio?: string | null
          id?: string
          missao_id?: string
          progresso_atual?: number | null
          progresso_necessario?: number
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "missoes_usuarios_missao_id_fkey"
            columns: ["missao_id"]
            isOneToOne: false
            referencedRelation: "missoes"
            referencedColumns: ["id"]
          },
        ]
      }
      pacotes_girinhas: {
        Row: {
          ativo: boolean | null
          created_at: string
          desconto_percentual: number | null
          id: string
          nome: string
          updated_at: string
          valor_girinhas: number
          valor_real: number
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          desconto_percentual?: number | null
          id?: string
          nome: string
          updated_at?: string
          valor_girinhas: number
          valor_real: number
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          desconto_percentual?: number | null
          id?: string
          nome?: string
          updated_at?: string
          valor_girinhas?: number
          valor_real?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          aceita_entrega_domicilio: boolean | null
          avatar_url: string | null
          bairro: string | null
          bio: string | null
          categorias_favoritas: string[] | null
          cidade: string | null
          created_at: string | null
          dados_segmentacao: Json | null
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          id: string
          instagram: string | null
          interesses: string[] | null
          nome: string | null
          ponto_retirada_preferido: string | null
          profissao: string | null
          raio_entrega_km: number | null
          reputacao: number | null
          saldo_girinhas: number | null
          telefone: string | null
          ultima_atividade: string | null
          ultimo_calculo_cotacao: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          aceita_entrega_domicilio?: boolean | null
          avatar_url?: string | null
          bairro?: string | null
          bio?: string | null
          categorias_favoritas?: string[] | null
          cidade?: string | null
          created_at?: string | null
          dados_segmentacao?: Json | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          id: string
          instagram?: string | null
          interesses?: string[] | null
          nome?: string | null
          ponto_retirada_preferido?: string | null
          profissao?: string | null
          raio_entrega_km?: number | null
          reputacao?: number | null
          saldo_girinhas?: number | null
          telefone?: string | null
          ultima_atividade?: string | null
          ultimo_calculo_cotacao?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          aceita_entrega_domicilio?: boolean | null
          avatar_url?: string | null
          bairro?: string | null
          bio?: string | null
          categorias_favoritas?: string[] | null
          cidade?: string | null
          created_at?: string | null
          dados_segmentacao?: Json | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          instagram?: string | null
          interesses?: string[] | null
          nome?: string | null
          ponto_retirada_preferido?: string | null
          profissao?: string | null
          raio_entrega_km?: number | null
          reputacao?: number | null
          saldo_girinhas?: number | null
          telefone?: string | null
          ultima_atividade?: string | null
          ultimo_calculo_cotacao?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      queimas_girinhas: {
        Row: {
          created_at: string | null
          id: string
          motivo: string | null
          quantidade: number
          transacao_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          motivo?: string | null
          quantidade: number
          transacao_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          motivo?: string | null
          quantidade?: number
          transacao_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "queimas_girinhas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recompensas_missoes: {
        Row: {
          data_coleta: string | null
          data_expiracao_girinhas: string | null
          girinhas_recebidas: number
          id: string
          missao_id: string
          transacao_id: string | null
          user_id: string
        }
        Insert: {
          data_coleta?: string | null
          data_expiracao_girinhas?: string | null
          girinhas_recebidas: number
          id?: string
          missao_id: string
          transacao_id?: string | null
          user_id: string
        }
        Update: {
          data_coleta?: string | null
          data_expiracao_girinhas?: string | null
          girinhas_recebidas?: number
          id?: string
          missao_id?: string
          transacao_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recompensas_missoes_missao_id_fkey"
            columns: ["missao_id"]
            isOneToOne: false
            referencedRelation: "missoes"
            referencedColumns: ["id"]
          },
        ]
      }
      reservas: {
        Row: {
          confirmado_por_reservador: boolean
          confirmado_por_vendedor: boolean
          created_at: string
          data_reserva: string
          id: string
          item_id: string
          localizacao_combinada: string | null
          prazo_expiracao: string
          status: string
          updated_at: string
          usuario_item: string
          usuario_reservou: string
          valor_girinhas: number
        }
        Insert: {
          confirmado_por_reservador?: boolean
          confirmado_por_vendedor?: boolean
          created_at?: string
          data_reserva?: string
          id?: string
          item_id: string
          localizacao_combinada?: string | null
          prazo_expiracao?: string
          status?: string
          updated_at?: string
          usuario_item: string
          usuario_reservou: string
          valor_girinhas: number
        }
        Update: {
          confirmado_por_reservador?: boolean
          confirmado_por_vendedor?: boolean
          created_at?: string
          data_reserva?: string
          id?: string
          item_id?: string
          localizacao_combinada?: string | null
          prazo_expiracao?: string
          status?: string
          updated_at?: string
          usuario_item?: string
          usuario_reservou?: string
          valor_girinhas?: number
        }
        Relationships: [
          {
            foreignKeyName: "reservas_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens"
            referencedColumns: ["id"]
          },
        ]
      }
      seguidores: {
        Row: {
          created_at: string
          id: string
          seguido_id: string
          seguidor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          seguido_id: string
          seguidor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          seguido_id?: string
          seguidor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seguidores_seguido_id_fkey"
            columns: ["seguido_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seguidores_seguidor_id_fkey"
            columns: ["seguidor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategorias_itens: {
        Row: {
          ativo: boolean | null
          categoria_pai: string
          created_at: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria_pai: string
          created_at?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria_pai?: string
          created_at?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      templates_segmentacao: {
        Row: {
          created_at: string | null
          criado_por: string | null
          criterios: Json
          descricao: string | null
          id: string
          nome: string
          updated_at: string | null
          uso_count: number | null
        }
        Insert: {
          created_at?: string | null
          criado_por?: string | null
          criterios: Json
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string | null
          uso_count?: number | null
        }
        Update: {
          created_at?: string | null
          criado_por?: string | null
          criterios?: Json
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
          uso_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_segmentacao_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transacoes: {
        Row: {
          cotacao_utilizada: number | null
          created_at: string
          data_expiracao: string | null
          descricao: string
          id: string
          item_id: string | null
          quantidade_girinhas: number | null
          tipo: string
          user_id: string
          usuario_origem: string | null
          valor: number
          valor_real: number | null
        }
        Insert: {
          cotacao_utilizada?: number | null
          created_at?: string
          data_expiracao?: string | null
          descricao: string
          id?: string
          item_id?: string | null
          quantidade_girinhas?: number | null
          tipo: string
          user_id: string
          usuario_origem?: string | null
          valor: number
          valor_real?: number | null
        }
        Update: {
          cotacao_utilizada?: number | null
          created_at?: string
          data_expiracao?: string | null
          descricao?: string
          id?: string
          item_id?: string | null
          quantidade_girinhas?: number | null
          tipo?: string
          user_id?: string
          usuario_origem?: string | null
          valor?: number
          valor_real?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens"
            referencedColumns: ["id"]
          },
        ]
      }
      transferencias_girinhas: {
        Row: {
          created_at: string | null
          destinatario_id: string | null
          id: string
          quantidade: number
          remetente_id: string | null
          status: string | null
          taxa_cobrada: number | null
        }
        Insert: {
          created_at?: string | null
          destinatario_id?: string | null
          id?: string
          quantidade: number
          remetente_id?: string | null
          status?: string | null
          taxa_cobrada?: number | null
        }
        Update: {
          created_at?: string | null
          destinatario_id?: string | null
          id?: string
          quantidade?: number
          remetente_id?: string | null
          status?: string | null
          taxa_cobrada?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transferencias_girinhas_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transferencias_girinhas_remetente_id_fkey"
            columns: ["remetente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      atualizar_reputacao: {
        Args: { p_usuario_id: string; p_nova_nota: number }
        Returns: undefined
      }
      buscar_usuario_por_username: {
        Args: { p_username: string }
        Returns: {
          id: string
          nome: string
          username: string
          avatar_url: string
        }[]
      }
      calcular_custo_extensao: {
        Args: { p_valor_expirando: number }
        Returns: number
      }
      calcular_metricas_saude: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      calcular_usuarios_elegiveis: {
        Args: { criterios_segmentacao: Json }
        Returns: number
      }
      cancelar_reserva: {
        Args: { p_reserva_id: string; p_usuario_id: string }
        Returns: boolean
      }
      coletar_recompensa_missao: {
        Args: { p_user_id: string; p_missao_id: string }
        Returns: Json
      }
      confirmar_entrega: {
        Args: { p_reserva_id: string; p_usuario_id: string }
        Returns: boolean
      }
      cotacao_atual: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cotacao_mercado: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      diagnostico_banda_cambial: {
        Args: Record<PropertyKey, never>
        Returns: {
          cotacao_marketplace: number
          preco_venda: number
          zona_atual: string
          markup_aplicado: string
          status_sistema: string
          acao_recomendada: string
        }[]
      }
      distribuir_girinhas_promocionais: {
        Args: {
          p_valor: number
          p_descricao: string
          p_apenas_ativas?: boolean
        }
        Returns: number
      }
      entrar_fila_espera: {
        Args: {
          p_item_id: string
          p_usuario_id: string
          p_valor_girinhas: number
        }
        Returns: Json
      }
      estender_validade_girinhas: {
        Args: {
          p_user_id: string
          p_valor_expirando: number
          p_nova_data_expiracao: string
        }
        Returns: boolean
      }
      estender_validade_girinhas_seguro: {
        Args: { p_user_id: string; p_transacao_id: string }
        Returns: Json
      }
      get_municipios_por_uf: {
        Args: { uf_param: string }
        Returns: string[]
      }
      inicializar_limites_missoes: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      inicializar_metas_usuario: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      mostrar_config_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          configuracao: string
          valor_atual: string
          descricao: string
        }[]
      }
      obter_cotacao_atual: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      obter_cotacao_mercado: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      obter_data_expiracao: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      obter_estatisticas_seguidor: {
        Args: { p_usuario_id: string }
        Returns: {
          total_seguindo: number
          total_seguidores: number
        }[]
      }
      obter_fila_espera: {
        Args: { p_item_id: string }
        Returns: {
          total_fila: number
          posicao_usuario: number
        }[]
      }
      obter_girinhas_expiracao: {
        Args: { p_user_id: string }
        Returns: {
          total_expirando_7_dias: number
          total_expirando_30_dias: number
          proxima_expiracao: string
          detalhes_expiracao: Json
        }[]
      }
      obter_girinhas_expiracao_seguro: {
        Args: { p_user_id: string }
        Returns: {
          total_expirando_7_dias: number
          total_expirando_30_dias: number
          proxima_expiracao: string
          detalhes_expiracao: Json
        }[]
      }
      obter_ou_criar_conversa: {
        Args: { p_reserva_id: string }
        Returns: string
      }
      obter_ou_criar_conversa_livre: {
        Args: { p_usuario1_id: string; p_usuario2_id: string }
        Returns: string
      }
      obter_preco_manual: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      obter_preco_recompra_girinhas: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      obter_preco_venda_girinhas: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      obter_valor_bonus: {
        Args: { p_tipo_bonus: string }
        Returns: number
      }
      pode_estender_transacao: {
        Args: { p_user_id: string; p_transacao_id: string }
        Returns: Json
      }
      preco_emissao: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      processar_bonus_diario: {
        Args: { p_user_id: string; p_valor_girinhas: number }
        Returns: boolean
      }
      processar_bonus_indicacao: {
        Args: { p_indicado_id: string; p_tipo_bonus: string }
        Returns: undefined
      }
      processar_compra_girinhas: {
        Args: { p_user_id: string; p_pacote_id: string; p_payment_id: string }
        Returns: string
      }
      processar_compra_manual: {
        Args: {
          p_user_id: string
          p_quantidade: number
          p_idempotency_key?: string
        }
        Returns: Json
      }
      processar_compra_segura: {
        Args: {
          p_user_id: string
          p_quantidade: number
          p_idempotency_key?: string
        }
        Returns: Json
      }
      processar_expiracao_girinhas: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      processar_proximo_fila: {
        Args: { p_item_id: string }
        Returns: undefined
      }
      processar_reserva: {
        Args: { p_item_id: string; p_usuario_reservou: string; p_valor: number }
        Returns: string
      }
      processar_taxa_transacao: {
        Args: { p_reserva_id: string }
        Returns: undefined
      }
      queimar_girinhas: {
        Args: { p_user_id: string; p_quantidade: number; p_motivo: string }
        Returns: boolean
      }
      registrar_analytics_missao: {
        Args: {
          p_missao_id: string
          p_user_id: string
          p_evento: string
          p_detalhes?: Json
        }
        Returns: string
      }
      registrar_indicacao: {
        Args: { p_indicador_id: string; p_indicado_id: string }
        Returns: boolean
      }
      relatorio_banda_situacao: {
        Args: Record<PropertyKey, never>
        Returns: {
          cotacao_real: number
          preco_venda: number
          preco_recompra: number
          zona_atual: string
          markup_aplicado: string
          status_sistema: string
        }[]
      }
      relatorio_cotacao_detalhado: {
        Args: Record<PropertyKey, never>
        Returns: {
          cotacao_marketplace: number
          preco_venda: number
          preco_recompra: number
          demanda_24h: number
          emissao_24h: number
          queima_24h: number
          oferta_liquida: number
          tendencia: string
        }[]
      }
      relatorio_sistema_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          cotacao_real: number
          preco_venda: number
          preco_recompra: number
          limite_min: number
          limite_max: number
          markup_atual: number
          status_sistema: string
          configuracao_markup: string
        }[]
      }
      relatorio_sistema_cotacao: {
        Args: Record<PropertyKey, never>
        Returns: {
          cotacao_real: number
          preco_meta: number
          preco_venda: number
          preco_recompra: number
          markup_aplicado: number
          situacao_mercado: string
          acao_sistema: string
        }[]
      }
      sair_fila_espera: {
        Args: { p_item_id: string; p_usuario_id: string }
        Returns: boolean
      }
      simular_banda_cambial: {
        Args: { cotacao_teste: number }
        Returns: {
          cotacao_simulada: number
          preco_que_seria: number
          markup_que_seria: number
          zona_que_seria: string
          explicacao: string
        }[]
      }
      simular_markup_inteligente: {
        Args: { cotacao_teste: number }
        Returns: {
          cotacao: number
          markup_seria: number
          preco_seria: number
          explicacao: string
        }[]
      }
      testar_precos_tela: {
        Args: Record<PropertyKey, never>
        Returns: {
          nome_funcao: string
          valor_retornado: number
          observacao: string
        }[]
      }
      transferir_girinhas_p2p: {
        Args: {
          p_remetente_id: string
          p_destinatario_id: string
          p_quantidade: number
        }
        Returns: string
      }
      usuario_elegivel_missao: {
        Args: { user_id: string; missao_id: string }
        Returns: boolean
      }
      validar_valor_item_categoria: {
        Args: { p_categoria: string; p_valor: number }
        Returns: boolean
      }
      verificar_metas_usuario: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      verificar_progresso_missoes: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      verificar_progresso_missoes_segmentadas: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      verificar_username_disponivel: {
        Args: { p_username: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
