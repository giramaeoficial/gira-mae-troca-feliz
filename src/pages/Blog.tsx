import { useState } from 'react';
import { usePosts } from '@/blog/hooks/usePosts';
import { useCategories } from '@/blog/hooks/useCategories';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import BlogLayout from '@/blog/components/layout/BlogLayout';
import BlogSidebar from '@/blog/components/layout/BlogSidebar';
import CategoryBadge from '@/blog/components/ui/CategoryBadge';
import PostMeta from '@/blog/components/ui/PostMeta';

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { categories } = useCategories();
  const { posts, loading, hasMore } = usePosts(
    {
      status: 'published',
      search: searchQuery || undefined,
      categoryId: selectedCategory || undefined,
    },
    { page, pageSize: 12 }
  );

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <BlogLayout sidebar={<BlogSidebar />}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16 -mx-4 mb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Blog GiraMãe</h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Dicas práticas sobre maternidade, economia e sustentabilidade
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Search & Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6 space-y-4">
            {/* Search */}
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Todas
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Nenhum post encontrado</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
                  <CardHeader>
                    {post.category && (
                      <CategoryBadge category={post.category} className="mb-2" />
                    )}
                    <Link to={`/blog/${post.slug}`}>
                      <h3 className="text-xl font-bold hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
                  </CardContent>

                  <CardFooter>
                    <PostMeta 
                      readingTimeMinutes={post.readingTimeMinutes}
                      viewCount={post.viewCount}
                      date={post.publishedAt || post.createdAt}
                      variant="compact"
                    />
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center">
                <Button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loading}
                  size="lg"
                  variant="outline"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Carregar mais posts
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </BlogLayout>
  );
}
