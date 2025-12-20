class I18n {
  constructor() {
    this.locale = 'es';
    this.translations = {};
    this.init();
  }

  async init() {
    await this.loadTranslations();
    this.updatePage();
    this.setupLanguageSwitcher();
  }

  async loadTranslations() {
    try {
      const response = await fetch(`/locales/${this.locale}.json`);
      this.translations = await response.json();
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  }

  t(key, params = {}) {
    const keys = key.split('.');
    let value = this.translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    // Reemplazar parámetros si existen
    if (typeof value === 'string' && params) {
      Object.keys(params).forEach(param => {
        value = value.replace(`{${param}}`, params[param]);
      });
    }

    return value;
  }

  async setLocale(newLocale) {
    this.locale = newLocale;
    await this.loadTranslations();
    this.updatePage();
    localStorage.setItem('preferredLocale', newLocale);
  }

  updatePage() {
    // Actualizar todos los elementos con data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const params = element.dataset.i18nParams ? 
        JSON.parse(element.dataset.i18nParams) : {};
      
      const translation = this.t(key, params);
      
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = translation;
      } else if (element.hasAttribute('data-i18n-html')) {
        element.innerHTML = translation;
      } else {
        element.textContent = translation;
      }
    });

    // Actualizar atributos con data-i18n-attr
    document.querySelectorAll('[data-i18n-attr]').forEach(element => {
      const attrs = JSON.parse(element.getAttribute('data-i18n-attr'));
      Object.keys(attrs).forEach(attr => {
        const key = attrs[attr];
        element.setAttribute(attr, this.t(key));
      });
    });
  }

  setupLanguageSwitcher() {
    // Crear selector de idioma si no existe
    if (!document.getElementById('language-switcher')) {
      const switcher = document.createElement('div');
      switcher.id = 'language-switcher';
      switcher.className = 'fixed bottom-4 right-4 z-50';
      switcher.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-2">
          <button data-lang="es" class="px-3 py-1 rounded ${this.locale === 'es' ? 'bg-primary text-white' : 'text-gray-700'}">ES</button>
          <button data-lang="en" class="px-3 py-1 rounded ${this.locale === 'en' ? 'bg-primary text-white' : 'text-gray-700'}">EN</button>
        </div>
      `;
      document.body.appendChild(switcher);

      switcher.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
          this.setLocale(button.dataset.lang);
        });
      });
    }
  }
}

// Inicializar i18n
const i18n = new I18n();