-- ============================================================
-- RenoV Pilot — Migration 001 : schéma complet
-- ============================================================
-- Ordre d'exécution : fonctions utilitaires → ENUMs → tables
-- (dans l'ordre des dépendances FK) → index → triggers → RLS
-- ============================================================

-- ============================================================
-- 0. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. FONCTION UTILITAIRE : updated_at automatique
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- 2. TYPES ENUM
-- Valeurs identiques aux union types TypeScript pour
-- une migration service → Supabase sans traduction.
-- ============================================================

DO $$ BEGIN CREATE TYPE project_status AS ENUM (
  'etude', 'travaux', 'termine', 'suspendu'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE lot_status AS ENUM (
  'a_etudier', 'devis_demande', 'devis_recu',
  'valide', 'en_cours', 'termine', 'bloque'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE task_status AS ENUM (
  'a_faire', 'en_cours', 'termine', 'bloque'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE priority AS ENUM (
  'basse', 'moyenne', 'haute', 'critique'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE artisan_status AS ENUM (
  'a_contacter', 'contacte', 'devis_recu', 'retenu', 'ecarte'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE budget_risk_level AS ENUM (
  'faible', 'moyen', 'eleve', 'critique'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE decision_status AS ENUM (
  'a_trancher', 'validee', 'abandonnee'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE document_category AS ENUM (
  'plans', 'devis', 'factures', 'photos',
  'declaration', 'etude_sol', 'notices', 'garanties'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE note_type AS ENUM (
  'decision', 'note', 'alerte'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE alert_level AS ENUM (
  'info', 'warning', 'critical'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE member_role AS ENUM (
  'owner', 'editor', 'viewer'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 3. PROFILES
-- Créé automatiquement via trigger sur auth.users.
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id         uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  text,
  email      text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Trigger auth → création automatique du profil à l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 4. PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id                  uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id            uuid           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                text           NOT NULL,
  project_type        text           NOT NULL DEFAULT '',
  surface_m2          integer,
  status              project_status NOT NULL DEFAULT 'etude',
  budget_target_cents integer        NOT NULL DEFAULT 0,
  start_date          date,
  -- Tableau ordonné de priorités libres (ex : contraintes du chantier).
  -- Reste en text[] pour MVP ; une table project_priorities pourra le
  -- remplacer quand le drag-and-drop sera implémenté.
  priorities          text[]         NOT NULL DEFAULT '{}',
  created_at          timestamptz    NOT NULL DEFAULT now(),
  updated_at          timestamptz    NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);

CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 5. PROJECT_MEMBERS
-- Table créée dès maintenant même si l'UI ne l'utilise pas encore.
-- Permet d'ajouter le partage de projet sans re-migrer le schéma RLS.
-- ============================================================
CREATE TABLE IF NOT EXISTS project_members (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        member_role NOT NULL DEFAULT 'viewer',
  invited_at  timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  UNIQUE (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id    ON project_members(user_id);

-- ============================================================
-- 6. ARTISANS (scoped par projet pour MVP)
-- ============================================================
CREATE TABLE IF NOT EXISTS artisans (
  id           uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     uuid           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id   uuid           NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name         text           NOT NULL,
  trade        text           NOT NULL DEFAULT '',
  phone        text           NOT NULL DEFAULT '',
  email        text           NOT NULL DEFAULT '',
  status       artisan_status NOT NULL DEFAULT 'a_contacter',
  trust_rating smallint       NOT NULL DEFAULT 0
               CHECK (trust_rating BETWEEN 0 AND 5),
  notes        text           NOT NULL DEFAULT '',
  created_at   timestamptz    NOT NULL DEFAULT now(),
  updated_at   timestamptz    NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_artisans_project_id ON artisans(project_id);
CREATE INDEX IF NOT EXISTS idx_artisans_owner_id   ON artisans(owner_id);

CREATE TRIGGER set_artisans_updated_at
  BEFORE UPDATE ON artisans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 7. LOTS
-- ============================================================
CREATE TABLE IF NOT EXISTS lots (
  id                       uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id               uuid              NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  owner_id                 uuid              NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Artisan retenu pour ce lot (nullable = pas encore attribué)
  artisan_id               uuid              REFERENCES artisans(id) ON DELETE SET NULL,
  name                     text              NOT NULL,
  status                   lot_status        NOT NULL DEFAULT 'a_etudier',
  priority                 priority          NOT NULL DEFAULT 'moyenne',
  -- Ordre d'affichage personnalisé (drag-and-drop futur)
  sort_order               integer           NOT NULL DEFAULT 0,
  budget_planned_cents     integer           NOT NULL DEFAULT 0,
  -- Coût réel constaté (saisie simple MVP ; une table invoices le remplacera en V2)
  real_cost_cents          integer,
  -- Scénarios budgétaires
  budget_optimistic_cents  integer,
  budget_retained_cents    integer,
  budget_pessimistic_cents integer,
  budget_risk_level        budget_risk_level NOT NULL DEFAULT 'moyen',
  budget_comment           text,
  notes                    text              NOT NULL DEFAULT '',
  created_at               timestamptz       NOT NULL DEFAULT now(),
  updated_at               timestamptz       NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lots_project_id ON lots(project_id);
CREATE INDEX IF NOT EXISTS idx_lots_owner_id   ON lots(owner_id);
CREATE INDEX IF NOT EXISTS idx_lots_artisan_id ON lots(artisan_id);
CREATE INDEX IF NOT EXISTS idx_lots_status     ON lots(status);

CREATE TRIGGER set_lots_updated_at
  BEFORE UPDATE ON lots
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 8. QUOTES (devis)
-- Remplace le champ scalaire quoteReceived sur Lot.
-- Permet de stocker plusieurs devis par lot.
-- ============================================================
CREATE TABLE IF NOT EXISTS quotes (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  owner_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lot_id        uuid        NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
  artisan_id    uuid        REFERENCES artisans(id) ON DELETE SET NULL,
  -- Dénormalisé pour affichage rapide sans join (artisan peut être supprimé)
  artisan_name  text        NOT NULL DEFAULT '',
  amount_cents  integer     NOT NULL CHECK (amount_cents >= 0),
  quote_date    date,
  is_retained   boolean     NOT NULL DEFAULT false,
  comment       text        NOT NULL DEFAULT '',
  -- Chemin fichier dans Supabase Storage (null si pas encore uploadé)
  storage_path  text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotes_project_id ON quotes(project_id);
CREATE INDEX IF NOT EXISTS idx_quotes_lot_id     ON quotes(lot_id);
CREATE INDEX IF NOT EXISTS idx_quotes_artisan_id ON quotes(artisan_id);
CREATE INDEX IF NOT EXISTS idx_quotes_owner_id   ON quotes(owner_id);

-- Décision 12 : un seul devis retenu par lot (index unique partiel)
CREATE UNIQUE INDEX IF NOT EXISTS idx_quotes_one_retained_per_lot
  ON quotes(lot_id)
  WHERE is_retained = true;

CREATE TRIGGER set_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 9. TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  owner_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lot_id        uuid        REFERENCES lots(id) ON DELETE SET NULL,
  title         text        NOT NULL,
  -- Texte libre pour MVP ("Moi", "Artisan X"). Un FK profiles sera ajouté en V2.
  assignee_name text        NOT NULL DEFAULT 'Moi',
  priority      priority    NOT NULL DEFAULT 'moyenne',
  status        task_status NOT NULL DEFAULT 'a_faire',
  due_date      date,
  notes         text        NOT NULL DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_lot_id     ON tasks(lot_id);
CREATE INDEX IF NOT EXISTS idx_tasks_owner_id   ON tasks(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status     ON tasks(status);

CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 10. DOCUMENTS (photos et documents dans une seule table)
-- Bucket séparé pour les photos (project-photos) et les
-- documents (project-documents), mais même table SQL.
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id              uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid              NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  owner_id        uuid              NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lot_id          uuid              REFERENCES lots(id) ON DELETE SET NULL,
  quote_id        uuid              REFERENCES quotes(id) ON DELETE SET NULL,
  name            text              NOT NULL,
  category        document_category NOT NULL,
  -- Chemin complet dans Supabase Storage : {owner_id}/{project_id}/{doc_id}/{filename}
  storage_path    text              NOT NULL,
  storage_bucket  text              NOT NULL,
  file_size_bytes bigint,
  mime_type       text,
  -- Date d'import (peut différer de created_at si le fichier date d'avant)
  uploaded_at     timestamptz       NOT NULL DEFAULT now(),
  created_at      timestamptz       NOT NULL DEFAULT now(),
  updated_at      timestamptz       NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_lot_id     ON documents(lot_id);
CREATE INDEX IF NOT EXISTS idx_documents_owner_id   ON documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_category   ON documents(category);

CREATE TRIGGER set_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 11. NOTES (notes libres, alertes terrain, décisions courtes)
-- Distinct de la table decisions qui est structurée (options/choix).
-- ============================================================
CREATE TABLE IF NOT EXISTS notes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  owner_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  body        text        NOT NULL DEFAULT '',
  note_type   note_type   NOT NULL DEFAULT 'note',
  note_date   date        NOT NULL DEFAULT CURRENT_DATE,
  author_name text        NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notes_project_id ON notes(project_id);
CREATE INDEX IF NOT EXISTS idx_notes_owner_id   ON notes(owner_id);

CREATE TRIGGER set_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 12. DECISIONS (décisions structurées avec options et choix retenu)
-- ============================================================
CREATE TABLE IF NOT EXISTS decisions (
  id                   uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id           uuid            NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  owner_id             uuid            NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title                text            NOT NULL,
  context              text            NOT NULL DEFAULT '',
  -- Liste ordonnée des options envisagées
  options              text[]          NOT NULL DEFAULT '{}',
  selected_option      text,
  status               decision_status NOT NULL DEFAULT 'a_trancher',
  -- Négatif = économie (ex : -80000 = -800 €)
  budget_impact_cents  integer,
  planning_impact_days integer,
  decision_date        date,
  priority             priority        NOT NULL DEFAULT 'moyenne',
  notes                text,
  created_at           timestamptz     NOT NULL DEFAULT now(),
  updated_at           timestamptz     NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_decisions_project_id ON decisions(project_id);
CREATE INDEX IF NOT EXISTS idx_decisions_owner_id   ON decisions(owner_id);
CREATE INDEX IF NOT EXISTS idx_decisions_status     ON decisions(status);

CREATE TRIGGER set_decisions_updated_at
  BEFORE UPDATE ON decisions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 13. DECISION_DOCUMENTS (table de jonction)
-- owner_id dénormalisé pour RLS simple sans sous-requête.
-- ============================================================
CREATE TABLE IF NOT EXISTS decision_documents (
  decision_id uuid NOT NULL REFERENCES decisions(id)  ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES documents(id)  ON DELETE CASCADE,
  owner_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (decision_id, document_id)
);

CREATE INDEX IF NOT EXISTS idx_decision_docs_document_id ON decision_documents(document_id);
CREATE INDEX IF NOT EXISTS idx_decision_docs_owner_id    ON decision_documents(owner_id);

-- ============================================================
-- 14. ALERTS
-- ============================================================
CREATE TABLE IF NOT EXISTS alerts (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  owner_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  level       alert_level NOT NULL DEFAULT 'info',
  alert_date  date        NOT NULL DEFAULT CURRENT_DATE,
  is_resolved boolean     NOT NULL DEFAULT false,
  resolved_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alerts_project_id ON alerts(project_id);
CREATE INDEX IF NOT EXISTS idx_alerts_owner_id   ON alerts(owner_id);
-- Index partiel pour le dashboard (alertes actives uniquement)
CREATE INDEX IF NOT EXISTS idx_alerts_active
  ON alerts(project_id, level)
  WHERE is_resolved = false;

CREATE TRIGGER set_alerts_updated_at
  BEFORE UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 15. ROW LEVEL SECURITY — activation
-- ============================================================
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisans          ENABLE ROW LEVEL SECURITY;
ALTER TABLE lots              ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts            ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 16. POLICIES RLS
-- ============================================================

-- ── profiles ──
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ── projects ──
CREATE POLICY "projects_select" ON projects
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "projects_insert" ON projects
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "projects_update" ON projects
  FOR UPDATE USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "projects_delete" ON projects
  FOR DELETE USING (owner_id = auth.uid());

-- ── project_members ──
-- SELECT : membres voient leurs propres appartenances ;
--          le propriétaire voit tous les membres de ses projets.
CREATE POLICY "pm_select" ON project_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
  );

-- INSERT/UPDATE/DELETE : seul le propriétaire du projet peut gérer les membres.
--   Un membre peut se retirer lui-même (DELETE user_id = auth.uid()).
CREATE POLICY "pm_insert" ON project_members
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
  );

CREATE POLICY "pm_update" ON project_members
  FOR UPDATE
  USING    (project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid()));

CREATE POLICY "pm_delete" ON project_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
  );

-- ── artisans ──
CREATE POLICY "artisans_select" ON artisans
  FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "artisans_insert" ON artisans
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "artisans_update" ON artisans
  FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "artisans_delete" ON artisans
  FOR DELETE USING (owner_id = auth.uid());

-- ── lots ──
CREATE POLICY "lots_select" ON lots
  FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "lots_insert" ON lots
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "lots_update" ON lots
  FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "lots_delete" ON lots
  FOR DELETE USING (owner_id = auth.uid());

-- ── quotes ──
CREATE POLICY "quotes_select" ON quotes
  FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "quotes_insert" ON quotes
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "quotes_update" ON quotes
  FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "quotes_delete" ON quotes
  FOR DELETE USING (owner_id = auth.uid());

-- ── tasks ──
CREATE POLICY "tasks_select" ON tasks
  FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "tasks_insert" ON tasks
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "tasks_update" ON tasks
  FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "tasks_delete" ON tasks
  FOR DELETE USING (owner_id = auth.uid());

-- ── documents ──
CREATE POLICY "documents_select" ON documents
  FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "documents_insert" ON documents
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "documents_update" ON documents
  FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "documents_delete" ON documents
  FOR DELETE USING (owner_id = auth.uid());

-- ── notes ──
CREATE POLICY "notes_select" ON notes
  FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "notes_insert" ON notes
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "notes_update" ON notes
  FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "notes_delete" ON notes
  FOR DELETE USING (owner_id = auth.uid());

-- ── decisions ──
CREATE POLICY "decisions_select" ON decisions
  FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "decisions_insert" ON decisions
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "decisions_update" ON decisions
  FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "decisions_delete" ON decisions
  FOR DELETE USING (owner_id = auth.uid());

-- ── decision_documents (owner_id dénormalisé → même pattern simple) ──
CREATE POLICY "dd_select" ON decision_documents
  FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "dd_insert" ON decision_documents
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "dd_delete" ON decision_documents
  FOR DELETE USING (owner_id = auth.uid());

-- ── alerts ──
CREATE POLICY "alerts_select" ON alerts
  FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "alerts_insert" ON alerts
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "alerts_update" ON alerts
  FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "alerts_delete" ON alerts
  FOR DELETE USING (owner_id = auth.uid());
