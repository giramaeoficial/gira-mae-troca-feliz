import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  AlertTriangle,
  Leaf,
  Heart,
  Quote,
  ArrowRight,
  Droplets,
  Tag,
  Archive,
  Gift,
  History,
  Store,
  Baby,
  CheckCircle2,
  RefreshCcw,
  Share2,
  HelpCircle,
  ToyBrick,
} from 'lucide-react';

// --- UTILITÁRIOS ---
const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// --- COMPONENTES VISUAIS ---

type CardColor =
  | 'blue'
  | 'red'
  | 'orange'
  | 'purple'
  | 'green'
  | 'yellow'
  | 'pink'
  | 'slate';

const Card = ({
  title,
  icon,
  color,
  children,
  className = '',
  delay = 0,
}: {
  title: string;
  icon: React.ReactNode;
  color: CardColor;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  const colors: Record<CardColor, string> = {
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    red: 'bg-red-50 border-red-100 text-red-700',
    orange: 'bg-orange-50 border-orange-100 text-orange-700',
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
    green: 'bg-green-50 border-green-100 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-100 text-yellow-700',
    pink: 'bg-pink-50 border-pink-100 text-pink-700',
    slate: 'bg-slate-50 border-slate-100 text-slate-700',
  };

  const iconColors: Record<CardColor, string> = {
    blue: 'bg-white text-blue-600',
    red: 'bg-white text-red-600',
    orange: 'bg-white text-orange-600',
    purple: 'bg-white text-purple-600',
    green: 'bg-white text-green-600',
    yellow: 'bg-white text-yellow-600',
    pink: 'bg-white text-pink-600',
    slate: 'bg-white text-slate-600',
  };

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition-all duration-700 hover:shadow-md ${colors[color]} ${className} animate-in fade-in slide-in-from-bottom-4`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3 mb-3 border-b border-black/5 pb-3">
        <div className={`p-2 rounded-full shadow-sm ${iconColors[color]}`}>
          {React.isValidElement(icon)
            ? React.cloneElement(icon as React.ReactElement, { size: 18 })
            : icon}
        </div>
        <h3 className="font-bold text-sm uppercase tracking-wide opacity-80">
          {title}
        </h3>
      </div>
      <div className="text-slate-800">{children}</div>
    </div>
  );
};

const ProgressBar = ({
  value,
  max,
  color = 'bg-blue-500',
  label,
}: {
  value: number;
  max: number;
  color?: string;
  label?: string;
}) => (
  <div className="w-full">
    {label && (
      <div className="flex justify-between text-xs mb-1 font-medium text-slate-500">
        <span>{label}</span>
        <span>{Math.round((value / max) * 100)}%</span>
      </div>
    )}
    <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-1000 ease-out`}
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      />
    </div>
  </div>
);

// --- SUB-WIDGET: FRASES ---
function FrasesWidget() {
  const [idx, setIdx] = useState(0);
  const frases = [
    'Você não precisa de mais uma blusinha.',
    'Quando eu era criança, eu tinha só dois casacos...',
    'Roupas não nascem em árvore!',
    'Na volta a gente compra.',
    'Cuidado pra não sujar, acabei de colocar!',
    'Tá achando que eu sou sócia da Renner?',
    'Essa roupa ainda serve, é só esticar um pouco.',
    'Se eu for aí e achar essa blusa...',
  ];

  const frase = frases[idx % frases.length];

  return (
    <div>
      <p className="text-2xl md:text-3xl font-medium text-slate-700 italic min-h-[80px] flex items-center justify-center animate-in fade-in">
        “{frase}”
      </p>
      <button
        onClick={() => setIdx((i) => i + 1)}
        className="mt-6 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full font-bold text-sm transition-colors"
      >
        Gerar Nova Frase
      </button>
    </div>
  );
}

// --- TIPO DOS DADOS DO FORM ---
interface FormData {
  name: string;
  ageMonths: number;
  wardrobeSize: number;
  piecesPerMonth: number;
  averagePrice: number;
  coldLevel: number;
  attachmentPieces: number;
}

