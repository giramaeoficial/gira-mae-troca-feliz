
-- Add missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS sobrenome text,
ADD COLUMN IF NOT EXISTS data_nascimento date;

-- Add unique constraint to cadastro_temp_data if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_user_step' 
        AND table_name = 'cadastro_temp_data'
    ) THEN
        ALTER TABLE cadastro_temp_data 
        ADD CONSTRAINT unique_user_step UNIQUE (user_id, step);
    END IF;
END $$;

-- Create the RPC functions for step data management
CREATE OR REPLACE FUNCTION save_step_data(p_step text, p_data jsonb)
RETURNS void AS $$
BEGIN
    INSERT INTO cadastro_temp_data (user_id, step, form_data)
    VALUES (auth.uid(), p_step, p_data)
    ON CONFLICT (user_id, step)
    DO UPDATE SET 
        form_data = EXCLUDED.form_data,
        updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_step_data(p_step text)
RETURNS jsonb AS $$
DECLARE
    result jsonb;
BEGIN
    SELECT form_data INTO result
    FROM cadastro_temp_data
    WHERE user_id = auth.uid() AND step = p_step;
    
    RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
