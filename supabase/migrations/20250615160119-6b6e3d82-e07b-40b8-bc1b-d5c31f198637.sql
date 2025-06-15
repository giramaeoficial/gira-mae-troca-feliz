
-- Verificar constraints existentes primeiro e adicionar apenas as que não existem

-- Adicionar foreign key para reservas_usuario_item apenas se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'reservas_usuario_item_fkey' 
        AND table_name = 'reservas'
    ) THEN
        ALTER TABLE public.reservas 
        ADD CONSTRAINT reservas_usuario_item_fkey 
        FOREIGN KEY (usuario_item) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Adicionar foreign key para indicacoes_indicador_id apenas se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'indicacoes_indicador_id_fkey' 
        AND table_name = 'indicacoes'
    ) THEN
        ALTER TABLE public.indicacoes 
        ADD CONSTRAINT indicacoes_indicador_id_fkey 
        FOREIGN KEY (indicador_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Adicionar foreign key para indicacoes_indicado_id apenas se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'indicacoes_indicado_id_fkey' 
        AND table_name = 'indicacoes'
    ) THEN
        ALTER TABLE public.indicacoes 
        ADD CONSTRAINT indicacoes_indicado_id_fkey 
        FOREIGN KEY (indicado_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Adicionar foreign key para transacoes apenas se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'transacoes_user_id_fkey' 
        AND table_name = 'transacoes'
    ) THEN
        ALTER TABLE public.transacoes 
        ADD CONSTRAINT transacoes_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;
