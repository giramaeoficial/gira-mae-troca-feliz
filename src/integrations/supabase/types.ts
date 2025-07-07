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
      admin_actions: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notifications: {
        Row: {
          action_text: string | null
          action_url: string | null
          created_at: string | null
          id: string
          message: string
          sent_by: string | null
          sent_count: number | null
          target_type: string
          target_users: string[] | null
          title: string
        }
        Insert: {
          action_text?: string | null
          action_url?: string | null
          created_at?: string | null
          id?: string
          message: string
          sent_by?: string | null
          sent_count?: number | null
          target_type: string
          target_users?: string[] | null
          title: string
        }
        Update: {
          action_text?: string | null
          action_url?: string | null
          created_at?: string | null
          id?: string
          message?: string
          sent_by?: string | null
          sent_count?: number | null
          target_type?: string
          target_users?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
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
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
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
            foreignKeyName: "avaliacoes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_completos"
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
      cadastro_temp_data: {
        Row: {
          created_at: string | null
          form_data: Json
          id: string
          step: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          form_data?: Json
          id?: string
          step: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          form_data?: Json
          id?: string
          step?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      categorias: {
        Row: {
          ativo: boolean | null
          codigo: string
          created_at: string | null
          descricao: string | null
          icone: string | null
          nome: string
          ordem: number | null
          updated_at: string | null
          valor_maximo: number | null
          valor_minimo: number | null
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          nome: string
          ordem?: number | null
          updated_at?: string | null
          valor_maximo?: number | null
          valor_minimo?: number | null
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          nome?: string
          ordem?: number | null
          updated_at?: string | null
          valor_maximo?: number | null
          valor_minimo?: number | null
        }
        Relationships: []
      }
      categorias_tamanhos: {
        Row: {
          ativo: boolean | null
          categoria: string
          created_at: string | null
          id: string
          idade_maxima_meses: number | null
          idade_minima_meses: number | null
          label_display: string
          ordem: number
          subcategoria: string | null
          tipo_tamanho: string
          valor: string
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          created_at?: string | null
          id?: string
          idade_maxima_meses?: number | null
          idade_minima_meses?: number | null
          label_display: string
          ordem: number
          subcategoria?: string | null
          tipo_tamanho: string
          valor: string
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          created_at?: string | null
          id?: string
          idade_maxima_meses?: number | null
          idade_minima_meses?: number | null
          label_display?: string
          ordem?: number
          subcategoria?: string | null
          tipo_tamanho?: string
          valor?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_categorias_tamanhos_categoria"
            columns: ["categoria"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["codigo"]
          },
        ]
      }
      compras_girinhas: {
        Row: {
          created_at: string
          external_reference: string | null
          girinhas_recebidas: number
          id: string
          pacote_id: string | null
          payment_id: string | null
          payment_method: string | null
          status: string
          updated_at: string
          user_id: string
          valor_pago: number
        }
        Insert: {
          created_at?: string
          external_reference?: string | null
          girinhas_recebidas: number
          id?: string
          pacote_id?: string | null
          payment_id?: string | null
          payment_method?: string | null
          status?: string
          updated_at?: string
          user_id: string
          valor_pago: number
        }
        Update: {
          created_at?: string
          external_reference?: string | null
          girinhas_recebidas?: number
          id?: string
          pacote_id?: string | null
          payment_id?: string | null
          payment_method?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          valor_pago?: number
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
      conversas_whatsapp_log: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          reserva_id: string
          tipo_usuario: string
          usuario_iniciou: string
          usuario_recebeu: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          reserva_id: string
          tipo_usuario: string
          usuario_iniciou: string
          usuario_recebeu: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          reserva_id?: string
          tipo_usuario?: string
          usuario_iniciou?: string
          usuario_recebeu?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversas_whatsapp_log_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversas_whatsapp_log_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversas_whatsapp_log_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversas_whatsapp_log_usuario_iniciou_fkey"
            columns: ["usuario_iniciou"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversas_whatsapp_log_usuario_recebeu_fkey"
            columns: ["usuario_recebeu"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      debug_logs: {
        Row: {
          created_at: string | null
          error_details: Json | null
          id: string
          message: string
          operation: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_details?: Json | null
          id?: string
          message: string
          operation: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_details?: Json | null
          id?: string
          message?: string
          operation?: string
          user_id?: string | null
        }
        Relationships: []
      }
      error_log: {
        Row: {
          created_at: string | null
          error_details: Json | null
          error_message: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_details?: Json | null
          error_message: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_details?: Json | null
          error_message?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      escolas_inep: {
        Row: {
          categoria_administrativa: string | null
          categoria_escola_privada: string | null
          cep: string | null
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
          cep?: string | null
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
          cep?: string | null
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
      estados_conservacao: {
        Row: {
          ativo: boolean | null
          codigo: string
          descricao: string | null
          nome: string
          ordem: number | null
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          descricao?: string | null
          nome: string
          ordem?: number | null
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          descricao?: string | null
          nome?: string
          ordem?: number | null
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
          {
            foreignKeyName: "favoritos_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_completos"
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
            foreignKeyName: "fila_espera_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_completos"
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
      generos: {
        Row: {
          ativo: boolean | null
          codigo: string
          icone: string | null
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          icone?: string | null
          nome: string
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          icone?: string | null
          nome?: string
        }
        Relationships: []
      }
      indicacoes: {
        Row: {
          bonus_cadastro_pago: boolean | null
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
          created_at: string
          descricao: string
          estado_conservacao: string
          fotos: string[] | null
          genero: string | null
          id: string
          publicado_por: string
          status: string
          subcategoria: string | null
          tamanho_categoria: string | null
          tamanho_valor: string | null
          titulo: string
          updated_at: string
          valor_girinhas: number
        }
        Insert: {
          categoria: string
          created_at?: string
          descricao: string
          estado_conservacao: string
          fotos?: string[] | null
          genero?: string | null
          id?: string
          publicado_por: string
          status?: string
          subcategoria?: string | null
          tamanho_categoria?: string | null
          tamanho_valor?: string | null
          titulo: string
          updated_at?: string
          valor_girinhas: number
        }
        Update: {
          categoria?: string
          created_at?: string
          descricao?: string
          estado_conservacao?: string
          fotos?: string[] | null
          genero?: string | null
          id?: string
          publicado_por?: string
          status?: string
          subcategoria?: string | null
          tamanho_categoria?: string | null
          tamanho_valor?: string | null
          titulo?: string
          updated_at?: string
          valor_girinhas?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_itens_categoria"
            columns: ["categoria"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "fk_itens_estado_conservacao"
            columns: ["estado_conservacao"]
            isOneToOne: false
            referencedRelation: "estados_conservacao"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "fk_itens_genero"
            columns: ["genero"]
            isOneToOne: false
            referencedRelation: "generos"
            referencedColumns: ["codigo"]
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
      notification_logs: {
        Row: {
          canal: string
          created_at: string | null
          dados_envio: Json | null
          erro_mensagem: string | null
          id: string
          status: string
          template_tipo: string
          user_id: string | null
        }
        Insert: {
          canal: string
          created_at?: string | null
          dados_envio?: Json | null
          erro_mensagem?: string | null
          id?: string
          status: string
          template_tipo: string
          user_id?: string | null
        }
        Update: {
          canal?: string
          created_at?: string | null
          dados_envio?: Json | null
          erro_mensagem?: string | null
          id?: string
          status?: string
          template_tipo?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          ativo: boolean | null
          corpo: string
          created_at: string | null
          id: string
          tipo: string
          titulo: string
          updated_at: string | null
          variaveis: Json | null
        }
        Insert: {
          ativo?: boolean | null
          corpo: string
          created_at?: string | null
          id?: string
          tipo: string
          titulo: string
          updated_at?: string | null
          variaveis?: Json | null
        }
        Update: {
          ativo?: boolean | null
          corpo?: string
          created_at?: string | null
          id?: string
          tipo?: string
          titulo?: string
          updated_at?: string | null
          variaveis?: Json | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          sent_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          sent_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          sent_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      preserved_user_id: {
        Row: {
          id: string | null
        }
        Insert: {
          id?: string | null
        }
        Update: {
          id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          aceita_entrega_domicilio: boolean | null
          avatar_url: string | null
          bairro: string | null
          bio: string | null
          cadastro_status: string | null
          cadastro_step: string | null
          categorias_favoritas: string[] | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          created_at: string | null
          dados_segmentacao: Json | null
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          instagram: string | null
          interesses: string[] | null
          latitude: number | null
          longitude: number | null
          nome: string | null
          numero: string | null
          numero_whatsapp: string | null
          ponto_referencia: string | null
          ponto_retirada_preferido: string | null
          profissao: string | null
          raio_entrega_km: number | null
          reputacao: number | null
          saldo_girinhas: number | null
          sobrenome: string | null
          telefone: string | null
          telefone_verificado: boolean | null
          ultima_atividade: string | null
          ultimo_calculo_cotacao: string | null
          updated_at: string | null
          username: string
          verification_code: string | null
          verification_code_expires: string | null
        }
        Insert: {
          aceita_entrega_domicilio?: boolean | null
          avatar_url?: string | null
          bairro?: string | null
          bio?: string | null
          cadastro_status?: string | null
          cadastro_step?: string | null
          categorias_favoritas?: string[] | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string | null
          dados_segmentacao?: Json | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id: string
          instagram?: string | null
          interesses?: string[] | null
          latitude?: number | null
          longitude?: number | null
          nome?: string | null
          numero?: string | null
          numero_whatsapp?: string | null
          ponto_referencia?: string | null
          ponto_retirada_preferido?: string | null
          profissao?: string | null
          raio_entrega_km?: number | null
          reputacao?: number | null
          saldo_girinhas?: number | null
          sobrenome?: string | null
          telefone?: string | null
          telefone_verificado?: boolean | null
          ultima_atividade?: string | null
          ultimo_calculo_cotacao?: string | null
          updated_at?: string | null
          username: string
          verification_code?: string | null
          verification_code_expires?: string | null
        }
        Update: {
          aceita_entrega_domicilio?: boolean | null
          avatar_url?: string | null
          bairro?: string | null
          bio?: string | null
          cadastro_status?: string | null
          cadastro_step?: string | null
          categorias_favoritas?: string[] | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string | null
          dados_segmentacao?: Json | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          instagram?: string | null
          interesses?: string[] | null
          latitude?: number | null
          longitude?: number | null
          nome?: string | null
          numero?: string | null
          numero_whatsapp?: string | null
          ponto_referencia?: string | null
          ponto_retirada_preferido?: string | null
          profissao?: string | null
          raio_entrega_km?: number | null
          reputacao?: number | null
          saldo_girinhas?: number | null
          sobrenome?: string | null
          telefone?: string | null
          telefone_verificado?: boolean | null
          ultima_atividade?: string | null
          ultimo_calculo_cotacao?: string | null
          updated_at?: string | null
          username?: string
          verification_code?: string | null
          verification_code_expires?: string | null
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
          codigo_confirmacao: string | null
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
          valor_taxa: number
          valor_total: number
        }
        Insert: {
          codigo_confirmacao?: string | null
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
          valor_taxa?: number
          valor_total?: number
        }
        Update: {
          codigo_confirmacao?: string | null
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
          valor_taxa?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "reservas_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_completos"
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
      subcategorias: {
        Row: {
          ativo: boolean | null
          categoria_pai: string
          created_at: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
        }
        Insert: {
          ativo?: boolean | null
          categoria_pai: string
          created_at?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
        }
        Update: {
          ativo?: boolean | null
          categoria_pai?: string
          created_at?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_subcategorias_categoria"
            columns: ["categoria_pai"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["codigo"]
          },
        ]
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
      transacao_config: {
        Row: {
          ativo: boolean | null
          categoria: string
          config: Json | null
          cor_hex: string | null
          created_at: string | null
          descricao_pt: string
          icone: string | null
          ordem_exibicao: number | null
          prorrogavel: boolean
          sinal: number
          tipo: Database["public"]["Enums"]["tipo_transacao_enum"]
          updated_at: string | null
          validade_dias: number | null
          valor_padrao: number | null
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          config?: Json | null
          cor_hex?: string | null
          created_at?: string | null
          descricao_pt: string
          icone?: string | null
          ordem_exibicao?: number | null
          prorrogavel?: boolean
          sinal: number
          tipo: Database["public"]["Enums"]["tipo_transacao_enum"]
          updated_at?: string | null
          validade_dias?: number | null
          valor_padrao?: number | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          config?: Json | null
          cor_hex?: string | null
          created_at?: string | null
          descricao_pt?: string
          icone?: string | null
          ordem_exibicao?: number | null
          prorrogavel?: boolean
          sinal?: number
          tipo?: Database["public"]["Enums"]["tipo_transacao_enum"]
          updated_at?: string | null
          validade_dias?: number | null
          valor_padrao?: number | null
        }
        Relationships: []
      }
      transacoes: {
        Row: {
          cotacao_utilizada: number | null
          created_at: string
          data_expiracao: string | null
          descricao: string
          id: string
          item_id: string | null
          metadados: Json | null
          quantidade_girinhas: number | null
          reserva_id: string | null
          tipo: Database["public"]["Enums"]["tipo_transacao_enum"]
          transferencia_id: string | null
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
          metadados?: Json | null
          quantidade_girinhas?: number | null
          reserva_id?: string | null
          tipo: Database["public"]["Enums"]["tipo_transacao_enum"]
          transferencia_id?: string | null
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
          metadados?: Json | null
          quantidade_girinhas?: number | null
          reserva_id?: string | null
          tipo?: Database["public"]["Enums"]["tipo_transacao_enum"]
          transferencia_id?: string | null
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
          {
            foreignKeyName: "transacoes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_transferencia_id_fkey"
            columns: ["transferencia_id"]
            isOneToOne: false
            referencedRelation: "transferencias_girinhas"
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
      user_addresses: {
        Row: {
          apelido: string
          bairro: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          created_at: string
          endereco: string | null
          estado: string | null
          id: string
          ponto_referencia: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          apelido: string
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string
          endereco?: string | null
          estado?: string | null
          id?: string
          ponto_referencia?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          apelido?: string
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string
          endereco?: string | null
          estado?: string | null
          id?: string
          ponto_referencia?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_preferences: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          girinhas: boolean | null
          id: string
          mensagens: boolean | null
          push_enabled: boolean | null
          push_subscription: Json | null
          reservas: boolean | null
          sistema: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          girinhas?: boolean | null
          id?: string
          mensagens?: boolean | null
          push_enabled?: boolean | null
          push_subscription?: Json | null
          reservas?: boolean | null
          sistema?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          girinhas?: boolean | null
          id?: string
          mensagens?: boolean | null
          push_enabled?: boolean | null
          push_subscription?: Json | null
          reservas?: boolean | null
          sistema?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      v_reserva: {
        Row: {
          codigo_confirmacao: string | null
          created_at: string | null
          data_reserva: string | null
          id: string | null
          item_id: string | null
          localizacao_combinada: string | null
          prazo_expiracao: string | null
          status: string | null
          updated_at: string | null
          usuario_item: string | null
          usuario_reservou: string | null
          valor_girinhas: number | null
          valor_taxa: number | null
          valor_total: number | null
        }
        Insert: {
          codigo_confirmacao?: string | null
          created_at?: string | null
          data_reserva?: string | null
          id?: string | null
          item_id?: string | null
          localizacao_combinada?: string | null
          prazo_expiracao?: string | null
          status?: string | null
          updated_at?: string | null
          usuario_item?: string | null
          usuario_reservou?: string | null
          valor_girinhas?: number | null
          valor_taxa?: number | null
          valor_total?: number | null
        }
        Update: {
          codigo_confirmacao?: string | null
          created_at?: string | null
          data_reserva?: string | null
          id?: string | null
          item_id?: string | null
          localizacao_combinada?: string | null
          prazo_expiracao?: string | null
          status?: string | null
          updated_at?: string | null
          usuario_item?: string | null
          usuario_reservou?: string | null
          valor_girinhas?: number | null
          valor_taxa?: number | null
          valor_total?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      itens_completos: {
        Row: {
          aceita_entrega_domicilio: boolean | null
          categoria: string | null
          created_at: string | null
          descricao: string | null
          estado_conservacao: string | null
          fotos: string[] | null
          genero: string | null
          id: string | null
          ponto_retirada_preferido: string | null
          publicado_por: string | null
          status: string | null
          subcategoria: string | null
          tamanho_categoria: string | null
          tamanho_valor: string | null
          titulo: string | null
          updated_at: string | null
          valor_girinhas: number | null
          vendedor_avatar: string | null
          vendedor_bairro: string | null
          vendedor_cep: string | null
          vendedor_cidade: string | null
          vendedor_endereco: string | null
          vendedor_estado: string | null
          vendedor_nome: string | null
          vendedor_raio_entrega: number | null
          vendedor_reputacao: number | null
          vendedor_telefone: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_itens_categoria"
            columns: ["categoria"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "fk_itens_estado_conservacao"
            columns: ["estado_conservacao"]
            isOneToOne: false
            referencedRelation: "estados_conservacao"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "fk_itens_genero"
            columns: ["genero"]
            isOneToOne: false
            referencedRelation: "generos"
            referencedColumns: ["codigo"]
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
      saldo_detalhado_v2: {
        Row: {
          categoria: string | null
          cor_hex: string | null
          data_expiracao: string | null
          descricao_pt: string | null
          icone: string | null
          status_validade: string | null
          tipo: Database["public"]["Enums"]["tipo_transacao_enum"] | null
          user_id: string | null
          valor_liquido: number | null
        }
        Relationships: []
      }
      tipos_credito: {
        Row: {
          cor_hex: string | null
          descricao_pt: string | null
          icone: string | null
          tipo: Database["public"]["Enums"]["tipo_transacao_enum"] | null
          validade_dias: number | null
          valor_padrao: number | null
        }
        Insert: {
          cor_hex?: string | null
          descricao_pt?: string | null
          icone?: string | null
          tipo?: Database["public"]["Enums"]["tipo_transacao_enum"] | null
          validade_dias?: number | null
          valor_padrao?: number | null
        }
        Update: {
          cor_hex?: string | null
          descricao_pt?: string | null
          icone?: string | null
          tipo?: Database["public"]["Enums"]["tipo_transacao_enum"] | null
          validade_dias?: number | null
          valor_padrao?: number | null
        }
        Relationships: []
      }
      tipos_debito: {
        Row: {
          cor_hex: string | null
          descricao_pt: string | null
          icone: string | null
          tipo: Database["public"]["Enums"]["tipo_transacao_enum"] | null
        }
        Insert: {
          cor_hex?: string | null
          descricao_pt?: string | null
          icone?: string | null
          tipo?: Database["public"]["Enums"]["tipo_transacao_enum"] | null
        }
        Update: {
          cor_hex?: string | null
          descricao_pt?: string | null
          icone?: string | null
          tipo?: Database["public"]["Enums"]["tipo_transacao_enum"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      atualizar_reputacao: {
        Args: { p_usuario_id: string; p_nova_nota: number }
        Returns: undefined
      }
      buscar_escolas_proximas_por_cep: {
        Args: { cep_usuario: string; limite?: number }
        Returns: {
          codigo_inep: number
          escola: string
          endereco: string
          cep: string
          municipio: string
          uf: string
          latitude: string
          longitude: string
          distancia_cep: number
        }[]
      }
      buscar_itens_mesma_escola: {
        Args: { p_user_id: string }
        Returns: {
          item_id: string
        }[]
      }
      buscar_itens_mesmo_bairro: {
        Args: { p_user_id: string }
        Returns: {
          item_id: string
        }[]
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
      bypass_rls_for_user_creation: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calcular_custo_extensao: {
        Args: { p_valor_expirando: number }
        Returns: number
      }
      calcular_distancia_ceps: {
        Args: { cep1: string; cep2: string }
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
      carregar_dados_feed_paginado: {
        Args: {
          p_user_id: string
          p_page?: number
          p_limit?: number
          p_busca?: string
          p_cidade?: string
          p_categoria?: string
          p_subcategoria?: string
          p_genero?: string
          p_tamanho?: string
          p_preco_min?: number
          p_preco_max?: number
          p_mostrar_reservados?: boolean
          p_item_id?: string
          p_modalidade_logistica?: string
        }
        Returns: Json
      }
      check_database_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          rls_enabled: boolean
          policy_count: number
          insert_policy_exists: boolean
        }[]
      }
      clear_cadastro_temp_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      coletar_recompensa_missao: {
        Args: { p_user_id: string; p_missao_id: string }
        Returns: Json
      }
      create_notification: {
        Args: {
          p_user_id: string
          p_type: string
          p_title: string
          p_message: string
          p_data?: Json
        }
        Returns: string
      }
      create_user_goals: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      create_user_profile: {
        Args: {
          p_user_id: string
          p_email: string
          p_nome: string
          p_avatar_url: string
          p_username: string
        }
        Returns: undefined
      }
      criar_transacao_validada: {
        Args: {
          p_user_id: string
          p_tipo: Database["public"]["Enums"]["tipo_transacao_enum"]
          p_valor: number
          p_descricao: string
          p_metadados?: Json
        }
        Returns: string
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
        Args: { p_item_id: string; p_usuario_id: string }
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
      extrair_cep_endereco: {
        Args: { endereco_text: string }
        Returns: string
      }
      finalizar_troca_com_codigo: {
        Args: { p_reserva_id: string; p_codigo_confirmacao: string }
        Returns: boolean
      }
      geocoding_queue_delete: {
        Args: { msg_ids: number[] }
        Returns: undefined
      }
      get_cadastro_temp_data: {
        Args: { p_step: string }
        Returns: Json
      }
      get_municipios_por_uf: {
        Args: { uf_param: string }
        Returns: string[]
      }
      get_step_data: {
        Args: { p_step: string }
        Returns: Json
      }
      get_user_form_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      inicializar_limites_missoes: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      inicializar_metas_usuario: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      is_trigger_context: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_debug: {
        Args: {
          p_user_id: string
          p_operation: string
          p_message: string
          p_error_details?: Json
        }
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
      obter_preco_manual: {
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
      processar_bonus_diario: {
        Args:
          | { p_user_id: string }
          | { p_user_id: string; p_valor_girinhas: number }
        Returns: boolean
      }
      processar_bonus_indicacao: {
        Args: { p_indicado_id: string; p_tipo_bonus: string }
        Returns: undefined
      }
      processar_bonus_indicado: {
        Args: { p_indicado_id: string }
        Returns: undefined
      }
      processar_compra_girinhas: {
        Args: { p_user_id: string; p_pacote_id: string; p_payment_id: string }
        Returns: string
      }
      processar_compra_girinhas_v2: {
        Args: { p_dados: Json }
        Returns: Json
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
      processar_compra_webhook_segura: {
        Args: {
          p_user_id: string
          p_quantidade: number
          p_payment_id: string
          p_external_reference: string
          p_payment_method?: string
          p_payment_status?: string
        }
        Returns: Json
      }
      processar_confirmacao_entrega_v2: {
        Args: { p_dados: Json }
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
        Args:
          | {
              p_item_id: string
              p_usuario_reservou: string
              p_valor: number
              p_permitir_reservado?: boolean
            }
          | {
              p_item_id: string
              p_usuario_reservou: string
              p_valor_girinhas: number
              p_valor_taxa: number
              p_valor_total: number
              p_permitir_reservado?: boolean
            }
        Returns: string
      }
      processar_reserva_da_fila: {
        Args: {
          p_item_id: string
          p_usuario_reservou: string
          p_valor_girinhas: number
          p_valor_taxa: number
          p_valor_total: number
        }
        Returns: string
      }
      processar_reserva_item_v2: {
        Args: { p_dados: Json }
        Returns: Json
      }
      processar_taxa_transacao: {
        Args: { p_reserva_id: string }
        Returns: undefined
      }
      processar_transacao_atomica: {
        Args: { p_operacao: string; p_dados: Json }
        Returns: Json
      }
      processar_transferencia_p2p_v2: {
        Args: { p_dados: Json }
        Returns: Json
      }
      queimar_girinhas: {
        Args: { p_user_id: string; p_quantidade: number; p_motivo: string }
        Returns: boolean
      }
      re_enable_rls: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
      registrar_conversa_whatsapp: {
        Args:
          | { p_reserva_id: string; p_tipo_usuario: string }
          | { p_reserva_id: string; p_usuario_recebeu: string }
        Returns: undefined
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
      save_cadastro_temp_data: {
        Args: { p_step: string; p_form_data: Json }
        Returns: undefined
      }
      save_step_data: {
        Args: { p_step: string; p_data: Json }
        Returns: undefined
      }
      save_user_phone: {
        Args: { p_telefone: string }
        Returns: boolean
      }
      save_verification_code: {
        Args: { p_telefone: string; p_code: string }
        Returns: boolean
      }
      send_admin_notification: {
        Args: {
          p_title: string
          p_message: string
          p_target_type?: string
          p_target_users?: string[]
          p_action_url?: string
          p_action_text?: string
          p_sent_by?: string
        }
        Returns: number
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
      verificar_admin: {
        Args: Record<PropertyKey, never>
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
      verify_phone_code: {
        Args: { p_code: string } | { p_code: string }
        Returns: boolean
      }
    }
    Enums: {
      tipo_transacao_enum:
        | "compra"
        | "bonus_cadastro"
        | "bonus_indicacao_cadastro"
        | "bonus_indicacao_primeiro_item"
        | "bonus_indicacao_primeira_compra"
        | "bonus_troca_concluida"
        | "bonus_avaliacao"
        | "bonus_diario"
        | "bonus_meta_bronze"
        | "bonus_meta_prata"
        | "bonus_meta_ouro"
        | "bonus_meta_diamante"
        | "missao"
        | "recebido_item"
        | "transferencia_p2p_entrada"
        | "reembolso"
        | "bloqueio_reserva"
        | "transferencia_p2p_saida"
        | "taxa_transferencia"
        | "taxa_extensao_validade"
        | "taxa_marketplace"
        | "queima_expiracao"
        | "queima_administrativa"
        | "bonus_promocional"
        | "bonus_indicacao_cadastro_indicado"
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
    Enums: {
      tipo_transacao_enum: [
        "compra",
        "bonus_cadastro",
        "bonus_indicacao_cadastro",
        "bonus_indicacao_primeiro_item",
        "bonus_indicacao_primeira_compra",
        "bonus_troca_concluida",
        "bonus_avaliacao",
        "bonus_diario",
        "bonus_meta_bronze",
        "bonus_meta_prata",
        "bonus_meta_ouro",
        "bonus_meta_diamante",
        "missao",
        "recebido_item",
        "transferencia_p2p_entrada",
        "reembolso",
        "bloqueio_reserva",
        "transferencia_p2p_saida",
        "taxa_transferencia",
        "taxa_extensao_validade",
        "taxa_marketplace",
        "queima_expiracao",
        "queima_administrativa",
        "bonus_promocional",
        "bonus_indicacao_cadastro_indicado",
      ],
    },
  },
} as const
