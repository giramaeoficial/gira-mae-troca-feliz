
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart } from 'lucide-react';
import Header from '@/components/shared/Header';
import { useAuth } from '@/hooks/useAuth';
import GoogleStep from '@/components/cadastro/GoogleStep';
import PhoneStep from '@/components/cadastro/PhoneStep';
import CodeStep from '@/components/cadastro/CodeStep';
import PersonalDataStep from '@/components/cadastro/PersonalDataStep';
import AddressStep from '@/components/cadastro/AddressStep';
import StepIndicator from '@/components/cadastro/StepIndicator';

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
  nome: string;
  bio: string;
  profissao: string;
  instagram: string;
  telefone: string;
  data_nascimento: string;
  interesses: string[];
  categorias_favoritas: string[];
  aceita_entrega_domicilio: boolean;
  raio_entrega_km: number;
  ponto_retirada_preferido: string;
}

const SignUp = () => {
  const { signInWithGoogleForRegistration } = useAuth();
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
    nome: '',
    bio: '',
    profissao: '',
    instagram: '',
    telefone: '',
    data_nascimento: '',
    interesses: [],
    categorias_favoritas: [],
    aceita_entrega_domicilio: false,
    raio_entrega_km: 5,
    ponto_retirada_preferido: ''
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

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCodeInput = (index: number, value: string) => {
    const newInputs = [...codeInputs];
    newInputs[index] = value;
    setCodeInputs(newInputs);
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      await signInWithGoogleForRegistration();
      setFormData(prev => ({ ...prev, google: true }));
    } catch (error) {
      console.error('Erro no login com Google:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleInteresseToggle = (interesse: string) => {
    const newInteresses = formData.interesses.includes(interesse)
      ? formData.interesses.filter(i => i !== interesse)
      : [...formData.interesses, interesse];
    handleInputChange('interesses', newInteresses);
  };

  const handleCategoriaToggle = (categoria: string) => {
    const newCategorias = formData.categorias_favoritas.includes(categoria)
      ? formData.categorias_favoritas.filter(c => c !== categoria)
      : [...formData.categorias_favoritas, categoria];
    handleInputChange('categorias_favoritas', newCategorias);
  };

  const renderStepContent = (step: Step, index: number) => {
    if (step.state !== 'active') return null;

    switch (step.key) {
      case 'google':
        return (
          <GoogleStep
            onComplete={() => completeStep(0)}
            onGoogleLogin={handleGoogleLogin}
            isLoading={isGoogleLoading}
          />
        );

      case 'phone':
        return (
          <PhoneStep
            phone={formData.phone}
            onPhoneChange={(phone) => handleInputChange('phone', phone)}
            onComplete={() => completeStep(1)}
          />
        );

      case 'code':
        return (
          <CodeStep
            phone={formData.phone}
            codeInputs={codeInputs}
            onCodeChange={handleCodeInput}
            onComplete={() => {
              const code = codeInputs.join('');
              setFormData(prev => ({ ...prev, code }));
              completeStep(2);
            }}
          />
        );

      case 'personal':
        return (
          <PersonalDataStep
            formData={{
              nome: formData.nome,
              bio: formData.bio,
              profissao: formData.profissao,
              instagram: formData.instagram,
              telefone: formData.telefone,
              data_nascimento: formData.data_nascimento,
              interesses: formData.interesses,
              categorias_favoritas: formData.categorias_favoritas
            }}
            onInputChange={handleInputChange}
            onInteresseToggle={handleInteresseToggle}
            onCategoriaToggle={handleCategoriaToggle}
            onComplete={() => completeStep(3)}
          />
        );

      case 'address':
        return (
          <AddressStep
            formData={{
              aceita_entrega_domicilio: formData.aceita_entrega_domicilio,
              raio_entrega_km: formData.raio_entrega_km,
              ponto_retirada_preferido: formData.ponto_retirada_preferido
            }}
            onInputChange={handleInputChange}
            onComplete={() => {
              completeStep(4);
              console.log('Cadastro completo:', formData);
            }}
          />
        );

      default:
        return null;
    }
  };

  const isAllStepsCompleted = steps.every(step => step.state === 'done');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <Header />
      
      <div className="flex-1 flex items-center justify-center p-4 pt-8">
        <div className="max-w-md w-full animate-fade-in-up">
          <div className="bg-white/80 backdrop-blur-sm border border-pink-100 rounded-2xl mb-6 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-pink-100 bg-gradient-to-r from-primary/5 to-pink-500/5">
              <div className="text-center mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                  Criar sua conta
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Junte-se à comunidade de mães que compartilham e economizam
                </p>
              </div>
            </div>

            {/* Steps */}
            <StepIndicator
              steps={steps}
              onEditStep={editStep}
              isAllStepsCompleted={isAllStepsCompleted}
            />

            {/* Step Content */}
            {steps.map((step, index) => (
              <div key={step.key}>
                {renderStepContent(step, index)}
              </div>
            ))}

            {/* Bônus sempre visível */}
            <div className="bg-gradient-to-r from-primary/10 via-pink-500/10 to-purple-100 p-4 rounded-xl m-4">
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
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-green-800 mb-2">
                  Cadastro realizado com sucesso!
                </h3>
                <p className="text-sm text-green-600 mb-4">
                  Sua conta foi criada e você já está logado.
                </p>
                
                <Link to="/feed" className="block">
                  <button className="w-full bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white font-medium py-3 px-4 rounded-lg shadow-lg transition-all duration-200">
                    Entrar na Plataforma
                  </button>
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
          <div className="text-xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent flex items-center justify-center mb-2">
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
