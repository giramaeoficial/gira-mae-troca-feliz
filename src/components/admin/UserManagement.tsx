import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX, TrendingUp, Search } from "lucide-react";
import { useGerenciamentoUsuarios } from "@/hooks/useGerenciamentoUsuarios";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  color: string;
  loading?: boolean;
  percentage?: number;
}

const MetricCard = ({ title, value, icon, description, color, loading, percentage }: MetricCardProps) => (
  <Card className={`hover:shadow-md transition-shadow border-l-4 ${color}`}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            {title}
          </p>
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <h3 className="text-3xl font-bold">{value}</h3>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          {percentage !== undefined && (
            <>
              <div className="mt-4 w-full bg-muted rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${color.replace('border-', 'bg-')}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{percentage.toFixed(1)}% da base total</p>
            </>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('border-', 'bg-').replace('-500', '-50')}`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [sortBy, setSortBy] = useState("data_cadastro");

  const {
    usuarios,
    estatisticas,
    loading,
    fetchUsuarios,
    getStatusBadgeConfig,
  } = useGerenciamentoUsuarios();

  // Processar dados para os gráficos
  const chartData = useMemo(() => {
    if (!usuarios.length) return { timeline: [], daily: [] };

    // Agrupar por data
    const groupedByDate = usuarios.reduce((acc, user) => {
      const date = new Date(user.data_cadastro).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
      
      if (!acc[date]) {
        acc[date] = { date, total: 0, ativos: 0, inativos: 0 };
      }
      
      acc[date].total++;
      if (user.status === 'active') {
        acc[date].ativos++;
      } else {
        acc[date].inativos++;
      }
      
      return acc;
    }, {} as Record<string, { date: string; total: number; ativos: number; inativos: number }>);

    // Converter para array e ordenar
    const dailyData = Object.values(groupedByDate).sort((a, b) => {
      const [dayA, monthA] = a.date.split('/');
      const [dayB, monthB] = b.date.split('/');
      return new Date(2025, parseInt(monthA) - 1, parseInt(dayA)).getTime() - 
             new Date(2025, parseInt(monthB) - 1, parseInt(dayB)).getTime();
    });

    // Calcular acumulados
    let runningAtivos = 0;
    let runningInativos = 0;
    const timelineData = dailyData.map(day => {
      runningAtivos += day.ativos;
      runningInativos += day.inativos;
      return {
        date: day.date,
        'Ativos (Acumulado)': runningAtivos,
        'Inativos (Acumulado)': runningInativos
      };
    });

    return { timeline: timelineData, daily: dailyData };
  }, [usuarios]);

  // Filtrar usuários
  const filteredUsers = useMemo(() => {
    let filtered = [...usuarios];

    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'todos') {
      filtered = filtered.filter(u => u.status === statusFilter);
    }

    return filtered;
  }, [usuarios, searchTerm, statusFilter]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const total = usuarios.length;
    const ativos = usuarios.filter(u => u.status === 'active').length;
    const inativos = total - ativos;
    const ativacaoRate = total > 0 ? (ativos / total) * 100 : 0;

    return { total, ativos, inativos, ativacaoRate };
  }, [usuarios]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    fetchUsuarios(searchTerm, value, sortBy);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    fetchUsuarios(searchTerm, statusFilter, value);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard de Usuários</h1>
          <p className="text-sm text-muted-foreground">
            Dados atualizados em tempo real
          </p>
        </div>
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          Dados Reais
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Cadastros"
          value={stats.total}
          icon={<Users className="h-6 w-6 text-indigo-600" />}
          color="border-indigo-500"
          loading={loading}
        />
        <MetricCard
          title="Usuários Ativos"
          value={stats.ativos}
          icon={<UserCheck className="h-6 w-6 text-emerald-600" />}
          color="border-emerald-500"
          percentage={(stats.ativos / stats.total) * 100}
          loading={loading}
        />
        <MetricCard
          title="Usuários Inativos"
          value={stats.inativos}
          icon={<UserX className="h-6 w-6 text-rose-600" />}
          color="border-rose-500"
          percentage={(stats.inativos / stats.total) * 100}
          loading={loading}
        />
        <MetricCard
          title="Taxa de Ativação"
          value={`${stats.ativacaoRate.toFixed(1)}%`}
          icon={<TrendingUp className="h-6 w-6 text-amber-600" />}
          color="border-amber-500"
          description="Média Global"
          loading={loading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-bold mb-4">Evolução Acumulada (Ativos vs Inativos)</h3>
          <div className="h-72 w-full">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    stroke="#64748b"
                  />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Inativos (Acumulado)" 
                    stroke="#f43f5e" 
                    strokeWidth={3}
                    dot={{ fill: '#fff', strokeWidth: 2, r: 4 }}
                    fill="#f43f5e"
                    fillOpacity={0.1}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Ativos (Acumulado)" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#fff', strokeWidth: 2, r: 4 }}
                    fill="#10b981"
                    fillOpacity={0.1}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Bar Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Cadastros por Dia</h3>
          <div className="h-72 w-full">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }}
                    stroke="#64748b"
                  />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="#6366f1" 
                    radius={[4, 4, 0, 0]}
                    name="Cadastros no Dia"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="flex flex-col h-[600px]">
        <div className="px-6 py-4 border-b bg-muted/50 flex justify-between items-center flex-shrink-0">
          <h3 className="font-bold">Tabela Completa de Usuários</h3>
          <Badge variant="secondary">
            {filteredUsers.length} registros
          </Badge>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b flex flex-col sm:flex-row gap-4 flex-shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou username..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
              <SelectItem value="warned">Advertidos</SelectItem>
              <SelectItem value="suspenso">Suspensos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="data_cadastro">Data de Cadastro</SelectItem>
              <SelectItem value="nome">Nome</SelectItem>
              <SelectItem value="ultima_atividade">Última Atividade</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table Content */}
        <div className="overflow-auto flex-grow">
          {loading ? (
            <div className="p-8 space-y-4">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase bg-muted/50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Usuário</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">Data Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const statusConfig = getStatusBadgeConfig(user.status);
                  const names = user.nome?.split(" ") || ["U"];
                  const initials = (names[0][0] + (names.length > 1 ? names[names.length - 1][0] : "")).toUpperCase();

                  return (
                    <tr key={user.user_id} className="border-b hover:bg-muted/50 transition">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {initials}
                          </div>
                          <span className="font-medium truncate max-w-[200px]">{user.nome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <Badge className={statusConfig.className}>
                          {statusConfig.text}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {formatDistanceToNow(new Date(user.data_cadastro), { 
                          addSuffix: true,
                          locale: ptBR 
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default UserManagement;
