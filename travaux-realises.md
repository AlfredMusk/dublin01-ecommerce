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

## PHASE 02 — PRODUCTION HEADER & HERO

Suite de la Phase 02, sur la base du commit `ca4d35f`. Périmètre : barre d'annonce, barre de navigation, Hero de l'accueil. Rien n'a changé sous le Hero (vérifié par comparaison avec le commit précédent) ; les 19 autres pages ne changent que par le header partagé.

### IMPLEMENTED NOW

**Composants créés**
- `src/data/site.json` : contenu de la barre d'annonce et arbre de navigation (libellés, routes, groupes des mega-menus, produit mis en avant).
- `src/data/campaigns.json` : les campagnes du Hero (`id`, `eyebrow`, `title`, `description`, `image.wide`, `image.tall`, `imageAlt`, `objectPosition`, `titleWidth`, `ctaLabel`, `ctaHref`).
- `src/js/modules/carousel.js` : comportement du carrousel.
- `src/js/data/search-source.js` : adaptateur de source de recherche.
- `src/pages/shop.html` → `pages/shop.html` : route catalogue générique (gabarit catalogue existant, preset vide).
- Six photos `public/images/editorial/hero-*.webp` (trois campagnes, versions large et verticale).

**Composants modifiés**
- `scripts/build-html.mjs` : génère au build la barre d'annonce, la navigation desktop (avec mega-menus), le menu mobile et le Hero à partir des deux fichiers de données ; surveille aussi `src/data`.
- `src/partials/header.html` : coquille du header, sans liste de liens écrite à la main.
- `src/css/header.css`, `src/css/commerce.css` (bloc Hero uniquement).
- `src/js/modules/search.js`, `src/js/modules/header.js`, `src/js/utils/dom.js`, `src/js/pages/catalog.js`, `src/js/pages/search.js`, `src/js/pages/home.js`.
- `public/images/CREDITS.md`.

**Barre d'annonce**
- Hauteur 36 → 32 px. Message commercial centré sur le viewport (écart mesuré : 0 px à 390, 768, 1024, 1280, 1366, 1440 et 1920 px) grâce à une grille `1fr auto 1fr`. À partir de 1024 px : « 30-day returns » à gauche, « EN / EUR € » à droite.
- Un seul message affiché (le premier de `announcement.messages`) : pas de rotation, donc rien à mettre en pause.

**Barre de navigation**
- Hauteur 72 → 64 px sur desktop (56 px une fois la page défilée), 60 → 56 px sur mobile (52 px défilée).
- Une seule ligne : catégories à gauche, DUBLIN/01 centré, recherche et actions à droite.
- Catégories issues de `site.json`, rendues deux fois par le même générateur : barre desktop et menu mobile. Barre desktop : New, Men, Women, Sneakers, Clothing, Brands, Sale. Menu mobile : les mêmes plus Accessories.
- Barre de catégories et champ de recherche visibles à partir de 1280 px. De 1024 à 1279 px, le header garde la composition compacte (Menu, logo centré, icônes) : sept catégories, un logo centré et un champ de recherche ne tiennent pas proprement sur une ligne en dessous de 1280 px, et une seconde ligne aurait porté le haut de page à 124 px au lieu de 96.
- État courant : `aria-current` posé au build pour les pages simples, et au chargement pour les liens à paramètres (Men, Women, Sale).

**Branding**
- Wordmark : 24 → 32 px sur desktop, 20 → 24 px sur mobile, graisse 800, interlettrage -0,06em. « /01 » en mono à 40 %, posé sur la ligne de capitales. Écart au centre du viewport : 0 px à toutes les largeurs testées.

**Architecture de la recherche**
- Toute l'interface passe par `search(query, { limit })` de `search-source.js`, qui renvoie `{ query, total, results }`.
- Desktop : champ réel dans la navbar (`<form role="search">`, placeholder « Search brands, products, categories... »), résultats instantanés dans un panneau sous le header (miniature, marque, nom, prix), flèche bas pour entrer dans les résultats, Échap et clic extérieur pour fermer, Entrée vers `pages/search.html?q=`.
- Tablette et mobile : icône qui ouvre l'overlay existant, branché sur le même adaptateur.
- La recherche fonctionne aujourd'hui sur le catalogue de démonstration local (`products.json`), classé dans le navigateur.

