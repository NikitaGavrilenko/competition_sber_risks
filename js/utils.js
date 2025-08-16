// ===== УТИЛИТЫ И ХЕЛПЕРЫ =====

/**
 * Утилиты для работы с DOM
 */
const DOM = {
    // Получение элемента по ID
    get: (id) => document.getElementById(id),
    
    // Получение элементов по селектору
    getAll: (selector) => document.querySelectorAll(selector),
    
    // Создание элемента с атрибутами
    create: (tag, attributes = {}, content = '') => {
      const element = document.createElement(tag);
      Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
          element.className = value;
        } else if (key === 'innerHTML') {
          element.innerHTML = value;
        } else {
          element.setAttribute(key, value);
        }
      });
      if (content) element.textContent = content;
      return element;
    },
    
    // Добавление/удаление классов
    addClass: (element, className) => element?.classList.add(className),
    removeClass: (element, className) => element?.classList.remove(className),
    toggleClass: (element, className) => element?.classList.toggle(className),
    hasClass: (element, className) => element?.classList.contains(className),
    
    // Показать/скрыть элемент
    show: (element) => element && element.classList.remove('hidden'),
    hide: (element) => element && element.classList.add('hidden'),
    
    // Очистка содержимого
    clear: (element) => {
      if (element) element.innerHTML = '';
    }
  };
  
  /**
   * Утилиты для работы с анимациями
   */
  const Animation = {
    // Добавление анимации появления с задержкой
    staggerIn: (elements, delay = 100) => {
      elements.forEach((element, index) => {
        setTimeout(() => {
          element.style.opacity = '0';
          element.style.transform = 'translateY(20px)';
          element.style.transition = 'all 0.5s ease-out';
          
          requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
          });
        }, index * delay);
      });
    },
    
    // Анимация счетчика
    countTo: (element, target, duration = 1000) => {
      const start = parseInt(element.textContent) || 0;
      const increment = (target - start) / (duration / 16);
      let current = start;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        element.textContent = Math.floor(current);
      }, 16);
    },
    
    // Плавный скролл к элементу
    scrollTo: (element, offset = 0) => {
      const top = element.offsetTop - offset;
      window.scrollTo({
        top,
        behavior: 'smooth'
      });
    }
  };
  
  /**
   * Утилиты для работы с данными
   */
  const DataUtils = {
    // Фильтрация массива по множественным критериям
    filter: (array, filters) => {
      return array.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
          if (!value || value === '') return true;
          if (Array.isArray(value)) {
            return value.includes(item[key]);
          }
          return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
        });
      });
    },
    
    // Поиск по тексту в нескольких полях
    search: (array, query, fields) => {
      if (!query) return array;
      
      const searchTerm = query.toLowerCase();
      return array.filter(item => {
        return fields.some(field => 
          item[field]?.toString().toLowerCase().includes(searchTerm)
        );
      });
    },
    
    // Группировка массива по полю
    groupBy: (array, key) => {
      return array.reduce((groups, item) => {
        const group = item[key];
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
      }, {});
    },
    
    // Подсчет элементов по критерию
    countBy: (array, key) => {
      return array.reduce((counts, item) => {
        const value = item[key];
        counts[value] = (counts[value] || 0) + 1;
        return counts;
      }, {});
    },
    
    // Сортировка массива
    sort: (array, key, direction = 'asc') => {
      return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        
        if (typeof aVal === 'string') {
          return direction === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        
        return direction === 'asc' 
          ? aVal - bVal 
          : bVal - aVal;
      });
    }
  };
  
  /**
   * Утилиты для работы с localStorage
   */
  const Storage = {
    // Сохранение данных
    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.warn('Ошибка сохранения в localStorage:', error);
        return false;
      }
    },
    
    // Получение данных
    get: (key, defaultValue = null) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.warn('Ошибка получения из localStorage:', error);
        return defaultValue;
      }
    },
    
    // Удаление данных
    remove: (key) => {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.warn('Ошибка удаления из localStorage:', error);
        return false;
      }
    },
    
    // Очистка всех данных
    clear: () => {
      try {
        localStorage.clear();
        return true;
      } catch (error) {
        console.warn('Ошибка очистки localStorage:', error);
        return false;
      }
    }
  };
  
  /**
   * Утилиты для работы с событиями
   */
  const Events = {
    // Делегирование событий
    delegate: (parent, selector, event, handler) => {
      parent.addEventListener(event, (e) => {
        if (e.target.matches(selector)) {
          handler(e);
        }
      });
    },
    
    // Debounce функции
    debounce: (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
    
    // Throttle функции
    throttle: (func, limit) => {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }
  };
  
  /**
   * Утилиты для работы с цветами и стилями
   */
  const StyleUtils = {
    // Получение CSS переменной
    getCSSVar: (name) => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(name).trim();
    },
    
    // Установка CSS переменной
    setCSSVar: (name, value) => {
      document.documentElement.style.setProperty(name, value);
    },
    
    // Генерация случайного цвета
    randomColor: () => {
      return `#${Math.floor(Math.random()*16777215).toString(16)}`;
    },
    
    // Конвертация hex в rgba
    hexToRgba: (hex, alpha = 1) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  };
  
  /**
   * Утилиты для экспорта данных
   */
  const ExportUtils = {
    // Экспорт в CSV
    toCSV: (data, filename = 'export.csv') => {
      if (!data.length) return;
      
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => 
            `"${(row[header] || '').toString().replace(/"/g, '""')}"`
          ).join(',')
        )
      ].join('\n');
      
      ExportUtils.downloadFile(csvContent, filename, 'text/csv');
    },
    
    // Экспорт в JSON
    toJSON: (data, filename = 'export.json') => {
      const jsonContent = JSON.stringify(data, null, 2);
      ExportUtils.downloadFile(jsonContent, filename, 'application/json');
    },
    
    // Скачивание файла
    downloadFile: (content, filename, type) => {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    },
    
    // Экспорт в Excel (простой HTML таблицей)
    toExcel: (data, filename = 'export.xls') => {
      if (!data.length) return;
      
      const headers = Object.keys(data[0]);
      const htmlTable = `
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${data.map(row => 
              `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`
            ).join('')}
          </tbody>
        </table>
      `;
      
      ExportUtils.downloadFile(htmlTable, filename, 'application/vnd.ms-excel');
    }
  };
  
  /**
   * Утилиты для форматирования
   */
  const Format = {
    // Форматирование чисел
    number: (num, decimals = 0) => {
      return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(num);
    },
    
    // Форматирование процентов
    percent: (num, decimals = 1) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(num / 100);
    },
    
    // Форматирование дат
    date: (date, options = {}) => {
      const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      return new Intl.DateTimeFormat('ru-RU', { ...defaultOptions, ...options })
        .format(new Date(date));
    },
    
    // Сокращение длинного текста
    truncate: (text, length = 100, suffix = '...') => {
      if (text.length <= length) return text;
      return text.substring(0, length).trim() + suffix;
    },
    
    // Капитализация первой буквы
    capitalize: (str) => {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
  };
  
  /**
   * Утилиты для валидации
   */
  const Validate = {
    // Проверка email
    email: (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },
    
    // Проверка на пустоту
    notEmpty: (value) => {
      return value !== null && value !== undefined && value.toString().trim() !== '';
    },
    
    // Проверка числа в диапазоне
    inRange: (value, min, max) => {
      const num = parseFloat(value);
      return !isNaN(num) && num >= min && num <= max;
    },
    
    // Проверка минимальной длины
    minLength: (value, length) => {
      return value && value.toString().length >= length;
    }
  };
  
  /**
   * Утилиты для уведомлений
   */
  const Notifications = {
    show: (message, type = 'info', duration = 3000) => {
      // Создаем контейнер для уведомлений если его нет
      let container = document.querySelector('.notifications-container');
      if (!container) {
        container = DOM.create('div', { className: 'notifications-container' });
        document.body.appendChild(container);
      }
      
      // Создаем уведомление
      const notification = DOM.create('div', {
        className: `notification notification-${type}`,
        innerHTML: `
          <i class="fas fa-${this.getIcon(type)}"></i>
          <span>${message}</span>
          <button class="notification-close">
            <i class="fas fa-times"></i>
          </button>
        `
      });
      
      // Добавляем в контейнер
      container.appendChild(notification);
      
      // Анимация появления
      requestAnimationFrame(() => {
        notification.classList.add('show');
      });
      
      // Обработчик закрытия
      const closeBtn = notification.querySelector('.notification-close');
      closeBtn.addEventListener('click', () => {
        this.hide(notification);
      });
      
      // Автоматическое закрытие
      if (duration > 0) {
        setTimeout(() => {
          this.hide(notification);
        }, duration);
      }
      
      return notification;
    },
    
    hide: (notification) => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    },
    
    getIcon: (type) => {
      const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
      };
      return icons[type] || 'info-circle';
    }
  };
  
  /**
   * Константы приложения
   */
  const CONSTANTS = {
    RISK_LEVELS: {
      critical: { name: 'Критический', color: '#dc2626', priority: 4 },
      high: { name: 'Высокий', color: '#ea580c', priority: 3 },
      medium: { name: 'Средний', color: '#ca8a04', priority: 2 },
      low: { name: 'Низкий', color: '#16a34a', priority: 1 }
    },
    
    CATEGORIES: {
      operational: 'Операционные',
      hr: 'Кадровые',
      financial: 'Финансовые',
      reputation: 'Репутационные',
      security: 'Безопасность',
      external: 'Внешние'
    },
    
    PROBABILITIES: ['Высокая', 'Средняя', 'Низкая'],
    
    MATRIX_SIZE: 5,
    
    STORAGE_KEYS: {
      THEME: 'riskMap_theme',
      FILTERS: 'riskMap_filters',
      VIEW: 'riskMap_currentView'
    },
    
          VIEWS: {
        MATRIX: 'matrix',
        CARDS: 'cards',
        TABLE: 'table'
      }
    };

// Делаем утилиты доступными глобально
window.DOM = DOM;
window.Animation = Animation;
window.DataUtils = DataUtils;
window.Storage = Storage;
window.Events = Events;
window.StyleUtils = StyleUtils;
window.ExportUtils = ExportUtils;
window.Format = Format;
window.Validate = Validate;
window.Notifications = Notifications;
window.CONSTANTS = CONSTANTS;