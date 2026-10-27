import markdownIt from "markdown-it";

// Markdown : un simple retour à la ligne dans l'éditeur devient un vrai retour à la ligne sur le site
// (utile pour les poèmes et les extraits découpés en lignes).
const md = markdownIt({ html: true, breaks: true, linkify: false, typographer: false });

// Les liens vers d'autres sites s'ouvrent dans un nouvel onglet.
const defaultLinkOpen = md.renderer.rules.link_open || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const href = tokens[idx].attrGet("href") || "";
  if (/^https?:\/\//.test(href)) {
    tokens[idx].attrSet("target", "_blank");
    tokens[idx].attrSet("rel", "noopener");
  }
  tokens[idx].attrJoin("class", "lien");
  return defaultLinkOpen(tokens, idx, options, env, self);
};

const NBSP = " ";   // espace insécable
const NNBSP = " ";  // espace fine insécable

// Typographie française appliquée au texte (jamais aux balises ni aux adresses des liens) :
// espaces insécables avant ; ! ? : et à l'intérieur des guillemets « », exposants (4e, 1er),
// et repérage des passages « [à compléter …] ».
function typoTexte(t) {
  return t
    .replace(/[   ]+([;!?])/g, NNBSP + "$1")
    .replace(/[   ]+([:»])/g, NBSP + "$1")
    .replace(/«[   ]*/g, "«" + NBSP)
    .replace(/(\d) (kg|g|km|m|cm|mm|h|min|€|%)(?=[\s.,;:!?)]|$)/g, "$1" + NBSP + "$2")
    .replace(/\b(\d+)(ème|eme)\b/g, "$1<sup>e</sup>")
    .replace(/\b(\d+)(er|re|e)(?=[\s ,.;:!?)]|$)/g, "$1<sup>$2</sup>")
    .replace(/\[(à compléter[^\]]*)\]/gi, '<span class="a-completer">$1</span>');
}

function typo(html) {
  if (!html) return "";
  // On découpe le HTML en balises / texte et on ne retouche que le texte.
  return String(html)
    .split(/(<[^>]+>)/g)
    .map((part) => (part.startsWith("<") ? part : typoTexte(part)))
    .join("");
}

export default function (eleventyConfig) {
  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addPassthroughCopy({ "src/medias": "medias" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Filtres utilisés dans les gabarits
  eleventyConfig.addFilter("md", (s) => (s ? typo(md.render(String(s))) : ""));
  eleventyConfig.addFilter("mdInline", (s) => (s ? typo(md.renderInline(String(s))) : ""));
  eleventyConfig.addFilter("typo", (s) => typo(s));
  // Chaque paragraphe devient un élément de liste (rubrique « À l'origine… » de l'accueil).
  eleventyConfig.addFilter("enListe", (html) =>
    String(html || "").replace(/<p>/g, "<li><p>").replace(/<\/p>/g, "</p></li>")
  );
  // Noms de famille écrits en capitales (ex. « DAGUINOT ») : affichés en petites capitales.
  eleventyConfig.addFilter("petitesCapitales", (html) =>
    String(html || "").replace(/\b([A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸ]{4,})\b/g, (m) =>
      `<span class="sc">${m.charAt(0)}${m.slice(1).toLowerCase()}</span>`
    )
  );
  eleventyConfig.addFilter("annee", () => new Date().getFullYear());

  // Œuvres : triées selon le champ « ordre »
  eleventyConfig.addCollection("oeuvres", (api) =>
    api
      .getFilteredByGlob("src/contenu/oeuvres/*.md")
      .sort((a, b) => (Number(a.data.ordre) || 0) - (Number(b.data.ordre) || 0))
  );
  // Actualités : les plus récentes en premier, sans celles qui sont masquées
  eleventyConfig.addCollection("actualites", (api) =>
    api
      .getFilteredByGlob("src/contenu/actualites/*.md")
      .filter((i) => !i.data.masquer)
      .sort((a, b) => new Date(b.data.date || 0) - new Date(a.data.date || 0))
  );
  eleventyConfig.addFilter("rubrique", (items, nom) => (items || []).filter((i) => i.data.rubrique === nom));

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    templateFormats: ["njk", "md"],
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
}
