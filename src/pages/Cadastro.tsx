
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Edit2, Sparkles, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/shared/Header';
import { useAuth } from '@/hooks/useAuth';

interface Step {
  key: string;
  title: string;
  subtitle?: string;
  state: 'pending' | 'active' | 'done';
}

interface FormData {
  google: boolean;
  phone: string;
  code: string;
  name: string;
  bio: string;
  profession: string;
  instagram: string;
  cep: string;
  state: string;
  city: string;
  street: string;
  number: string;
  neighborhood: string;
  reference: string;
}

const SignUp = () => {
  const { signInWithGoogle } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const [steps, setSteps] = useState<Step[]>([
    { key: 'google', title: 'Entrar com Google', state: 'active' },
    { key: 'phone', title: 'Adicione seu celular', state: 'pending' },
    { key: 'code', title: 'Insira o código', state: 'pending' },
    { key: 'personal', title: 'Dados pessoais', state: 'pending' },
    { key: 'address', title: 'Endereço', state: 'pending' }
  ]);

  const [formData, setFormData] = useState<FormData>({
    google: false,
    phone: '',
    code: '',
    name: '',
    bio: '',
    profession: '',
    instagram: '',
    cep: '',
    state: '',
    city: '',
    street: '',
    number: '',
    neighborhood: '',
    reference: ''
  });

  const [codeInputs, setCodeInputs] = useState(['', '', '', '']);

  const completeStep = (index: number) => {
    const newSteps = [...steps];
    newSteps[index].state = 'done';
    if (newSteps[index + 1]) {
      newSteps[index + 1].state = 'active';
    }
    for (let i = index + 2; i < newSteps.length; i++) {
      newSteps[i].state = 'pending';
    }
    setSteps(newSteps);
  };

  const editStep = (index: number) => {
    const newSteps = steps.map((step, idx) => {
      if (idx === index) return { ...step, state: 'active' as const };
      if (idx < index) return { ...step, state: 'done' as const };
      return { ...step, state: 'pending' as const };
    });
    setSteps(newSteps);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCodeInput = (index: number, value: string) => {
    if (value.length <= 1) {
      const newInputs = [...codeInputs];
      newInputs[index] = value;
      setCodeInputs(newInputs);
      
      // Auto-focus next input
      if (value && index < 3) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      await signInWithGoogle();
      setFormData(prev => ({ ...prev, google: true }));
      completeStep(0);
    } catch (error) {
      console.error('Erro no login com Google:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handlePhoneSubmit = () => {
    if (formData.phone.trim()) {
      completeStep(1);
    }
  };

  const handleCodeSubmit = () => {
    const code = codeInputs.join('');
    if (code.length === 4) {
      setFormData(prev => ({ ...prev, code }));
      completeStep(2);
    }
  };

  const handlePersonalSubmit = () => {
    if (formData.name.trim()) {
      completeStep(3);
    }
  };

  const handleAddressSubmit = () => {
    if (formData.cep.trim() && formData.street.trim()) {
      completeStep(4);
      console.log('Cadastro completo:', formData);
    }
  };

  const getStepIcon = (step: Step, index: number) => {
    if (step.state === 'done') {
      return (
        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center flex-shrink-0 shadow-lg">
          <Check className="w-5 h-5" />
        </div>
      );
    }

    if (step.state === 'active') {
      const iconMap = {
        google: (
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary flex items-center justify-center flex-shrink-0 animate-pulse">
            <img 
              src="https://www.svgrepo.com/show/475656/google-color.svg" 
              alt="Google" 
              className="w-6 h-6"
            />
          </div>
        ),
        phone: (
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
        ),
        code: (
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M6 10h.01M18 10h.01M12 13h.01" />
            </svg>
          </div>
        ),
        personal: (
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        ),
        address: (
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )
      };
      return iconMap[step.key as keyof typeof iconMap] || iconMap.personal;
    }

    // Pending state
    return (
      <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
      </div>
    );
  };

  const renderStepContent = (step: Step, index: number) => {
    if (step.state !== 'active') return null;

    switch (step.key) {
      case 'google':
        return (
          <div className="px-6 pb-6 pt-2">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <img 
                  src="https://www.svgrepo.com/show/475656/google-color.svg" 
                  alt="Google" 
                  className="w-10 h-10"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Entre com sua conta Google
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Para sua segurança e praticidade, utilizamos o login do Google. 
                Seus dados estarão protegidos e você terá acesso imediato à plataforma.
              </p>
            </div>
            
            <Button 
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium py-3 h-auto shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              <img 
                src="https://www.svgrepo.com/show/475656/google-color.svg" 
                alt="Google" 
                className="w-6 h-6 mr-3"
              />
              {isGoogleLoading ? 'Conectando...' : 'Continuar com Google'}
            </Button>
            
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Ao continuar, você concorda com nossos{' '}
                <Link to="#" className="text-primary hover:underline">Termos de Uso</Link>
                {' '}e{' '}
                <Link to="#" className="text-primary hover:underline">Política de Privacidade</Link>
              </p>
            </div>
          </div>
        );

      case 'phone':
        return (
          <div className="px-6 pb-5 pt-1">
            <p className="text-sm text-gray-600 mb-2">
              Vamos te enviar um código por SMS para validar seu número.
            </p>
            <Input
              type="tel"
              placeholder="+55 31999999999"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="mb-3"
            />
            <Button onClick={handlePhoneSubmit} className="w-full bg-primary hover:bg-primary/90">
              Continuar
            </Button>
          </div>
        );

      case 'code':
        return (
          <div className="px-6 pb-5 pt-1">
            <p className="text-sm text-gray-600 mb-2">
              Enviamos para <strong>{formData.phone || '+55 31 98335-6459'}</strong>. 
              Se precisar, você pode alterar seu número.
            </p>
            <div className="flex gap-2 justify-center mb-3">
              {codeInputs.map((value, idx) => (
                <Input
                  key={idx}
                  id={`code-${idx}`}
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleCodeInput(idx, e.target.value)}
                  className="w-12 h-12 text-center text-xl"
                />
              ))}
            </div>
            <div className="flex justify-center mb-3 space-x-4">
              <button className="text-primary text-sm hover:underline">
                Reenviar código por SMS
              </button>
              <button className="text-primary text-sm hover:underline">
                Reenviar código por ligação
              </button>
            </div>
            <Button onClick={handleCodeSubmit} className="w-full bg-primary hover:bg-primary/90">
              Confirmar código
            </Button>
          </div>
        );

      case 'personal':
        return (
          <div className="px-6 pb-5 pt-1">
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  placeholder="Nome completo"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  placeholder="ex: mãe de gêmeos"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="profession">Profissão</Label>
                <Input
                  id="profession"
                  placeholder="Profissão"
                  value={formData.profession}
                  onChange={(e) => handleInputChange('profession', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  placeholder="@seuperfil"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                />
              </div>
              <Button onClick={handlePersonalSubmit} className="w-full bg-primary hover:bg-primary/90 mt-4">
                Salvar e Continuar
              </Button>
            </div>
          </div>
        );

      case 'address':
        return (
          <div className="px-6 pb-5 pt-1">
            <div className="space-y-3">
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  placeholder="CEP"
                  value={formData.cep}
                  onChange={(e) => handleInputChange('cep', e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    placeholder="Estado"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    placeholder="Cidade"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="street">Rua / Endereço</Label>
                <Input
                  id="street"
                  placeholder="Rua / Endereço"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    placeholder="Número"
                    value={formData.number}
                    onChange={(e) => handleInputChange('number', e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    placeholder="Bairro"
                    value={formData.neighborhood}
                    onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="reference">Ponto de Referência</Label>
                <Textarea
                  id="reference"
                  placeholder="Ponto de Referência"
                  value={formData.reference}
                  onChange={(e) => handleInputChange('reference', e.target.value)}
                />
              </div>
              <Button onClick={handleAddressSubmit} className="w-full bg-primary hover:bg-primary/90 mt-4">
                Salvar Endereço
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isAllStepsCompleted = steps.every(step => step.state === 'done');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <Header />
      
      <div className="flex-1 flex items-center justify-center p-4 pt-8">
        <div className="max-w-md w-full animate-fade-in-up">
          <div className="bg-white/80 backdrop-blur-sm border border-pink-100 rounded-2xl mb-6 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-pink-100 bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="text-center mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Criar sua conta
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Junte-se à comunidade de mães que compartilham e economizam
                </p>
              </div>
            </div>

            {/* Steps */}
            {steps.map((step, index) => (
              <div key={step.key} className="bg-white border-b border-gray-100 last:border-b-0">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {getStepIcon(step, index)}
                    <div>
                      <p className={`text-sm font-semibold ${
                        step.state === 'active' ? 'text-primary' : 
                        step.state === 'done' ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </p>
                      {step.subtitle && (
                        <p className="text-xs text-gray-500">{step.subtitle}</p>
                      )}
                    </div>
                  </div>

                  {/* Edit button for completed steps */}
                  {step.state === 'done' && !isAllStepsCompleted && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editStep(index)}
                      className="p-2 hover:bg-primary/10 text-primary"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Step content */}
                {renderStepContent(step, index)}
              </div>
            ))}

            {/* Bônus sempre visível */}
            <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-purple-100 p-4 rounded-xl m-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-semibold text-gray-800">Bônus de Boas-vindas</span>
              </div>
              <p className="text-sm text-gray-700">
                Você começará com <span className="font-bold text-primary">50 Girinhas</span> de presente 
                para fazer suas primeiras trocas na comunidade!
              </p>
            </div>

            {/* Botão de entrar quando tudo estiver completo */}
            {isAllStepsCompleted && (
              <div className="bg-white border-t border-gray-100 p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-green-800 mb-2">
                  Cadastro realizado com sucesso!
                </h3>
                <p className="text-sm text-green-600 mb-4">
                  Sua conta foi criada e você já está logado.
                </p>
                
                <Link to="/feed" className="block">
                  <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg" size="lg">
                    Entrar na Plataforma
                  </Button>
                </Link>

                <div className="text-center text-sm mt-4">
                  Já tem uma conta?{" "}
                  <Link to="/auth" className="underline text-primary font-medium">
                    Faça login aqui
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Help section */}
          <p className="text-xs text-center text-gray-600 mt-4">
            Precisa de ajuda?{' '}
            <Link to="#" className="text-primary underline hover:text-primary/80">
              Fale conosco.
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm py-6 border-t border-pink-100">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <div className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center justify-center mb-2">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            GiraMãe
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} GiraMãe. Feito com <Heart className="inline h-4 w-4 text-primary" /> por e para mães.</p>
        </div>
      </footer>
    </div>
  );
};

export default SignUp;
