# Mes fiches de révision

Site statique minimal : une page d'accueil (`index.html`) qui liste des fiches,
chaque fiche étant un fichier HTML autonome dans `chapitres/`, avec un style
partagé dans `assets/style.css`.

## Structure

```
site/
├── index.html                     <- page d'accueil (liste des chapitres)
├── assets/
│   └── style.css                  <- style partagé par toutes les pages
└── chapitres/
    └── chapitre-02-langages-reguliers.html
```

## Ajouter un nouveau chapitre

1. Fais-moi générer (ou génère toi-même) la fiche HTML du nouveau chapitre.
2. Dans le `<head>` de cette fiche, remplace le bloc `<style>...</style>`
   par : `<link rel="stylesheet" href="../assets/style.css">`
   (si tu pars d'une fiche que je t'ai donnée précédemment, dis-moi de le
   faire directement, je sais extraire le CSS automatiquement).
3. Ajoute, en haut de la page (dans `.top-title`), un lien retour :
   `<a href="../index.html" class="home-link">← Mes fiches</a>`
4. Enregistre le fichier dans `chapitres/`, par exemple
   `chapitres/chapitre-03-automates.html`.
5. Dans `index.html`, duplique un bloc `<a class="chapter-card">...</a>`,
   change le `href` et le texte.
6. Redéploie (voir ci-dessous) — c'est tout.

## Déployer — option recommandée : GitHub Pages

1. Crée un compte GitHub (gratuit) si tu n'en as pas.
2. Crée un nouveau dépôt, par exemple nommé `mes-fiches`.
3. Mets tout le contenu de ce dossier `site/` à la racine du dépôt
   (tu peux glisser-déposer les fichiers directement sur la page GitHub
   du dépôt, pas besoin de ligne de commande).
4. Dans le dépôt : Settings → Pages → Source → choisis la branche `main`
   et le dossier `/ (root)` → Save.
5. Après 1-2 minutes, ton site est en ligne à :
   `https://TON-PSEUDO.github.io/mes-fiches/`
6. Pour chaque mise à jour future : reviens sur GitHub, uploade/édite les
   fichiers modifiés (bouton "Add file" → "Upload files"), et c'est
   republié automatiquement en quelques secondes.

## Déployer — option zéro-compte : Netlify Drop

1. Va sur https://app.netlify.com/drop
2. Glisse le dossier `site/` entier dans la zone de dépôt.
3. Une URL est générée immédiatement (ex. `random-name-123.netlify.app`).
4. Limite : sans créer de compte, chaque mise à jour demande de redéposer
   le dossier entier. Avec un compte gratuit, tu peux reconnecter le même
   site et juste re-glisser le dossier à chaque changement.

## Tester en local avant de déployer

Double-clique simplement sur `index.html` — ça s'ouvre dans ton navigateur
et tous les liens internes fonctionnent (pas besoin de serveur pour un
site aussi simple).
