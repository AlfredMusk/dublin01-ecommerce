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

---

## PHASE 02 — TOP BAR + NAVBAR + HERO

**STATUS: PRODUCTION READY / VISUAL REVIEW**

Date : 4 octobre 2026. Passe finale de contrôle, corrections et vérification. Aucune nouvelle section, aucune refonte. En attente de la validation visuelle avant le gel.

### Vérifié

- **Barre d'annonce** : hauteur 32 px, message centré sur l'axe de la page (écart mesuré : 0 px), « 30-day returns » à gauche et « EN / EUR € » à droite à partir de 1024 px, message seul en dessous. Aucun défaut trouvé, rien modifié.
- **Navbar** : New, Men, Women, Sneakers, Clothing, Brands, Sale ; logo centré sur la page à toutes les largeurs (écart 0 px) ; aucun chevauchement entre navigation, logo et actions, y compris à 1280 px ; recherche réelle sur le catalogue local (résultats, Échap, clic extérieur) ; compte, favoris et panier ; menus déroulants et menu mobile. Aucun défaut trouvé, rien modifié.
- **Hero** : 4 campagnes, un cycle complet observé sur desktop et sur mobile (changement toutes les 6 s), boutons, cadrages, hauteur, contraste, clavier, mouvement réduit.
- **Bande blanche sous le Hero** : c'est le padding supérieur de la section suivante (144 px à 1440, 64 px à 390). Le Hero n'a ni marge ni padding en bas, et aucun conteneur vide ne le suit. Non modifié.
- **Largeurs** : 1440, 1280, 1024, 768, 430, 390 et 375 px, plus un téléphone couché (844×390). Aucun débordement horizontal.

### Corrigé

- **Points du carrousel retirés**, avec leur CSS et leur JS. Le mécanisme n'a plus aucun élément visible à la souris ni au tactile.
- **Slide 4 sur téléphone** : image portrait recadrée, les immeubles et la rue restent visibles au-dessus du texte (avant : surtout du ciel).
- **Téléphone couché** : le Hero tient dans l'écran sous l'en-tête et le bloc texte se resserre ; le bouton est visible sans faire défiler.
- **Téléphones courts (375×667)** : titre réduit pour que l'eyebrow ne recouvre plus les chaussures.
- **Lisibilité** : dégradé gauche légèrement renforcé derrière le texte sur desktop et halo discret sous le titre. Contraste mesuré sur les 4 photos aux 8 tailles, halo compris : au moins 6,2:1 pour l'eyebrow et la description, au moins 3,1:1 pour le titre.
- **Espace bas du bloc texte sur mobile** réduit (il était réservé aux points).

### Responsive

Eyebrow, titre, texte et bouton visibles sur les 4 campagnes aux 8 tailles ; bouton de 48 px de haut ; même marge gauche que la navbar (40, 24 ou 16 px selon la largeur) ; titre sur la même échelle typographique, avec une largeur propre à chaque campagne.

### Accessibilité

- Un bouton Pause / Play reste dans la page, visible uniquement au focus clavier : il permet d'arrêter le défilement (WCAG 2.2.2). Invisible à la souris et au tactile.
- Le défilement se suspend au survol, quand le focus clavier est dans une slide et quand l'onglet est caché. Avec `prefers-reduced-motion`, pas de défilement automatique, ni zoom ni mouvement.
- Balayage au doigt pour changer de campagne ; changement annoncé aux lecteurs d'écran.
- Chaque bouton est un lien réel avec anneau de focus visible ; textes alternatifs sur les 4 photos ; un seul `h1` dans la page.

### Console et technique

- Aucune erreur de console, aucune image cassée, aucune requête en échec. Un avis de Chrome sur le préchargement de la police apparaît parfois après un rechargement ; ce n'est pas une erreur.
- Un seul minuteur : après des survols répétés, puis Play, Pause, Play, le rythme reste de 6 s par campagne.
- Aucun décalage de mise en page (CLS mesuré : 0).
- Projet en JavaScript natif : pas de React, donc ni avertissement React ni hydratation.
- Aucune dépendance ajoutée, pas de CSS ni de JS mort lié aux anciens contrôles.

### Performance

