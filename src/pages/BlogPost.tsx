import { useParams, Link } from 'react-router-dom';
import { usePost } from '@/blog/hooks/usePost';
import { usePosts } from '@/blog/hooks/usePosts';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/blog/lib/utils/formatDate';
import ReactMarkdown from 'react-markdown';
import BlogLayout from '@/blog/components/layout/BlogLayout';
import CategoryBadge from '@/blog/components/ui/CategoryBadge';
import TagList from '@/blog/components/ui/TagList';
import PostMeta from '@/blog/components/ui/PostMeta';
import AuthorCard from '@/blog/components/ui/AuthorCard';
import RelatedPosts from '@/blog/components/ui/RelatedPosts';
import ShareButtons from '@/blog/components/ui/ShareButtons';
import TableOfContents from '@/blog/components/ui/TableOfContents';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { post, loading, error } = usePost(slug || '');
  const { posts: relatedPosts } = usePosts(
    { 
      status: 'published',
      categoryId: post?.categoryId 
    },
    { page: 1, pageSize: 4 }
  );

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
    <BlogLayout sidebar={<TableOfContents content={post.content} />}>
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link to="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Blog
          </Link>
        </Button>
      </div>

      {/* Content Container */}
      <article className="space-y-8">
        {/* Category Badge */}
        {post.category && (
          <CategoryBadge category={post.category} />
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          {post.title}
        </h1>

        {/* Excerpt */}
        <p className="text-xl text-muted-foreground">{post.excerpt}</p>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 pb-8 border-b">
          {post.author && (
            <div className="flex items-center gap-2">
              <span className="font-medium">{post.author.name}</span>
            </div>
          )}
          <PostMeta 
            readingTimeMinutes={post.readingTimeMinutes}
            viewCount={post.viewCount}
            date={post.publishedAt || post.createdAt}
          />
        </div>

        {/* Content */}
        <Card className="p-8">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </Card>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Tags:</h3>
            <TagList tags={post.tags} />
          </div>
        )}

        {/* Share Buttons */}
        <ShareButtons 
          title={post.title}
          url={`${window.location.origin}/blog/${post.slug}`}
          description={post.excerpt}
        />

        {/* Author Card */}
        {post.author && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Sobre o Autor</h3>
            <AuthorCard author={post.author} />
          </div>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <RelatedPosts posts={relatedPosts} currentPostId={post.id} />
        )}
      </article>
    </BlogLayout>
  );
}
