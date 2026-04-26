-- Required Supabase migration for new lote flow + profile email consistency
-- Safe to run multiple times (idempotent-style checks where possible)

BEGIN;

-- 1) Lotes: new fields used by frontend
ALTER TABLE public.lotes
    ADD COLUMN IF NOT EXISTS tipo_material text,
    ADD COLUMN IF NOT EXISTS local_lote text,
    ADD COLUMN IF NOT EXISTS fotos_urls text[],
    ADD COLUMN IF NOT EXISTS descricao_resumida text,
    ADD COLUMN IF NOT EXISTS descricao_completa text,
    ADD COLUMN IF NOT EXISTS numero_itens integer,
    ADD COLUMN IF NOT EXISTS materiais_lote text[],
    ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2) Backfill from legacy data
UPDATE public.lotes
SET tipo_material = categoria
WHERE tipo_material IS NULL;

UPDATE public.lotes
SET local_lote = concat_ws(', ', cidade, estado)
WHERE local_lote IS NULL;

UPDATE public.lotes
SET fotos_urls = ARRAY[foto_url]
WHERE (fotos_urls IS NULL OR array_length(fotos_urls, 1) IS NULL)
  AND foto_url IS NOT NULL;

UPDATE public.lotes
SET descricao_completa = descricao
WHERE descricao_completa IS NULL
  AND descricao IS NOT NULL;

UPDATE public.lotes
SET descricao_resumida = left(coalesce(descricao_completa, descricao, ''), 180)
WHERE descricao_resumida IS NULL;

UPDATE public.lotes
SET materiais_lote = ARRAY[tipo_material]
WHERE (materiais_lote IS NULL OR array_length(materiais_lote, 1) IS NULL)
  AND tipo_material IS NOT NULL;

-- 3) Ensure required defaults for new data
ALTER TABLE public.lotes
    ALTER COLUMN tipo_material SET DEFAULT 'Misto',
    ALTER COLUMN fotos_urls SET DEFAULT ARRAY[]::text[],
    ALTER COLUMN materiais_lote SET DEFAULT ARRAY[]::text[];

-- Keep categoria for backward compatibility but enforce sync by default fill
UPDATE public.lotes
SET categoria = COALESCE(categoria, tipo_material, 'Misto')
WHERE categoria IS NULL;

-- 4) Data constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'lotes_numero_itens_check'
    ) THEN
        ALTER TABLE public.lotes
            ADD CONSTRAINT lotes_numero_itens_check CHECK (numero_itens IS NULL OR numero_itens > 0);
    END IF;
END $$;

-- 5) Performance indexes
CREATE INDEX IF NOT EXISTS idx_lotes_empresa_id ON public.lotes (empresa_id);
CREATE INDEX IF NOT EXISTS idx_lotes_status ON public.lotes (status);
CREATE INDEX IF NOT EXISTS idx_lotes_tipo_material ON public.lotes (tipo_material);
CREATE INDEX IF NOT EXISTS idx_lotes_created_at ON public.lotes (created_at DESC);

-- 6) Keep updated_at fresh
CREATE OR REPLACE FUNCTION public.set_lotes_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_lotes_updated_at ON public.lotes;
CREATE TRIGGER trg_set_lotes_updated_at
BEFORE UPDATE ON public.lotes
FOR EACH ROW
EXECUTE FUNCTION public.set_lotes_updated_at();

-- 7) Profile types for Business/User transition
ALTER TABLE public.perfis
    DROP CONSTRAINT IF EXISTS perfis_tipo_perfil_check;

ALTER TABLE public.perfis
    ADD CONSTRAINT perfis_tipo_perfil_check
    CHECK (tipo_perfil = ANY (ARRAY['User'::text, 'Business'::text, 'Moderador'::text, 'Usuario'::text, 'Parceiro'::text]));

UPDATE public.perfis
SET tipo_perfil = 'User'
WHERE tipo_perfil = 'Usuario';

UPDATE public.perfis
SET tipo_perfil = 'Business'
WHERE tipo_perfil = 'Parceiro';

-- 8) Email editable flow via auth.users -> perfis sync
-- When user email changes in Supabase Auth, profile table stays synced.
CREATE OR REPLACE FUNCTION public.sync_profile_email_from_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.perfis
    SET email = NEW.email
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_email_from_auth ON auth.users;
CREATE TRIGGER trg_sync_profile_email_from_auth
AFTER UPDATE OF email ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_email_from_auth();

COMMIT;

-- Optional RLS template (uncomment and adapt if you are enforcing RLS now)
-- ALTER TABLE public.lotes ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY lotes_select_disponivel ON public.lotes
-- FOR SELECT
-- USING (status = 'disponivel' OR auth.uid()::text = empresa_id::text);
-- CREATE POLICY lotes_update_owner ON public.lotes
-- FOR UPDATE
-- USING (auth.uid()::text = empresa_id::text);
-- CREATE POLICY lotes_delete_owner ON public.lotes
-- FOR DELETE
-- USING (auth.uid()::text = empresa_id::text);
