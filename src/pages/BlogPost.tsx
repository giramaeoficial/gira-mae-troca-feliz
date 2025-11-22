import { useParams, Link } from 'react-router-dom';
import { usePost } from '@/blog/hooks/usePost';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Clock, Eye, Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/blog/lib/utils/formatDate';
import ReactMarkdown from 'react-markdown';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { post, loading, error } = usePost(slug || '');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Post não encontrado</h1>
        <p className="text-muted-foreground mb-6">
          O post que você está procurando não existe ou foi removido.
        </p>
        <Button asChild>
          <Link to="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Blog
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" asChild>
          <Link to="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Blog
          </Link>
        </Button>
      </div>

      {/* Content Container */}
      <article className="container mx-auto px-4 pb-16 max-w-4xl">
        {/* Category Badge */}
        {post.category && (
          <Badge className="mb-4">{post.category.name}</Badge>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          {post.title}
        </h1>

        {/* Excerpt */}
        <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b">
          {post.author && (
            <div className="flex items-center gap-2">
              <span className="font-medium">{post.author.name}</span>
            </div>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(post.publishedAt || post.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {post.readingTimeMinutes} min de leitura
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {post.viewCount} visualizações
          </span>
        </div>

        {/* Content */}
        <Card className="p-8">
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </Card>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag.id} variant="outline">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