**Architecture du Hero**
- Les quatre campagnes sont rendues en HTML statique au build. La première porte son image en `src` avec `fetchpriority="high"` ; les trois autres en `data-src`, chargées après l'événement `load` (ou à la première interaction).
- Chaque campagne a une image large (1920 × 1080) et une verticale (1080 × 1350) recadrée à la source, plus un `objectPosition`.
- Hauteur : `100svh` moins le header, moins 64 px sur desktop et 48 px sur mobile, pour laisser deviner la suite. Mesuré : 740 px à 1440 × 900 (bas du Hero à 836 px), 708 px à 390 × 844 (bas à 796 px).

**Comportement du carrousel**
- Fondu croisé de 900 ms (la slide sortante reste opaque sous la slide entrante, sans passage par le noir), léger recul de l'image (échelle 1,04 → 1), texte en fondu avec 12 px de translation.
- Lecture automatique : 6 s par campagne, pilotée par l'animation CSS de la barre de progression (un seul minuteur, aucun `setInterval`).
- Contrôles : précédent, suivant, pause/lecture, pagination cliquable (une barre par campagne), compteur « 01 / 04 », flèches gauche et droite au clavier, balayage tactile horizontal (le défilement vertical reste libre).
- Mise en attente au survol et quand l'onglet est masqué. Quand le focus clavier entre dans le carrousel, la lecture s'arrête jusqu'à un Play explicite. Après une action manuelle à la souris, la lecture reprend sur la campagne choisie.

**Accessibilité**
- Région `aria-roledescription="carousel"`, slides `role="group"` numérotées, slides inactives `inert` (leurs liens ne sont pas atteignables au clavier).
- Un seul `h1`, masqué visuellement, placé hors des slides (une slide inactive est `inert`) ; les quatre titres de campagne sont des `h2`.
- Changement manuel annoncé dans une zone `aria-live` polie ; la lecture automatique n'annonce rien.
- `prefers-reduced-motion` : pas de lecture automatique, pas de mouvement ; les contrôles manuels restent disponibles.
- Boutons du carrousel et de la navbar : 44 px minimum. Focus visible partout (anneau blanc sur le Hero).

**Performance**
- Aucune dépendance ajoutée. Décalage de mise en page cumulé mesuré sur l'accueil : 0.
- Images du Hero : 91 à 342 Ko en WebP. Seule la première est demandée avec la page (à 176 ms dans le test) ; la suivante est chargée ensuite.
- Transitions limitées à l'opacité et aux transformations ; seule la hauteur de la barre de navigation est animée lors du passage en mode compact.

**Routes et CTA**

| Élément | Route |
| --- | --- |
| New | `pages/new.html` |
| Men | `pages/shop.html?gender=men,unisex` (21 produits) |
| Women | `pages/shop.html?gender=women,unisex` (18 produits) |
| Sneakers | `pages/sneakers.html` |
| Clothing | `pages/clothing.html` |
| Accessories | `pages/clothing.html?type=accessories` |
| Brands | `pages/brands.html` |
| Sale | `pages/shop.html?collection=sale` |
| Campagne 1 « Shop collection » | `pages/shop.html` |
| Campagne 2 « Shop clothing » | `pages/clothing.html` |
| Campagne 3 « Shop sneakers » | `pages/sneakers.html` |
| Campagne 4 « Explore new arrivals » | `pages/new.html` |

Les 41 liens du header, du menu mobile et du Hero répondent 200.

**Images du Hero** (Unsplash, licence Unsplash, crédits dans `public/images/CREDITS.md`)
- Campagne 1 : photo déjà en place depuis la V1 (Josh Hild).
- Campagne 2 : Kyler Boone.
- Campagne 3 : Alexander Grey (baskets blanches sans marque identifiable ; une première photo montrait des Vans, marque non vendue, et a été remplacée après relecture).
- Campagne 4 : Kamilla Isalieva.

**Tests effectués** (Chrome piloté par Playwright)
- Mise en page à 390, 768, 1024, 1280, 1440 et 1920 px sur six pages (36 combinaisons) : logo et message centrés, aucun débordement horizontal, aucun chevauchement, aucune zone sous 44 px dans la navbar.
- Carrousel : lecture automatique, précédent, suivant, pagination, clavier, pause au survol, bouton pause puis reprise, balayage dans les deux sens, mouvement réduit, chargement différé des images.
- Recherche : résultats, absence de résultat, Échap, clic extérieur, champ vide refusé, envoi vers la page de résultats, exclusivité avec les mega-menus.
- Mega-menus (survol, diagonale, Échap), menu mobile (huit entrées, accordéon, piège du focus, Échap), header compact au scroll.
- Console : aucune erreur ni avertissement.
- Non testé : lecteur d'écran réel, appareil tactile réel, Safari et Firefox.

