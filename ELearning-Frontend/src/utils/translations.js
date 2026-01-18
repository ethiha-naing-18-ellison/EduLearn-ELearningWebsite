import enTranslations from '../locales/en.json';
import mmTranslations from '../locales/mm.json';

const translations = {
  en: enTranslations,
  mm: mmTranslations
};

export const getTranslation = (language, key) => {
  const keys = key.split('.');
  let value = translations[language] || translations['en'];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if translation not found
      value = translations['en'];
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return key; // Return key if translation not found
        }
      }
      break;
    }
  }
  
  return typeof value === 'string' ? value : key;
};

export default translations;
