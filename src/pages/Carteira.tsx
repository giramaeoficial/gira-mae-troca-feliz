
import { Link } from "react-router-dom";
import Header from "@/components/shared/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, TrendingUp, TrendingDown, Gift, History, Plus, Minus } from "lucide-react";

const Carteira = () => {
    const transacoes = [
        { id: 1, tipo: "recebido", valor: 22, descricao: "Venda: Kit Bodies Carter's", data: "há 2 horas", usuario: "Fernanda S." },
        { id: 2, tipo: "gasto", valor: 18, descricao: "Compra: Macacão Tip Top", data: "há 1 dia", usuario: "Carla M." },
        { id: 3, tipo: "recebido", valor: 15, descricao: "Venda: Sapatilha Rosa", data: "há 3 dias", usuario: "Juliana L." },
        { id: 4, tipo: "bonus", valor: 50, descricao: "Bônus de boas-vindas", data: "há 1 semana", usuario: "Sistema" },
        { id: 5, tipo: "gasto", valor: 30, descricao: "Compra: Lote de brinquedos", data: "há 1 semana", usuario: "Patricia R." },
        { id: 6, tipo: "recebido", valor: 25, descricao: "Venda: Vestido de festa", data: "há 2 semanas", usuario: "Ana C." },
    ];

    const saldoAtual = 84;
    const totalRecebido = 112;
    const totalGasto = 48;
    const ganhoEsteMes = 37;

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
                    <Card className="bg-gradient-to-br from-primary to-pink-500 text-white border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-primary-foreground/80 text-sm">Saldo Atual</p>
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-6 h-6" />
                                        <span className="text-2xl font-bold">{saldoAtual}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm">Total Recebido</p>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-6 h-6" />
                                        <span className="text-2xl font-bold">{totalRecebido}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">Total Gasto</p>
                                    <div className="flex items-center gap-2">
                                        <TrendingDown className="w-6 h-6" />
                                        <span className="text-2xl font-bold">{totalGasto}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm">Ganho Este Mês</p>
                                    <div className="flex items-center gap-2">
                                        <Gift className="w-6 h-6" />
                                        <span className="text-2xl font-bold">+{ganhoEsteMes}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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
                                    {transacoes.map((transacao) => (
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
                                                    <p className="text-sm text-gray-600">{transacao.usuario} • {transacao.data}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold text-lg ${
                                                    transacao.tipo === 'recebido' || transacao.tipo === 'bonus' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {transacao.tipo === 'recebido' || transacao.tipo === 'bonus' ? '+' : '-'}{transacao.valor}
                                                </p>
                                                <p className="text-sm text-gray-500">Girinhas</p>
                                            </div>
                                        </div>
                                    ))}
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
                                        <span className="font-bold text-green-600">+37</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                        <span className="text-red-700">Girinhas Gastas</span>
                                        <span className="font-bold text-red-600">-18</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                                        <span className="text-primary">Saldo Líquido</span>
                                        <span className="font-bold text-primary">+19</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle>Categorias Mais Vendidas</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span>Roupas</span>
                                        <Badge variant="secondary">65%</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Calçados</span>
                                        <Badge variant="secondary">20%</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Brinquedos</span>
                                        <Badge variant="secondary">15%</Badge>
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
