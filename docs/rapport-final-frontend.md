# DUBLIN/01 — Rapport final du frontend

Mission « Final front-end development & production readiness », 9 octobre 2026.
Tout ce qui est écrit ici a été exécuté ou mesuré ; ce qui ne l'a pas été est listé comme tel.

## 1. Stack technique réelle

Le projet n'utilise ni Next.js, ni React, ni TypeScript. Aucune migration n'a été faite : le brief demande d'éviter les migrations inutiles, et l'architecture actuelle remplit le besoin.

| Élément | Réalité |
|---|---|
| Pages | HTML statique généré par `scripts/build-html.mjs` (Node ≥ 20) à partir de `src/pages`, `src/partials`, `src/templates` : 70 pages, dont 32 fiches produit et 6 pages marque |
| Styles | Tailwind CSS 4.3.3 (CLI), jetons de design dans `src/css/theme.css` |
| JavaScript | Modules ES natifs, sans framework ni bundler : `src/js/modules` (comportements partagés), `src/js/pages` (un module par page), `src/js/data` (accès au catalogue) |
| Données | `src/data/products.json` (32 produits), type `Product` documenté en JSDoc dans `src/js/data/catalog.js`, contrat d'API dans `docs/api-contract.md` |
| État | `localStorage` : panier, wishlist, produits vus, choix cookies |
| Dépendances | 4, toutes de développement : `tailwindcss`, `@tailwindcss/cli`, `concurrently`, `serve`. Aucune dépendance à l'exécution |
| Routage | Un fichier par URL ; anciennes adresses redirigées par des pages relais |

Équivalences avec le brief : « composants React réutilisables » = modules partagés (`product-card.js`, `bag-lines.js`, `quick-add.js`…) ; « TypeScript » = types JSDoc ; « données centralisées et typées » = `products.json` + `catalog.js`.

## 2. Améliorations de cette mission

