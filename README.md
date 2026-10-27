# La Ménagère du Chaos : guide de mise en ligne (pour James)

Site d'autrice d'Isabelle Augier-Jeannin. Site statique généré par [Eleventy](https://www.11ty.dev/) à partir de fichiers Markdown et JSON, hébergé sur Cloudflare Pages, et modifiable par Isabelle via [Pages CMS](https://pagescms.org).

Le rendu reprend à l'identique la maquette validée par Isabelle. Seul changement visible : la police EB Garamond est maintenant servie depuis le site lui-même (plus d'appel à Google Fonts), et chaque rubrique a sa propre adresse (`/actualite/`, `/en-finalisation/`…) au lieu d'ancres `#`.

## Comment ça marche

```
Isabelle ──(Pages CMS)──► commit dans le dépôt GitHub ──► Cloudflare Pages lance « npm run build » ──► site en ligne (~1 min)
                                       │
                                       └──► GitHub Action « Optimisation des médias » : recompresse les vidéos / images trop lourdes
```

## Arborescence

| Chemin | Rôle |
|---|---|
| `src/contenu/oeuvres/*.md` | Une œuvre par fichier (front matter YAML + présentation en Markdown). Le champ `rubrique` choisit la page : `en-voie-d-edition`, `en-finalisation` ou `masquee`. Le champ `ordre` fixe la position. |
| `src/contenu/actualites/*.md` | Une annonce par fichier, triées par `date` (la plus récente en haut). |
| `src/_data/accueil.json`, `qui.json`, `contacts.json`, `confidentialite.json` | Contenu des pages uniques. |
| `src/_data/reglages.json` | Nom du site, e-mail, adresse du site, réglages du formulaire. |
| `src/medias/images/`, `src/medias/videos/` | Médias (servis sous `/medias/…`). C'est là que Pages CMS dépose les fichiers. |
| `src/_includes/` | Gabarits Nunjucks (`base.njk`, `macros.njk`). |
| `src/assets/` | CSS, JS, polices, favicon. |
| `.pages.yml` | Configuration de l'interface Pages CMS (libellés en français pour Isabelle). |
| `.github/workflows/optimiser-medias.yml` | Compression automatique des médias. |
| `MODE-D-EMPLOI.md` | Le guide pour Isabelle. |

Détails pratiques :

- Le Markdown est rendu avec `breaks: true` : un simple retour à la ligne devient `<br>` (poèmes, extraits).
- Un filtre `typo` (dans `eleventy.config.js`) ajoute les espaces insécables avant `; : ! ?` et dans les guillemets `« »`, met en exposant `4e`, `1er`, et surligne les passages `[à compléter …]`.
- Dans les extraits marqués « dialogue », le texte en gras s'affiche en petites capitales (noms de personnages).
- Dans la bibliographie, un nom en CAPITALES (4 lettres ou plus) s'affiche en petites capitales.

## Mise en ligne, étape par étape

### 1. Dépôt GitHub

```bash
cd menagere-du-chaos
git init -b main
git add -A
git commit -m "Site La Ménagère du Chaos"
git remote add origin git@github.com:<toi>/menagere-du-chaos.git
git push -u origin main
```

Le dépôt peut être privé. Il pèse environ 25 Mo (dont ~21 Mo de vidéos).

Dans **Settings → Actions → General → Workflow permissions**, coche **Read and write permissions**, sinon l'action de compression ne pourra pas pousser ses commits.

### 2. Cloudflare Pages

*Workers & Pages → Create → Pages → Connect to Git*, puis choisis le dépôt.

| Réglage | Valeur |
|---|---|
| Framework preset | None (ou Eleventy) |
| Build command | `npm run build` |
| Build output directory | `_site` |
| Variable d'environnement | `NODE_VERSION` = `22` (un fichier `.node-version` est aussi fourni) |

Ensuite, *Custom domains* pour brancher le nom de domaine. Limite à garder en tête : 25 Mio par fichier sur Pages. Les vidéos actuelles font toutes moins de 6 Mo, et l'action de compression ramène les nouvelles sous ce seuil dans la grande majorité des cas.

Pour tester en local : `npm install` puis `npm start` (serveur sur http://localhost:8080).

### 3. Formulaire de contact

Cloudflare Pages ne traite pas les formulaires : il faut un service extérieur qui reçoit le POST et l'envoie par e-mail à augier-jeannin@outlook.fr. Le JavaScript (`src/assets/js/site.js`) envoie le formulaire en `fetch` (`FormData`, en-tête `Accept: application/json`) vers l'adresse définie dans les réglages, et affiche un message de réussite ou d'erreur.

Dans `src/_data/reglages.json` (ou dans Pages CMS, rubrique *Réglages du site*) :

- **Web3Forms** : `formulaire_adresse_envoi` = `https://api.web3forms.com/submit`, et dans `formulaire_champs_caches` ajoute `{ "nom": "access_key", "valeur": "<la clé reçue>" }`. Un piège à robots `botcheck` est déjà dans le formulaire.
- **Formcarry / Forminit** : `formulaire_adresse_envoi` = l'URL du formulaire fournie par le service, sans champ caché.

Tant que `formulaire_adresse_envoi` est vide, le bouton « Envoyer » invite simplement à écrire à l'adresse e-mail.

Pense ensuite à compléter la politique de confidentialité (nom du service, hébergeur, adresse postale, date) : les passages `[à compléter : …]` sont surlignés en gris sur le site tant qu'ils restent.

### 4. Pages CMS

1. Va sur https://app.pagescms.org et connecte-toi avec GitHub.
2. Installe l'application GitHub de Pages CMS sur le dépôt.
3. Ouvre le dépôt : Pages CMS lit `.pages.yml` et affiche les rubriques.
4. Dans les réglages du dépôt sur Pages CMS, invite Isabelle comme **collaboratrice** avec son adresse e-mail. Elle n'a pas besoin de compte GitHub.
5. Envoie-lui le fichier `MODE-D-EMPLOI.md` (ou imprime-le).

### 5. Dernières vérifications

- Remplir `adresse_site` dans les réglages (ex. `https://www.lamenageereduchaos.fr`, sans `/` final) pour les aperçus de partage et l'URL canonique.
- Mentions légales : à ajouter si Isabelle le souhaite (éditrice, coordonnées, hébergeur Cloudflare, SIRET). Il suffit d'un fichier `src/mentions-legales.njk` sur le modèle de `politique-de-confidentialite.njk`, et d'un lien dans le pied de page de `base.njk`.

## Modifier l'apparence

Tout l'aspect visuel est dans `src/assets/css/style.css` et les gabarits `src/_includes/`. Isabelle n'y a pas accès depuis Pages CMS : c'est voulu, l'apparence a été validée et doit rester stable.
