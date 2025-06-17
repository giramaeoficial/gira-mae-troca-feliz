
import { Link } from "react-router-dom";
import Header from "@/components/shared/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, TrendingUp, TrendingDown, Gift, History, Plus, Minus } from "lucide-react";
import { useCarteira } from "@/hooks/useCarteira";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import UniversalCard from "@/components/ui/universal-card";

const Carteira = () => {
    const { user } = useAuth();
    const { carteira, transacoes, loading, error, saldo, totalRecebido, totalGasto } = useCarteira();

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <Card className="max-w-md mx-auto text-center">
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
                            <p className="text-gray-600 mb-6">Você precisa estar logado para acessar sua carteira.</p>
                            <Button asChild>
                                <Link to="/auth">Fazer Login</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600">Carregando sua carteira...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <Card className="max-w-md mx-auto text-center">
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-bold mb-4">Erro ao Carregar</h2>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <Button onClick={() => window.location.reload()}>
                                Tentar Novamente
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    // Calcular ganho do mês (últimos 30 dias)
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 30);
    
    const ganhoEsteMes = transacoes
        .filter(t => 
            (t.tipo === 'recebido' || t.tipo === 'bonus') && 
            new Date(t.created_at) >= dataLimite
        )
        .reduce((total, t) => total + Number(t.valor), 0);

    const formatarTempo = (data: string) => {
        try {
            const agora = new Date();
            const dataTransacao = new Date(data);
            const diferencaMs = agora.getTime() - dataTransacao.getTime();
            const diferencaHoras = Math.floor(diferencaMs / (1000 * 60 * 60));
            const diferencaDias = Math.floor(diferencaHoras / 24);

            if (diferencaHoras < 1) return 'há poucos minutos';
            if (diferencaHoras < 24) return `há ${diferencaHoras}h`;
            if (diferencaDias === 1) return 'há 1 dia';
            if (diferencaDias < 7) return `há ${diferencaDias} dias`;
            if (diferencaDias < 14) return 'há 1 semana';
            return format(dataTransacao, "dd/MM/yyyy", { locale: ptBR });
        } catch {
            return 'Data inválida';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24 md:pb-8">
            <Header />
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header da Carteira */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Minha Carteira</h1>
                    <p className="text-gray-600">Gerencie suas Girinhas e acompanhe suas transações</p>
                </div>

                {/* Cards de Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <UniversalCard
                        variant="stats"
                        data={{
                            icon: Sparkles,
                            title: "Saldo Atual",
                            value: Number(saldo).toFixed(0),
                            gradient: "bg-gradient-to-br from-primary to-pink-500"
                        }}
                    />

                    <UniversalCard
                        variant="stats"
                        data={{
                            icon: TrendingUp,
                            title: "Total Recebido",
                            value: Number(totalRecebido).toFixed(0),
                            gradient: "bg-gradient-to-br from-green-500 to-green-600"
                        }}
                    />

                    <UniversalCard
                        variant="stats"
                        data={{
                            icon: TrendingDown,
                            title: "Total Gasto",
                            value: Number(totalGasto).toFixed(0),
                            gradient: "bg-gradient-to-br from-blue-500 to-blue-600"
                        }}
                    />

                    <UniversalCard
                        variant="stats"
                        data={{
                            icon: Gift,
                            title: "Ganho Este Mês",
                            value: `+${ganhoEsteMes.toFixed(0)}`,
                            gradient: "bg-gradient-to-br from-purple-500 to-purple-600"
                        }}
                    />
                </div>

                {/* Conteúdo Principal */}
                <Tabs defaultValue="historico" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-white/60 backdrop-blur-sm">
                        <TabsTrigger value="historico" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                            <History className="w-4 h-4 mr-2" />
                            Histórico
                        </TabsTrigger>
                        <TabsTrigger value="estatisticas" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Estatísticas
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="historico" className="mt-6">
                        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="w-5 h-5 text-primary" />
                                    Histórico de Transações
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {transacoes.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-gray-600">Nenhuma transação encontrada</p>
                                        </div>
                                    ) : (
                                        transacoes.map((transacao) => (
                                            <div key={transacao.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                        transacao.tipo === 'recebido' ? 'bg-green-100 text-green-600' :
                                                        transacao.tipo === 'gasto' ? 'bg-red-100 text-red-600' :
                                                        'bg-purple-100 text-purple-600'
                                                    }`}>
                                                        {transacao.tipo === 'recebido' ? <Plus className="w-5 h-5" /> :
                                                         transacao.tipo === 'gasto' ? <Minus className="w-5 h-5" /> :
                                                         <Gift className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800">{transacao.descricao}</p>
                                                        <p className="text-sm text-gray-600">
                                                            {transacao.usuario_origem && `${transacao.usuario_origem} • `}
                                                            {formatarTempo(transacao.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-bold text-lg ${
                                                        transacao.tipo === 'recebido' || transacao.tipo === 'bonus' ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {transacao.tipo === 'recebido' || transacao.tipo === 'bonus' ? '+' : '-'}{Number(transacao.valor).toFixed(0)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">Girinhas</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="estatisticas" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle>Resumo Mensal</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <span className="text-green-700">Girinhas Recebidas</span>
                                        <span className="font-bold text-green-600">+{ganhoEsteMes.toFixed(0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                        <span className="text-red-700">Girinhas Gastas</span>
                                        <span className="font-bold text-red-600">-{Number(totalGasto).toFixed(0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                                        <span className="text-primary">Saldo Líquido</span>
                                        <span className="font-bold text-primary">+{(ganhoEsteMes - Number(totalGasto)).toFixed(0)}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle>Atividade</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span>Total de Transações</span>
                                        <Badge variant="secondary">{transacoes.length}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Transações de Recebimento</span>
                                        <Badge variant="secondary">{transacoes.filter(t => t.tipo === 'recebido').length}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Bônus Recebidos</span>
                                        <Badge variant="secondary">{transacoes.filter(t => t.tipo === 'bonus').length}</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Ações Rápidas */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-pink-500" asChild>
                        <Link to="/publicar-item">
                            <Plus className="w-5 h-5 mr-2" />
                            Publicar Novo Item
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link to="/feed">
                            <Sparkles className="w-5 h-5 mr-2" />
                            Buscar Itens
                        </Link>
                    </Button>
                </div>
            </main>
        </div>
    );
};

export default Carteira;
