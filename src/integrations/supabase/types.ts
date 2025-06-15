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
      conversas: {
        Row: {
          created_at: string
          id: string
          reserva_id: string
          updated_at: string
          usuario1_id: string
          usuario2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reserva_id: string
          updated_at?: string
          usuario1_id: string
          usuario2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reserva_id?: string
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
            foreignKeyName: "filhos_mae_id_fkey"
            columns: ["mae_id"]
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
          created_at?: string
          descricao: string
          estado_conservacao: string
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
          created_at?: string
          descricao?: string
          estado_conservacao?: string
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
            foreignKeyName: "itens_publicado_por_fkey"
            columns: ["publicado_por"]
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
          updated_at: string | null
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
          updated_at?: string | null
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
          updated_at?: string | null
        }
        Relationships: []
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
          created_at: string
          descricao: string
          id: string
          item_id: string | null
          tipo: string
          user_id: string
          usuario_origem: string | null
          valor: number
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          item_id?: string | null
          tipo: string
          user_id: string
          usuario_origem?: string | null
          valor: number
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          item_id?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      atualizar_reputacao: {
        Args: { p_usuario_id: string; p_nova_nota: number }
        Returns: undefined
      }
      cancelar_reserva: {
        Args: { p_reserva_id: string; p_usuario_id: string }
        Returns: boolean
      }
      confirmar_entrega: {
        Args: { p_reserva_id: string; p_usuario_id: string }
        Returns: boolean
      }
      entrar_fila_espera: {
        Args: {
          p_item_id: string
          p_usuario_id: string
          p_valor_girinhas: number
        }
        Returns: Json
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
      processar_proximo_fila: {
        Args: { p_item_id: string }
        Returns: undefined
      }
      processar_reserva: {
        Args: { p_item_id: string; p_usuario_reservou: string; p_valor: number }
        Returns: string
      }
      sair_fila_espera: {
        Args: { p_item_id: string; p_usuario_id: string }
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
