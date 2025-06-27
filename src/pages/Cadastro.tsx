import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Heart, Sparkles, Baby, Check, Edit2, Loader2 } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Cadastro = () => {
    const navigate = useNavigate();
    const { user, signInWithGoogle } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        // Dados básicos (do Google)
        nome: '',
        email: '',
        avatar_url: '',
        
        // Telefone e verificação
        telefone: '',
        telefone_verificado: false,
        codigo_sms: '',
        
        // Dados pessoais (similar ao /editar)
        bio: '',
        profissao: '',
        instagram: '',
        data_nascimento: '',
        
        // Endereço (similar ao /editar)
        cep: '',
        endereco: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        complemento: '',
        ponto_referencia: '',
        
        // Filhos (do formulário original)
        sobre_filhos: '',
        num_criancas: '',
        idade_criancas: ''
    });

    const steps = [
        {
            key: 'google',
            title: 'Entrar com Google',
            description: 'Login seguro com sua conta Google'
        },
        {
            key: 'telefone',
            title: 'Verificar telefone',
            description: 'Adicione seu número para segurança'
        },
        {
            key: 'codigo',
            title: 'Confirmar código',
            description: 'Digite o código SMS enviado'
        },
        {
            key: 'pessoais',
            title: 'Dados pessoais',
            description: 'Complete seu perfil'
        },
        {
            key: 'endereco',
            title: 'Endereço',
            description: 'Para facilitar as trocas'
        }
    ];

    // Verificar se usuário está logado e avançar para próximo step
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                nome: user.user_metadata?.full_name || '',
                email: user.email || '',
                avatar_url: user.user_metadata?.avatar_url || ''
            }));
            
            // Se já temos login do Google, pular para telefone
            if (currentStep === 0) {
                completeStep(0);
            }
        }
    }, [user]);

    const completeStep = (stepIndex) => {
        const newCompleted = [...completedSteps];
        if (!newCompleted.includes(stepIndex)) {
            newCompleted.push(stepIndex);
            setCompletedSteps(newCompleted);
        }
        
        if (stepIndex < steps.length - 1) {
            setCurrentStep(stepIndex + 1);
        }
    };

    const editStep = (stepIndex) => {
        setCurrentStep(stepIndex);
    };

    const isStepCompleted = (stepIndex) => completedSteps.includes(stepIndex);
    const isStepActive = (stepIndex) => currentStep === stepIndex;

    const handleGoogleLogin = async () => {
        try {
            setIsSigningIn(true);
            await signInWithGoogle();
        } catch (error) {
            console.error('Erro no login:', error);
            toast.error('Erro ao fazer login com Google. Tente novamente.');
        } finally {
            setIsSigningIn(false);
        }
    };

    const handleSendSMS = async () => {
        if (!formData.telefone) {
            toast.error('Digite seu telefone');
            return;
        }
        
        try {
            setLoading(true);
            // Simular envio de SMS - aqui você implementaria a integração real
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Código enviado por SMS!');
            completeStep(1);
        } catch (error) {
            toast.error('Erro ao enviar SMS');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifySMS = async () => {
        if (!formData.codigo_sms || formData.codigo_sms.length !== 4) {
            toast.error('Digite o código de 4 dígitos');
            return;
        }
        
        try {
            setLoading(true);
            // Simular verificação - aqui você implementaria a validação real
            await new Promise(resolve => setTimeout(resolve, 1000));
            setFormData(prev => ({ ...prev, telefone_verificado: true }));
            toast.success('Telefone verificado!');
            completeStep(2);
        } catch (error) {
            toast.error('Código inválido');
        } finally {
            setLoading(false);
        }
    };

    const handleSavePessoais = async () => {
        if (!formData.nome) {
            toast.error('Nome é obrigatório');
            return;
        }
        
        completeStep(3);
    };

    const handleFinalizarCadastro = async () => {
        if (!formData.cep || !formData.cidade || !formData.estado) {
            toast.error('Complete pelo menos CEP, cidade e estado');
            return;
        }
        
        try {
            setLoading(true);
            
            // Criar/atualizar perfil
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: formData.email,
                    nome: formData.nome,
                    avatar_url: formData.avatar_url,
                    telefone: formData.telefone,
                    bio: formData.bio,
                    profissao: formData.profissao,
                    instagram: formData.instagram,
                    data_nascimento: formData.data_nascimento || null,
                    cep: formData.cep,
                    endereco: formData.endereco,
                    numero: formData.numero,
                    bairro: formData.bairro,
                    cidade: formData.cidade,
                    estado: formData.estado,
                    complemento: formData.complemento,
                    ponto_referencia: formData.ponto_referencia,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            // Dar bônus de boas-vindas
            await supabase
                .from('transacoes')
                .insert({
                    user_id: user.id,
                    tipo: 'bonus',
                    valor: 50,
                    descricao: 'Bônus de boas-vindas'
                });

            toast.success('Conta criada com sucesso! Bem-vinda ao GiraMãe! 🎉');
            navigate('/feed');
            
        } catch (error) {
            console.error('Erro ao criar conta:', error);
            toast.error('Erro ao criar conta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const renderStepIcon = (step, index) => {
        if (isStepCompleted(index)) {
            return (
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-pink-500 rounded-full flex items-center justify-center shadow-sm">
                    <Check className="w-6 h-6 text-white" />
                </div>
            );
        }
        
        const iconMap = {
            'google': '🔐',
            'telefone': '📱', 
            'codigo': '🔢',
            'pessoais': '👤',
            'endereco': '📍'
        };
        
        return (
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-200
                ${isStepActive(index) ? 'bg-gradient-to-r from-primary to-pink-500 text-white shadow-md' : 'bg-pink-50 border border-pink-100'}`}>
                {iconMap[step.key] || '💫'}
            </div>
        );
    };

    const renderStepContent = (step, index) => {
        if (!isStepActive(index)) return null;

        switch (step.key) {
            case 'google':
                return (
                    <CardContent className="space-y-4">
                        <p className="text-gray-600 mb-4">
                            Clique para fazer login seguro com sua conta Google. Isso facilitará seu acesso e manterá seus dados protegidos.
                        </p>
                        <Button 
                            onClick={handleGoogleLogin}
                            disabled={isSigningIn}
                            className="w-full bg-white border-2 border-pink-200 text-gray-700 hover:bg-pink-50 hover:border-pink-300 flex items-center justify-center gap-3 transition-all duration-200 shadow-sm"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            {isSigningIn ? 'Entrando...' : 'Entrar com Google'}
                        </Button>
                    </CardContent>
                );

            case 'telefone':
                return (
                    <CardContent className="space-y-4">
                        <p className="text-gray-600 mb-4">
                            Vamos enviar um código por SMS para validar seu número. Isso garante a segurança da plataforma para todas as mães.
                        </p>
                        <div className="space-y-3">
                            <Label htmlFor="telefone">Telefone/WhatsApp</Label>
                            <Input 
                                id="telefone"
                                type="tel" 
                                placeholder="(11) 99999-9999"
                                value={formData.telefone}
                                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                            />
                            <Button 
                                onClick={handleSendSMS}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white transition-all duration-200"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    'Enviar código SMS'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                );

            case 'codigo':
                return (
                    <CardContent className="space-y-4">
                        <p className="text-gray-600 mb-4">
                            Enviamos um código para <strong>{formData.telefone}</strong>. 
                            Se precisar, você pode alterar seu número.
                        </p>
                        <div className="space-y-4">
                            <div className="flex gap-2 justify-center">
                                {[...Array(4)].map((_, i) => (
                                    <Input 
                                        key={i}
                                        maxLength={1}
                                        className="w-12 h-12 text-center text-xl font-bold"
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const newCode = formData.codigo_sms.split('');
                                            newCode[i] = value;
                                            setFormData(prev => ({ ...prev, codigo_sms: newCode.join('') }));
                                            
                                            if (value && i < 3) {
                                                const nextInput = e.target.parentNode.children[i + 1];
                                                if (nextInput) nextInput.focus();
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-center gap-4 text-sm">
                                <button 
                                    onClick={handleSendSMS}
                                    className="text-primary hover:text-pink-500 hover:underline transition-colors duration-200"
                                >
                                    Reenviar por SMS
                                </button>
                            </div>
                            <Button 
                                onClick={handleVerifySMS}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white transition-all duration-200"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Verificando...
                                    </>
                                ) : (
                                    'Confirmar código'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                );

            case 'pessoais':
                return (
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="nome">Nome completo</Label>
                                <Input 
                                    id="nome" 
                                    placeholder="Seu nome completo" 
                                    value={formData.nome}
                                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="profissao">Profissão</Label>
                                <Input 
                                    id="profissao" 
                                    placeholder="Ex: Designer, Professora"
                                    value={formData.profissao}
                                    onChange={(e) => setFormData(prev => ({ ...prev, profissao: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Input 
                                id="bio" 
                                placeholder="Ex: Mãe do Lorenzo, 2 anos"
                                value={formData.bio}
                                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="instagram">Instagram (opcional)</Label>
                            <Input 
                                id="instagram" 
                                placeholder="@seuusuario"
                                value={formData.instagram}
                                onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="criancas">Sobre seus filhos</Label>
                            <Textarea 
                                id="criancas" 
                                placeholder="Ex: Tenho 1 filho de 2 anos, Lorenzo, que adora brincar no parque..."
                                value={formData.sobre_filhos}
                                onChange={(e) => setFormData(prev => ({ ...prev, sobre_filhos: e.target.value }))}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="numCriancas">Número de filhos</Label>
                                <Select 
                                    value={formData.num_criancas}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, num_criancas: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 filho(a)</SelectItem>
                                        <SelectItem value="2">2 filhos</SelectItem>
                                        <SelectItem value="3">3 filhos</SelectItem>
                                        <SelectItem value="4+">4 ou mais</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="idadeCriancas">Faixa etária dos filhos</Label>
                                <Select
                                    value={formData.idade_criancas}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, idade_criancas: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0-1">0-1 ano</SelectItem>
                                        <SelectItem value="1-3">1-3 anos</SelectItem>
                                        <SelectItem value="3-6">3-6 anos</SelectItem>
                                        <SelectItem value="6-10">6-10 anos</SelectItem>
                                        <SelectItem value="variada">Idades variadas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button 
                            onClick={handleSavePessoais}
                            className="w-full bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white transition-all duration-200"
                        >
                            Salvar e continuar
                        </Button>
                    </CardContent>
                );

            case 'endereco':
                return (
                    <CardContent className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="endereco">Endereço</Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input 
                                    placeholder="Bairro" 
                                    value={formData.bairro}
                                    onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
                                />
                                <Input 
                                    placeholder="Cidade" 
                                    value={formData.cidade}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                                />
                                <Select
                                    value={formData.estado}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, estado: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sp">São Paulo</SelectItem>
                                        <SelectItem value="rj">Rio de Janeiro</SelectItem>
                                        <SelectItem value="mg">Minas Gerais</SelectItem>
                                        <SelectItem value="pr">Paraná</SelectItem>
                                        <SelectItem value="rs">Rio Grande do Sul</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="cep">CEP</Label>
                                <Input 
                                    id="cep" 
                                    placeholder="00000-000" 
                                    value={formData.cep}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="numero">Número</Label>
                                <Input 
                                    id="numero" 
                                    placeholder="123" 
                                    value={formData.numero}
                                    onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="endereco_rua">Rua/Endereço</Label>
                            <Input 
                                id="endereco_rua" 
                                placeholder="Nome da rua" 
                                value={formData.endereco}
                                onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                            />
                        </div>

                        <div className="bg-gradient-to-r from-primary/10 to-purple-100 p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                <span className="font-semibold text-gray-800">Bônus de Boas-vindas</span>
                            </div>
                            <p className="text-sm text-gray-700">
                                Você começará com <span className="font-bold text-primary">50 Girinhas</span> de presente 
                                para fazer suas primeiras trocas na comunidade!
                            </p>
                        </div>

                        <Button 
                            onClick={handleFinalizarCadastro}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90" 
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Criando conta...
                                </>
                            ) : (
                                'Criar Minha Conta'
                            )}
                        </Button>
                    </CardContent>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24 md:pb-8">
            <Header />
            <main className="flex-grow flex items-center justify-center py-12 px-4">
                <Card className="w-full max-w-2xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-primary to-pink-500 rounded-full flex items-center justify-center">
                                <Baby className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl">Junte-se à Comunidade GiraMãe</CardTitle>
                        <CardDescription>
                            Crie sua conta e comece a trocar itens infantis de forma segura e solidária.
                        </CardDescription>
                    </CardHeader>

                    {/* Steps Progress */}
                    <div className="px-6 mb-6">
                        <div className="space-y-3">
                            {steps.map((step, index) => (
                                <div key={step.key} className="flex items-center gap-4 p-3 rounded-lg transition-all duration-200 hover:bg-pink-50/50">
                                    {renderStepIcon(step, index)}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-semibold text-gray-800">{step.title}</h4>
                                                <p className="text-sm text-gray-600">{step.description}</p>
                                            </div>
                                            {isStepCompleted(index) && index < steps.length - 1 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => editStep(index)}
                                                    className="p-2 h-8 w-8 hover:bg-pink-50 text-pink-600 hover:text-pink-700"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active Step Content */}
                    {steps.map((step, index) => (
                        <div key={step.key}>
                            {renderStepContent(step, index)}
                        </div>
                    ))}

                    {/* Footer Links */}
                    <CardContent className="pt-0">
                        <div className="text-center text-sm">
                            Já tem uma conta?{" "}
                            <Link to="/auth" className="underline text-primary font-medium">
                                Faça login aqui
                            </Link>
                        </div>

                        <div className="text-xs text-gray-500 text-center mt-4">
                            Ao se cadastrar, você concorda com nossos{" "}
                            <Link to="#" className="underline">Termos de Uso</Link> e{" "}
                            <Link to="#" className="underline">Política de Privacidade</Link>.
                        </div>
                    </CardContent>
                </Card>
            </main>
            
            <footer className="bg-muted py-8">
                <div className="container mx-auto px-4 text-center text-muted-foreground">
                    <div className="text-2xl font-bold text-primary flex items-center justify-center mb-4">
                        <Link to="/" className="flex items-center text-primary">
                            <Sparkles className="h-6 w-6 mr-2" />
                            GiraMãe
                        </Link>
                    </div>
                    <p>&copy; {new Date().getFullYear()} GiraMãe. Feito com <Heart className="inline h-4 w-4 text-primary" /> por e para mães.</p>
                </div>
            </footer>
        </div>
    );
};

export default Cadastro;
