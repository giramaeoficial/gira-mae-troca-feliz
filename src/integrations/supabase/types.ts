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
          cidade: string | null
          created_at: string | null
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
          ultimo_calculo_cotacao: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          aceita_entrega_domicilio?: boolean | null
          avatar_url?: string | null
          bairro?: string | null
          bio?: string | null
          cidade?: string | null
          created_at?: string | null
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
          ultimo_calculo_cotacao?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          aceita_entrega_domicilio?: boolean | null
          avatar_url?: string | null
          bairro?: string | null
          bio?: string | null
          cidade?: string | null
          created_at?: string | null
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
      calcular_cotacao_dinamica: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cancelar_reserva: {
        Args: { p_reserva_id: string; p_usuario_id: string }
        Returns: boolean
      }
      confirmar_entrega: {
        Args: { p_reserva_id: string; p_usuario_id: string }
        Returns: boolean
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
      get_municipios_por_uf: {
        Args: { uf_param: string }
        Returns: string[]
      }
      inicializar_metas_usuario: {
        Args: { p_user_id: string }
        Returns: undefined
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
      obter_ou_criar_conversa: {
        Args: { p_reserva_id: string }
        Returns: string
      }
      obter_ou_criar_conversa_livre: {
        Args: { p_usuario1_id: string; p_usuario2_id: string }
        Returns: string
      }
      obter_valor_bonus: {
        Args: { p_tipo_bonus: string }
        Returns: number
      }
      processar_bonus_indicacao: {
        Args: { p_indicado_id: string; p_tipo_bonus: string }
        Returns: undefined
      }
      processar_compra_girinhas: {
        Args: { p_user_id: string; p_pacote_id: string; p_payment_id: string }
        Returns: string
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
      registrar_indicacao: {
        Args: { p_indicador_id: string; p_indicado_id: string }
        Returns: boolean
      }
      sair_fila_espera: {
        Args: { p_item_id: string; p_usuario_id: string }
        Returns: boolean
      }
      transferir_girinhas_p2p: {
        Args: {
          p_remetente_id: string
          p_destinatario_id: string
          p_quantidade: number
        }
        Returns: string
      }
      verificar_metas_usuario: {
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
