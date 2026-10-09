# DUBLIN/01 — Feuille de route d'apprentissage

Objectif : comprendre le code existant, fichier par fichier, puis le modifier à la main et reconstruire soi-même quelques composants. Aucune leçon n'est commencée ici : ce document dit seulement quoi lire, dans quel ordre, et quoi essayer.

Méthode pour chaque étape : **lire** le fichier, **prédire** ce qui se passe si on change une ligne, **changer** cette ligne, **vérifier** dans le navigateur, puis **annuler** avec `git restore <fichier>`.

Avant de commencer : `npm install`, puis `npm run dev` et http://localhost:3001. Après chaque essai : `npm run check`.

| # | Thème | À lire dans le dépôt | Exercices à faire soi-même |
|---|---|---|---|
| 1 | Structure du dépôt | `README.md` (section Project Structure), `package.json`, `.gitignore` | Dessiner l'arborescence de mémoire. Expliquer la différence entre `src/` (ce qu'on écrit) et les `.html` à la racine (ce qui est généré). |
| 2 | HTML : construction d'une page | `src/partials/layout.html`, `src/partials/header.html`, `src/partials/footer.html`, `src/pages/delivery.html`, `src/partials/info-head.html` | Créer une page `src/pages/test.html` avec un titre et un paragraphe, lancer `npm run build`, l'ouvrir. Repérer `<header>`, `<main>`, `<nav>`, `<footer>` et la hiérarchie `h1` → `h2` → `h3`. |
| 3 | Générateur de pages | `scripts/build-html.mjs` (lire d'abord les commentaires, puis la fonction `render`) | Suivre le trajet d'un `{{title}}` depuis l'en-tête d'un fichier de `src/pages` jusqu'au HTML généré. |
| 4 | CSS : jetons et bases | `src/css/theme.css`, `src/css/base.css`, `src/css/typography.css` | Changer `--spacing-section` et observer l'accueil. Changer une couleur du thème, puis annuler. |
| 5 | CSS : composants | `src/css/components.css` (boutons, liens), `src/css/commerce.css` (carte produit, grille, héros) | Reconstruire le bouton `.btn-primary` dans un fichier HTML vide, sans regarder le code. |
| 6 | Responsive | Dans `src/css/commerce.css` : `.product-grid`, `.hero`, `.rain` ; dans `src/css/theme.css` : les points de rupture | Dans les outils du navigateur, passer de 320 à 1440 px et noter à quelle largeur la grille change de nombre de colonnes, puis retrouver la règle. |
| 7 | Tailwind CSS 4 | `src/css/main.css`, `src/css/layout.css`, et les classes utilitaires de `src/pages/index.html` (`grid-site`, `col-span-full`, `mt-6`, `lg:col-span-5`) | Expliquer ce que fait `lg:` devant une classe. Ajouter `md:mt-12` à un élément et vérifier la largeur à partir de laquelle il s'applique. |
| 8 | JavaScript : bases et modules | `src/js/main.js`, `src/js/utils/format.js`, `src/js/utils/dom.js` | Expliquer `import` et `export`. Écrire une fonction `formatPrice` soi-même et comparer. |
| 9 | Manipulation du DOM | `src/js/modules/toast.js`, `src/js/modules/newsletter.js`, `src/js/utils/dialog.js` | Refaire la validation de la newsletter dans une page vide : un champ, un bouton, un message. |
| 10 | Données produit | `src/data/products.json`, `src/js/data/catalog.js` (`normalise`, `loadProducts`, le type `Product`) | Ajouter un produit de test dans le JSON, lancer `npm run check`, lire les tests qui échouent et comprendre pourquoi, puis annuler. |
| 11 | Carte produit et listes | `src/js/modules/product-card.js`, `src/js/pages/home.js`, `src/js/pages/catalog.js` | Afficher la liste des noms de produits dans la console. Trier un tableau de produits par prix à la main. |
| 12 | Recherche | `searchProducts` dans `src/js/data/catalog.js`, `src/js/modules/search.js`, `src/js/pages/search.js` | Expliquer pourquoi « samba » trouve 2 produits. Écrire une recherche simple sur le nom seulement. |
| 13 | Wishlist | `src/js/modules/wishlist.js`, `src/js/pages/wishlist.js` | Reconstruire une wishlist minimale : un bouton qui ajoute un identifiant à une liste et un compteur qui se met à jour. |
| 14 | Panier | `src/js/modules/cart.js`, `src/js/modules/bag-lines.js`, `src/js/modules/bag-drawer.js`, `src/js/pages/bag.js` | Calculer un sous-total à la main pour trois lignes, puis lire `cartDetails`. Expliquer le rôle de `maxFor`. |
| 15 | Stockage du navigateur | `src/js/utils/storage.js` | Ouvrir l'onglet Application des outils du navigateur, observer les clés `dublin01:cart` et `dublin01:wishlist` pendant qu'on ajoute un produit. |
| 16 | Fiche produit et tailles | `src/templates/product.html`, `src/js/pages/product.js`, `src/js/modules/quick-add.js` | Expliquer pourquoi on ne peut pas ajouter un produit sans taille. Trouver où le message d'erreur est écrit. |
| 17 | Tests et débogage | `tests/cart.test.mjs`, `tests/catalogue.test.mjs`, `tests/site.test.mjs` | Écrire un test qui vérifie qu'un panier vide a un sous-total de 0. Casser volontairement une fonction, lire l'erreur, réparer. Utiliser `console.log` et un point d'arrêt dans le navigateur. |
| 18 | Git et GitHub | `git log --oneline`, `git status`, `git diff` | Créer une branche `apprentissage`, faire un commit par exercice, comparer avec `main`. Ne jamais pousser la branche locale `backup/local-before-publish`. |

## Composants à reconstruire en fin de parcours

1. Un bouton et un lien avec leurs états de survol et de focus.
2. Une carte produit statique en HTML et CSS.
3. Une grille de cartes responsive.
4. Une wishlist qui persiste dans `localStorage`.
5. Un panier avec quantité, suppression et sous-total.
6. Une recherche sur un tableau de produits.

Chaque reconstruction se fait dans un dossier à part (par exemple `apprentissage/`), puis se compare au code du projet.
