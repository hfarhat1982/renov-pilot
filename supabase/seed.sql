-- ============================================================
-- RenoV Pilot — Seed : données du projet sous-sol
-- ============================================================
-- PRÉREQUIS AVANT D'EXÉCUTER :
--   1. Créer un compte via l'interface Supabase Auth
--      (Dashboard → Authentication → Users → "Invite user")
--   2. Copier l'UUID de cet utilisateur
--   3. Remplacer 'REMPLACER-PAR-VOTRE-UUID' ci-dessous
--   4. Exécuter : psql "$DATABASE_URL" < supabase/seed.sql
--      OU via le SQL Editor de Supabase en mode service_role
--
-- Le seed est idempotent : il s'arrête silencieusement si les
-- données existent déjà pour cet utilisateur.
-- ============================================================

DO $$
DECLARE
  -- ──────────────────────────────────────────────────────
  -- !! REMPLACER PAR VOTRE UUID (Authentication > Users) !!
  -- ──────────────────────────────────────────────────────
  v_owner_id uuid := 'REMPLACER-PAR-VOTRE-UUID'::uuid;

  v_project_id uuid;

  -- Artisans
  v_a_sol   uuid; v_a_mac  uuid; v_a_plomb uuid;
  v_a_elec  uuid; v_a_iso  uuid;

  -- Lots (15)
  v_l1  uuid; v_l2  uuid; v_l3  uuid; v_l4  uuid; v_l5  uuid;
  v_l6  uuid; v_l7  uuid; v_l8  uuid; v_l9  uuid; v_l10 uuid;
  v_l11 uuid; v_l12 uuid; v_l13 uuid; v_l14 uuid; v_l15 uuid;

  -- Documents (9)
  v_d1 uuid; v_d2 uuid; v_d3 uuid; v_d4 uuid; v_d5 uuid;
  v_d6 uuid; v_d7 uuid; v_d8 uuid; v_d9 uuid;

  -- Décisions (6)
  v_dec1 uuid; v_dec2 uuid; v_dec3 uuid;
  v_dec4 uuid; v_dec5 uuid; v_dec6 uuid;

