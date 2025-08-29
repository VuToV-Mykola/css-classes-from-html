const commentManager = require("./commentManager");
const globalRules = require("./globalRules");

const PROP_ORDER = {
  layout: ["display", "position", "top", "right", "bottom", "left", "z-index"],
  flexGrid: [
    "flex",
    "flex-direction",
    "justify-content",
    "align-items",
    "grid",
    "gap",
  ],
  boxModel: ["width", "height", "margin", "padding", "border", "border-radius"],
  typography: [
    "font-family",
    "font-size",
    "font-weight",
    "line-height",
    "text-align",
    "color",
  ],
  visual: ["background", "opacity", "box-shadow"],
  animation: ["transition", "transform", "animation"],
};

function generateCSS(
  classes,
  dict,
  global = true,
  reset = true,
  tokens = null,
  selTags = null
) {
  const blocks = [commentManager.getFileHeader()];
  if (global) blocks.push(globalRules.getGlobalRules(reset, selTags));
  const clsCSS = classes
    .map((c) => {
      const info = dict[c];
      return info && hasValid(info) ? generateClassCSS(c, info) : "";
    })
    .filter(Boolean);
  const allCSS = [...blocks, ...clsCSS].join("\n");
  const used = selTags
    ? new Set(allCSS.match(/var\((--[\w-]+)/g)?.map((x) => x.slice(4, -1)))
    : null;
  if (tokens) blocks.push(genVars(tokens, used));
  blocks.push(...clsCSS);
  const mq = genMQ(classes, dict, tokens);
  if (mq.trim()) blocks.push(mq);
  return blocks.filter((b) => b.trim()).join("\n\n");
}

function genVars(tokens, used) {
  const out = ["/* Design tokens */", ":root {"];
  [
    ["colors", "--color"],
    ["typography", "--font"],
    ["spacing", "--space"],
    ["effects", "--shadow"],
    ["breakpoints", "--bp"],
  ].forEach(([k, p]) => {
    if (tokens[k]) {
      const filtered = used
        ? Object.fromEntries(
            Object.entries(tokens[k]).filter(([key]) => used.has(`${p}-${key}`))
          )
        : tokens[k];
      if (Object.keys(filtered).length) {
        out.push(`  /* ${k} */`);
        Object.entries(filtered).forEach(([key, val]) =>
          out.push(`  ${p}-${key}: ${val};`)
        );
      }
    }
  });
  out.push("}");
  return out.join("\n");
}

function generateClassCSS(name, { properties = {}, pseudo = {} }) {
  const b = [commentManager.getClassComment(name)];
  const cats = {};
  Object.entries(properties).forEach(([k, v]) => {
    const cat =
      Object.keys(PROP_ORDER).find((c) => PROP_ORDER[c].includes(k)) || "other";
    (cats[cat] || (cats[cat] = {}))[k] = v;
  });
  const css = [];
  Object.entries(PROP_ORDER).forEach(([cat, props]) => {
    const o = cats[cat];
    if (o && Object.keys(o).length) {
      css.push(`  /* ${cat} */`);
      Object.entries(o).forEach(([k, v]) => css.push(`  ${k}: ${v};`));
    }
  });
  if (css.length) {
    b.push(`.${name} {`);
    b.push(...css);
    b.push("}");
  }
  Object.entries(pseudo).forEach(([p, props]) => {
    b.push(`\n.${name}${p} {`);
    Object.entries(props).forEach(([k, v]) => b.push(`  ${k}: ${v};`));
    b.push("}");
  });
  return b.join("\n");
}

function genMQ(classes, dict, tokens) {
  const bp = tokens?.breakpoints || { tablet: "768px", desktop: "1158px" };
  const mq = [];
  Object.entries(bp).forEach(([k, v]) => {
    if (k === "mobile") return;
    const rules = classes
      .map((c) => {
        const r = dict[c]?.responsive?.[k];
        return r && Object.keys(r).length
          ? [
              `  .${c} {`,
              ...Object.entries(r).map(([p, val]) => `    ${p}: ${val};`),
              "  }",
            ].join("\n")
          : "";
      })
      .filter(Boolean);
    if (rules.length) {
      mq.push(`@media (min-width: ${v}) {`, ...rules, "}");
    }
  });
  return mq.join("\n");
}

function createClassDictionary(classes, opts = {}, parents = {}, tags = {}) {
  const dict = {};
  classes.forEach((c) => {
    dict[c] = {
      properties: getProps(c, opts.designTokens, tags, parents),
      pseudo: getPseudo(c, opts.designTokens),
      responsive: opts.responsive ? getResp(c, opts.designTokens) : {},
    };
  });
  return dict;
}

const PATTERNS = {
  header: {
    "border-bottom": "1px solid var(--color-border)",
    "box-shadow": "var(--shadow-light)",
  },
  hero: {
    "background-color": "var(--color-dark)",
    color: "var(--color-white)",
    "text-align": "center",
    padding: "120px 0",
  },
  btn: {
    "background-color": "var(--color-primary)",
    color: "var(--color-white)",
    "border-radius": "4px",
    padding: "16px 32px",
    border: "none",
    cursor: "pointer",
  },
};

function getProps(c, tokens, tags, parents) {
  let p = tokens?.classStyles?.[c] || {};
  Object.entries(PATTERNS).forEach(([k, v]) => {
    if (c.includes(k)) Object.assign(p, v);
  });
  return p;
}

function getPseudo(c) {
  const ps = {};
  if (/link|btn/.test(c)) {
    ps[":hover"] = { color: "var(--color-hover)" };
    if (/btn/.test(c)) ps[":hover"]["background-color"] = "var(--color-hover)";
  }
  return ps;
}

function getResp(c) {
  const r = {};
  if (c === "container") {
    r.tablet = { "max-width": "768px" };
    r.desktop = { "max-width": "1158px" };
  }
  return r;
}

function hasValid({ properties = {}, pseudo = {}, responsive = {} }) {
  return (
    Object.keys(properties).length ||
    Object.keys(pseudo).length ||
    Object.keys(responsive).length
  );
}

module.exports = { generateCSS, createClassDictionary };
