-- Required Supabase migration for new lote flow + profile email consistency
-- Safe to run multiple times (idempotent-style checks where possible)

BEGIN;

-- 1) Auth/profile consistency
-- Passwords, reset tokens and recovery expiration are managed by Supabase Auth.
-- The public table stores only profile data needed by the app.
CREATE TABLE IF NOT EXISTS public.perfis (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE,
    nome text,
    telefone text,
    documento text,
    tipo_perfil text DEFAULT 'User',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.perfis
    ADD COLUMN IF NOT EXISTS email text,
    ADD COLUMN IF NOT EXISTS nome text,
    ADD COLUMN IF NOT EXISTS telefone text,
    ADD COLUMN IF NOT EXISTS documento text,
    ADD COLUMN IF NOT EXISTS tipo_perfil text DEFAULT 'User',
    ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS idx_perfis_email_unique ON public.perfis (lower(email));

CREATE OR REPLACE FUNCTION public.set_perfis_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_perfis_updated_at ON public.perfis;
CREATE TRIGGER trg_set_perfis_updated_at
BEFORE UPDATE ON public.perfis
FOR EACH ROW
EXECUTE FUNCTION public.set_perfis_updated_at();

CREATE OR REPLACE FUNCTION public.sync_profile_from_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.perfis (
        id,
        email,
        nome,
        telefone,
        documento,
        tipo_perfil
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.raw_user_meta_data ->> 'name'),
        NEW.raw_user_meta_data ->> 'telefone',
        NEW.raw_user_meta_data ->> 'documento',
        COALESCE(NEW.raw_user_meta_data ->> 'perfil', 'User')
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        nome = COALESCE(EXCLUDED.nome, public.perfis.nome),
        telefone = COALESCE(EXCLUDED.telefone, public.perfis.telefone),
        documento = COALESCE(EXCLUDED.documento, public.perfis.documento),
        tipo_perfil = COALESCE(EXCLUDED.tipo_perfil, public.perfis.tipo_perfil);

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_from_auth ON auth.users;
CREATE TRIGGER trg_sync_profile_from_auth
AFTER INSERT OR UPDATE OF email, raw_user_meta_data ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_from_auth();

-- 2) Lotes: new fields used by frontend
ALTER TABLE public.lotes
    ADD COLUMN IF NOT EXISTS tipo_material text,
    ADD COLUMN IF NOT EXISTS local_lote text,
    ADD COLUMN IF NOT EXISTS fotos_urls text[],
    ADD COLUMN IF NOT EXISTS descricao_resumida text,
    ADD COLUMN IF NOT EXISTS descricao_completa text,
    ADD COLUMN IF NOT EXISTS numero_itens integer,
    ADD COLUMN IF NOT EXISTS materiais_lote text[],
    ADD COLUMN IF NOT EXISTS comprador_email text,
    ADD COLUMN IF NOT EXISTS comprado_em timestamptz,
    ADD COLUMN IF NOT EXISTS finalizado_em timestamptz,
    ADD COLUMN IF NOT EXISTS entregue_em timestamptz,
    ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DO $$
DECLARE
    empresa_id_type text;
BEGIN
    SELECT pg_catalog.format_type(a.atttypid, a.atttypmod)
    INTO empresa_id_type
    FROM pg_attribute a
    WHERE a.attrelid = 'public.lotes'::regclass
      AND a.attname = 'empresa_id'
      AND NOT a.attisdropped;

    IF empresa_id_type IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.lotes ADD COLUMN IF NOT EXISTS comprador_empresa_id %s', empresa_id_type);
    END IF;
END $$;

-- 3) Backfill from legacy data
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

-- 4) Ensure required defaults for new data
ALTER TABLE public.lotes
    ALTER COLUMN tipo_material SET DEFAULT 'Misto',
    ALTER COLUMN fotos_urls SET DEFAULT ARRAY[]::text[],
    ALTER COLUMN materiais_lote SET DEFAULT ARRAY[]::text[];

-- Keep categoria for backward compatibility but enforce sync by default fill
UPDATE public.lotes
SET categoria = COALESCE(categoria, tipo_material, 'Misto')
WHERE categoria IS NULL;

-- 5) Data constraints
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