- **Stabilité de mise en page** : les pages catalogue et les fiches produit réservent un écran pendant que JavaScript les remplit. Décalage cumulé (CLS) mesuré : catalogue 0,30–0,34 → 0 ; fiche produit mobile 0,14 → 0.
- **Fiche produit** : la première image est préchargée depuis le HTML (elle n'était découverte qu'après l'exécution du JavaScript).
- **Images de l'accueil** : variantes légères pour les 4 catégories (800 px → 480 px sur mobile, 623 Ko → 194 Ko au total), pour la photo Rain (720 px) et pour la photo du tram (640 px), servies par `srcset`.
- **Héros** : les campagnes suivantes se chargent en priorité basse et ne concurrencent plus la première image.
- **Accessibilité** : titre de niveau 2 ajouté avant les grilles (catalogue, recherche, wishlist) pour un ordre de titres correct ; le tri du catalogue garde son libellé sur mobile.
- **SEO** : `robots.txt` généré (il manquait).
- **Qualité** : `npm run lint` (contrôle de syntaxe de tous les modules) et 7 tests d'intégrité du site généré ajoutés ; `npm run check` enchaîne lint, build et tests.

La passe précédente (commit `30686d6`) avait traité le héros plein écran, les espacements, les photos Rain et tram, les micro-interactions, le footer et la newsletter.

## 3. Fonctions livrées et vérifiées

Navigation (barre d'annonce, méga-menus Sneakers et Clothing, menu mobile), carrousel automatique sans contrôle visible, pages New / Men / Women / Sneakers / Clothing / Accessories / Running & trail / Brands / Sale, 6 pages marque avec compteurs calculés depuis les données, recherche instantanée et page de résultats, filtres (marque, taille, catégorie, genre, couleur, prix, type, style, stock, collection) et tri pilotés par l'URL, fiche produit (galerie, coloris, tailles EU, guide des tailles, ajout au panier, wishlist, description, matières, livraison, retours, produits liés), Quick add avec choix de taille obligatoire, panier et tiroir panier (quantité, suppression, sous-total, état vide, persistance), wishlist persistante, Recently viewed, newsletter avec validation, bandeau et réglages cookies, pages légales et d'information, checkout en 5 étapes dont le bouton de paiement reste désactivé.

## 4. Résultats de tests réels

**Automatisés** (`npm run check`) : lint OK ; build OK (70 pages) ; 27 tests sur 27.
Il n'existe ni typecheck ni linter de style (pas de TypeScript, pas d'ESLint) : seul le contrôle de syntaxe est exécuté.

**Lighthouse 13.5, Chrome sans interface, serveur local, build minifié.** Scores : performance / accessibilité / bonnes pratiques / SEO.

| Page | Mobile avant | Mobile après | Desktop avant | Desktop après |
|---|---|---|---|---|
| Accueil | 78 / 100 / 100 / 92 | 90 / 100 / 100 / 92 | 97 / 100 / 100 / 92 | 99 / 100 / 100 / 92 |
| Catalogue Sneakers | 76 / 94 / 100 / 92 | 98 / 100 / 100 / 92 | 85 / 99 / 100 / 92 | 100 / 100 / 100 / 92 |
| Fiche produit (Air Force 1) | 92 / 100 / 100 / 92 | 97 / 100 / 100 / 92 | 100 / 100 / 100 / 92 | 100 / 100 / 100 / 92 |
| Panier | 99 / 100 / 100 / 54 | 99 / 100 / 100 / 58 | 100 / 100 / 100 / 54 | 100 / 100 / 100 / 58 |

Lecture : le SEO à 92 vient de l'URL canonique relative (pas de domaine de production) ; le panier est volontairement en `noindex`. LCP mobile de l'accueil : 5,6 s → 3,6 s en réseau 4G lent simulé. Ces scores sont mesurés en local : ils sont à refaire sur l'hébergement réel.

**Parcours client dans Chrome (13 étapes, toutes passées)** : accueil ; navigation New, Men, Women, Brands, Sale et méga-menus ; recherche « samba » (2 résultats) et recherche sans résultat ; filtres marque + taille + prix + tri ; fiche produit ; ajout sans taille refusé avec message, rien dans le panier ; choix de taille et ajout ; quantité 1 → 2 (170 € → 340 €) ; suppression et état vide ; wishlist (ajout, compteur, retrait) ; CTA du héros, Shop jackets, Shop rain shells, Shop running & trail ; menu mobile et filtres mobiles ; 21 liens du footer en 200. Aucune erreur console.

**Balayage de toutes les pages** : 91 fichiers HTML (les pages du site, les pages relais d'anciennes adresses et la référence du design system) à 8 largeurs (320, 375, 430, 768, 1024, 1280, 1440, 1728 px), soit 728 chargements : 0 débordement horizontal, 0 image cassée, 0 erreur console, 0 réponse en erreur.

**Non testé** : Safari, Firefox, appareils réels, lecteur d'écran, audit d'accessibilité formel, charge réelle.

## 5. Problèmes restants

- **Prix en attente de ta décision** : XA PRO 3D GORE-TEX (150 €), New Balance 327 (130 €). Aucun prix modifié dans cette mission.
- **Incohérences de données à trancher** (non corrigées) : Crossbody Bag — description « leather », matière « 100% polyamide » saisie sans source ; Gazelle — détail « Leather lining », matière doublure « Textile » ; Rain Shell — construction (trois couches ou non) à confirmer.
- **Shop rain shells** mène à la fiche du seul rain shell du catalogue, pas à une collection : il n'y a qu'un produit de ce type.
- **13 produits n'ont qu'une photo** : pas d'image secondaire au survol pour eux (aucune photo exacte du modèle disponible).
- **19 prix sur 32** n'ont pas de source officielle enregistrée (marque propre et valeurs de travail).
- **Sale** : page vide, aucun historique de prix réel.
- **LCP mobile de l'accueil à 3,6 s** en 4G lent simulé : la feuille de style unique (72 Ko) bloque le rendu ; un CSS critique en ligne et un cache HTTP long sur l'hébergement le réduiraient.

## 6. Préparation backend

Le détail des points d'entrée est dans `docs/api-contract.md`. Chaque intégration ne touche qu'un module.

| Domaine | À brancher | Module frontend concerné |
|---|---|---|
| Authentification | Inscription, connexion, réinitialisation, session | `src/js/pages/account.js` ; les pages login / register / forgot-password n'envoient rien aujourd'hui |
| Produits | `GET /products`, `GET /products/:slug`, marques, catégories, recherche | `src/js/data/catalog.js`, `src/js/data/search-source.js` |
| Stock | Stock par taille faisant autorité, réservation à l'ajout | `normalise()` dans `catalog.js`, `maxFor()` dans `cart.js` |
| Paniers | Panier serveur, fusion à la connexion, prix recalculés côté serveur | `src/js/modules/cart.js` |
| Paiements | Prestataire (Stripe ou autre), 3-D Secure, webhooks | Étape « Payment » de `src/js/pages/checkout.js` (point de montage vide) |
| Commandes | Création, confirmation par email, historique, rétractation en ligne | `checkout.js`, `account.js`, `cancel-contract.html` |
| Livraison | Transporteurs, tarifs, délais, suivi | `commerce` dans `src/js/config.js`, pages Delivery et checkout |
| Administration | Gestion du catalogue, des prix, du stock, des commandes ; régénération des pages à la publication | `scripts/build-html.mjs` ou rendu serveur aux mêmes URL |
| Autres | Newsletter, formulaire de contact, journal des consentements cookies | `newsletter.js`, `src/js/pages/contact.js`, `consent.js` |

## 7. Statut de déploiement

**Techniquement déployable comme site statique** : le build passe, aucune erreur console, aucun lien mort, aucune dépendance à l'exécution.

**Pas prêt à recevoir de vrais clients.** Il manque :

1. Un backend : paiement, commandes, stock, comptes, emails.
2. L'identité légale du vendeur : raison sociale, adresse, numéros CRO et TVA, email et téléphone du service client (champs `null`, masqués).
3. Un domaine de production (`siteUrl`) : URL canoniques absolues et sitemap en dépendent.
4. Les conditions commerciales réelles : transporteurs, tarifs et délais de livraison, frais et adresse de retour, délai de remboursement (valeurs de développement aujourd'hui).
5. La relecture par un juriste de toutes les pages légales (voir `docs/legal-readiness.md`) ; aucune conformité n'est revendiquée.
6. Les données produit de la marque propre : compositions, étiquettes d'entretien, pays d'origine ; et la vérification des prix sans source.
7. Les droits d'usage commercial des photos et des marques tierces (les photos viennent d'Unsplash ; vendre Nike, adidas, etc. suppose des accords de distribution).
8. Un audit d'accessibilité formel et des tests sur Safari, Firefox et appareils réels.
9. La configuration de l'hébergement : HTTPS, cache, en-têtes de sécurité, page 404.
