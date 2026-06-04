---
# Multi-agents RenoV Pilot
---

## Agents disponibles

| Agent | Fichier | Rôle |
|---|---|---|
| `renov-orchestrator` | `agents/renov-orchestrator.md` | Coordination, décomposition, boucle dev→QA |
| `renov-dev` | `agents/renov-dev.md` | Implémentation ciblée + tsc/build + commit |
| `renov-qa` | `agents/renov-qa.md` | Tests navigateur Playwright MCP, rapport OK/KO |

---

## Backlog

### Phase actuelle — Features métier

| Priorité | Feature | Statut |
|---|---|---|
| — | Lots 1 — création lot | ✅ Validé |
| 1 | Lots 2 — édition / changement statut / suppression | À faire |
| 2 | Tâches 1 — création tâche liée projet/lot | À faire |
| 3 | Devis 1 — création devis lié lot/artisan | À faire |
| 4 | Documents/photos 1 — upload Supabase Storage | À faire |
| 5 | UX artisans — statut dans formulaire + édition/suppression | À faire |

---

## Lancement orchestrateur

```
Démarre renov-orchestrator.
Feature : Lots 2 — édition / changement statut / suppression lot.
Projet : RenoV Pilot (React/TanStack/Vite + Supabase).
App locale : http://localhost:8080.
Contraintes : pas de migration, pas de modification RLS/auth, pas de git push.
Décompose en tâches, implémente via renov-dev, valide via renov-qa, commite localement.
```

---

## Boucle standard

```
orchestrateur
  → brief → renov-dev (implémente + tsc + build + commit)
  → brief → renov-qa  (teste navigateur, rapport OK/KO/Partiel)
  → si KO : correction ciblée → renov-dev
  → si OK : rapport final → humain
```

---

## Escalades à l'humain (orchestrateur bloque et demande)

- Migration SQL
- Modification RLS / politiques Supabase
- Suppression de données ou tables
- Refactor architectural (routing, auth, layout global)
- Choix produit ambigu
