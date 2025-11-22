import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, BookOpen, Tag } from 'lucide-react';

export default function BlogHeader() {
  return (
    <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/blog" className="flex items-center gap-3 group">
            <img 
              src="/giramae_logo.png" 
              alt="GiraMãe" 
              className="h-10 transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-bold text-xl text-primary">GiraMãe</span>
              <span className="text-xs text-muted-foreground">Blog</span>
            </div>
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
