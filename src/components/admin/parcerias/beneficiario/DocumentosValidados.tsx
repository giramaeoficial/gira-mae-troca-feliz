import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download } from 'lucide-react';
import type { Documento } from '@/types/parcerias';
import EmptyState from '../shared/EmptyState';

interface DocumentosValidadosProps {
  documentos: Documento[];
  onDownload?: (documento: Documento) => void;
}

export default function DocumentosValidados({ documentos, onDownload }: DocumentosValidadosProps) {
  if (!documentos || documentos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documentos Validados</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState 
            icon={FileText}
            titulo="Nenhum documento"
            mensagem="Este beneficiário ainda não enviou documentos"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentos Validados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documentos.map((doc, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="h-5 w-5 shrink-0 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{doc.nome}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs">{doc.tipo}</Badge>
                    {doc.size && <span>{(doc.size / 1024).toFixed(2)} KB</span>}
                  </div>
                </div>
              </div>
              {onDownload && (
                <Button size="sm" variant="outline" onClick={() => onDownload(doc)}>
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
