# DUBLIN/01 — Final front-end acceptance report

9 octobre 2026. Tout ce qui figure ici a été exécuté ou mesuré sur le dépôt local ; ce qui ne l'a pas été est écrit comme tel.

**Statut final : CONDITIONAL PASS** (détail en section 10).

## 1. Project overview

Le projet n'utilise ni Next.js, ni React, ni TypeScript, ni ESLint. Aucune migration n'a été faite.

| Élément | Réalité |
|---|---|
| Pages | HTML statique généré par `scripts/build-html.mjs` (Node ≥ 20) : 70 pages, dont 32 fiches produit et 6 pages marque |
| Styles | Tailwind CSS 4.3.3 (CLI) ; jetons de design dans `src/css/theme.css` |
| JavaScript | Modules ES natifs, sans framework ni bundler : `src/js/modules`, `src/js/pages`, `src/js/data` |
| Données | `src/data/products.json` (32 produits) ; type `Product` en JSDoc dans `src/js/data/catalog.js` |
| État | `localStorage` : panier, wishlist, produits vus, choix cookies |
| Routage | Un fichier par URL ; anciennes adresses redirigées |
| Tests | `node --test` (27 tests), contrôle de syntaxe (`npm run lint`) |
| Dépendances | 4, toutes de développement ; aucune à l'exécution |

## 2. Homepage acceptance

| Section | Statut | Constat |
|---|---|---|
| A. Barre d'annonce | Accepté, 1 point à confirmer | « 30-day returns », « Free delivery in Ireland over €100 », « EN / EUR € » affichés. Voir le seuil de livraison en section 9 |
| B. Navigation | Accepté | New, Men, Women, Sneakers, Clothing, Brands, Sale ; logo centré ; recherche ; compte ; wishlist ; panier ; barre collante ; méga-menus ; menu mobile ; clavier (Entrée ouvre, Échap ferme et rend le focus) |
| C. Héros | Accepté | 4 campagnes, transition automatique vérifiée, pause au survol, aucun contrôle visible, hauteur = écran sous l'en-tête, CTA vers des collections réelles |
| D. New arrivals | Accepté | 8 produits, prix issus des données, Rain Shell à 100,00 €, Quick add avec taille obligatoire, wishlist |
| E. Rain is the dress code | Accepté, 1 remarque | « Shop jackets » → 3 vestes. « Shop rain shells » → la fiche du seul produit de ce type |
| F. Shop by category | Accepté | Sneakers 16, Running & trail 6, Clothing 11, Accessories 5 ; tuiles entièrement cliquables |
| G. After the last tram | Accepté | CTA vers Running & trail |
| H. Sélection et marques | Accepté | Compteurs de marque identiques aux pages marque (5, 4, 4, 2, 1, 16) |
| I. Livraison, retours, TVA, Dublin | Accepté, points à confirmer | Textes cohérents avec les pages Delivery, Returns et Consumer rights. Montants = valeurs de développement. « Based in Dublin » à confirmer |
| J. Newsletter et footer | Accepté | 21 liens valides, aucun lien factice, « © 2026 DUBLIN/01 · Prices include VAT », validation d'email, aucune fausse confirmation d'inscription |

## 3. Functional acceptance

Les 20 tests demandés ont été exécutés dans Chrome (Playwright) et passent :

1. Navigation depuis l'accueil — 2. Recherche (« samba » : 2 suggestions) — 3. Page de résultats — 4. Navigation par catégorie — 5. Navigation par marque — 6. Filtres (marque + taille + prix, portés par l'URL) — 7. Tri par prix — 8. Accès aux fiches produit — 9. Choix de taille (ajout sans taille refusé avec message, rien dans le panier) — 10. Ajout au panier — 11. Suppression — 12. Quantité — 13. Sous-total (170 € → 340 € ; Rain Shell 100 € → 200 €) — 14. Wishlist ajout et retrait — 15. Persistance du panier et de la wishlist après rechargement et dans un autre onglet — 16. CTA éditoriaux — 17. Navigation et filtres mobiles — 18. Liens du footer — 19. Validation de la newsletter — 20. États vides et d'erreur (panier, wishlist, recherche sans résultat, Sale, checkout vide, page 404, produit inconnu, catalogue indisponible).

