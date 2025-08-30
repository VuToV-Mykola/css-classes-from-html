/**
 * Модуль управління коментарями
 * Забезпечує коментарі різними мовами
 */

let currentLanguage = "uk"

const translations = {
  uk: {
    file_header:
      "/* !!! AUTO-GENERATED CSS FROM HTML !!! */\n/* !!! Згенеровано автоматично з HTML-файлу !!! */",
    global_rules: "/* !!! Глобальні стилі документа !!! */",
    reset_rules: "/* !!! Скидання стилів за замовчуванням !!! */",
    class_comment: "/* !!! Стилі для класу {className} !!! */",
    basic_properties: "Базові властивості",
    layout_properties: "Властивості макету",
    typography_properties: "Властивості типографіки",
    visual_properties: "Візуальні властивості",
    interactive_properties: "Інтерактивні властивості",
    hover_focus_states: "Стилі для станів наведення та фокусу",
    media_queries: "Медіа-запити для адаптивного дизайну",
    tablet_styles: "Стилі для планшетів",
    desktop_styles: "Стилі для десктопів",
    mobile_styles: "Стилі для мобільних пристроїв",
    property_display: "Спосіб відображення елемента",
    property_position: "Спосіб позиціонування елемента",
    property_box_sizing: "Спосіб розрахунку розмірів елемента",
    property_opacity: "Рівень непрозорості елемента",
    property_cursor: "Тип курсора при наведенні",
    property_flex: "Flexbox властивості",
    property_grid: "Grid властивості",
    property_transition: "Анімація переходу",
    property_transform: "Трансформація елемента",
    property_border_radius: "Заокруглення кутів",
    property_box_shadow: "Тінь елемента",
    webstudio_specific: "/* Стилі специфічні для Web Studio */",
    component_styles: "/* Стилі компонента {componentName} */",
    responsive_design: "/* Адаптивний дизайн для {breakpoint} */"
  },
  en: {
    file_header: "/* !!! AUTO-GENERATED CSS FROM HTML !!! */",
    global_rules: "/* !!! Global document styles !!! */",
    reset_rules: "/* !!! Default styles reset !!! */",
    class_comment: "/* !!! Styles for {className} class !!! */",
    basic_properties: "Basic properties",
    layout_properties: "Layout properties",
    typography_properties: "Typography properties",
    visual_properties: "Visual properties",
    interactive_properties: "Interactive properties",
    hover_focus_states: "Hover and focus states",
    media_queries: "Media queries for responsive design",
    tablet_styles: "Tablet styles",
    desktop_styles: "Desktop styles",
    mobile_styles: "Mobile styles",
    property_display: "Element display type",
    property_position: "Element positioning method",
    property_box_sizing: "Element sizing method",
    property_opacity: "Element opacity level",
    property_cursor: "Cursor type on hover",
    property_flex: "Flexbox properties",
    property_grid: "Grid properties",
    property_transition: "Transition animation",
    property_transform: "Element transformation",
    property_border_radius: "Border radius",
    property_box_shadow: "Box shadow",
    webstudio_specific: "/* Web Studio specific styles */",
    component_styles: "/* {componentName} component styles */",
    responsive_design: "/* Responsive design for {breakpoint} */"
  }
}

function setLanguage(lang) {
  if (translations[lang]) {
    currentLanguage = lang
  } else {
    currentLanguage = "uk"
  }
}

function getTranslation(key) {
  return translations[currentLanguage][key] || key
}

function getFileHeader() {
  return getTranslation("file_header")
}

function getClassComment(className) {
  return getTranslation("class_comment").replace("{className}", className)
}

function getComponentComment(componentName) {
  return getTranslation("component_styles").replace("{componentName}", componentName)
}

function getResponsiveComment(breakpoint) {
  return getTranslation("responsive_design").replace("{breakpoint}", breakpoint)
}

module.exports = {
  setLanguage,
  getTranslation,
  getFileHeader,
  getClassComment,
  getComponentComment,
  getResponsiveComment
}
