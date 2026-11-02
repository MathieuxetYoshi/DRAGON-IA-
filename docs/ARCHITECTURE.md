# Architecture cible de DRAGON IA

## Vue d'ensemble

```text
Utilisateurs entreprise
        |
   Next.js Web App
        |
  API Gateway / FastAPI
        |
  Authentification OIDC + RBAC
        |
  Orchestrateur de missions
        |
  +-----+-----------+-------------+
  |                 |             |
Agent documentaire Agent métier  Agent automatisation
  |                 |             |
  +----------- Outils/connecteurs-+
        |
 PostgreSQL + stockage objet + Redis/queue
        |
 Journaux d'audit / métriques / alertes
```

## Principes multi-tenant

- Chaque requête doit être associée à une organisation authentifiée côté serveur.
- Ne jamais faire confiance à un identifiant d'organisation fourni librement par le navigateur.
- Toutes les lectures et écritures doivent être filtrées par tenant.
- Utiliser PostgreSQL Row-Level Security ou un schéma d'isolation équivalent, avec tests négatifs inter-tenant.
- Séparer les secrets et les connexions des clients; chiffrer les secrets au repos.
- Pour les grands comptes, prévoir SSO, SCIM, politiques de rétention et clés gérées par client si nécessaire.

## Exécution des agents

Un orchestrateur reçoit un objectif, vérifie les droits, construit un plan borné et appelle les agents/outils autorisés. Chaque outil doit avoir un schéma strict, une permission explicite, un délai maximal et une limite de ressources.

Les actions à impact externe (paiement, envoi massif, publication, suppression, changement de droits, engagement contractuel) doivent passer par une approbation humaine. Prévoir idempotence, journal d'audit, annulation lorsque possible et arrêt d'urgence.

## Sécurité et conformité

- OIDC/SAML via un fournisseur d'identité d'entreprise.
- RBAC/ABAC et moindre privilège.
- TLS partout, chiffrement des données et sauvegardes.
- Gestion des secrets via un coffre dédié, jamais dans Git.
- Défenses contre prompt injection : traiter les documents externes comme des données non fiables; ne jamais les laisser modifier les politiques ou les permissions.
- Journaliser qui a demandé quoi, quel agent/outils ont été appelés et quelle approbation a été donnée, en limitant les données personnelles consignées.
- Évaluer les obligations RGPD, les contrats de sous-traitance et les exigences sectorielles avec les responsables compétents.

## Déploiement progressif

1. Prototype local avec données fictives.
2. Pilote isolé avec un seul client et données non sensibles.
3. Authentification, isolation tenant, audit et tests de sécurité.
4. Déploiement redondant, sauvegardes testées, alertes et plan de reprise.
5. Revue de conformité et validation par les équipes sécurité/juridique avant production.
