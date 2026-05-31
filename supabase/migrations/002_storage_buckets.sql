-- ============================================================
-- RenoV Pilot — Migration 002 : Supabase Storage
-- ============================================================
-- Deux buckets privés :
--   project-documents  (PDFs, plans, devis, etc.)  max 50 MB
--   project-photos     (JPEG, PNG, HEIC, etc.)      max 20 MB
--
-- Structure des chemins dans chaque bucket :
--   {owner_id}/{project_id}/{document_id}/{nom_original}
--
-- L'ownership est vérifié via split_part(name, '/', 1) = auth.uid()
-- ============================================================

-- ============================================================
-- 1. BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'project-documents',
    'project-documents',
    false,
    52428800, -- 50 MB
    ARRAY[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/webp'
    ]
  ),
  (
    'project-photos',
    'project-photos',
    false,
    20971520, -- 20 MB
    ARRAY[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif'
    ]
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. POLICIES STORAGE (storage.objects)
--
-- Règle : le premier composant du chemin (avant le 1er '/') DOIT
-- correspondre à auth.uid().
-- Exemple valide   : "a1b2c3d4-.../proj-id.../doc-id.../plan.pdf"
-- Exemple invalide : "autre-user-id/.../..."
-- ============================================================

-- ── project-documents ──

CREATE POLICY "docs_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'project-documents'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "docs_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'project-documents'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "docs_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'project-documents'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "docs_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'project-documents'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

-- ── project-photos ──

CREATE POLICY "photos_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'project-photos'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "photos_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'project-photos'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "photos_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'project-photos'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "photos_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'project-photos'
    AND split_part(name, '/', 1) = auth.uid()::text
  );