- Première image du Hero chargée en priorité (`fetchpriority="high"`) ; les trois autres sont demandées une par une après son affichage.
- Images WebP : 1920×1080 pour le format large (142 à 193 Ko), 1080×1350 pour le portrait (117 à 161 Ko).
- `carousel.js` : 8,6 Ko non minifié. Animations en `opacity` et `transform` uniquement.

### Limites connues

- Sur les slides 3 et 4, le titre passe devant la veste et les immeubles (aucun visage ni chaussure couverts).
- Le lien de la barre d'annonce mesure 32 px de haut sur mobile (la hauteur de la barre).

### Fichiers modifiés

`scripts/build-html.mjs`, `src/js/modules/carousel.js`, `src/css/commerce.css`, `src/data/campaigns.json`, `public/images/editorial/hero-dublin-tall.webp`, `index.html` (généré).

---

**TOP BAR + NAVBAR + HERO = FROZEN V1.0** (validé en lançant la Phase 03, 2026-10-04)

---

## PHASE 03 — NEW ARRIVALS

Date : 4 octobre 2026. Périmètre : la section New Arrivals de l'accueil, première section sous le Hero. La barre d'annonce, la navbar et le Hero n'ont pas changé (captures de l'en-tête identiques au pixel à 1440, 1024 et 390). Les autres sections de l'accueil et le footer sont intacts.

### Architecture

Rien de concurrent n'a été créé : la section s'appuie sur le catalogue (`products.json`), la carte produit, le panier, les favoris, les dialogues et les toasts déjà en place. Un seul module nouveau, `quick-add.js`.

- **Section** : titre « New arrivals », phrase « Fresh drops selected for Dublin. », lien « View all » vers `pages/new.html`. Les 8 produits viennent des données (`isNew`, triés par `createdAt`), jamais d'une liste écrite dans le HTML.
- **Sélection actuelle** : 4 sneakers (ASICS GEL-Kayano 14, adidas Samba OG, New Balance 990v6 et 2002R) et 4 pièces DUBLIN/01 (veste, hoodie, tee, bonnet).

### ProductCard

Une seule carte, `productCard(product, { eager, quickAdd })` dans `product-card.js`, utilisée par l'accueil, le catalogue, la recherche, les favoris et la fiche produit. L'option `quickAdd` ajoute le bouton Quick add ; elle est activée pour New Arrivals. Contenu : image, badge, cœur, marque, nom, couleur, prix.

### Structure des données produit

Champs lus par la carte et le Quick add : `id`, `slug`, `brand`, `name`, `category`, `color`, `price`, `compareAtPrice`, `currency`, `images`, `sizeSystem`, `sizes`, `availableSizes`, `stock`, `isNew`, `isLimited`, `createdAt`. Le badge (New, Limited, Sold out, remise) et l'état épuisé sont calculés à partir de ces champs.

### Images

Ratio fixe 4:5, `object-fit: cover`, dimensions réservées (aucun décalage de mise en page), variantes `-sm` en `srcset`, chargement différé. Au survol avec une souris, la seconde image apparaît en fondu ; rien d'essentiel ne dépend du survol.

### Favoris

Bouton cœur avec `aria-pressed` et libellé « Save … to wishlist » / « Remove … from wishlist ». Le cœur se remplit, le compteur de la navbar se met à jour, l'état est partagé avec la page Wishlist (`wishlist.js`, localStorage).

### Tailles

- **Sneakers en pointures EU** (`sizeSystem: "EU"`, de 35.5 à 47 selon le modèle, demi-pointures comprises). Elles étaient en UK. La fiche produit, son guide des tailles, le filtre du catalogue (trié par ordre croissant) et la FAQ suivent.
- Vêtements de XS à XXL, pantalons en tour de taille, accessoires en taille unique.
- La disponibilité vient de `availableSizes` : une taille absente est affichée barrée, désactivée, et annoncée « unavailable ».
- Un ancien panier contenant une pointure UK n'est plus affiché (la ligne est ignorée, sans erreur).

### Quick Add

