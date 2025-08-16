// ===== ОСНОВНАЯ ЛОГИКА ПРИЛОЖЕНИЯ =====

// Используем глобальные переменные из utils.js
  
  /**
   * Главный класс приложения
   */
  class RiskMapApp {
    constructor() {
      this.risks = [];
      this.filteredRisks = [];
      this.currentView = Storage.get(CONSTANTS.STORAGE_KEYS.VIEW, CONSTANTS.VIEWS.MATRIX);
      this.filters = Storage.get(CONSTANTS.STORAGE_KEYS.FILTERS, {});
      this.searchQuery = '';
      
      this.init();
    }
    
    /**
     * Инициализация приложения
     */
    async init() {
      try {
        // Показываем загрузку
        this.showLoading();
        
        // Загружаем данные
        await this.loadData();
        
        // Инициализируем компоненты
        this.initializeComponents();
        
        // Устанавливаем обработчики событий
        this.setupEventListeners();
        
        // Применяем сохраненные настройки
        this.applySettings();
        
        // Рендерим интерфейс
        this.render();
        
        // Скрываем загрузку
        this.hideLoading();
        
        Notifications.show('Карта рисков загружена успешно!', 'success');
        
      } catch (error) {
        console.error('Ошибка инициализации:', error);
        Notifications.show('Ошибка загрузки данных', 'error');
        this.hideLoading();
      }
    }
    
    /**
     * Загрузка данных рисков
     */
    async loadData() {
      // Имитируем загрузку для красивой анимации
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Используем глобальную переменную risks из data.js
      if (typeof window.risks !== 'undefined') {
        this.risks = window.risks;
      } else {
        throw new Error('Данные рисков не найдены');
      }
      
      this.filteredRisks = [...this.risks];
    }
    
    /**
     * Инициализация компонентов
     */
    initializeComponents() {
      // Инициализация матрицы
      this.matrixComponent = new MatrixComponent(this);
      
      // Инициализация карточек
      this.cardsComponent = new CardsComponent(this);
      
      // Инициализация таблицы
      this.tableComponent = new TableComponent(this);
      
      // Инициализация модального окна
      this.modalComponent = new ModalComponent(this);
      
      // Инициализация статистики
      this.statsComponent = new StatsComponent(this);
    }
    
    /**
     * Установка обработчиков событий
     */
    setupEventListeners() {
      // Переключение видов
      Events.delegate(document, '.nav-tab', 'click', (e) => {
        const view = e.target.closest('.nav-tab').dataset.view;
        this.switchView(view);
      });
      
      // Поиск
      const searchInput = DOM.get('searchInput');
      searchInput?.addEventListener('input', Events.debounce((e) => {
        this.searchQuery = e.target.value;
        this.applyFilters();
        this.updateSearchClear();
      }, 300));
      
      // Очистка поиска
      DOM.get('searchClear')?.addEventListener('click', () => {
        this.clearSearch();
      });
      
      // Фильтры
      const filters = ['categoryFilter', 'levelFilter', 'probabilityFilter'];
      filters.forEach(filterId => {
        const filterElement = DOM.get(filterId);
        filterElement?.addEventListener('change', (e) => {
          const filterKey = filterId.replace('Filter', '');
          this.filters[filterKey] = e.target.value;
          this.applyFilters();
          this.saveFilters();
        });
      });
      
      // Сброс фильтров
      DOM.get('resetFilters')?.addEventListener('click', () => {
        this.resetFilters();
      });
      
      // Переключение темы
      DOM.get('themeToggle')?.addEventListener('click', () => {
        this.toggleTheme();
      });
      
      // Экспорт
      DOM.get('exportBtn')?.addEventListener('click', () => {
        this.showExportOptions();
      });
      
      // Закрытие модального окна
      DOM.get('modalClose')?.addEventListener('click', () => {
        this.modalComponent.hide();
      });
      
      // Закрытие модального окна по клику на overlay
      DOM.get('riskModal')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
          this.modalComponent.hide();
        }
      });
      
      // Закрытие модального окна по ESC
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.modalComponent.hide();
        }
      });
    }
    
    /**
     * Применение сохраненных настроек
     */
    applySettings() {
      // Применяем тему
      const savedTheme = Storage.get(CONSTANTS.STORAGE_KEYS.THEME, 'light');
      document.body.setAttribute('data-theme', savedTheme);
      this.updateThemeIcon(savedTheme);
      
      // Применяем фильтры
      Object.entries(this.filters).forEach(([key, value]) => {
        const filterElement = DOM.get(key + 'Filter');
        if (filterElement) {
          filterElement.value = value;
        }
      });
      
      // Применяем вид
      this.switchView(this.currentView, false);
    }
    
    /**
     * Переключение видов отображения
     */
    switchView(view, animate = true) {
      if (!Object.values(CONSTANTS.VIEWS).includes(view)) return;
      
      this.currentView = view;
      Storage.set(CONSTANTS.STORAGE_KEYS.VIEW, view);
      
      // Обновляем активную вкладку
      DOM.getAll('.nav-tab').forEach(tab => {
        DOM.removeClass(tab, 'active');
        if (tab.dataset.view === view) {
          DOM.addClass(tab, 'active');
        }
      });
      
      // Скрываем все виды
      DOM.getAll('.view-container').forEach(container => {
        DOM.addClass(container, 'hidden');
      });
      
      // Показываем нужный вид
      const viewContainer = DOM.get(view + 'View');
      DOM.removeClass(viewContainer, 'hidden');
      
      // Рендерим содержимое
      this.renderCurrentView(animate);
      
      Notifications.show(`Переключено на вид: ${this.getViewName(view)}`, 'info', 1500);
    }
    
    /**
     * Получение названия вида
     */
    getViewName(view) {
      const names = {
        matrix: 'Матрица',
        cards: 'Карточки',
        table: 'Таблица'
      };
      return names[view] || view;
    }
    
    /**
     * Применение фильтров
     */
    applyFilters() {
      let filtered = [...this.risks];
      
      // Применяем поиск
      if (this.searchQuery) {
        filtered = DataUtils.search(filtered, this.searchQuery, [
          'title', 'consequences', 'mitigation', 'categoryName'
        ]);
      }
      
      // Применяем фильтры
      filtered = DataUtils.filter(filtered, this.filters);
      
      this.filteredRisks = filtered;
      this.render();
    }
    
    /**
     * Сброс фильтров
     */
    resetFilters() {
      this.filters = {};
      this.searchQuery = '';
      
      // Очищаем UI фильтров
      DOM.getAll('.filter-select').forEach(select => {
        select.value = '';
      });
      
      const searchInput = DOM.get('searchInput');
      if (searchInput) {
        searchInput.value = '';
      }
      
      this.updateSearchClear();
      this.applyFilters();
      this.saveFilters();
      
      Notifications.show('Фильтры сброшены', 'info', 1500);
    }
    
    /**
     * Очистка поиска
     */
    clearSearch() {
      this.searchQuery = '';
      const searchInput = DOM.get('searchInput');
      if (searchInput) {
        searchInput.value = '';
      }
      this.updateSearchClear();
      this.applyFilters();
    }
    
    /**
     * Обновление кнопки очистки поиска
     */
    updateSearchClear() {
      const clearBtn = DOM.get('searchClear');
      if (clearBtn) {
        if (this.searchQuery) {
          DOM.addClass(clearBtn, 'show');
        } else {
          DOM.removeClass(clearBtn, 'show');
        }
      }
    }
    
    /**
     * Сохранение фильтров
     */
    saveFilters() {
      Storage.set(CONSTANTS.STORAGE_KEYS.FILTERS, this.filters);
    }
    
    /**
     * Переключение темы
     */
    toggleTheme() {
      const currentTheme = document.body.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.body.setAttribute('data-theme', newTheme);
      Storage.set(CONSTANTS.STORAGE_KEYS.THEME, newTheme);
      
      this.updateThemeIcon(newTheme);
      
      Notifications.show(
        `Переключено на ${newTheme === 'dark' ? 'темную' : 'светлую'} тему`, 
        'info', 
        1500
      );
    }
    
    /**
     * Обновление иконки темы
     */
    updateThemeIcon(theme) {
      const icon = DOM.get('themeToggle')?.querySelector('i');
      if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
    }
    
    /**
     * Показ опций экспорта
     */
    showExportOptions() {
      const options = [
        { label: 'Экспорт в CSV', action: () => this.exportToCSV() },
        { label: 'Экспорт в JSON', action: () => this.exportToJSON() },
        { label: 'Экспорт в Excel', action: () => this.exportToExcel() }
      ];
      
      // Простое меню экспорта (можно улучшить)
      const choice = confirm('Выберите формат экспорта:\n1. CSV\n2. JSON\n3. Excel\n\nВведите номер:');
      
      if (choice) {
        const index = parseInt(prompt('Введите номер (1-3):')) - 1;
        if (index >= 0 && index < options.length) {
          options[index].action();
        }
      }
    }
    
    /**
     * Экспорт в различные форматы
     */
    exportToCSV() {
      const exportData = this.prepareExportData();
      ExportUtils.toCSV(exportData, 'risk-map.csv');
      Notifications.show('Данные экспортированы в CSV', 'success');
    }
    
    exportToJSON() {
      ExportUtils.toJSON(this.filteredRisks, 'risk-map.json');
      Notifications.show('Данные экспортированы в JSON', 'success');
    }
    
    exportToExcel() {
      const exportData = this.prepareExportData();
      ExportUtils.toExcel(exportData, 'risk-map.xls');
      Notifications.show('Данные экспортированы в Excel', 'success');
    }
    
    /**
     * Подготовка данных для экспорта
     */
    prepareExportData() {
      return this.filteredRisks.map(risk => ({
        'ID': risk.id,
        'Название': risk.title,
        'Категория': risk.categoryName,
        'Уровень': CONSTANTS.RISK_LEVELS[risk.level]?.name || risk.level,
        'Вероятность': risk.probability,
        'Последствия': risk.consequences,
        'Меры митигации': risk.mitigation
      }));
    }
    
    /**
     * Показ/скрытие загрузки
     */
    showLoading() {
      const loading = DOM.get('loadingOverlay');
      DOM.addClass(loading, 'show');
    }
    
    hideLoading() {
      const loading = DOM.get('loadingOverlay');
      DOM.removeClass(loading, 'show');
    }
    
    /**
     * Основной метод рендеринга
     */
    render() {
      this.statsComponent.render();
      this.renderCurrentView();
    }
    
    /**
     * Рендеринг текущего вида
     */
    renderCurrentView(animate = true) {
      switch (this.currentView) {
        case CONSTANTS.VIEWS.MATRIX:
          this.matrixComponent.render(animate);
          break;
        case CONSTANTS.VIEWS.CARDS:
          this.cardsComponent.render(animate);
          break;
        case CONSTANTS.VIEWS.TABLE:
          this.tableComponent.render(animate);
          break;
      }
    }
    
    /**
     * Показ деталей риска
     */
    showRiskDetails(risk) {
      this.modalComponent.show(risk);
    }
  }
  
  /**
   * Компонент статистики
   */
  class StatsComponent {
    constructor(app) {
      this.app = app;
    }
    
    render() {
      const stats = this.calculateStats();
      
      // Обновляем счетчики с анимацией
      Object.entries(stats).forEach(([key, value]) => {
        const element = DOM.get(key);
        if (element) {
          Animation.countTo(element, value, 800);
        }
      });
    }
    
    calculateStats() {
      const risks = this.app.filteredRisks;
      const counts = DataUtils.countBy(risks, 'level');
      
      return {
        totalCount: risks.length,
        criticalCount: counts.critical || 0,
        highCount: counts.high || 0,
        mediumCount: counts.medium || 0,
        lowCount: counts.low || 0
      };
    }
  }
  
  /**
   * Компонент матрицы рисков
   */
  class MatrixComponent {
    constructor(app) {
      this.app = app;
      this.matrixData = [];
    }
    
    render(animate = true) {
      const grid = DOM.get('matrixGrid');
      if (!grid) return;
      
      DOM.clear(grid);
      this.generateMatrixData();
      
      // Создаем ячейки матрицы
      for (let row = 0; row < CONSTANTS.MATRIX_SIZE; row++) {
        for (let col = 0; col < CONSTANTS.MATRIX_SIZE; col++) {
          const cell = this.createMatrixCell(row, col);
          grid.appendChild(cell);
        }
      }
      
      if (animate) {
        const cells = grid.querySelectorAll('.matrix-cell');
        Animation.staggerIn(Array.from(cells), 50);
      }
    }
    
    generateMatrixData() {
      // Создаем матрицу 5x5 для рисков
      this.matrixData = Array(CONSTANTS.MATRIX_SIZE).fill().map(() => 
        Array(CONSTANTS.MATRIX_SIZE).fill().map(() => [])
      );
      
      // Распределяем риски по матрице
      this.app.filteredRisks.forEach(risk => {
        const { row, col } = this.getRiskPosition(risk);
        if (row >= 0 && row < CONSTANTS.MATRIX_SIZE && col >= 0 && col < CONSTANTS.MATRIX_SIZE) {
          this.matrixData[row][col].push(risk);
        }
      });
    }
    
    getRiskPosition(risk) {
      // Простое распределение по уровню и вероятности
      const levelMap = { low: 0, medium: 1, high: 2, critical: 3 };
      const probMap = { 'Низкая': 0, 'Средняя': 2, 'Высокая': 4 };
      
      const row = CONSTANTS.MATRIX_SIZE - 1 - (levelMap[risk.level] || 0);
      const col = probMap[risk.probability] || 1;
      
      return { row, col };
    }
    
    createMatrixCell(row, col) {
      const risks = this.matrixData[row][col];
      const count = risks.length;
      const level = this.getCellLevel(risks);
      
      const cell = DOM.create('div', {
        className: `matrix-cell ${level}`,
        innerHTML: count > 0 ? count.toString() : '',
        'data-row': row,
        'data-col': col
      });
      
      // Добавляем обработчик клика
      cell.addEventListener('click', () => {
        if (risks.length > 0) {
          this.showCellRisks(risks, row, col);
        }
      });
      
      // Добавляем tooltip
      if (count > 0) {
        cell.title = `${count} рисков в этой ячейке`;
      }
      
      return cell;
    }
    
    getCellLevel(risks) {
      if (risks.length === 0) return '';
      
      // Определяем уровень ячейки по самому высокому риску
      const priorities = risks.map(r => CONSTANTS.RISK_LEVELS[r.level]?.priority || 0);
      const maxPriority = Math.max(...priorities);
      
      const levelMap = { 1: 'low', 2: 'medium', 3: 'high', 4: 'critical' };
      return levelMap[maxPriority] || '';
    }
    
    showCellRisks(risks, row, col) {
      if (risks.length === 1) {
        this.app.showRiskDetails(risks[0]);
      } else {
        // Показываем список рисков в ячейке
        const risksList = risks.map(risk => 
          `<div class="cell-risk-item" data-risk-id="${risk.id}">
            <i class="${risk.icon}"></i>
            <span>${risk.title}</span>
          </div>`
        ).join('');
        
        this.app.modalComponent.show({
          title: `Риски в ячейке (${row + 1}, ${col + 1})`,
          content: `<div class="cell-risks-list">${risksList}</div>`,
          isCustom: true
        });
        
        // Добавляем обработчики для элементов списка
        setTimeout(() => {
          DOM.getAll('.cell-risk-item').forEach(item => {
            item.addEventListener('click', () => {
              const riskId = parseInt(item.dataset.riskId);
              const risk = risks.find(r => r.id === riskId);
              if (risk) {
                this.app.showRiskDetails(risk);
              }
            });
          });
        }, 100);
      }
    }
  }
  
  /**
   * Компонент карточек рисков
   */
  class CardsComponent {
    constructor(app) {
      this.app = app;
    }
    
    render(animate = true) {
      const grid = DOM.get('cardsGrid');
      if (!grid) return;
      
      DOM.clear(grid);
      
      if (this.app.filteredRisks.length === 0) {
        grid.innerHTML = '<div class="no-results">Риски не найдены</div>';
        return;
      }
      
      // Создаем карточки
      this.app.filteredRisks.forEach(risk => {
        const card = this.createRiskCard(risk);
        grid.appendChild(card);
      });
      
      if (animate) {
        const cards = grid.querySelectorAll('.risk-card');
        Animation.staggerIn(Array.from(cards), 100);
      }
    }
    
    createRiskCard(risk) {
      const card = DOM.create('div', {
        className: `risk-card ${risk.level}`,
        innerHTML: `
          <div class="risk-card-header">
            <div class="risk-icon ${risk.level}">
              <i class="${risk.icon}"></i>
            </div>
            <div class="risk-card-title">
              <h3>${risk.title}</h3>
              <div class="category">${risk.categoryName}</div>
            </div>
          </div>
          
          <div class="risk-card-meta">
            <div class="risk-meta-item">
              <div class="label">Уровень</div>
              <div class="value">${CONSTANTS.RISK_LEVELS[risk.level]?.name || risk.level}</div>
            </div>
            <div class="risk-meta-item">
              <div class="label">Вероятность</div>
              <div class="value">${risk.probability}</div>
            </div>
          </div>
          
          <div class="risk-card-content">
            <p>${Format.truncate(risk.consequences, 150)}</p>
          </div>
          
          <div class="risk-card-footer">
            <div class="risk-id">ID: ${risk.id}</div>
            <div class="risk-level-badge ${risk.level}">
              ${CONSTANTS.RISK_LEVELS[risk.level]?.name || risk.level}
            </div>
          </div>
        `
      });
      
      // Добавляем обработчик клика
      card.addEventListener('click', () => {
        this.app.showRiskDetails(risk);
      });
      
      return card;
    }
  }
  
  /**
   * Компонент таблицы рисков
   */
  class TableComponent {
    constructor(app) {
      this.app = app;
    }
    
    render(animate = true) {
      const tbody = DOM.get('tableBody');
      if (!tbody) return;
      
      DOM.clear(tbody);
      
      if (this.app.filteredRisks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Риски не найдены</td></tr>';
        return;
      }
      
      // Создаем строки таблицы
      this.app.filteredRisks.forEach(risk => {
        const row = this.createTableRow(risk);
        tbody.appendChild(row);
      });
      
      if (animate) {
        const rows = tbody.querySelectorAll('tr');
        Animation.staggerIn(Array.from(rows), 50);
      }
    }
    
    createTableRow(risk) {
      const row = DOM.create('tr', {
        innerHTML: `
          <td>${risk.id}</td>
          <td>
            <div class="table-risk-title">
              <i class="${risk.icon}"></i>
              ${risk.title}
            </div>
          </td>
          <td>${risk.categoryName}</td>
          <td>
            <span class="risk-level-badge ${risk.level}">
              ${CONSTANTS.RISK_LEVELS[risk.level]?.name || risk.level}
            </span>
          </td>
          <td>${risk.probability}</td>
          <td>
            <div class="table-actions">
              <button class="btn-icon view-btn" title="Посмотреть детали">
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </td>
        `
      });
      
      // Добавляем обработчики
      const viewBtn = row.querySelector('.view-btn');
      viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.app.showRiskDetails(risk);
      });
      
      row.addEventListener('click', () => {
        this.app.showRiskDetails(risk);
      });
      
      return row;
    }
  }
  
  /**
   * Компонент модального окна
   */
  class ModalComponent {
    constructor(app) {
      this.app = app;
      this.modal = DOM.get('riskModal');
    }
    
    show(risk) {
      if (!this.modal) return;
      
      const title = DOM.get('modalTitle');
      const body = DOM.get('modalBody');
      
      if (risk.isCustom) {
        // Кастомное содержимое
        title.textContent = risk.title;
        body.innerHTML = risk.content;
      } else {
        // Стандартные детали риска
        title.textContent = risk.title;
        body.innerHTML = this.createRiskDetails(risk);
      }
      
      DOM.addClass(this.modal, 'show');
      document.body.style.overflow = 'hidden';
    }
    
    hide() {
      if (!this.modal) return;
      
      DOM.removeClass(this.modal, 'show');
      document.body.style.overflow = '';
    }
    
    createRiskDetails(risk) {
      return `
        <div class="modal-risk-header">
          <div class="modal-risk-icon ${risk.level}">
            <i class="${risk.icon}"></i>
          </div>
          <div class="modal-risk-info">
            <h4>${risk.title}</h4>
            <p class="modal-risk-category">${risk.categoryName}</p>
            <div class="modal-risk-meta">
              <span class="risk-level-badge ${risk.level}">
                ${CONSTANTS.RISK_LEVELS[risk.level]?.name || risk.level}
              </span>
              <span class="modal-risk-prob">Вероятность: ${risk.probability}</span>
            </div>
          </div>
        </div>
        
        <div class="modal-risk-section">
          <h5><i class="fas fa-exclamation-triangle"></i> Последствия</h5>
          <p>${risk.consequences}</p>
        </div>
        
        <div class="modal-risk-section">
          <h5><i class="fas fa-shield-alt"></i> Меры митигации</h5>
          <p>${risk.mitigation}</p>
        </div>
        
        <div class="modal-risk-footer">
          <small>ID риска: ${risk.id}</small>
        </div>
      `;
    }
  }
  
  // Инициализация приложения при загрузке DOM
  document.addEventListener('DOMContentLoaded', () => {
    // Проверяем наличие данных
    if (typeof window.risks === 'undefined') {
      console.error('Данные рисков не загружены. Убедитесь, что data.js подключен.');
      return;
    }
    
    // Создаем и запускаем приложение
    window.riskMapApp = new RiskMapApp();
    
    // Добавляем стили для уведомлений
    const notificationStyles = `
      <style>
        .notifications-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10001;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .notification {
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1rem;
          box-shadow: var(--shadow-lg);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 300px;
          transform: translateX(100%);
          opacity: 0;
          transition: all 0.3s ease-out;
        }
        
        .notification.show {
          transform: translateX(0);
          opacity: 1;
        }
        
        .notification-success { border-left: 4px solid #22c55e; }
        .notification-error { border-left: 4px solid #ef4444; }
        .notification-warning { border-left: 4px solid #f59e0b; }
        .notification-info { border-left: 4px solid #3b82f6; }
        
        .notification-close {
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 0.25rem;
          margin-left: auto;
        }
        
        .notification-close:hover {
          color: var(--text-primary);
        }
        
        .no-results {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-secondary);
          font-size: 1.125rem;
        }
        
        .modal-risk-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }
        
        .modal-risk-icon {
          width: 60px;
          height: 60px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        
        .modal-risk-info h4 {
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }
        
        .modal-risk-category {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin-bottom: 0.75rem;
        }
        
        .modal-risk-meta {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        
        .modal-risk-prob {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        
        .modal-risk-section {
          margin-bottom: 1.5rem;
        }
        
        .modal-risk-section h5 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
          font-size: 1rem;
        }
        
        .modal-risk-section p {
          line-height: 1.6;
          color: var(--text-secondary);
        }
        
        .modal-risk-footer {
          padding-top: 1rem;
          border-top: 1px solid var(--border);
          text-align: center;
          color: var(--text-tertiary);
        }
        
        .cell-risks-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .cell-risk-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .cell-risk-item:hover {
          background: var(--bg-primary);
          border-color: var(--primary);
          transform: translateX(4px);
        }
        
        .table-risk-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        @media (max-width: 768px) {
          .notifications-container {
            left: 20px;
            right: 20px;
          }
          
          .notification {
            min-width: auto;
          }
        }
      </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', notificationStyles);
  });