Rien n'est simulé : le bouton « Place order and pay » reste désactivé, les pages de compte n'envoient rien, la newsletter dit que l'adresse n'est pas enregistrée.

## 4. Product catalog

- 32 produits, total 3 417,95 €, tout en EUR, aucun prix barré, aucun avis ni note.
- 206 cartes sur 20 pages de listes et les 32 fiches : chaque prix affiché égale le prix de `products.json`, y compris dans les données structurées.
- 32 fiches contrôlées une par une : nombre d'images, tailles affichées et tailles en stock conformes aux données, titre, marque, produits liés, rubriques livraison et retours.
- Classement des prix (`docs/rapport-prix-catalogue.md`) : 9 vérifiés, 18 raisonnables mais provisoires, 5 à approfondir.
- Points de données non résolus : XA PRO 3D GORE-TEX (variante non confirmée, 150 €) ; Crew Socks 3-Pack (25 €, au-dessus de la fourchette relevée) ; Crossbody Bag (matière non publiée) ; doublure de la Gazelle non publiée ; trois modèles en fin de série ; 15 produits avec une seule photo ; Rain Shell à 100 € provisoire jusqu'à validation du coût et de la marge.

## 5. Responsive acceptance

Largeurs testées : 320, 375, 430, 768, 1024, 1280, 1440, 1728 px.

- 91 fichiers HTML × 8 largeurs = 728 chargements : 0 débordement horizontal, 0 image cassée, 0 erreur console.
- Héros : hauteur d'écran exacte et bouton visible à chaque largeur.
- Accueil mesuré à 390, 768 et 1440 px : ratio 4:5 de toutes les cartes et tuiles, une seule taille de titre de section, boutons de 48 px, espacement de section unique.
- Menu mobile, filtres mobiles et Quick add en feuille vérifiés à 390 px.

## 6. Technical validation

| Contrôle | Résultat |
|---|---|
| `npm run lint` (syntaxe de tous les modules) | OK |
| `npm run build` | OK, 70 pages |
| `npm test` | 27 sur 27 |
| TypeScript | N'existe pas dans ce projet : non exécuté |
| ESLint | N'existe pas dans ce projet : non exécuté |
| Tests navigateur | 20 tests fonctionnels, 32 fiches, balayage 8 largeurs : passés |

## 7. Performance and accessibility

Lighthouse 13.5, Chrome sans interface, serveur local, build minifié, 9 octobre 2026. Performance / accessibilité / bonnes pratiques / SEO.

| Page | Mobile | Desktop | LCP mobile | CLS |
|---|---|---|---|---|
| Accueil | 88 / 100 / 100 / 92 | 99 / 100 / 100 / 92 | 3,8 s | 0 |
| Catalogue Sneakers | 96 / 100 / 100 / 92 | 100 / 100 / 100 / 92 | 2,7 s | 0 |
| Fiche produit | 97 / 100 / 100 / 92 | 100 / 100 / 100 / 92 | 2,4 s | 0 |
| Panier | 99 / 100 / 100 / 58 | 100 / 100 / 100 / 58 | 1,9 s | 0,04 |

- Cette série a été mesurée pendant qu'un autre test tournait : les scores de performance mobile peuvent être légèrement sous-évalués (série précédente : accueil 90, catalogue 98).
- SEO à 92 : URL canonique relative faute de domaine. Panier à 58 : page volontairement hors index.
- Limite restante : LCP mobile de l'accueil à 3,8 s en 4G lent simulé (feuille de style unique de 72 Ko bloquante).
- Accessibilité : titres ordonnés, textes alternatifs, boutons nommés, focus visible, `prefers-reduced-motion` respecté. Aucun audit formel ni test au lecteur d'écran.

## 8. Back-end integration requirements

Contrat détaillé : `docs/api-contract.md`. Chaque intégration ne touche qu'un module.