**Bugs détectés et corrigés pendant la phase**
- Le survol ne mettait pas le carrousel en pause (règle CSS écrasée par l'animation).
- Quatrième photo initiale trop chargée (enseignes réelles, texte peu lisible) : remplacée.
- Recadrages verticaux de deux photos qui coupaient le sujet sur mobile : refaits.

**Corrections issues de la relecture indépendante** (toutes revérifiées dans Chrome)
1. Bloquant : en mouvement réduit, un Play manuel faisait défiler les slides à chaque image (la règle globale réduisait aussi l'animation qui sert d'horloge). L'animation de progression garde sa durée réelle et `carousel.js` ignore tout cycle de moins d'une seconde. Mesuré : 2 changements en 13 s.
2. `h1` sorti des slides ; titres de campagne en `h2`.
3. Icône pause/lecture qui ne changeait pas (attribut `hidden` sur un SVG) : corrigé.
4. Flèches du clavier limitées aux contrôles : depuis le bouton d'une slide, elles ne font plus perdre le focus.
5. Contraste : dégradé bas ajouté sur desktop sous les contrôles, dégradé mobile renforcé, description en blanc.
6. Le panneau de recherche ne se rouvre plus après Échap, un clic ailleurs ou l'ouverture d'un mega-menu (frappe en attente et recherche en cours annulées).
7. Men et Women incluent les produits unisexes : 21 et 18 produits au lieu de 5 et 2.
8. Photo de la campagne 3 remplacée (marque non vendue).
9. Champ de recherche : `aria-expanded` retiré, formulaire nommé « Site search ».
10. Résultats placés juste après le champ dans le DOM ; Échap depuis un résultat rend le focus au champ.
11. « 1 result » et « View 1 result » ; miniatures décoratives ; annonce du nombre de résultats après 700 ms.
12. Le panneau se ferme quand la fenêtre passe sous 1280 px.
13. Si le catalogue ne se charge pas : message « Search is unavailable right now », sans erreur non gérée.
14. La deuxième image et l'horloge ne démarrent qu'une fois la première image affichée.
15. Fondu sans passage par le noir.
16. Zoom à deux doigts rétabli sur le Hero (`touch-action: pan-y pinch-zoom`).
17. Focus clavier entrant : pause jusqu'à un Play ; contrôles placés avant les slides dans le DOM.
18. Menu mobile : doublons « All sneakers » et « All clothing » supprimés.
19. `shop.html` : titre correct dès le premier affichage ; état courant de Men, Women et Sale recalculé à chaque changement de filtre.
20. Barre d'annonce centrée jusqu'à 320 px.
21. Un changement du réglage système ne relance jamais une lecture mise en pause.
22. Anneau de focus des liens de la barre d'annonce entièrement visible.
23. Contrôles du carrousel alignés sur l'axe du bouton (mesuré : même centre à 732 px).

#### Revue 2 — bugs détectés et corrigés

Seconde revue indépendante, limitée à la barre d'annonce, la navbar, la recherche et le Hero. Chaque point a été reproduit avant correction.

- **A. Slide 3, titre posé sur la basket.** « miles. » recouvrait la chaussure gauche de 1024 à 1920 px. Deux corrections cumulées : `hero-miles-wide.webp` recadrée depuis l'original d'Alexander Grey pour placer les chaussures dans le tiers droit, et titre limité à `8ch` (trois lignes : Made for / everyday / miles.). Mesuré à 1024, 1280, 1440 et 1920 : aucune lettre sur les chaussures ; contraste minimal du titre 4,57 / 4,28 / 3,65, et à 1920 px 0,1 % des pixels sous 3:1 (peinture jaune sous « everyday », min 2,5, mesuré sans l'ombre). Images réencodées : wide 419 Ko → 186 Ko, tall 262 Ko → 119 Ko. Texte alternatif et cadrage enregistrés dans `campaigns.json`.
- **B. Perte de focus.** Avec la lecture active, le focus placé sur le bouton d'une slide tombait sur `body` à la rotation. La lecture est maintenant tenue (`data-holding`) tant que le focus est dans une slide et reprend quand il en sort. Testé : 15 s sur le bouton, la slide ne change pas.
- **C. Liens Fit.** `gender=men` et `gender=women` excluaient les unisexes. Les liens passent à `men,unisex` et `women,unisex` dans `site.json`, donc dans les mega-menus et le menu mobile des 21 pages. Le lien Unisex est conservé.
- **D. Barre de progression.** Pistes non remplies montées de 35 % à 50 % de blanc.
- **E. Contraste du petit texte.** Halo sombre discret (`text-shadow`) sur l'eyebrow, la description et le compteur, sans assombrir les photos.
- **F. Connexion lente.** L'autoplay n'avance que si l'image suivante est chargée (attente de `load` ou `error`, plafonnée à 4 s). L'image suivante est demandée dès que la courante est affichée, les autres au repos (`requestIdleCallback`). Testé avec une image retardée de 9 s.
- **G. Recherche.** Le coloris figure dans chaque résultat (les deux Boxy Tee se distinguent). `catalog.js` ne garde plus en cache un chargement échoué, donc un nouvel essai peut réussir. `pages/search.html` affiche un message court si le catalogue ne se charge pas, sans erreur non gérée. Un clic hors du formulaire ferme le panneau et le voile ; Échap ferme toujours, même si le focus n'est plus dans le champ.
- **H. Navigation.** L'état courant de Men, Women et Sale suit la même règle que le titre (genre non unisexe, sinon collection) : il survit à un tri ou à un filtre. « All sneakers » et « All clothing » n'apparaissent plus qu'une fois par mega-panneau. Sur Men, Women et Sale, le fil d'Ariane et l'introduction suivent le titre.

Non traité, hors périmètre de cette revue : sur téléphone (390 px), le mot « for » du titre de la slide 3 touche encore la chaussure ; l'original ne laisse pas assez de bitume sous les chaussures pour un recadrage vertical propre. `home.js` garde le même défaut de chargement que la page de recherche avait (sous le Hero, à reprendre plus tard).

#### Revue 3 — bugs détectés et corrigés

Dernière passe, limitée au carrousel et à la slide 3.

1. **Slide 3 sur téléphone et tablette.** Le titre couvrait les chaussures à 390 px et la chaussure droite sortait du cadre à 768 px. Nouveau recadrage portrait depuis l'original (chaussures entre 20 et 40 % de la hauteur, 154 Ko), ancré en haut (`50% 0%`). Le portrait est servi sous 64rem en orientation portrait ; en paysage, l'image large reste utilisée. `objectPosition` a deux valeurs (wide, tall) dans `campaigns.json`, appliquées par le CSS selon la source. Vérifié sur captures à 390, 430 et 768 : aucune lettre sur les chaussures, les deux chaussures dans le cadre.
2. **Titre coupé sur écrans bas.** La taille du titre est plafonnée par la hauteur du Hero. Eyebrow et haut du titre visibles sur les 4 slides à 1280x720, 1366x768, 1024x600 et 844x390.
3. **Maintien pendant l'attente d'image.** Survol, focus clavier dans une slide et onglet caché sont respectés aussi quand l'image suivante charge encore ; la slide n'avance qu'à la levée du maintien. Testé : image retardée de 13 s, focus sur le bouton, la slide ne change pas et le focus reste.
4. **Pas de slide noire.** Si l'image suivante n'est pas prête après 4 s, la slide courante reste et la barre repart. Sur un clic (point, précédent, suivant), la slide sortante reste affichée jusqu'au chargement de l'entrante, 1,5 s au plus.
5. **Préchargement étagé.** Les images 3 et 4 ne sont demandées qu'après la fin du chargement de la 2.
6. **Focus souris.** Un clic souris sur le bouton d'une slide ne bloque plus la lecture ; seul le focus clavier la tient.
7. **Pistes de progression.** Liseré sombre de 1 px pour rester visibles sur les reflets clairs.

### READY FOR FUTURE BACKEND INTEGRATION

Rien de ce qui suit n'est branché aujourd'hui ; ce sont les points d'entrée prévus.

- **Recherche** : remplacer le corps de `search()` dans `search-source.js` par un appel d'API qui respecte le même contrat. Ni la navbar ni l'overlay ni la page de résultats ne changent.
- **Navigation** : `site.json` peut être produit par un CMS ou une API ; le générateur ne lit que ce fichier.
- **Barre d'annonce** : `announcement.messages` accepte plusieurs messages (retours, nouveauté, promotion). La rotation n'est pas écrite ; elle devra rester accessible (pause, pas d'annonce répétée, mouvement réduit).
- **Campagnes du Hero** : `campaigns.json` peut être alimenté par un CMS ; dates de début et de fin, ciblage et mesure des clics ne sont pas prévus dans le schéma actuel.
- **Men, Women, Sale** : ces routes filtrent le catalogue local côté navigateur ; un backend pourra servir les mêmes URL.
- **Langue et devise** : « EN / EUR € » est un affichage, pas un sélecteur.
- **Compte, wishlist, panier** : inchangés depuis la V1 (LocalStorage, aucune donnée client).

### Commit

`feat: build production header and campaign hero` (commit local unique de cette phase).

---

## PHASE 02 — FINALISATION HERO

Date : 4 octobre 2026. Périmètre : Hero uniquement. La barre d'annonce et la navbar sont validées et n'ont pas été modifiées (captures avant et après identiques au pixel à 1440, 1024 et 390 px).

### Changements du Hero

- **Contrôles retirés** : compteur « 01 / 04 », bouton pause visible, flèches précédent et suivant, barres de progression, avec leur CSS et leur JS.
- **Ce qui reste visible** : quatre points discrets (6 px, zone cliquable 24 × 44 px), en bas à gauche sur mobile et tablette, en bas à droite sur desktop.
- **Quatre campagnes, un objectif commercial chacune** (`src/data/campaigns.json`) :
  1. Autumn / Winter 26 — « Built for wet pavements. » → *Shop new arrivals* (`pages/new.html`)
  2. Footwear edit — « Made for everyday miles. » → *Shop sneakers* (`pages/sneakers.html`)
  3. Streetwear edit — « City layers. Dublin energy. » → *Shop the edit* (`pages/clothing.html`)
  4. Dublin essentials — « Ready for every route. » → *Explore collection* (`pages/shop.html`)
- **Photos** : la slide 1 est recadrée (la basket en haut, le texte sur le bitume sombre, plus aucune lettre sur la chaussure). La slide 4 utilise une vraie photo de Dublin au crépuscule après la pluie (Guillaume Henrotte, Unsplash) à la place de la photo de nuit précédente. Crédits à jour dans `public/images/CREDITS.md`.
- **Variation éditoriale** : largeur du bloc titre et point focal propres à chaque campagne (titre sur deux ou trois lignes), dans un seul système typographique.

### Comportement du carrousel

- Défilement automatique toutes les 6 secondes, par un minuteur JavaScript qui conserve le temps restant pendant un survol ou une pause (mesuré : 5,8 s, 11,9 s, 17,8 s, 23,8 s).
- Fondu enchaîné de 900 ms ; la slide sortante reste opaque dessous. Zoom lent de l'image active de 1,06 à 1 (transform seul). Entrée du texte en quatre temps décalés.
- La slide ne change jamais vers une image non chargée : attente de 4 s au plus, sinon un nouveau cycle sur la slide courante. Images suivantes chargées une par une.
- Balayage au doigt sur mobile ; flèches gauche et droite du clavier depuis les points.
- Aucun décalage de mise en page (CLS mesuré : 0).

### Responsive

Vérifié sur captures à 1440×900, 1280×800, 1280×720, 1024×768, 768×1024, 390×844, 375×667 et 844×390 : eyebrow, titre et bouton visibles sur les 4 campagnes, aucune lettre sur les chaussures, aucun débordement horizontal.

- Sous 1024 px en portrait : image portrait dédiée, sujet en haut, texte en bas.
- Téléphones courts (moins de 704 px de haut) : titre réduit pour laisser le haut de la photo au sujet.
- Titre plafonné par la hauteur du Hero sur les écrans bas.
- Limite connue : téléphone en paysage (844×390), le Hero (480 px minimum) dépasse la hauteur de l'écran ; le bouton s'atteint en faisant défiler.

### Accessibilité

- Le bouton Pause / Play existe toujours mais n'apparaît qu'au focus clavier (exigence WCAG 2.2.2 : pouvoir arrêter un contenu qui défile seul).
- Le défilement se suspend au survol, quand le focus clavier est dans une slide et quand l'onglet est caché ; il s'arrête jusqu'à un Play quand le focus clavier entre dans le Hero.
- `prefers-reduced-motion` : pas de défilement automatique, ni zoom ni mouvement ; points et balayage restent actifs.
- Chaque point est un bouton nommé (« Show campaign 2 of 4: … ») ; chaque bouton d'achat est un vrai lien dont le nom commence par le libellé visible.

### Fichiers modifiés

`src/data/campaigns.json`, `scripts/build-html.mjs` (bloc Hero), `src/js/modules/carousel.js`, `src/css/commerce.css` (bloc Hero), `src/css/base.css` (exception d'animation retirée), `public/images/editorial/hero-wide.webp`, `hero-tall.webp`, `hero-miles-tall.webp`, `hero-dublin-wide.webp` et `hero-dublin-tall.webp` (nouveaux), `hero-night-*.webp` (supprimés), `public/images/CREDITS.md`, `index.html` (généré).

### Implémenté maintenant / prêt pour plus tard

- **Maintenant** : tout ce qui précède. Aucune dépendance ajoutée.
- **Plus tard** : campagnes servies par un CMS (même schéma JSON), dates de début et de fin, mesure des clics. Les sections sous le Hero ne sont pas commencées.
