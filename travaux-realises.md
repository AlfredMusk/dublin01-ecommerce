# DUBLIN/01 — Travaux réalisés

Journal technique permanent du projet. Chaque phase importante est ajoutée à la suite ; l'historique n'est jamais réécrit.

## Phase 01 — Foundation

Résumé de ce qui existait avant la Phase 02, reconstitué d'après `git log` et le code.

| Commit | Contenu |
| --- | --- |
| `408ae1b` chore: initial project setup | Arborescence, Tailwind CSS v4 (CLI), scripts npm, page de vérification d'environnement. |
| `bbd909f` fix: call local binaries by path | Le « : » du dossier parent `DUBLIN:01` cassait le PATH de npm : les scripts appellent `node_modules/.bin/...`. |
| `61889ca` chore: serve on fixed port 3001 | Le port 3000 est occupé par un autre projet de la machine. |
| `210e6ec` feat: establish DUBLIN01 design system | Tokens (`theme.css`) : couleurs noir/blanc/neutres, échelle typographique fluide Geist Sans + Geist Mono auto-hébergées, espacements base 4 px, grille 4/8/12, boutons, liens, icônes, motion (180/300/520 ms), focus visible, `prefers-reduced-motion`. |
| `bbcdc8f` feat: build DUBLIN01 premium navigation | Header global : barre d'annonce, navigation desktop avec mega-menus, menu mobile plein écran, overlay de recherche, header sticky. |
| `4f93f4a` style: refine DUBLIN01 navigation identity | Wordmark (DUBLIN en graisse 800 + « /01 » mono en exposant), libellés à 13 px, actions alignées, marges optiques identiques. |
| `41511df` feat: build complete DUBLIN01 ecommerce v1 | V1 complète : 20 pages assemblées par `scripts/build-html.mjs` à partir de `src/pages` et `src/partials`, 23 produits (`src/data/products.json`), catalogue filtrable piloté par l'URL, fiche produit, panier et wishlist en LocalStorage, recherche client, checkout UI (Irlande, Eircode) sans paiement, pages d'aide et légales, footer. Photos Unsplash locales (crédits dans `public/images/CREDITS.md`). |

État à la fin de la Phase 01 : boutique navigable et testée (375 à 1920 px), sans backend. Produits, prix et stocks fictifs.

## Phase 02 — Premium Header & Navigation

### Objectif

Faire passer le header de « fonctionnel » à « premium » sans toucher au contenu des pages : barre d'annonce, navigation desktop et mobile, mega-menus, recherche, compteurs, comportement sticky et micro-interactions.

### Audit initial

Mesuré dans Chrome avant toute modification (7 largeurs, 375 à 1920 px).

Déjà en place et conservé :
- Structure gauche / centre / droite, logo centré au pixel (écart 0 px à toutes les largeurs, même avec un compteur à deux chiffres).
- Soulignement animé des liens (300 ms), `aria-current` sur New et Brands.
- Mega-menus ouvrables au survol, au clic et au clavier ; Échap, clic extérieur.
- Menu mobile plein écran en `<dialog>` : accordéons, piège du focus, Échap, blocage du scroll, focus restauré.
- Recherche client avec résultats instantanés (miniature, marque, nom, prix).
- Compteurs Bag et Wishlist réels (LocalStorage).

Faiblesses relevées :
- Barre d'annonce : deux textes posés, sans séparation ni lien ; rien à droite sur tablette.
- Header sticky sans compaction : 72 px en permanence sur desktop, 60 px sur mobile.
- Mega-menus : colonnes de liens + encart typographique ; pas de produit réel, pas de pied de panneau, pas de voile sur la page.
- Lien « Women » du mega-menu Clothing menant à une liste vide.
- Survol : en allant en diagonale d'un lien vers le panneau, frôler le lien voisin faisait basculer le menu.
- Aucun état « section courante » sur Sneakers / Clothing.
- Compteur Bag identique à 0 et à n ; aucun retour visuel lors d'un changement.
- Recherches populaires : « Limited » seulement, sans titre de section.

### Fichiers modifiés

- `src/partials/header.html` — barre d'annonce, liste de navigation, mega-menus, voile, recherches populaires, liens du menu mobile.
- `src/css/header.css` — barre d'annonce, compaction sticky, wordmark, états de navigation, mega-menu, voile, compteurs.
- `src/js/modules/header.js` — intention au survol, produit mis en avant chargé depuis le catalogue.
- `src/js/modules/cart.js`, `src/js/modules/wishlist.js` — état vide et transition des compteurs.
- `src/js/modules/search.js` — titre « Products » au-dessus des résultats instantanés.
- `scripts/build-html.mjs` — `aria-current="true"` sur le déclencheur de la section courante.
- `index.html`, `404.html`, `pages/*.html` — régénérés (header partagé uniquement).

Fichier créé : `travaux-realises.md`.

### Fonctionnalités ajoutées

