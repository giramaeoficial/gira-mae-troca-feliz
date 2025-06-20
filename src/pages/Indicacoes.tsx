
import Header from "@/components/shared/Header";
import QuickNav from "@/components/shared/QuickNav";
import PaginaIndicacoes from "@/components/indicacoes/PaginaIndicacoes";

const Indicacoes = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
      <Header />
      <main className="flex-grow pb-32 md:pb-8">
        <PaginaIndicacoes />
      </main>
      <QuickNav />
    </div>
  );
};

export default Indicacoes;
