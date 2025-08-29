const axios = require("axios");
class FigmaService {
  constructor(t) {
    this.t = t;
    this.base = "https://api.figma.com/v1";
  }
  hdr() {
    return { "X-FIGMA-TOKEN": this.t };
  }
  async getFile(k) {
    return (await axios.get(`${this.base}/files/${k}`, { headers: this.hdr() }))
      .data;
  }
  async getStyles(k) {
    return (
      await axios.get(`${this.base}/files/${k}/styles`, { headers: this.hdr() })
    ).data;
  }
  extractFileKeyFromLink(l) {
    const m = l.match(/(?:file|design)\/([a-zA-Z0-9]+)/);
    return m ? m[1] : null;
  }
  parseDesignTokens(f, s) {
    const t = {
      colors: {},
      typography: {},
      spacing: {},
      effects: {},
      classStyles: {},
      breakpoints: { mobile: "320px", tablet: "768px", desktop: "1158px" },
    };
    const extract = (n) => {
      if (n.fills?.[0]?.color) {
        const c = n.fills[0].color;
        t.colors[
          n.name
            ?.toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
            .replace(/^-|-$/g, "") || "color"
        ] =
          `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${c.a || 1})`;
      }
      if (n.name && n.type !== "DOCUMENT" && n.type !== "CANVAS") {
        const cls = n.name
          .toLowerCase()
          .replace(/[^a-z0-9-_]/g, "-")
          .replace(/^-|-$/g, "");
        const st = {};
        if (n.style?.fontSize) st["font-size"] = `${n.style.fontSize}px`;
        if (n.style?.fontWeight) st["font-weight"] = n.style.fontWeight;
        if (n.fills?.[0]?.color) {
          const c = n.fills[0].color;
          st.color = `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${c.a || 1})`;
        }
        if (n.cornerRadius) st["border-radius"] = `${n.cornerRadius}px`;
        if (Object.keys(st).length) t.classStyles[cls] = st;
      }
      n.children?.forEach(extract);
    };
    f.document.children.forEach(extract);
    if (Object.keys(t.colors).length === 0)
      t.colors = {
        primary: "#4d5ae5",
        dark: "#2e2f42",
        light: "#f4f4fd",
        white: "#ffffff",
        border: "#e7e9fc",
        hover: "#404bbf",
      };
    if (Object.keys(t.typography).length === 0)
      t.typography = {
        "font-primary": "'Roboto', sans-serif",
        "font-secondary": "'Raleway', sans-serif",
        "size-h1": "56px",
        "size-h2": "36px",
        "size-h3": "20px",
        "size-body": "16px",
        "weight-regular": "400",
        "weight-medium": "500",
        "weight-bold": "700",
      };
    return t;
  }
}
module.exports = FigmaService;
