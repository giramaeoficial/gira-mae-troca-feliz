
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Search, Filter } from 'lucide-react';
import { useSimpleGeolocation } from '@/hooks/useSimpleGeolocation';
import { useConfigCategorias } from '@/hooks/useConfigCategorias';
import { useSubcategorias } from '@/hooks/useSubcategorias';
import { useItensInteligentes } from '@/hooks/useItensInteligentes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ItemCard } from '@/components/shared/ItemCard';

const BuscarItens = () => {
  const navigate = useNavigate();
  
  // Estados dos filtros
  const [busca, setBusca] = useState('');
  const [cidadeManual, setCidadeManual] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState('todas');
  const [categoria, setCategoria] = useState('todas');
  const [subcategoria, setSubcategoria] = useState('todas');
  const [genero, setGenero] = useState('todos');
  const [idadeTamanho, setIdadeTamanho] = useState('todos');
  const [precoRange, setPrecoRange] = useState([0, 200]);
  
  // Estado para mostrar filtros avançados
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false);
  
  // Geolocalização
  const { location, loading: geoLoading, error: geoError, detectarLocalizacao, limparLocalizacao } = useSimpleGeolocation();
  
  // Dados dos dropdowns
  const { configuracoes: categorias = [] } = useConfigCategorias();
  const { subcategorias: todasSubcategorias = [] } = useSubcategorias();
  
  // Filtrar subcategorias baseado na categoria selecionada
  const subcategoriasFiltradas = categoria !== 'todas' 
    ? todasSubcategorias.filter(sub => sub.categoria_pai === categoria)
    : [];

  // Estado para aplicar filtros
  const [filtrosAplicados, setFiltrosAplicados] = useState(false);
  
  // Buscar itens quando filtros são aplicados
  const locationForSearch = location || (cidadeManual ? { 
    cidade: cidadeManual, 
    estado: '',
    bairro: undefined 
  } : null);

  const { data: itens = [], isLoading } = useItensInteligentes({
    location: filtrosAplicados ? locationForSearch : null,
    categoria: filtrosAplicados && categoria !== 'todas' ? categoria : undefined,
    subcategoria: filtrosAplicados && subcategoria !== 'todas' ? subcategoria : undefined,
    busca: filtrosAplicados ? busca : undefined,
    precoMin: filtrosAplicados ? precoRange[0] : undefined,
    precoMax: filtrosAplicados ? precoRange[1] : undefined,
    ordem: 'recentes'
  });

  const handleAplicarFiltros = () => {
    setFiltrosAplicados(true);
  };

  const handleLimparFiltros = () => {
    setBusca('');
    setCidadeManual('');
    setTipoEntrega('todas');
    setCategoria('todas');
    setSubcategoria('todas');
    setGenero('todos');
    setIdadeTamanho('todos');
    setPrecoRange([0, 200]);
    limparLocalizacao();
    setFiltrosAplicados(false);
    setMostrarFiltrosAvancados(false);
  };

  const handleLocationClick = () => {
    if (location) {
      limparLocalizacao();
    } else {
      detectarLocalizacao();
    }
  };

  const toggleFiltrosAvancados = () => {
    setMostrarFiltrosAvancados(!mostrarFiltrosAvancados);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-3 text-lg font-medium">Buscar Itens</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Campo de busca com ícone de filtro */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Busque por vestido, carrinho, lego..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10 pr-12 h-12 text-base"
          />
          <button
            onClick={toggleFiltrosAvancados}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
          >
            <Filter className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Filtros Avançados - só aparecem quando clicado no ícone */}
        {mostrarFiltrosAvancados && (
          <>
            {/* Seção Localização */}
            <div>
              <h3 className="font-medium mb-3 text-gray-700 uppercase text-sm tracking-wide">LOCALIZAÇÃO</h3>
              
              <Input
                type="text"
                placeholder="Digite sua cidade..."
                value={cidadeManual}
                onChange={(e) => setCidadeManual(e.target.value)}
                className="w-full h-12 text-base mb-3"
              />
              
              <Button
                onClick={handleLocationClick}
                disabled={geoLoading}
                variant="outline"
                className="w-full h-12 flex items-center justify-start"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {geoLoading ? 'Detectando localização...' : 
                 location ? `✅ ${location.cidade}, ${location.estado} - Alterar` :
                 '📍 Usar Minha Localização Atual'}
              </Button>
              
              {geoError && (
                <p className="text-red-500 text-sm mt-2">{geoError}</p>
              )}
            </div>

            {/* Tipo de Entrega */}
            <div>
              <h3 className="font-medium mb-3 text-gray-700 uppercase text-sm tracking-wide">TIPO DE ENTREGA</h3>
              <Select value={tipoEntrega} onValueChange={setTipoEntrega}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as opções</SelectItem>
                  <SelectItem value="presencial">Entrega presencial</SelectItem>
                  <SelectItem value="correios">Pelos Correios</SelectItem>
                  <SelectItem value="motoboy">Motoboy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Categoria e Subcategoria */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-3 text-gray-700 uppercase text-sm tracking-wide">CATEGORIA</h3>
                <Select value={categoria} onValueChange={(value) => {
                  setCategoria(value);
                  setSubcategoria('todas'); // Reset subcategoria quando categoria muda
                }}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {categorias && categorias.map((cat) => (
                      <SelectItem key={cat.codigo} value={cat.nome}>
                        {cat.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="font-medium mb-3 text-gray-700 uppercase text-sm tracking-wide">SUBCATEGORIA</h3>
                <Select 
                  value={subcategoria} 
                  onValueChange={setSubcategoria}
                  disabled={categoria === 'todas' || subcategoriasFiltradas.length === 0}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {subcategoriasFiltradas && subcategoriasFiltradas.map((sub) => (
                      <SelectItem key={sub.id} value={sub.nome}>
                        {sub.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Idade/Tamanho e Gênero */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-3 text-gray-700 uppercase text-sm tracking-wide">IDADE/TAMANHO</h3>
                <Select value={idadeTamanho} onValueChange={setIdadeTamanho}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="0-6m">0-6 meses</SelectItem>
                    <SelectItem value="6-12m">6-12 meses</SelectItem>
                    <SelectItem value="1-2a">1-2 anos</SelectItem>
                    <SelectItem value="3-4a">3-4 anos</SelectItem>
                    <SelectItem value="5-6a">5-6 anos</SelectItem>
                    <SelectItem value="7-8a">7-8 anos</SelectItem>
                    <SelectItem value="9-10a">9-10 anos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="font-medium mb-3 text-gray-700 uppercase text-sm tracking-wide">GÊNERO</h3>
                <Select value={genero} onValueChange={setGenero}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="menino">Menino</SelectItem>
                    <SelectItem value="menina">Menina</SelectItem>
                    <SelectItem value="unissex">Unissex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Faixa de Preço */}
            <div>
              <h3 className="font-medium mb-3 text-gray-700 uppercase text-sm tracking-wide">
                PREÇO: {precoRange[0]} - {precoRange[1]} Girinhas
              </h3>
              <div className="px-2">
                <Slider
                  value={precoRange}
                  onValueChange={setPrecoRange}
                  max={200}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleLimparFiltros}
                variant="outline"
                className="flex-1 h-12"
              >
                Limpar Filtros
              </Button>
              <Button
                onClick={handleAplicarFiltros}
                className="flex-1 h-12 bg-gradient-to-r from-primary to-pink-500"
              >
                Aplicar Filtros
              </Button>
            </div>
          </>
        )}

        {/* Resultados */}
        {filtrosAplicados && (
          <div className="pt-6">
            <h3 className="font-medium mb-4 text-gray-700">
              {isLoading ? 'Buscando...' : `${itens.length} itens encontrados`}
            </h3>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {itens.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
            
            {!isLoading && itens.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum item encontrado com os filtros aplicados.</p>
                <p className="text-sm mt-2">Tente ajustar os filtros para ver mais resultados.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuscarItens;
