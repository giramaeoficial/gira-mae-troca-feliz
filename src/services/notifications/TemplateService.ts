
import { supabase } from '@/integrations/supabase/client';
import { NotificationTemplate, NotificationType } from '@/types/notifications';

export class TemplateService {
  async getTemplate(tipo: NotificationType): Promise<NotificationTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('tipo', tipo)
        .eq('ativo', true)
        .single();

      if (error) {
        console.error('Erro ao buscar template:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar template:', error);
      return null;
    }
  }

  processTemplate(template: NotificationTemplate, variables: Record<string, any>): { title: string; body: string } {
    let processedTitle = template.titulo;
    let processedBody = template.corpo;

    // Substituir variáveis no formato {{variavel}}
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      const stringValue = String(value);
      
      processedTitle = processedTitle.replace(new RegExp(placeholder, 'g'), stringValue);
      processedBody = processedBody.replace(new RegExp(placeholder, 'g'), stringValue);
    });

    return {
      title: processedTitle,
      body: processedBody
    };
  }
}