-- 6) Performance indexes
CREATE INDEX IF NOT EXISTS idx_lotes_empresa_id ON public.lotes (empresa_id);
CREATE INDEX IF NOT EXISTS idx_lotes_comprador_email ON public.lotes (comprador_email);
CREATE INDEX IF NOT EXISTS idx_lotes_status ON public.lotes (status);
CREATE INDEX IF NOT EXISTS idx_lotes_tipo_material ON public.lotes (tipo_material);
CREATE INDEX IF NOT EXISTS idx_lotes_created_at ON public.lotes (created_at DESC);

-- 7) Keep updated_at fresh
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

-- 8) Purchase state helper
CREATE OR REPLACE FUNCTION public.mark_lote_as_purchased(
    lote_id_input bigint,
    comprador_empresa_id_input text,
    comprador_email_input text
)
RETURNS public.lotes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    updated_lote public.lotes;
    empresa_id_type text;
BEGIN
    SELECT pg_catalog.format_type(a.atttypid, a.atttypmod)
    INTO empresa_id_type
    FROM pg_attribute a
    WHERE a.attrelid = 'public.lotes'::regclass
      AND a.attname = 'empresa_id'
      AND NOT a.attisdropped;

    IF empresa_id_type = 'uuid' THEN
        EXECUTE '
            UPDATE public.lotes
            SET status = ''entregue'',
                comprador_empresa_id = $2::uuid,
                comprador_email = $3,
                comprado_em = now(),
                finalizado_em = now(),
                entregue_em = now()
            WHERE id = $1
              AND status = ''disponivel''
              AND empresa_id <> $2::uuid
            RETURNING *
        ' INTO updated_lote USING lote_id_input, comprador_empresa_id_input, comprador_email_input;
    ELSE
        EXECUTE '
            UPDATE public.lotes
            SET status = ''entregue'',
                comprador_empresa_id = $2::bigint,
                comprador_email = $3,
                comprado_em = now(),
                finalizado_em = now(),
                entregue_em = now()
            WHERE id = $1
              AND status = ''disponivel''
              AND empresa_id <> $2::bigint
            RETURNING *
        ' INTO updated_lote USING lote_id_input, comprador_empresa_id_input, comprador_email_input;
    END IF;

    RETURN updated_lote;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_lote_as_purchased(bigint, text, text) TO authenticated;

-- 9) Delete account and owned lots atomically
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id uuid := auth.uid();
    current_email text;
    empresa_id_type text;
BEGIN
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario nao autenticado.';
    END IF;

    SELECT email INTO current_email
    FROM auth.users
    WHERE id = current_user_id;

    DELETE FROM storage.objects
    WHERE bucket_id = 'lotes-fotos'
      AND name IN (
          SELECT DISTINCT split_part(url, '/lotes-fotos/', 2)
          FROM (
              SELECT unnest(COALESCE(l.fotos_urls, ARRAY[]::text[])) AS url
              FROM public.lotes l
              JOIN public.empresas e ON e.id = l.empresa_id
              WHERE lower(e.email) = lower(current_email)
              UNION ALL
              SELECT l.foto_url AS url
              FROM public.lotes l
              JOIN public.empresas e ON e.id = l.empresa_id
              WHERE lower(e.email) = lower(current_email)
                AND l.foto_url IS NOT NULL
          ) lote_urls
          WHERE url IS NOT NULL
            AND url LIKE '%/lotes-fotos/%'
      );

    DELETE FROM public.lotes
    USING public.empresas e
    WHERE public.lotes.empresa_id = e.id
      AND lower(e.email) = lower(current_email);

    SELECT pg_catalog.format_type(a.atttypid, a.atttypmod)
    INTO empresa_id_type
    FROM pg_attribute a
    WHERE a.attrelid = 'public.lotes'::regclass
      AND a.attname = 'comprador_empresa_id'
      AND NOT a.attisdropped;

    IF empresa_id_type IS NOT NULL THEN
        EXECUTE '
            UPDATE public.lotes
            SET comprador_empresa_id = NULL
            WHERE comprador_email = $1
        ' USING current_email;
    END IF;

    DELETE FROM public.empresas
    WHERE lower(email) = lower(current_email);

    DELETE FROM public.perfis
    WHERE id = current_user_id;

    DELETE FROM auth.users
    WHERE id = current_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;

-- 10) Profile types for Business/User transition
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