- **Souris, écran large (1280 px et plus)** : au survol ou au focus de la carte, une barre « Quick add » apparaît en bas de l'image. Un clic ouvre le choix de taille dans la carte, puis « Add to bag ». Fermeture par Échap, par un second clic ou en quittant la carte.
- **Tactile et écrans plus étroits** : un bouton « + » de 44 px, toujours visible sur l'image, ouvre une feuille en bas de l'écran (panneau latéral à partir de 1024 px) : produit, prix, tailles, « Add to bag ». Focus piégé, Échap, retour du focus sur le bouton.
- Sans taille choisie : message « Select a size first. ». Taille unique : ajout direct.
- La taille est revérifiée dans le catalogue au moment de l'ajout : une taille indisponible ou un produit épuisé ne peut pas entrer dans le panier, même en forçant le formulaire.
- Produit épuisé : badge « Sold out », image atténuée, pas de Quick add.

### Panier

Le Quick add appelle `addToCart(slug, size)` du panier existant (`cart.js`, localStorage). Une ligne contient le produit, la taille et la quantité ; nom, prix et image sont toujours relus dans le catalogue. Le compteur de la navbar s'anime et un toast confirme (« Added to bag: ASICS GEL-Kayano 14, EU 40 », avec un lien vers le panier).

### Prix

Format `€160.00`. Quand `compareAtPrice` existe : prix soldé, puis ancien prix barré. Aucune remise ajoutée : seuls les deux produits déjà soldés l'affichent.

### Navigation

Image et nom mènent à la fiche produit par `productUrl(slug)` (`pages/product.html?slug=…`). Le site est statique : des URL propres (`/products/slug`, `/new-arrivals`) viendront avec un serveur, en modifiant uniquement `paths.js`. Aucun lien en dièse.

### Responsive

Vérifié sur captures à 1440, 1280, 1024, 768, 430, 390 et 375 px : 4 colonnes à partir de 1024 px (8 produits), 3 colonnes sur tablette (6 produits), 2 colonnes sur téléphone (8 produits). Même ratio d'image partout, aucun texte ni prix coupé, aucun débordement horizontal.

### Accessibilité

Boutons et liens réels, textes alternatifs décrivant le produit et sa couleur, tailles en boutons radio regroupés (flèches du clavier, état sélectionné et désactivé natifs), anneau de focus visible, parcours complet au clavier testé (ouvrir, choisir, ajouter, Échap).

### Tests réalisés (Chrome, automatisés)

- **Flux A** : survol → seconde image → Quick add → taille → Add to bag → ligne présente dans le panier. OK.
- **Flux B** : cœur → état rempli, compteur à 1, produit présent sur la page Wishlist. OK.
- **Flux C** : clic sur le produit → fiche produit correcte, tailles en EU ; « View all » → `pages/new.html`. OK.
- **Flux D** : taille indisponible non sélectionnable ; envoi forcé refusé (« This size is unavailable. »), panier inchangé. OK.
- **Flux E** : produit épuisé sans Quick add ; envoi forcé refusé ; bouton désactivé sur la fiche produit. OK.
- Mobile (390 px) : feuille du bas, ajout, fermeture, retour du focus. OK.
- Pages catalogue, recherche, favoris, panier et fiche produit : toujours fonctionnelles. Console vide, aucune image cassée. Projet sans React.

### Corrigé pendant les tests

- Un clic sur une taille désactivée refermait le sélecteur (le focus partait sur `main`). Corrigé.
- À 1024 px, le sélecteur dans la carte dépassait de l'image : il n'est utilisé qu'à partir de 1280 px ; en dessous, le panneau latéral prend le relais.

### Photos corrigées

Trois produits montraient une photo d'un autre article. Règle appliquée : jamais la photo d'un autre modèle.

- **Rain Shell** : la photo 1 montrait une doudoune d'une autre marque, la photo 2 un imperméable clair. Remplacées par deux vestes noires à capuche sans logo (Wildan Ramdani Akbar, twentyonekoalas — Unsplash).
- **ASICS GEL-Kayano 14** : les trois photos montraient une GEL-Kinsei. Remplacées par une vraie GEL-Kayano 14 (Vlad Ciutacu — Unsplash) ; couleur corrigée en « White / Midnight ». Une seule photo, donc pas de seconde image au survol.
- **New Balance 2002R** : la photo montrait une 997H. Aucune photo libre de la 2002R : le produit devient « New Balance 997H, Grey » (110 €), avec la photo dont l'auteur indique le modèle ; la seconde photo, de modèle incertain, est retirée.
- **Heavyweight Hoodie et Boxy Tee** : secondes photos retirées (casquettes avec logos tiers).
- Crédits mis à jour dans `public/images/CREDITS.md`. Les photos 1 et 2 des 8 produits affichés ont été revues sur une planche.
- Reste à corriger hors New Arrivals : les photos de la Nike Pegasus 41 (page New) ne montrent pas ce modèle.

