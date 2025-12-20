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
    const response = await fetch(`./src/langs/${this.locale}.json`); 
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
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
  if (!document.getElementById('language-switcher')) {
    const switcher = document.createElement('div');
    switcher.id = 'language-switcher';
    // Estilo de contenedor: centrado en mobile, esquina en desktop
    switcher.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-50';
    
    switcher.innerHTML = `
      <div class="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md border border-white/10 p-1.5 rounded-full shadow-2xl">
        <button data-lang="es" class="flex items-center justify-center w-12 h-10 md:w-10 md:h-8 rounded-full text-xs font-bold transition-all duration-200 ${this.locale === 'es' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-300 hover:text-white'}">
          ES
        </button>
        <button data-lang="en" class="flex items-center justify-center w-12 h-10 md:w-10 md:h-8 rounded-full text-xs font-bold transition-all duration-200 ${this.locale === 'en' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-300 hover:text-white'}">
          EN
        </button>
      </div>
    `;
    
    document.body.appendChild(switcher);

    switcher.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', async () => {
        await this.setLocale(button.dataset.lang);
        // Actualizar clases visuales después del cambio
        switcher.querySelectorAll('button').forEach(btn => {
          if (btn.dataset.lang === this.locale) {
            btn.classList.remove('bg-blue-500', 'text-white', 'shadow-lg');
            btn.classList.add('text-slate-300');
          } else {
            btn.classList.add('bg-blue-500', 'text-white', 'shadow-lg');
            btn.classList.remove('text-slate-300');
          }
        });
      });
    });
  }
}
}

// Inicializar i18n
const i18n = new I18n();