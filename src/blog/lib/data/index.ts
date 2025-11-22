// Data layer - Repository pattern
import { BlogRepository } from '@/blog/types';
import { MockBlogRepository } from './mockRepository';

let repository: BlogRepository | null = null;

export function getBlogRepository(): BlogRepository {
  if (!repository) {
    // Por enquanto, sempre usa mock
    // No futuro, pode verificar env var para usar Supabase
    repository = new MockBlogRepository();
  }
  return repository;
}

export function resetBlogRepository() {
  repository = null;
}
