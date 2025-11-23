import { z } from 'zod';

export const postFormSchema = z.object({
  title: z.string().min(10, 'Título deve ter no mínimo 10 caracteres').max(100, 'Título muito longo (máx 100 caracteres)'),
  slug: z.string().min(5).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido'),
  excerpt: z.string().min(100, 'Resumo deve ter no mínimo 100 caracteres').max(160, 'Resumo muito longo (máx 160 caracteres)'),
  content: z.string().min(1000, 'Conteúdo deve ter no mínimo 1000 palavras (≈5000 caracteres)'),
  categoryId: z.string().optional(),
  status: z.enum(['draft', 'published', 'scheduled', 'archived']),
  seoTitle: z.string().min(1, 'Título SEO obrigatório').max(60, 'Máximo 60 caracteres').optional().or(z.literal('')),
  seoDescription: z.string().min(1, 'Descrição SEO obrigatória').max(160, 'Máximo 160 caracteres').optional().or(z.literal('')),
  featuredImage: z.string().url('URL de imagem inválida').optional().or(z.literal('')),
});

export type PostFormData = z.infer<typeof postFormSchema>;