| Domaine | Contrat attendu | Implémentation locale à remplacer |
|---|---|---|
| Authentification | `POST /auth/register`, `/auth/login`, `/auth/password-reset` | Pages login, register, forgot-password : formulaires sans envoi |
| Comptes | `GET /account`, `GET /account/orders`, `GET/POST/PATCH/DELETE /account/addresses` | `src/js/pages/account.js` : états vides |
| Produits | `GET /products`, `GET /products/:slug`, `GET /brands`, `GET /categories`, `GET /search` | `products.json` lu par `src/js/data/catalog.js` et `search-source.js` |
| Stock, variantes, tailles | Stock par taille faisant autorité, réservation à l'ajout | Champ `inventory` du JSON, `normalise()` et `maxFor()` |
| Panier | `GET /cart`, `POST/PATCH/DELETE /cart/lines` ; prix recalculés côté serveur | `localStorage` clé `dublin01:cart` (`cart.js`) |
| Wishlist | `GET /wishlist`, `PUT/DELETE /wishlist/:slug`, fusion à la connexion | `localStorage` clé `dublin01:wishlist` |
| Commandes | `POST /orders`, `GET /orders/:id`, email de confirmation, rétractation en ligne | Checkout en 5 étapes sans création de commande ; `cancel-contract.html` sans envoi |
| Paiements | Champs hébergés du prestataire, 3-D Secure, webhooks | Point de montage vide `[data-payment-mount]` |
| Livraison | `POST /checkout/delivery-options` : transporteurs, tarifs, délais | Valeurs `commerce` de `src/js/config.js` |
| Newsletter | Prestataire et double consentement, point d'entrée à définir | `newsletter.js` : validation seule |
| Administration | Catalogue, prix, stock, commandes ; régénération des pages à la publication | Édition manuelle du JSON puis `npm run build` |

Modèles de données : `Product` (JSDoc dans `catalog.js`) ; ligne de panier `{ slug, size, qty }` ; wishlist `slug[]` ; consentement `{ necessary, analytics, marketing, decidedAt }`.

## 9. Outstanding issues

**Bloquants pour l'ouverture aux clients (pas pour l'intégration backend)**
- Aucun backend : paiement, commandes, stock, comptes, emails.
- Identité légale du vendeur absente (raison sociale, adresse, CRO, TVA, contact) : champs `null`, masqués.
- Pages légales non relues par un juriste ; aucune conformité revendiquée.
- Droits commerciaux sur les photos (Unsplash) et sur la vente des marques tierces à établir.

**À confirmer par le propriétaire**
- Seuil de livraison gratuite : tous les textes disent « over €100 » ; le calcul (panier, tiroir, checkout) l'accorde dès 100,00 € inclus. Visible depuis qu'un produit coûte 100 €. Non modifié.
- « Based in Dublin » (accueil, About, Terms, Privacy) : à confirmer avec l'adresse légale.
- Frais (4,95 € et 9,95 €), seuil de 100 €, retours sous 30 jours, mention TVA : valeurs de développement.
- Prix et données listés en section 4.

**Mineurs**
- « Shop rain shells » mène à un produit unique.
- Le seuil « €100 » est écrit en dur dans la barre d'annonce et dans des descriptions de page ; à relier à `config.js` si le seuil change.
- Pas de typecheck ni de linter de style.
- Non testé : Safari, Firefox, appareils réels, lecteur d'écran.

**Corrigé pendant cet audit**
- Description de la page Running & trail : citait adidas, qui n'a aucun produit dans cette collection.
- Page Clothing : « technical shells » et « rain shells » remplacés, le Rain Shell n'étant plus présenté comme une veste technique.

## 10. Final front-end status

**CONDITIONAL PASS.**

Tous les contrôles exécutables passent : build, tests, 20 tests fonctionnels, 32 fiches, 8 largeurs, accessibilité Lighthouse à 100. Aucun défaut bloquant du frontend n'a été trouvé, et le frontend est prêt pour l'intégration backend.

Le statut n'est pas « PASS » pour trois raisons documentées et non bloquantes : la règle du seuil de livraison n'est pas tranchée ; les tests Safari, Firefox, appareils réels et lecteur d'écran n'ont pas été faits ; il n'existe ni typecheck ni ESLint à exécuter.
