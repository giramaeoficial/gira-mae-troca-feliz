import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, BookOpen, Tag } from 'lucide-react';

export default function BlogHeader() {
  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/blog" className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>Blog GiraMãe</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm hover:text-primary transition-colors">
              <Home className="h-4 w-4 inline mr-1" />
              Início
            </Link>
            <Link to="/blog" className="text-sm hover:text-primary transition-colors">
              Todos os Posts
            </Link>
            <Link to="/blog/categorias" className="text-sm hover:text-primary transition-colors">
              <Tag className="h-4 w-4 inline mr-1" />
              Categorias
            </Link>
          </nav>

          <Button asChild>
            <Link to="/">Voltar para GiraMãe</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
