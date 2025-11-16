import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getIndicacoesDoUsuario } from "@/services/indicacoesService";
import { Loader2 } from "lucide-react";

interface Indicacao {
  id: string;
  nome: string;
  data_indicacao: string;
  bonus_cadastro_pago: boolean;
  bonus_primeiro_item_pago: boolean;
  bonus_primeira_compra_pago: boolean;
}

const PaginaIndicacoes = () => {
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      const lista = await getIndicacoesDoUsuario();
      setIndicacoes(lista);
      setLoading(false);
    };

    carregar();
  }, []);

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-10">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-green-600 text-lg">📈</span>
        Minhas Indicações ({indicacoes.length})
      </h2>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin w-6 h-6 text-purple-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {indicacoes.map((indicacao) => (
            <div
              key={indicacao.id}
              className="bg-white rounded-xl shadow-sm border p-4 flex gap-4"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700 uppercase">
                {indicacao.nome?.charAt(0)}
              </div>

              {/* Conteúdo */}
              <div className="flex-1">
                <div className="font-semibold text-gray-800">
                  {indicacao.nome}
                </div>

                <div className="text-sm text-gray-500 mb-2">
                  Indicado em {indicacao.data_indicacao}
                </div>

                {/* BADGES AJUSTADOS */}
                <div
                  className={`flex gap-2 
                    ${
                      indicacao.bonus_cadastro_pago &&
                      indicacao.bonus_primeiro_item_pago
                        ? "flex-col md:flex-row md:items-center"
                        : "flex-row items-center"
                    }`}
                >
                  {indicacao.bonus_cadastro_pago && (
                    <Badge className="bg-red-500 text-white">
                      Cadastro ✓
                    </Badge>
                  )}

                  {indicacao.bonus_primeiro_item_pago && (
                    <Badge className="bg-green-600 text-white">
                      1º Item ✓
                    </Badge>
                  )}

                  {indicacao.bonus_primeira_compra_pago && (
                    <Badge variant="outline" className="border-purple-500 text-purple-600">
                      1ª Compra ✓
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaginaIndicacoes;
