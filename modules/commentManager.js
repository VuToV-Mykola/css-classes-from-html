let lang = "uk";
const tr = {
  uk: {
    file_header: "/* !!! AUTO-GENERATED CSS FROM HTML !!! */",
    reset_rules: "/* Reset */",
    global_rules: "/* Global */",
    class_comment: "/* Styles for {className} */",
  },
  en: {
    file_header: "/* !!! AUTO-GENERATED CSS FROM HTML !!! */",
    reset_rules: "/* Reset */",
    global_rules: "/* Global */",
    class_comment: "/* Styles for {className} */",
  },
};
function setLanguage(l) {
  lang = tr[l] ? l : "uk";
}
function getTranslation(k) {
  return tr[lang][k] || k;
}
function getFileHeader() {
  return getTranslation("file_header");
}
function getClassComment(c) {
  return getTranslation("class_comment").replace("{className}", c);
}
module.exports = {
  setLanguage,
  getTranslation,
  getFileHeader,
  getClassComment,
};