// --- COMPONENTE PRINCIPAL ---
export default function DossieGiraMae360() {
  const [step, setStep] = useState<'setup' | 'report'>('setup');

  const [data, setData] = useState<FormData>({
    name: '',
    ageMonths: 6,
    wardrobeSize: 60,
    piecesPerMonth: 5,
    averagePrice: 45,
    coldLevel: 6,
    attachmentPieces: 8,
  });

  const handleNumChange =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLInputElement>) => {
      const raw = e.target.value;
      const n = raw === '' ? 0 : Number(raw);
      setData((prev) => ({ ...prev, [field]: isNaN(n) ? prev[field] : n }));
    };

  const nomeCurto =
    data.name.trim().length === 0 ? 'seu filho' : data.name.trim().split(' ')[0];

  // --- LÓGICA DERIVADA (compartilhada pelos dois códigos) ---
  const { ageMonths, wardrobeSize, piecesPerMonth, averagePrice, coldLevel, attachmentPieces } =
    data;

  const isBaby = ageMonths < 24;

  // idade em anos/meses só para texto
  const idadeAnos = Math.floor(ageMonths / 12);
  const idadeMesesRest = ageMonths % 12;

  // Ritmo do armário / churn
  const churnRateText =
    ageMonths < 3
      ? 'TURBO (2–3 meses)'
      : ageMonths < 12
      ? 'RÁPIDA (3–6 meses)'
      : 'MODERADA (Anual)';
  const nextChangeIn = ageMonths < 12 ? 3 : ageMonths < 36 ? 6 : 12;

  const heroItem =
    ageMonths < 12
      ? 'Body + mijão'
      : ageMonths < 36
      ? 'Legging + moletom'
      : 'Uniforme / roupa confortável';

  const ghostItem =
    ageMonths < 12
      ? 'Sapato de sola dura'
      : ageMonths < 36
      ? 'Jeans com botão'
      : 'Roupa de festa cheia de detalhe';

  // Manchas
  const manchaProb =
    ageMonths < 6 ? 10 : ageMonths < 12 ? 90 : ageMonths < 24 ? 70 : 40;
  const manchaVilao =
    ageMonths < 6
      ? 'leite / gorfada'
      : ageMonths < 12
      ? 'papinha colorida'
      : ageMonths < 24
      ? 'terra e grama'
      : 'tinta e canetinha';

  // Sustentabilidade
  const ecoBanhos = Math.round(wardrobeSize * 0.8);
  const ecoGarrafas = Math.round(wardrobeSize * 1.2);

  // Financeiro
  const gastoMensalEstimado = piecesPerMonth * averagePrice;
  const gastoAnualEstimado = gastoMensalEstimado * 12;
  const valorPagoArmario = wardrobeSize * averagePrice;
  const valorRevenda = valorPagoArmario * 0.3;
  const perdaFin = Math.max(valorPagoArmario - valorRevenda, 0);

  // Consumo / culpa
  let consumoPerfil: string;
  if (piecesPerMonth < 3) consumoPerfil = 'Minimalista Zen 🧘‍♀️';
  else if (piecesPerMonth <= 10) consumoPerfil = 'Equilíbrio Saudável ⚖️';
  else consumoPerfil = 'Time “só mais uma blusinha” 🛍️';

  // Apego
  const apegoNivel =
    attachmentPieces === 0
      ? 'Apego sob controle 👏'
      : attachmentPieces <= 10
      ? 'Algumas memórias especiais 💖'
      : attachmentPieces <= 25
      ? 'Apego alto: vale revisar esse baú 📦'
      : 'Museu da infância oficial – hora de girar 🦕';

  const filhosEstimados = attachmentPieces > 0 && attachmentPieces <= 10 ? 1 : 2;

  // Diagnóstico da casa
  const diagnosticoCasa =
    wardrobeSize > 100
      ? '🚨 Casa-Estoque'
      : wardrobeSize > 50
      ? '✅ Casa-Equilibrada'
      : '✨ Casa-Minimalista';

  // Peças “de Instagram”
  const instagramPieces = Math.round(wardrobeSize * 0.1);

  const reset = () => {
    setStep('setup');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --- VIEW: ONBOARDING / SETUP (MOBILE FIRST) ---
  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-in zoom-in duration-500">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-7 text-white text-center">
            <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-90" />
            <h1 className="text-2xl font-black mb-1">Dossiê GiraMãe 360º</h1>
            <p className="text-sm opacity-90">
              Uma única tela. Um raio-X completo do armário do seu filho.
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Nome */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nome da criança (ou apelido)
              </label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Ana, Pedro, Manu..."
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-pink-500 outline-none text-sm"
              />
            </div>

            {/* Idade (meses) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Idade do {nomeCurto} (em meses)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={144}
                  step={1}
                  value={ageMonths}
                  onChange={handleNumChange('ageMonths')}
                  className="w-full accent-pink-600 cursor-pointer"
                />
                <span className="font-bold text-pink-600 text-xs min-w-[72px] text-right">
                  {ageMonths < 24
                    ? `${ageMonths} m`
                    : `${idadeAnos}a${idadeMesesRest ? ` ${idadeMesesRest}m` : ''}`}
                </span>
              </div>
            </div>

            {/* Tamanho do armário */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Quantas peças tem hoje no armário (aprox.)?
              </label>
              <div className="flex items-center gap-3">
                <Archive className="text-slate-400 w-4 h-4" />
                <input
                  type="range"
                  min={10}
                  max={300}
                  step={10}
                  value={wardrobeSize}
                  onChange={handleNumChange('wardrobeSize')}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <span className="font-bold text-purple-600 text-xs min-w-[56px] text-right">
                  {wardrobeSize} pçs
                </span>
              </div>
            </div>

            {/* Peças/mês */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Em média, quantas peças você compra por mês?
              </label>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1 px-1">
                <span>Zen 🧘‍♀️</span>
                <span>Shopper 🛍️</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                step={1}
                value={piecesPerMonth}
                onChange={handleNumChange('piecesPerMonth')}
                className="w-full accent-red-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Hoje você estima comprar{' '}
                <span className="font-semibold text-slate-600">
                  {piecesPerMonth} peça(s)
                </span>{' '}
                por mês.
              </p>
            </div>

            {/* Preço médio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preço médio por peça (R$)
              </label>
              <input
                type="number"
                min={5}
                step={5}
                value={averagePrice}
                onChange={handleNumChange('averagePrice')}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-pink-500 outline-none text-sm"
              />
            </div>

            {/* Clima e Apego (2 colunas no desktop, 1 no mobile) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Clima da sua cidade
                  </label>
                  <span className="text-[10px] text-slate-400">
                    0 = muito calor • 10 = muito frio
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={coldLevel}
                  onChange={handleNumChange('coldLevel')}
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {coldLevel <= 3
                    ? 'Mais verão que inverno: body manda em tudo.'
                    : coldLevel >= 8
                    ? 'Zona casaco: frio manda nas compras.'
                    : 'Clima misto: metade do armário é meia estação.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantas peças você guarda só por apego?
                </label>
                <input
                  type="number"
                  min={0}
                  value={attachmentPieces}
                  onChange={handleNumChange('attachmentPieces')}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-pink-500 outline-none text-sm"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Vestidinho da festa, saída de maternidade, uniforme especial…
                </p>
              </div>
            </div>

            <button
              onClick={() => data.name && setStep('report')}
              disabled={!data.name}
              className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5"
            >
              Gerar Dossiê <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW: RELATÓRIO / DASHBOARD (MOBILE FIRST, ENRIQUECIDO) ---
  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-10">
      {/* HEADER FIXO */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 sm:px-6 py-3.5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
            G
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-slate-800 text-sm">
              Dossiê {nomeCurto}
            </span>
            <span className="text-[10px] text-slate-400">
              {ageMonths < 24
                ? `${ageMonths} meses`
                : `${idadeAnos} ano(s)${idadeMesesRest ? ` e ${idadeMesesRest} meses` : ''}`}
            </span>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={reset}
            className="text-[11px] sm:text-xs font-medium text-slate-500 hover:text-pink-600 flex items-center gap-1"
          >
            <RefreshCcw className="w-3.5 h-3.5" />{' '}
            <span className="hidden sm:inline">Refazer</span>
          </button>
          <button className="bg-slate-900 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5" />{' '}
            <span className="hidden sm:inline">Compartilhar</span>
            <span className="sm:hidden">Share</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
        {/* HERO SECTION (sempre empilhado no mobile) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 animate-in slide-in-from-bottom-8 duration-700">
          {/* Card Principal */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-7 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] text-slate-400 font-medium mb-1 uppercase tracking-wider">
                    Perfil atual
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-black mb-1">
                    {isBaby ? 'Fase Bebê' : 'Fase Criança'}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-200">
                    {ageMonths < 24
                      ? `${ageMonths} mês(es)`
                      : `${idadeAnos} ano(s)${
                          idadeMesesRest ? ` e ${idadeMesesRest} mês(es)` : ''
                        }`}{' '}
                    • {wardrobeSize} peças no armário
                  </p>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md flex-shrink-0">
                  <Baby className="w-7 h-7 text-pink-300" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 text-xs sm:text-sm">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">
                    Ritmo do armário
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-yellow-300">
                    {churnRateText}
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Próxima troca geral em ~{nextChangeIn} meses.
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">
                    Peça heróina
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-emerald-300">
                    {heroItem}
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1">
                    É a que mais gira entre máquina e rua.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card Diagnóstico da casa */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-50 text-purple-600 mb-2">
                <Store className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Diagnóstico da Casa
              </h3>
              <p className="text-slate-500 text-xs mt-1">{diagnosticoCasa}</p>
            </div>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Peças totais</span>
                <span className="font-bold">{wardrobeSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Em uso ativo</span>
                <span className="font-bold text-green-600">
                  ~{Math.round(wardrobeSize * 0.4)} peças
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Paradas / encalhadas</span>
                <span className="font-bold text-red-500">
                  ~{Math.round(wardrobeSize * 0.6)} peças
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '40%' }} />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Quanto mais verde, mais o armário gira. Quanto mais cinza, mais a
                gaveta pesa.
              </p>
            </div>
          </div>
        </section>

        {/* GRID ANALÍTICO (mobile: empilhado; desktop: bento) */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* COLUNA 1-2: financeiro + arrependimentos */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Painel Financeiro (do primeiro código) */}
            <Card title="Painel Financeiro" icon={<Heart />} color="red" delay={50}>
              <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm mb-3">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">
                    Gasto estimado / mês
                  </p>
                  <p className="text-base sm:text-lg font-bold text-red-600">
                    {formatBRL(gastoMensalEstimado || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">
                    Gasto estimado / ano
                  </p>
                  <p className="text-base sm:text-lg font-bold text-red-600">
                    {formatBRL(gastoAnualEstimado || 0)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm mb-3">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">
                    Valor pago no armário
                  </p>
                  <p className="font-semibold">
                    {formatBRL(valorPagoArmario || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">
                    Se vendesse tudo hoje
                  </p>
                  <p className="font-semibold text-emerald-600">
                    {formatBRL(valorRevenda || 0)}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Hoje, aproximadamente{' '}
                <span className="font-semibold text-slate-700">
                  {formatBRL(perdaFin)}
                </span>{' '}
                estão parados em roupa. Trocas bem feitas devolvem uma parte disso
                pra você.
              </p>
              <div className="mt-2">
                <ProgressBar
                  value={Math.min(piecesPerMonth, 30)}
                  max={30}
                  color="bg-gradient-to-r from-green-400 via-yellow-400 to-red-500"
                  label="Termômetro de consumo"
                />
                <p className="text-[11px] text-slate-500 mt-2">{consumoPerfil}</p>
              </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card
                title="O Grande Vilão de Encalhe"
                icon={<AlertTriangle />}
                color="orange"
                delay={150}
              >
                <div className="text-center py-2 text-sm">
                  <div className="text-3xl mb-1">👻</div>
                  <p className="font-bold text-slate-800 leading-tight">
                    {ghostItem}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Campeão de ficar parado nesta fase do {nomeCurto}.
                  </p>
                </div>
              </Card>

              <Card
                title="Peças de Instagram (1 uso)"
                icon={<Tag />}
                color="purple"
                delay={200}
              >
                <div className="flex items-center gap-3 text-xs sm:text-sm">
                  <div className="bg-purple-100 p-3 rounded-full text-purple-600 font-bold text-lg min-w-[52px] text-center">
                    {instagramPieces}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      Peças de “foto” no armário
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Estimamos que cerca de {instagramPieces} peças foram usadas 0 ou
                      1 vez.
                    </p>
                    <p className="text-[11px] font-semibold text-purple-700 mt-2">
                      Custo afundado: {formatBRL(instagramPieces * averagePrice)}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* COLUNA 3-4: tempo, eco, armário no tempo, mito */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <Card
              title="Relógio da Mancha"
              icon={<Droplets />}
              color="blue"
              delay={100}
            >
              <div className="flex items-center justify-between mb-3 text-xs sm:text-sm">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">
                    Risco atual
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-blue-600">
                    {manchaProb}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">
                    Vilão da fase
                  </p>
                  <p className="text-sm sm:text-base font-bold text-slate-700">
                    {manchaVilao}
                  </p>
                </div>
              </div>
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden relative">
                <div
                  className="absolute top-0 bottom-0 left-0 bg-blue-500 transition-all duration-1000"
                  style={{ width: `${manchaProb}%` }}
                />
                <div className="absolute top-0 bottom-0 left-[25%] border-r border-white/50 w-1" />
                <div className="absolute top-0 bottom-0 left-[50%] border-r border-white/50 w-1" />
                <div className="absolute top-0 bottom-0 left-[75%] border-r border-white/50 w-1" />
              </div>
              <p className="text-[11px] text-center mt-2 text-slate-400">
                Quanto maior a barra, mais neutras e “giráveis” as roupas precisam
                ser (adeus branco em festa infantil).
              </p>
            </Card>

            <Card
              title="Impacto Ambiental do Armário"
              icon={<Leaf />}
              color="green"
              delay={180}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-3 bg-white rounded-xl border border-emerald-100 p-3 shadow-sm">
                  <div className="text-2xl">🚿</div>
                  <div>
                    <p className="text-xl font-bold text-slate-800">
                      {ecoBanhos} banhos
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Equivalente de água usada para produzir as roupas atuais.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white rounded-xl border border-emerald-100 p-3 shadow-sm">
                  <div className="text-2xl">🍾</div>
                  <div>
                    <p className="text-xl font-bold text-slate-800">
                      {ecoGarrafas} garrafas
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Resíduo plástico equivalente se tudo fosse poliéster.
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-3 bg-emerald-100 text-emerald-800 text-[11px] p-2 rounded-lg text-center font-medium">
                ♻️ Cada peça que gira (troca, doa, revende) tira um pouco dessa conta
                da sua casa e do planeta.
              </p>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card
                title="Armário no Tempo"
                icon={<History />}
                color="pink"
                delay={220}
              >
                <div className="flex flex-col items-center py-2 text-xs sm:text-sm">
                  <Clock className="w-7 h-7 text-pink-300 mb-2" />
                  <p className="font-bold text-center">
                    {ageMonths < 12 ? 'Viajante do Futuro' : 'Museu do Passado'}
                  </p>
                  <p className="text-[11px] text-center text-slate-500 mt-1">
                    {ageMonths < 12
                      ? 'Tem roupa grande demais guardada esperando o dia chegar.'
                      : 'Tem muita roupa pequena guardada que já poderia girar.'}
                  </p>
                </div>
              </Card>

              <Card
                title="Mito ou Verdade"
                icon={<HelpCircle />}
                color="slate"
                delay={260}
              >
                <p className="text-xs font-medium text-slate-600 italic">
                  “Roupa usada tem energia ruim?”
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <p className="text-xs font-bold text-green-700">Mito total.</p>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Energia ruim é boleto vencido. Roupa lavada é roupa nova. Roupa
                  girada tem energia de comunidade e sustentabilidade.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* APEGO & PERFIL DIVERTIDO (mais lúdico) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <Card
            title="Mapa de Apego & Memória"
            icon={<Heart />}
            color="pink"
            delay={100}
          >
            <div className="text-xs sm:text-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-500">
                  Peças guardadas “porque tem história”
                </span>
                <span className="font-bold text-pink-600">
                  {attachmentPieces} peças
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-1">
                <div
                  className="h-full bg-pink-500 transition-all"
                  style={{
                    width: `${Math.min(
                      (attachmentPieces / Math.max(wardrobeSize, 1)) * 100 * 2,
                      100,
                    )}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mb-2">{apegoNivel}</p>

              {attachmentPieces > 0 && (
                <div className="mt-2 rounded-xl bg-pink-50 border border-pink-100 p-3 text-[11px] text-slate-700 flex gap-3">
                  <ToyBrick className="w-5 h-5 text-pink-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-pink-700 mb-0.5">
                      Ritual sugerido
                    </p>
                    <p>
                      Escolha <strong>3 peças</strong> pra guardar “pra sempre” e
                      coloque o resto em modo <strong>girar</strong>. Se pensa em ter
                      mais {filhosEstimados} filho(s), foque em casacos, jeans e
                      pijamas neutros.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card
            title="Perfil de Consumo da Casa"
            icon={<Store />}
            color="slate"
            delay={140}
          >
            <div className="text-xs sm:text-sm space-y-2">
              <p>
                Hoje você compra em média{' '}
                <span className="font-semibold">{piecesPerMonth} peça(s)</span> por
                mês, pagando cerca de{' '}
                <span className="font-semibold">
                  {formatBRL(averagePrice || 0)}
                </span>{' '}
                em cada.
              </p>
              <p className="font-semibold mt-1">{consumoPerfil}</p>
              <p className="text-[11px] text-slate-500">
                Quanto mais consciente for a próxima compra, mais leve fica o
                relatório do próximo Dossiê.
              </p>
            </div>
          </Card>

          <Card
            title="Frase de Mãe que Mora em Você"
            icon={<Quote />}
            color="yellow"
            delay={180}
          >
            <FrasesWidget />
          </Card>
        </section>

        {/* CTA FINAL */}
        <section className="bg-slate-900 rounded-3xl p-6 sm:p-8 md:p-10 text-center text-white relative overflow-hidden animate-in fade-in duration-1000">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black">
              Não deixe esses números parados no cabide.
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Agora que você viu o diagnóstico do armário do {nomeCurto}, transforme
              peças paradas em roupas úteis para outra criança — sem gastar nada a
              mais.
            </p>
            <button className="bg-white text-slate-900 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base hover:bg-slate-100 transition-transform hover:scale-105 shadow-xl inline-flex items-center gap-2">
              Começar a Girar Agora <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {/* Background decorativo */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-6 left-6 w-24 h-24 sm:w-32 sm:h-32 bg-pink-500 rounded-full blur-3xl" />
            <div className="absolute bottom-6 right-6 w-40 h-40 sm:w-56 sm:h-56 bg-purple-500 rounded-full blur-3xl" />
          </div>
        </section>
      </main>
    </div>
  );
}
