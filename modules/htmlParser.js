// Модуль для парсингу HTML та витягування CSS класів
function extractClasses(html) {
  const cls = new Set(),
    parents = {},
    tags = {},
    hier = new Map();
  let m;
  const clsRx = /class="([^"]*)"/g;
  while ((m = clsRx.exec(html)))
    m[1]
      .split(/\s+/)
      .filter((c) => c)
      .forEach((c) => {
        cls.add(c);
        if (!parents[c]) parents[c] = new Set();
        if (!tags[c]) tags[c] = new Set();
      });

  const tagRx = /<(\w+)[^>]*class="([^"]*)"[^>]*>/g;
  while ((m = tagRx.exec(html))) {
    const t = m[1].toLowerCase();
    m[2]
      .split(/\s+/)
      .filter((c) => c)
      .forEach((c) => tags[c] && tags[c].add(t));
  }

  return {
    classes: [...cls],
    classParents: parents,
    classTags: tags,
    classHierarchy: hier,
  };
}

function extractIds(html) {
  const ids = new Set();
  let m;
  while ((m = /id="([^"]*)"/g.exec(html))) ids.add(m[1].trim());
  return [...ids];
}

const COMP_PATTERNS = {
  header: [/header/i, /\.header/],
  hero: [/\.hero/],
  features: [/\.features/],
  team: [/\.team/],
  portfolio: [/\.portfolio/],
  footer: [/footer/i, /\.footer/],
};
const LAYOUT_PATTERNS = {
  flexbox: [/flex/i, /display:\s*flex/i],
  grid: [/grid/i, /display:\s*grid/i],
  container: [/\.container/],
};

function analyzeStructure(html) {
  const s = {
    components: {},
    layout: { usesFlexbox: false, usesGrid: false, hasContainer: false },
  };
  Object.entries(COMP_PATTERNS).forEach(
    ([k, v]) => (s.components[k] = v.some((p) => p.test(html)))
  );
  Object.entries(LAYOUT_PATTERNS).forEach(
    ([k, v]) => (s.layout[k] = v.some((p) => p.test(html)))
  );
  return s;
}

module.exports = { extractClasses, extractIds, analyzeStructure };