- Barre d'annonce : « Free delivery… » (lien vers Delivery) à gauche ; à droite « 30-day returns » (lien vers Returns) puis « EN / EUR € » séparés par un filet vertical de 12 px. Tablette : livraison + retours. Mobile : livraison seule, centrée.
- Header compact au scroll : 72 → 60 px sur desktop, 60 → 56 px sur mobile, wordmark réduit à 94 %, filet inférieur. Retour naturel en haut de page.
- Mega-menu éditorial pleine largeur : quatre colonnes (Shop, By style / Categories, Brands / Accessories, Fit), produit mis en avant, pied de panneau (« All sneakers » + rappel livraison et retours), voile à 28 % sur la page.
- Produit mis en avant : lu dans `products.json` à la première ouverture (ASICS GEL-Kayano 14, Rain Shell), avec photo, marque, nom, couleur, prix et lien. Si le produit disparaît du catalogue, l'encart typographique d'origine reste affiché.
- Navigation : le lien survolé ou ouvert reste noir, ses voisins passent en gris ; soulignement permanent sur la section courante.
- Compteurs : Bag gris à 0, noir dès 1 article ; Wishlist masqué à 0 ; courte transition (opacité + 4 px) à chaque changement réel.
- Recherche : section « Popular searches » (Samba, New Balance, Running, Rain jackets, Hoodies) et titre « Products » au-dessus des résultats.

### Design decisions

- Aucune nouvelle couleur, aucun dégradé, aucun flou. Le relief vient des filets de 1 px, du gris `neutral-600` et de l'espace.
- « /01 » : 46 % de la taille de DUBLIN (50 % avant), mono, posé sur la ligne de capitales : plus petit, plus technique, toujours aligné.
- Le header garde une boîte de hauteur fixe ; seule la barre intérieure se compacte. La page ne bouge donc jamais (hauteur du document et position du contenu vérifiées identiques).
- « Best sellers » et « Retro » de l'exemple n'ont pas été repris : aucune donnée de vente ni style « retro » dans le catalogue. Remplacés par des filtres réels (Limited, Sale, Trail, Skate).
- « Gore-Tex » n'a pas été repris dans les recherches populaires : aucun produit ne correspond. Chaque terme affiché renvoie au moins un résultat.
- « Women » retiré du mega-menu Clothing (aucun vêtement femme dans le catalogue actuel).
- Image du mega-menu : uniquement la photo d'un produit réel du catalogue, jamais une image décorative.

### Responsive

Testé à 375, 430, 768, 1024, 1280, 1440 et 1920 px, sur l'accueil, le catalogue Sneakers, une fiche produit et le panier (28 combinaisons) : écart du logo au centre 0 px, aucun débordement horizontal, aucun chevauchement des trois zones, contenu des pages à la même position qu'avant (96 px sous le haut sur mobile et tablette, 108 px sur desktop).

### Accessibility

- `header` / `nav` sémantiques, `aria-expanded`, `aria-controls`, `aria-current` (page et section), libellés accessibles des compteurs (« Bag, 1 item », « Wishlist, 1 item »).
- Clavier : Tab et Shift+Tab dans l'ordre visuel, Entrée ouvre un mega-menu, Tab entre dans le panneau, Échap ferme et rend le focus au déclencheur.
- Menu mobile et recherche : piège du focus, Échap, focus restauré.
- Zones tactiles de la barre de navigation : 44 px minimum. Liens de la barre d'annonce : 36 px de haut (hauteur de la barre).
- `prefers-reduced-motion` : toutes les transitions du header sont neutralisées.

### Tests effectués

Chrome piloté (Playwright) : mesures géométriques, survol avec intention (passage rapide, arrêt, diagonale, changement de section, sortie), clic, clavier, Échap, clic extérieur, sticky aller-retour, recherche (focus, résultats, Échap), cinq recherches populaires, compteurs à 0, 1 et 12, menu mobile (piège du focus, accordéon, Échap, recherche depuis le menu), mouvement réduit, console. Revue visuelle par captures à 375, 768, 1024, 1440 et 1920 px.

Non testé : lecteur d'écran réel, appareil tactile réel, Safari et Firefox.

### Bugs détectés

1. Passage en diagonale du lien « Sneakers » vers le produit mis en avant : le menu basculait sur « Clothing ».
2. « Hoodies & sweats » passait sur deux lignes dans le mega-menu à 1024 px.
3. Lien « Women » du mega-menu Clothing vers une liste vide (présent depuis la Phase 01).

### Bugs corrigés

1. Intention au survol refaite : ouvrir (110 ms) et changer de section (140 ms) exigent que le curseur s'arrête sur le lien ; quitter le lien annule le changement ; entrer dans le panneau annule toute fermeture en attente ; tolérance de sortie 260 ms.
2. Libellé raccourci en « Hoodies ».
3. Lien retiré ; la colonne Fit ne propose que des filtres qui ont des produits.

### Points restant à traiter

- Les liens de la barre d'annonce font 36 px de haut (sous les 44 px visés pour le tactile).
- Le produit mis en avant est choisi à la main dans le balisage ; une règle éditoriale (nouveauté la plus récente, par exemple) pourra le piloter.
- Pas de navigation aux flèches dans les résultats instantanés de la recherche.
- Sélecteur de langue et de devise : affichage seulement.

### Commit

`feat: refine DUBLIN01 premium header navigation`
