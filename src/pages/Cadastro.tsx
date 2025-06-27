import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Edit2, Sparkles, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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

  const handleGoogleLogin = () => {
    // Simular login com Google - aqui seria integrado com a autenticação real
    setFormData(prev => ({ ...prev, google: true }));
    completeStep(0);
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
      // Aqui seria feita a integração com o banco de dados
      console.log('Cadastro completo:', formData);
    }
  };

  const getStepIcon = (step: Step, index: number) => {
    if (step.state === 'done') {
      return (
        <div className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
          <Check className="w-5 h-5" />
        </div>
      );
    }

    const iconMap = {
      google: (
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <img 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            alt="Google" 
            className="w-7 h-7"
          />
        </div>
      ),
      phone: (
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
      ),
      code: (
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M6 10h.01M18 10h.01M12 13h.01" />
          </svg>
        </div>
      ),
      personal: (
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      ),
      address: (
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      )
    };

    return iconMap[step.key as keyof typeof iconMap] || iconMap.personal;
  };

  const renderStepContent = (step: Step, index: number) => {
    if (step.state !== 'active') return null;

    switch (step.key) {
      case 'google':
        return (
          <div className="px-6 pb-5 pt-1">
            <p className="text-sm text-gray-600 mb-3">
              Clique para fazer login seguro com sua conta Google.
            </p>
            <Button 
              onClick={handleGoogleLogin}
              className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm"
            >
              <img 
                src="https://www.svgrepo.com/show/475656/google-color.svg" 
                alt="Google" 
                className="w-6 h-6 mr-2"
              />
              Entrar com Google
            </Button>
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
            <Button onClick={handlePhoneSubmit} className="w-full bg-blue-600 hover:bg-blue-700">
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
              <button className="text-blue-600 text-sm hover:underline">
                Reenviar código por SMS
              </button>
              <button className="text-blue-600 text-sm hover:underline">
                Reenviar código por ligação
              </button>
            </div>
            <Button onClick={handleCodeSubmit} className="w-full bg-blue-600 hover:bg-blue-700">
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
              <Button onClick={handlePersonalSubmit} className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
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
              <Button onClick={handleAddressSubmit} className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
                Salvar Endereço
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isLastStepCompleted = steps[steps.length - 1].state === 'done';
  const isAllStepsCompleted = steps.every(step => step.state === 'done');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white border-2 border-gray-200 rounded-xl mb-4 overflow-hidden shadow-xl">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-lg font-bold text-gray-800">Criar conta</h1>
                <div className="w-9" /> {/* Spacer */}
              </div>
              <h2 className="text-lg font-bold text-center text-gray-800">
                Preencha os dados para criar sua conta
              </h2>
            </div>

            {/* Steps */}
            {steps.map((step, index) => (
              <div key={step.key} className="bg-white border-b border-gray-200 last:border-b-0">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {getStepIcon(step, index)}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{step.title}</p>
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
                      className="p-2 hover:bg-gray-100"
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
            <div className="bg-gradient-to-r from-primary/10 to-purple-100 p-4 rounded-xl mb-4">
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
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-4 text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-green-800 mb-2">
                  Cadastro realizado com sucesso!
                </h3>
                <p className="text-sm text-green-600 mb-4">
                  Sua conta foi criada e você já está logado.
                </p>
                
                <Link to="/" className="block">
                  <Button className="w-full bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90" size="lg">
                    Entrar na Plataforma
                  </Button>
                </Link>

                <div className="text-center text-sm mt-4">
                  Já tem uma conta?{" "}
                  <Link to="/login" className="underline text-primary font-medium">
                    Faça login aqui
                  </Link>
                </div>

                <div className="text-xs text-gray-500 text-center mt-2">
                  Ao se cadastrar, você concorda com nossos{" "}
                  <Link to="#" className="underline">Termos de Uso</Link> e{" "}
                  <Link to="#" className="underline">Política de Privacidade</Link>.
                </div>
              </div>
            )}
          </div>

          {/* Help section */}
          <p className="text-xs text-center text-gray-500 mt-6">
            Precisa de ajuda?{' '}
            <Link to="/help" className="text-blue-600 underline">
              Fale conosco.
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
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

export default SignUp;
