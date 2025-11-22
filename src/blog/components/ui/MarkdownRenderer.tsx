import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import '@/blog/styles/prose-giramae.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-giramae prose-lg max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
        img: ({ src, alt }) => (
          <img
            src={src}
            alt={alt || ''}
            className="rounded-lg shadow-lg my-6 w-full"
            loading="lazy"
          />
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-primary hover:underline font-medium"
            target={href?.startsWith('http') ? '_blank' : undefined}
            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            {children}
          </a>
        ),
        h1: ({ children }) => (
          <h1 className="text-4xl font-bold mt-8 mb-4 text-primary">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-3xl font-bold mt-8 mb-4 text-primary">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-2xl font-semibold mt-6 mb-3 text-primary">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-xl font-semibold mt-4 mb-2 text-primary">
            {children}
          </h4>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary bg-primary/5 pl-4 py-2 my-4 italic">
            {children}
          </blockquote>
        ),
        code: ({ className, children }) => {
          const isInline = !className;
          return isInline ? (
            <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono">
              {children}
            </code>
          ) : (
            <code className={className}>{children}</code>
          );
        },
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-2 my-4">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-2 my-4">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="ml-4">{children}</li>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-6">
            <table className="min-w-full divide-y divide-border">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2 bg-primary/10 text-left font-semibold">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 border-t border-border">
            {children}
          </td>
        ),
        hr: () => <hr className="my-8 border-border" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