BEGIN

  -- Vérification que le placeholder a été remplacé
  IF v_owner_id::text = 'REMPLACER-PAR-VOTRE-UUID' THEN
    RAISE EXCEPTION
      'Remplacez REMPLACER-PAR-VOTRE-UUID par votre UUID utilisateur Supabase.';
  END IF;

  -- Idempotence : ne rien faire si le projet existe déjà
  IF EXISTS (SELECT 1 FROM projects WHERE owner_id = v_owner_id LIMIT 1) THEN
    RAISE NOTICE 'Données déjà présentes pour cet utilisateur — seed ignoré.';
    RETURN;
  END IF;

  -- Génération des UUIDs
  v_project_id := gen_random_uuid();
  v_a_sol   := gen_random_uuid(); v_a_mac   := gen_random_uuid();
  v_a_plomb := gen_random_uuid(); v_a_elec  := gen_random_uuid();
  v_a_iso   := gen_random_uuid();
  v_l1  := gen_random_uuid(); v_l2  := gen_random_uuid();
  v_l3  := gen_random_uuid(); v_l4  := gen_random_uuid();
  v_l5  := gen_random_uuid(); v_l6  := gen_random_uuid();
  v_l7  := gen_random_uuid(); v_l8  := gen_random_uuid();
  v_l9  := gen_random_uuid(); v_l10 := gen_random_uuid();
  v_l11 := gen_random_uuid(); v_l12 := gen_random_uuid();
  v_l13 := gen_random_uuid(); v_l14 := gen_random_uuid();
  v_l15 := gen_random_uuid();
  v_d1 := gen_random_uuid(); v_d2 := gen_random_uuid();
  v_d3 := gen_random_uuid(); v_d4 := gen_random_uuid();
  v_d5 := gen_random_uuid(); v_d6 := gen_random_uuid();
  v_d7 := gen_random_uuid(); v_d8 := gen_random_uuid();
  v_d9 := gen_random_uuid();
  v_dec1 := gen_random_uuid(); v_dec2 := gen_random_uuid();
  v_dec3 := gen_random_uuid(); v_dec4 := gen_random_uuid();
  v_dec5 := gen_random_uuid(); v_dec6 := gen_random_uuid();

  -- ─── PROFILE ────────────────────────────────────────────
  INSERT INTO profiles (id, full_name, email)
  VALUES (v_owner_id, 'Haykel Farhat', 'm.haykel.farhat@gmail.com')
  ON CONFLICT (id) DO NOTHING;

  -- ─── PROJET ─────────────────────────────────────────────
  INSERT INTO projects
    (id, owner_id, name, project_type, surface_m2, status,
     budget_target_cents, start_date, priorities)
  VALUES (
    v_project_id, v_owner_id,
    'Aménagement sous-sol habitable',
    'Rénovation intérieure',
    35, 'etude',
    3000000,  -- 30 000 €
    '2026-03-15',
    ARRAY[
      'Éviter les problèmes d''humidité',
      'Valider la faisabilité structurelle',
      'Gérer les évacuations avec station de relevage',
      'Préparer un dossier propre pour la déclaration préalable',
      'Suivre précisément le budget'
    ]
  );

  -- ─── ARTISANS ───────────────────────────────────────────
  INSERT INTO artisans
    (id, owner_id, project_id, name, trade, phone, email, status, trust_rating, notes)
  VALUES
    (v_a_sol,   v_owner_id, v_project_id,
     'BTP Solutions Sol',        'Étude de sol', '06 12 34 56 78',
     'contact@btp-sol.fr',       'devis_recu', 4,
     'Disponible sous 2 semaines. Rapport G2 inclus.'),
    (v_a_mac,   v_owner_id, v_project_id,
     'Maçonnerie Dupuis & Fils', 'Maçonnerie',   '06 22 11 33 44',
     'contact@dupuis-maconnerie.fr', 'devis_recu', 5,
     'Bonnes références sur sous-sols semi-enterrés.'),
    (v_a_plomb, v_owner_id, v_project_id,
     'AquaPlomb',                'Plomberie',    '07 88 99 11 22',
     'devis@aquaplomb.fr',       'contacte', 4,
     'Visite prévue jeudi prochain.'),
    (v_a_elec,  v_owner_id, v_project_id,
     'ElecPro 92',               'Électricité',  '06 55 44 33 22',
     'info@elecpro92.fr',        'a_contacter', 0, ''),
    (v_a_iso,   v_owner_id, v_project_id,
     'Isolation Confort',        'Isolation',    '06 77 88 99 00',
     'contact@isolation-confort.fr', 'devis_recu', 4,
     'Préconise polyuréthane projeté pour murs enterrés.');

  -- ─── LOTS (15) ──────────────────────────────────────────
  -- Montants en centimes (€ × 100)
  INSERT INTO lots
    (id, owner_id, project_id, artisan_id, name, status, priority, sort_order,
     budget_planned_cents, real_cost_cents,
     budget_optimistic_cents, budget_retained_cents, budget_pessimistic_cents,
     budget_risk_level, budget_comment, notes)
  VALUES
    (v_l1,  v_owner_id, v_project_id, v_a_sol,
     'Étude de sol', 'valide', 'critique', 1,
     150000, 145000, 120000, 150000, 250000,
     'faible', 'Rapport G2 livré · coût maîtrisé',
     'Réalisée en mars. Aucun risque structurel majeur.'),

    (v_l2,  v_owner_id, v_project_id, NULL,
     'Déclaration préalable / mairie', 'en_cours', 'haute', 2,
     0, NULL, 0, 50000, 150000,
     'moyen', 'Dépend des instructions de la mairie',
     'Dossier en cours de constitution.'),

    (v_l3,  v_owner_id, v_project_id, v_a_mac,
     'Décaissement / maçonnerie', 'devis_recu', 'critique', 3,
     800000, NULL, 600000, 800000, 1200000,
     'eleve', 'Devis Dupuis reçu · écart +400 €',
     'Léger dépassement à arbitrer.'),

    (v_l4,  v_owner_id, v_project_id, NULL,
     'Structure / renforcement', 'a_etudier', 'haute', 4,
     0, NULL, 0, 300000, 1000000,
     'critique', 'À chiffrer après validation étude de sol',
     'À chiffrer après validation de l''étude de sol.'),

    (v_l5,  v_owner_id, v_project_id, NULL,
     'Traitement humidité', 'a_etudier', 'critique', 5,
     0, NULL, 200000, 500000, 1200000,
     'critique', 'Point critique · cuvelage vs drainage périphérique',
     'Cuvelage à étudier.'),

    (v_l6,  v_owner_id, v_project_id, v_a_iso,
     'Isolation murs et sol', 'devis_recu', 'haute', 6,
     400000, NULL, 350000, 400000, 700000,
     'moyen', 'Devis polyuréthane projeté reçu', ''),

    (v_l7,  v_owner_id, v_project_id, v_a_plomb,
     'Plomberie', 'devis_demande', 'haute', 7,
     350000, NULL, 250000, 350000, 600000,
     'moyen', 'Visite AquaPlomb prévue', ''),

    (v_l8,  v_owner_id, v_project_id, NULL,
     'Station de relevage eaux usées', 'a_etudier', 'critique', 8,
     150000, NULL, 120000, 200000, 400000,
     'eleve', 'À coupler avec lot plomberie',
     'À coupler avec lot plomberie.'),

    (v_l9,  v_owner_id, v_project_id, v_a_elec,
     'Électricité', 'a_etudier', 'haute', 9,
     300000, NULL, 250000, 350000, 550000,
     'moyen', 'Artisan à contacter', ''),

    (v_l10, v_owner_id, v_project_id, NULL,
     'Ventilation / VMC', 'a_etudier', 'haute', 10,
     150000, NULL, 80000, 150000, 350000,
     'moyen', 'VMC double flux recommandé pour sous-sol',
     'VMC double flux à envisager.'),

    (v_l11, v_owner_id, v_project_id, NULL,
     'Cloisons', 'a_etudier', 'moyenne', 11,
     150000, NULL, 120000, 180000, 300000,
     'faible', NULL, ''),

    (v_l12, v_owner_id, v_project_id, NULL,
     'Sol', 'a_etudier', 'moyenne', 12,
     150000, NULL, 120000, 180000, 300000,
     'faible', NULL, ''),

    (v_l13, v_owner_id, v_project_id, NULL,
     'Peinture', 'a_etudier', 'basse', 13,
     100000, NULL, 80000, 120000, 250000,
     'faible', NULL, ''),

    (v_l14, v_owner_id, v_project_id, NULL,
     'Menuiserie', 'a_etudier', 'basse', 14,
     70000, NULL, 70000, 150000, 300000,
     'faible', NULL, ''),

    (v_l15, v_owner_id, v_project_id, NULL,
     'Finitions / déco', 'a_etudier', 'basse', 15,
     100000, NULL, 100000, 200000, 500000,
     'moyen', NULL, '');

  -- ─── DEVIS (quotes) ─────────────────────────────────────
  -- Seulement les devis reçus du MVP
  INSERT INTO quotes
    (owner_id, project_id, lot_id, artisan_id, artisan_name,
     amount_cents, quote_date, is_retained, comment)
  VALUES
    (v_owner_id, v_project_id, v_l1,  v_a_sol,  'BTP Solutions Sol',
     145000, '2026-03-20', true,  'Rapport G2 inclus. Validé.'),
    (v_owner_id, v_project_id, v_l3,  v_a_mac,  'Maçonnerie Dupuis & Fils',
     840000, '2026-05-22', true,  'Léger dépassement par rapport au budget.'),
    (v_owner_id, v_project_id, v_l6,  v_a_iso,  'Isolation Confort',
     395000, '2026-05-24', true,  'Devis polyuréthane projeté.');

  -- ─── TÂCHES ─────────────────────────────────────────────
  INSERT INTO tasks
    (owner_id, project_id, lot_id, title, assignee_name,
     priority, status, due_date, notes)
  VALUES
    (v_owner_id, v_project_id, v_l1,
     'Récupérer le rapport d''étude de sol G2',
     'Moi', 'haute', 'termine', '2026-04-02', ''),
    (v_owner_id, v_project_id, v_l2,
     'Déposer la déclaration préalable en mairie',
     'Moi', 'critique', 'en_cours', '2026-06-10', 'Plans à finaliser.'),
    (v_owner_id, v_project_id, v_l3,
     'Comparer les devis maçonnerie',
     'Moi', 'haute', 'en_cours', '2026-06-05', '2 devis reçus, 1 en attente.'),
    (v_owner_id, v_project_id, v_l7,
     'Visite plombier AquaPlomb',
     'Moi', 'haute', 'a_faire', '2026-06-12', ''),
    (v_owner_id, v_project_id, v_l5,
     'Demander 3 devis traitement humidité',
     'Moi', 'critique', 'a_faire', '2026-06-15',
     'Cuvelage vs drainage périphérique.'),
    (v_owner_id, v_project_id, v_l10,
     'Valider type de VMC',
     'Moi', 'moyenne', 'a_faire', '2026-06-25', ''),
    (v_owner_id, v_project_id, v_l2,
     'Préparer plans cotés pour mairie',
     'Moi', 'haute', 'en_cours', '2026-06-08', '');

  -- ─── DOCUMENTS ──────────────────────────────────────────
  -- storage_path : chemin théorique dans Storage (les fichiers
  -- n'existent pas encore — à uploader via l'UI ou l'API).
  INSERT INTO documents
    (id, owner_id, project_id, lot_id, name, category,
     storage_path, storage_bucket, uploaded_at)
  VALUES
    (v_d1, v_owner_id, v_project_id, NULL,
     'Plan sous-sol existant.pdf', 'plans',
     v_owner_id::text||'/'||v_project_id::text||'/'||v_d1::text||'/plan-sous-sol-existant.pdf',
     'project-documents', '2026-03-20 00:00:00+00'),
    (v_d2, v_owner_id, v_project_id, NULL,
     'Plan projet aménagement v2.pdf', 'plans',
     v_owner_id::text||'/'||v_project_id::text||'/'||v_d2::text||'/plan-projet-v2.pdf',
     'project-documents', '2026-05-15 00:00:00+00'),
    (v_d3, v_owner_id, v_project_id, v_l3,
     'Devis Dupuis maçonnerie.pdf', 'devis',
     v_owner_id::text||'/'||v_project_id::text||'/'||v_d3::text||'/devis-dupuis-maconnerie.pdf',
     'project-documents', '2026-05-22 00:00:00+00'),
    (v_d4, v_owner_id, v_project_id, v_l6,
     'Devis Isolation Confort.pdf', 'devis',
     v_owner_id::text||'/'||v_project_id::text||'/'||v_d4::text||'/devis-isolation-confort.pdf',
     'project-documents', '2026-05-24 00:00:00+00'),
    (v_d5, v_owner_id, v_project_id, v_l1,
     'Rapport étude de sol G2.pdf', 'etude_sol',
     v_owner_id::text||'/'||v_project_id::text||'/'||v_d5::text||'/rapport-g2.pdf',
     'project-documents', '2026-04-02 00:00:00+00'),
    (v_d6, v_owner_id, v_project_id, NULL,
     'Photo état initial mur nord.jpg', 'photos',
     v_owner_id::text||'/'||v_project_id::text||'/'||v_d6::text||'/photo-mur-nord.jpg',
     'project-photos', '2026-03-15 00:00:00+00'),
    (v_d7, v_owner_id, v_project_id, NULL,
     'Photo trace humidité angle SE.jpg', 'photos',
     v_owner_id::text||'/'||v_project_id::text||'/'||v_d7::text||'/photo-humidite-se.jpg',
     'project-photos', '2026-03-15 00:00:00+00'),
    (v_d8, v_owner_id, v_project_id, v_l8,
     'Notice station de relevage SFA.pdf', 'notices',
     v_owner_id::text||'/'||v_project_id::text||'/'||v_d8::text||'/notice-sfa.pdf',
     'project-documents', '2026-05-10 00:00:00+00'),
    (v_d9, v_owner_id, v_project_id, v_l2,
     'Brouillon CERFA DP.pdf', 'declaration',
     v_owner_id::text||'/'||v_project_id::text||'/'||v_d9::text||'/brouillon-cerfa-dp.pdf',
     'project-documents', '2026-05-28 00:00:00+00');

  -- ─── NOTES ──────────────────────────────────────────────
  INSERT INTO notes
    (owner_id, project_id, title, body, note_type, note_date, author_name)
  VALUES
    (v_owner_id, v_project_id,
     'Choix du système d''évacuation',
     'Station de relevage SFA Sanibroyeur PRO retenue : compatible WC + douche, bruit acceptable, SAV reconnu.',
     'decision', '2026-05-12', 'Haykel Farhat'),
    (v_owner_id, v_project_id,
     'Type d''isolation murs enterrés',
     'Polyuréthane projeté préféré aux panneaux rigides : meilleure adhérence sur supports irréguliers, pas de pont thermique.',
     'decision', '2026-05-18', 'Haykel Farhat'),
    (v_owner_id, v_project_id,
     'Trace d''humidité angle sud-est',
     'Auréole repérée après les pluies de mars. À investiguer avant tout doublage. Photo dans le dossier chantier.',
     'alerte', '2026-03-16', 'Haykel Farhat'),
    (v_owner_id, v_project_id,
     'Hauteur sous plafond limite',
     '2,28 m après dalle isolée — vérifier la conformité pour un espace habitable (mini 2,20 m après finitions).',
     'note', '2026-04-04', 'Haykel Farhat'),
    (v_owner_id, v_project_id,
     'Devis maçonnerie au-dessus du budget',
     'Devis Dupuis à 8 400 € pour 8 000 € prévus. Négocier ou ajuster la marge imprévus.',
     'alerte', '2026-05-23', 'Haykel Farhat');

  -- ─── DÉCISIONS ──────────────────────────────────────────
  -- budget_impact_cents : négatif = économie (ex : -80000 = -800 €)
  INSERT INTO decisions
    (id, owner_id, project_id, title, context, options, selected_option,
     status, budget_impact_cents, planning_impact_days, decision_date, priority, notes)
  VALUES
    (v_dec1, v_owner_id, v_project_id,
     'Solution d''évacuation des eaux usées',
     'Le sous-sol est en dessous du réseau d''évacuation principal. Une solution de relevage est indispensable pour raccorder WC et douche.',
     ARRAY[
       'Station de relevage SFA Sanibroyeur PRO (WC + douche + évier)',
       'Broyeur individuel par appareil sanitaire',
       'Refonte complète des évacuations (terrassement)'
     ],
     'Station de relevage SFA Sanibroyeur PRO (WC + douche + évier)',
     'validee', 50000, 0, '2026-05-12', 'haute',
     'Bruit acceptable en fonctionnement nocturne. SAV reconnu.'),

    (v_dec2, v_owner_id, v_project_id,
     'Profondeur de décaissement',
     'La hauteur sous plafond brute est de 2,48 m. Après dalle isolée : 2,28 m — au-dessus du minimum réglementaire de 2,20 m mais sans marge.',
     ARRAY[
       'Pas de décaissement supplémentaire (HSP finale : 2,28 m)',
       'Décaisser 20 cm — terrassement léger (HSP finale : 2,48 m)',
       'Décaisser 30 cm — terrassement important (HSP finale : 2,58 m)'
     ],
     'Décaisser 20 cm — terrassement léger (HSP finale : 2,48 m)',
     'validee', 200000, 5, '2026-04-15', 'haute', NULL),

    (v_dec3, v_owner_id, v_project_id,
     'Stratégie de traitement de l''humidité',
     'Trace d''humidité angle sud-est. Deux approches : cuvelage intérieur (coûteux, radical) ou drainage périphérique extérieur (moins invasif).',
     ARRAY[
       'Cuvelage intérieur (enduits d''étanchéité par l''intérieur)',
       'Drainage périphérique extérieur (fouilles + membrane + drain)',
       'Combinaison : cuvelage ponctuel angle SE + drain périphérique partiel'
     ],
     NULL,
     'a_trancher', NULL, NULL, NULL, 'critique',
     'Dépend des résultats de la visite humidité à planifier avant tout engagement.'),

    (v_dec4, v_owner_id, v_project_id,
     'Type de ventilation mécanique',
     'Un sous-sol habitable exige une VMC réglementaire. Simple flux : moins cher mais moins efficace. Double flux : performant mais plus cher et plus encombrant.',
     ARRAY[
       'VMC simple flux hygro B (solution économique)',
       'VMC double flux (performance, récupération chaleur)',
       'Ventilation naturelle renforcée par grilles hautes/basses'
     ],
     NULL,
     'a_trancher', NULL, NULL, NULL, 'haute',
     'La double flux est recommandée pour un sous-sol avec enjeux humidité.'),

    (v_dec5, v_owner_id, v_project_id,
     'Mode de dépôt de la déclaration préalable',
     'Le projet crée plus de 5 m² de surface habitable. Déclaration préalable obligatoire. Deux options : autonome ou architecte.',
     ARRAY[
       'Dépôt en autonomie avec plans cotés réalisés maison',
       'Mandater un architecte pour les plans et le dossier complet'
     ],
     'Dépôt en autonomie avec plans cotés réalisés maison',
     'validee', -80000, 14, '2026-05-20', 'critique',
     'Plans cotés en cours de finalisation. Délai mairie estimé à 1 mois.'),

    (v_dec6, v_owner_id, v_project_id,
     'Technique d''isolation des murs enterrés',
     'Murs enterrés humides. Deux techniques : polyuréthane projeté (adhérence maximale) ou panneaux PSE rigides (moins cher, risque de ponts thermiques).',
     ARRAY[
       'Polyuréthane projeté (PUR) sur murs bruts',
       'Panneaux PSE rigides collés + enduit',
       'Doublage placo avec laine minérale (solution sèche)'
     ],
     'Polyuréthane projeté (PUR) sur murs bruts',
     'validee', 40000, 0, '2026-05-18', 'haute',
     'Choix validé avec Isolation Confort. Meilleure adhérence sur supports irréguliers.');

  -- ─── DECISION_DOCUMENTS ─────────────────────────────────
  INSERT INTO decision_documents (decision_id, document_id, owner_id)
  VALUES
    -- dec1 → Notice SFA
    (v_dec1, v_d8, v_owner_id),
    -- dec2 → Rapport G2 + Plan v2
    (v_dec2, v_d5, v_owner_id),
    (v_dec2, v_d2, v_owner_id),
    -- dec3 → Rapport G2 + Photo humidité
    (v_dec3, v_d5, v_owner_id),
    (v_dec3, v_d7, v_owner_id),
    -- dec5 → CERFA + Plan existant + Plan v2
    (v_dec5, v_d9, v_owner_id),
    (v_dec5, v_d1, v_owner_id),
    (v_dec5, v_d2, v_owner_id),
    -- dec6 → Devis Isolation Confort
    (v_dec6, v_d4, v_owner_id);

  -- ─── ALERTES ────────────────────────────────────────────
  INSERT INTO alerts
    (owner_id, project_id, title, level, alert_date, is_resolved)
  VALUES
    (v_owner_id, v_project_id,
     'Trace d''humidité non traitée — angle sud-est',
     'critical', '2026-03-16', false),
    (v_owner_id, v_project_id,
     'Devis maçonnerie dépasse de 400 € le budget prévu',
     'warning', '2026-05-23', false),
    (v_owner_id, v_project_id,
     'Déclaration préalable à déposer avant le 10 juin',
     'warning', '2026-06-01', false),
    (v_owner_id, v_project_id,
     '3 lots critiques encore sans devis',
     'info', '2026-05-29', false);

  RAISE NOTICE 'Seed terminé — projet : Aménagement sous-sol habitable (id: %)', v_project_id;

END $$;