### Fonctionne maintenant / prêt pour un backend

- **Maintenant** : tout ce qui précède, côté navigateur (catalogue JSON local, panier et favoris en localStorage).
- **Prêt pour plus tard** : remplacer `loadProducts()` par un appel d'API qui garde le même schéma ; brancher panier et favoris sur un compte client ; stock en temps réel ; URL propres. La carte et le Quick add n'auront pas à changer.

### Fichiers

- **Créé** : `src/js/modules/quick-add.js`.
- **Modifiés** : `src/pages/index.html` (section New Arrivals), `src/partials/header.html` (dialogue Quick add, invisible), `src/js/modules/product-card.js`, `src/js/pages/home.js`, `src/js/main.js`, `src/js/modules/cart.js`, `src/js/data/catalog.js`, `src/js/pages/catalog.js`, `src/js/pages/product.js`, `src/css/commerce.css`, `src/data/products.json` (pointures EU), `src/pages/faq.html`, `src/pages/sneakers.html`, et les 21 pages générées.

---

## PHASE 03 — NEW ARRIVALS + RAIN EDITORIAL

Date : 4 octobre 2026. Périmètre : la section New Arrivals et la section « Rain is the dress code » de l'accueil. Barre d'annonce, navbar et Hero inchangés (captures de l'en-tête identiques au pixel à 1440, 1024 et 390 ; rotation du Hero revérifiée). « Shop by category » n'est pas commencé.

### Composants modifiés

- **New Arrivals** : pas de nouvelle carte ni de nouvel état ; la carte partagée (`product-card.js`), le Quick add (`quick-add.js`), le panier (`cart.js`) et les favoris (`wishlist.js`) de la Phase 03 sont conservés.
  - ASICS GEL-Kayano 14 : la photo sur fond bleu saturé jurait dans la grille. Remplacée par une vraie GEL-Kayano 14 argent sur fond gris (Tanaphong Toochinda, Unsplash) ; la couleur devient « Pure Silver » et l'identifiant du produit suit (`asics-gel-kayano-14-pure-silver`).
  - Grille : une colonne sous 360 px de large, deux colonnes au-dessus, trois sur tablette (rangées complètes), quatre sur desktop.
- **Rain is the dress code** : section refaite en composition asymétrique.
  - Photo : rue de Dublin sous une averse, passant en capuche, trottoir mouillé et reflets (E Vos, Unsplash, lieu indiqué : Dublin). Recadrée depuis l'original haute définition pour retirer le bord de parapluie et le chapeau coupé.
  - Desktop : la photo va jusqu'au bord gauche de l'écran (58 % de la largeur), le texte est à côté sur fond blanc, aligné sur la marge de la page. Tablette et téléphone : photo bord à bord, texte dessous. Aucun voile sombre sur la photo.
  - Texte : « Rain is the dress code. », puis « Built for Dublin weather. Technical layers, everyday jackets and waterproof essentials selected for the city. »
  - Deux boutons : « Shop jackets » → `pages/clothing.html?type=jackets` ; « Shop rain shells » → fiche de la Rain Shell.

### Fonctionnalités réellement actives

- Quick add : sélecteur de tailles dans la carte (souris, 1280 px et plus) ou feuille / panneau (tactile et écrans plus étroits), tailles indisponibles désactivées, « Add to bag » qui met à jour le vrai panier et le compteur.
- Favori : bascule avec `aria-pressed`, cœur rempli, compteur, sans navigation ni saut de page.
- Image et nom : lien vers `pages/product.html?slug=…`. Aucun lien en dièse dans ces deux sections.
- Section Rain : léger zoom de la photo au survol (1,02), entrée du texte en quatre temps à la première apparition, transitions des boutons. Rien de tout cela avec `prefers-reduced-motion`.

### Responsive

Testé dans Chrome à 1440, 1024, 768 et 390 px (et 340 px pour la grille en une colonne) : alignement de la grille, ratio 4:5 identique partout, aucune image cassée, aucun texte ni prix coupé, aucun débordement horizontal ; section Rain en deux colonnes à partir de 1024 px, empilée en dessous.

### Interactions testées

Survol et seconde image, Quick add, sélecteur de tailles, taille indisponible (clic et envoi forcé refusés), ajout au sac et compteur, favori et page Wishlist, navigation vers la fiche produit, parcours clavier, feuille mobile, les deux boutons de la section Rain (clic et focus clavier), mouvement réduit. Console vide.

### Bugs corrigés

- Photo du produit Kayano 14 incohérente avec la grille (voir ci-dessus).
- Ancien recadrage de la photo de pluie : bord noir en haut, chapeau coupé à droite.

### Limites

- « Shop rain shells » mène à une fiche produit : le catalogue ne compte qu'une veste de pluie aujourd'hui.
- Le badge NEW reste sur l'image (demande « keep NEW badges ») ; il n'a pas été déplacé dans le bloc d'informations.
- La photo de pluie montre des enseignes de la rue, petites et en arrière-plan.
- Quatre produits de la grille n'ont qu'une photo (Kayano 14, 997H, Heavyweight Hoodie, Boxy Tee : pas de seconde image au survol). La photo du hoodie est très sombre. Pas de point focal par image dans les données : les photos sont déjà recadrées en 4:5.
- Les photos de la Nike Pegasus 41 (page New, hors accueil) ne montrent pas ce modèle.

### Fichiers

`src/pages/index.html` (section Rain), `src/css/commerce.css` (bloc Rain, grille une colonne), `src/js/pages/home.js` (apparition du texte), `src/data/products.json` et `src/data/site.json` (Kayano 14), `public/images/editorial/rain-campaign-*.webp` (nouveaux), `dublin-rain-tall.webp` (supprimé), `public/images/products/asics-gel-kayano-14-pure-silver-1*.webp`, `public/images/CREDITS.md`, pages générées.

---

## MASTER BUILD — FRONTEND V1

Démarré le 4 octobre 2026. Avancement par jalons, un commit local par jalon.

### Jalon 1 — Audit, données, configuration

- **Architecture constatée** : site statique sans framework. HTML assemblé par `scripts/build-html.mjs` à partir de `src/pages`, `src/partials` et des données JSON ; Tailwind CSS v4 en ligne de commande ; modules JavaScript natifs (`src/js/modules`, `pages`, `utils`, `data`) ; état en localStorage (panier, favoris). Conservé tel quel : aucune migration de framework, aucune dépendance ajoutée.
- **Configuration centrale** : `src/js/config.js` (entreprise, règles de commerce, origine de production, fonctionnalités ouvertes). Lue par le navigateur et par le générateur. Tous les champs légaux sont à `null` : ils ne sont affichés nulle part tant qu'ils ne sont pas fournis.
- **Modèle produit** : ajout de `subcategory`, `colors` (familles de couleur), `inventory` (unités par taille), `material`, `care`, `collection`, `badge`. Le stock n'a plus qu'une source : `availableSizes`, `stock` et `available` sont calculés au chargement à partir de `inventory`.
- **Module de données unique** : `src/js/data/catalog.js` expose `getProducts`, `getProduct`, `getCategories`, `getBrands` (asynchrones, calquées sur la future API) et un typedef `Product`.
- **Contrat frontend / backend** : `docs/api-contract.md`.

### Jalon 2 — Routes et SEO

- **Nouvelles adresses**, toutes générées au build : `new-arrivals`, `men`, `women`, `sneakers`, `clothing`, `running-trail`, `accessories`, `sale`, `shop`, `brands`, `brands/<marque>`, `products/<produit>`, plus `login`, `register`, `forgot-password`, `account`. 57 pages au total.
- **Une page statique par produit et par marque** : titre, description, canonical, image de partage et données structurées propres (Product sans note ni avis, BreadcrumbList ; Organization et WebSite sur l'accueil).
- **Anciennes adresses** (`pages/*.html`, `?slug=`, filtres en paramètre) : redirigées vers les nouvelles.
- **Canonical** : relatif tant que le domaine n'est pas configuré ; absolu et sans `.html` dès que `siteUrl` est renseigné, avec génération du `sitemap.xml`.
- **Pages catalogue** : chaque page fixe son périmètre par un preset (catégorie, genre, style, marque, collection) ; Men et Women sont de vraies pages, plus des filtres sur une page générique.
- **Comptes** : connexion, inscription et mot de passe oublié séparés en trois pages, validation locale, message clair « comptes pas encore ouverts » ; page compte avec écrans commandes, adresses, profil et favoris en état vide.
- **Vérifié** : crawl automatique des 57 pages à 1440 et 390 px — aucun lien mort, aucune erreur console, aucune image cassée, un seul `h1` par page, aucun débordement ; 9 redirections testées.

### Jalons 3 à 5 — Recherche, panier, checkout, comptes, cookies, pages légales (5 octobre 2026)

- **Catalogue** : filtres marque, catégorie, type, style, genre, taille, couleur, prix, collection et disponibilité ; tri ; chips actives ; tout effacer ; tiroir mobile. Quick add activé sur toutes les grilles.
- **Recherche** : suggestions de marques et de catégories en plus des produits, recherche étendue (sous-catégorie, couleur, collection, matière), flèches haut et bas dans les suggestions, Échap.
- **Panier** : tiroir « Your bag » (lignes, quantité, retrait, sous-total, View bag, Checkout) ouvert après chaque ajout et depuis l'icône du sac ; page panier conservée. Quantité plafonnée par le stock de la taille ; lignes partagées entre tiroir et page (`bag-lines.js`).
- **Fiche produit** : matières et entretien, autres coloris du même modèle, livraison et retours tirés de la configuration.
- **Checkout** : cinq étapes (contact, livraison, adresse, paiement, revue), une seule ouverte à la fois, résumé et bouton Edit par étape. Aucun champ de carte. Bouton « Place order and pay » désactivé avec la raison affichée ; rien n'est stocké.
- **Cookies** : bandeau (tout accepter, refuser le non essentiel, gérer), dialogue de préférences réouvrable depuis le footer, choix en localStorage, événement `consent:change`, aucun script de suivi.
- **Pages** : Terms, Privacy, Cookies, Returns, Delivery réécrites ; Consumer rights, Accessibility et Size guide créées. Le retour sous 30 jours est présenté comme une politique commerciale, distincte du droit légal de rétractation de 14 jours. Les coordonnées de l'entreprise ne s'affichent que si elles sont renseignées dans la configuration.
- **Footer** : groupes Shop, Help, About, Legal complets, réglages cookies, mention « Portfolio project » supprimée. Mentions « preview » et « fictional » retirées de l'interface.
- **Testé** : crawl de 60 pages à 1440 et 390 (0 lien mort, 0 erreur console) ; tiroir panier, plafond de stock, persistance ; checkout pas à pas ; formulaires de compte ; consentement cookies ; newsletter.

### Reste à faire (interrompu par la limite d'usage)

- Passer le catalogue à environ 32 produits avec prix vérifiés et photos exactes ; corriger les photos de la Nike Pegasus 41.
- Jalon 6 : polissage de l'accueil, navigation mobile, normalisation des tokens.
- Jalon 7 : QA aux largeurs du brief, 5 scénarios client, tests `node:test`, rapport en 17 points.
- Intégrer les prix et la note juridique attendus du coordinateur ; republier l'aperçu (encore à la version des jalons 1-2).

### Catalogue — 33 produits, prix sourcés, photos exactes (5 octobre 2026)

- **Règle appliquée** : une photo doit montrer exactement le modèle vendu. Chaque photo de marque a été recoupée avec la description de son auteur ou un marquage lisible sur le produit.
- **Retirés** (aucune photo libre du bon modèle) : Nike Air Max 1, Nike Pegasus 41, adidas Ultraboost 1.0, ASICS GEL-1130 (ses deux photos montraient une Kayano 14).
- **Corrigé** : la « Salomon XT-6 » était en réalité une XA PRO 3D GORE-TEX (marquage « 3D Chassis » lisible) : produit renommé. Dunk Low : photo douteuse retirée, coloris nommé « White / Black ».
- **Ajoutés** : ASICS GEL-Kayano 14 White / Midnight (second coloris, relié au premier sur la fiche produit), Nike Cortez Leather, Nike Air Max 90 Iron Grey, Nike Pegasus Trail 5 GORE-TEX, adidas Samba OG Clay Strata, adidas Handball Spezial, New Balance 327, Fresh Foam X More v4 et Fresh Foam Garoé Midcut ; label DUBLIN/01 : Canvas Tote, Six-Panel Cap, Overshirt, Running Tee, Running Short.
- **Répartition** : 17 sneakers, 11 vêtements, 5 accessoires ; 7 produits Running & trail ; hommes, femmes et unisexe.
- **Prix** : corrigés d'après les boutiques officielles irlandaises (990v6 à 250 €, Kayano 14 à 170 €), source et date conservées dans `priceSource` (jamais affiché) et dans `docs/pricing-sources.md`. Quatre modèles sans source vérifiée sont marqués « valeur de développement ».
- **Remises** : plus aucun `compareAtPrice`. Aucune réduction n'est affichée sans historique de prix réel ; la page Sale montre un état vide soigné.
- **Limites** : les photos de la 990v6 ne portent pas de description nommant le modèle ; le pantalon de la photo Overshirt montre un petit logo tiers.

### Jalons 6 et 7 — Accueil, QA finale, tests (5 octobre 2026)

- **Accueil** : hiérarchie Hero → New arrivals → Rain is the dress code → Shop by category → The ones we wear → Brands → After the last tram → services → footer. En-têtes de section harmonisés (titre puis phrase), bouton réel sur la campagne « After the last tram », léger mouvement d'image au survol des catégories, DUBLIN/01 présenté comme label maison dans les marques. Les compteurs de marques sont calculés depuis les données.
- **Filtres** : Marque et Taille passent en tête et sont ouverts par défaut.
- **Prix du label et Salomon** ajustés (Rain Shell 195, Half-Zip Fleece 115, Crew Socks 25, Six-Panel Cap 39, XA PRO 3D 150).
- **Tests automatisés** (`npm test`, `node:test`, aucune dépendance) : 19 tests — intégrité du catalogue (champs, tailles, stock dérivé, images présentes et non partagées, pas de remise inventée, sources de prix), recherche, formatage des prix, panier (plafond de stock, totaux, lignes périmées), favoris. `npm run check` = build + tests.
- **QA** : crawl automatique des 70 pages aux 10 largeurs du brief (320, 375, 390, 430, 768, 820, 1024, 1280, 1440, 1728) : aucun lien mort, aucune erreur console, aucune image cassée, un `h1` par page, aucun débordement horizontal.
- **Scénarios client** (Chrome) : 1. accueil → New arrivals → produit → taille → sac → panier → checkout ; 2. recherche « New Balance » → produit → favori → page Wishlist → ajout au sac ; 3. Women → filtre taille → filtre marque → tri → produit, retour arrière qui restaure les filtres ; 4. Brands → adidas → produit → produits liés et coloris ; 5. mobile → menu → Sneakers → filtre → produit → erreur de taille → sac. Les cinq passent.

### Frontière frontend / backend

Fonctionne aujourd'hui dans le navigateur : catalogue, filtres, tri, recherche, fiche produit, sac, favoris, consentement cookies. En attente d'un backend, sans rien simuler : authentification et comptes, stock réel, commandes, paiement, e-mails, newsletter, formulaire de contact, tarifs de livraison, TVA, administration, mesure d'audience. Détail par point d'entrée dans `docs/api-contract.md`.

### Informations à fournir par l'entreprise

Dans `src/js/config.js` : nom légal, adresse du siège, numéro CRO, numéro de TVA, e-mail et téléphone du service client, horaires, nom de domaine. À confirmer : frais et seuil de livraison, durée et frais des retours, prix du label, prix des quatre modèles marqués « valeur de développement ». Les pages légales sont un résumé prudent à faire relire par un juriste avant ouverture.
