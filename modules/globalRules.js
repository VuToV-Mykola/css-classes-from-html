const commentManager = require("./commentManager");

function getGlobalRules(reset = true, tags = null) {
  let r = "";
  if (reset) {
    r += `${commentManager.getTranslation("reset_rules")}\n`;
    r += `*, *::before, *::after {box-sizing:border-box}
*{margin:0;padding:0}
html{scroll-behavior:smooth;font-size:clamp(1rem,.75rem+1.5vw,1.25rem)}
body{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;min-height:100vh;min-height:100dvh;line-height:1.6}
`;
  }
  r += `${commentManager.getTranslation("global_rules")}\n`;
  r += `.container{width:min(100% - 2rem,1200px);margin-inline:auto}
.grid{display:grid;gap:var(--space-md,1rem)}
.flex{display:flex;gap:var(--space-md,1rem)}
`;
  const base = {
    body: "body{font-family:var(--font-primary,sans-serif);color:var(--color-text,#333);background:var(--color-background,#fff);font-size:1rem;line-height:1.6}",
    h: "h1,h2,h3,h4,h5,h6{font-family:var(--font-secondary,sans-serif);line-height:1.2;font-weight:700;margin-bottom:var(--space-md)}",
    p: "p{margin-bottom:var(--space-md);max-width:65ch}",
    img: "img,picture,video,canvas,svg{display:block;max-width:100%;height:auto}",
    input: "input,button,textarea,select{font:inherit}",
    button:
      "button{cursor:pointer;border:none;background:none;padding:var(--space-sm) var(--space-md);border-radius:var(--radius-md);transition:background-color var(--transition-base)}",
    a: "a{color:var(--color-primary);text-decoration:none;transition:color var(--transition-base)}a:hover{color:color-mix(in oklab,var(--color-primary),black 15%)}",
    ul: "ul,ol{list-style:none;padding-left:var(--space-lg)}",
    li: "li{margin-bottom:var(--space-sm)}",
  };
  const util = {
    all: ".sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}",
    text: ".text-balance{text-wrap:balance}",
    container:
      ".grid-auto-fit{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(250px,100%),1fr));gap:var(--space-md)}",
    media: ".aspect-ratio{aspect-ratio:16/9}",
  };
  if (tags) {
    tags.forEach((t) => {
      if (base[t]) {
        r += base[t];
        delete base[t];
      }
    });
    r += util.all;
    if (
      tags.some((t) =>
        ["p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "a"].includes(t)
      )
    )
      r += util.text;
    if (tags.some((t) => ["div", "section", "article", "main"].includes(t)))
      r += util.container;
    if (tags.some((t) => ["img", "video", "picture"].includes(t)))
      r += util.media;
  } else {
    Object.values(base).forEach((v) => (r += v));
    Object.values(util).forEach((v) => (r += v));
  }
  return r;
}
module.exports = { getGlobalRules };
