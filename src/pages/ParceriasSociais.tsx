import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, ChevronRight, Users, GraduationCap, Heart, FileText } from 'lucide-react';
import { useParceriasSociais, Organizacao, Programa } from '@/hooks/parcerias/useParceriasSociais';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import SEOHead from '@/components/seo/SEOHead';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Users': return Users;
    case 'GraduationCap': return GraduationCap;
    case 'Heart': return Heart;
    default: return FileText;
  }
};

export default function ParceriasSociais() {
  const { organizacoes, loading, error } = useParceriasSociais();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Parcerias Sociais | GiraMãe"
        description="Comprove sua participação em programas sociais e receba benefícios em Girinhas"
        keywords="parcerias sociais, programas sociais, cadastro único, benefícios, girinhas"
      />
      <Header />
      
      <main className="min-h-screen pt-16">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Parcerias Sociais</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprove sua participação em programas sociais e receba benefícios em Girinhas
          </p>
        </div>

        {/* Lista de Organizações */}
        <div className="space-y-6">
          {organizacoes.map((org) => (
            <Card key={org.id} className="shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-4">
                  {org.logo_url && (
                    <img src={org.logo_url} alt={org.nome} className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <div>
                    <CardTitle className="text-xl">{org.nome}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {org.tipo} • {org.cidade}, {org.estado}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {org.programas.map((programa) => (
                    <ProgramaCard key={programa.id} programa={programa} organizacao={org} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/50 dark:to-green-950/50 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Não encontrou sua organização?</h3>
            <p className="text-muted-foreground mb-4">
              Entre em contato conosco para incluir sua instituição nas parcerias
            </p>
            <Button asChild>
              <Link to="/contato">
                <Plus className="w-4 h-4 mr-2" />
                Solicitar Nova Parceria
              </Link>
            </Button>
          </CardContent>
        </Card>
        </div>
      </main>
      
      <Footer />
    </>
  );
}

interface ProgramaCardProps {
  programa: Programa;
  organizacao: Organizacao;
}

function ProgramaCard({ programa, organizacao }: ProgramaCardProps) {
  const IconComponent = getIcon(programa.icone);

  const getStatusBadge = () => {
    switch (programa.status_usuario) {
      case 'aprovado':
        return <Badge className="bg-green-600 hover:bg-green-700">✅ Ativo</Badge>;
      case 'pendente':
        return <Badge variant="secondary">⏳ Em análise</Badge>;
      case 'rejeitado':
        return <Badge variant="destructive">❌ Rejeitado</Badge>;
      default:
        return <Badge variant="outline">📝 Disponível</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer border group" 
          style={{ borderColor: programa.cor_tema + '20' }}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <IconComponent className="w-4 h-4" style={{ color: programa.cor_tema }} />
                <h4 className="font-semibold text-sm">{programa.nome}</h4>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {programa.descricao}
              </p>
            </div>
            {getStatusBadge()}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-muted-foreground">Benefício: </span>
              <span className="font-semibold" style={{ color: programa.cor_tema }}>
                {programa.valor_mensal} Girinhas/mês
              </span>
            </div>
            
            <Button 
              size="sm" 
              asChild
              className="group-hover:scale-105 transition-transform"
              style={{ backgroundColor: programa.cor_tema }}
            >
              <Link to={`/parcerias/${organizacao.codigo}/${programa.codigo}`}>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}