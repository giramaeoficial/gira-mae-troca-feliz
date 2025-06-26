
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useTiposTamanho } from '@/hooks/useTamanhosPorCategoria';

interface Categoria {
  value: string;
  label: string;
}

interface ItemCategorizationProps {
  form: UseFormReturn<any>;
  categorias: Categoria[];
  subcategorias: {
    [key: string]: Categoria[];
  };
}

const ItemCategorization = ({ form, categorias, subcategorias }: ItemCategorizationProps) => {
  const categoria = form.watch('categoria');
  const { data: tiposTamanho } = useTiposTamanho(categoria);

  return (
    <>
      <FormField
        control={form.control}
        name="categoria"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoria</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categorias.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {categoria && subcategorias[categoria] && (
        <FormField
          control={form.control}
          name="subcategoria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subcategoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a subcategoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subcategorias[categoria].map((subcat) => (
                    <SelectItem key={subcat.value} value={subcat.value}>{subcat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="genero"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Gênero</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o gênero" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="menina">Menina</SelectItem>
                <SelectItem value="menino">Menino</SelectItem>
                <SelectItem value="unissex">Unissex</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {tiposTamanho && Object.keys(tiposTamanho).length > 0 && (
        <FormField
          control={form.control}
          name="tamanho"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tamanho</FormLabel>
              <Select onValueChange={(value) => {
                const selectedTamanho = Object.values(tiposTamanho)
                  .flat()
                  .find(tamanho => tamanho.valor === value);
                field.onChange(selectedTamanho || null);
              }} defaultValue={field.value?.valor}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(tiposTamanho)
                    .flat()
                    .sort((a, b) => {
                      const aNum = a.valor.match(/\d+/);
                      const bNum = b.valor.match(/\d+/);

                      if (aNum && bNum) {
                        return parseInt(aNum[0]) - parseInt(bNum[0]);
                      }

                      return a.valor.localeCompare(b.valor);
                    })
                    .map((tamanho) => (
                      <SelectItem key={tamanho.valor} value={tamanho.valor}>
                        {tamanho.label_display}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};

export default ItemCategorization;
