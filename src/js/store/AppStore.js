import { StorageService } from '../services/StorageService.js';

/**
 * Основной Store для управления состоянием приложения
 */
export class AppStore {
    constructor() {
        this.state = {
            // Настройки приложения
            settings: {
                theme: 'light',
                language: 'ru',
                notifications: true,
                autoSave: true,
                defaultView: 'matrix'
            },
            
            // Состояние UI
            ui: {
                sidebarOpen: true,
                currentView: 'matrix',
                modalOpen: false,
                modalType: null,
                loading: false,
                error: null
            },
            
            // Пользовательские настройки
            userPreferences: {
                filters: {},
                sortBy: 'level',
                sortOrder: 'desc',
                itemsPerPage: 20,
                showArchived: false
            },
            
            // История действий
            history: [],
            
            // Статистика использования
            usage: {
                lastVisit: null,
                totalVisits: 0,
                totalActions: 0,
                favoriteFeatures: []
            }
        };
        
        this.subscribers = [];
        
        // Загружаем состояние из localStorage
        this.loadState();
        
        // Обновляем статистику использования
        this.updateUsageStats();
    }
    
    /**
     * Получить текущее состояние
     */
    getState() {
        return { ...this.state };
    }
    
    /**
     * Получить конкретную часть состояния
     */
    getStateSlice(slice) {
        return this.state[slice] ? { ...this.state[slice] } : null;
    }
    
    /**
     * Обновить состояние
     */
    setState(updates) {
        try {
            // Обновляем состояние
            Object.keys(updates).forEach(key => {
                if (this.state.hasOwnProperty(key)) {
                    if (typeof this.state[key] === 'object' && this.state[key] !== null) {
                        this.state[key] = { ...this.state[key], ...updates[key] };
                    } else {
                        this.state[key] = updates[key];
                    }
                }
            });
            
            // Сохраняем в localStorage
            this.saveState();
            
            // Уведомляем подписчиков
            this.notify();
            
            return true;
        } catch (error) {
            console.error('Error updating app state:', error);
            return false;
        }
    }
    
    /**
     * Обновить конкретную часть состояния
     */
    setStateSlice(slice, updates) {
        if (!this.state[slice]) {
            console.warn(`State slice "${slice}" does not exist`);
            return false;
        }
        
        return this.setState({ [slice]: updates });
    }
    
    /**
     * Обновить настройки
     */
    updateSettings(settings) {
        return this.setStateSlice('settings', settings);
    }
    
    /**
     * Обновить настройки UI
     */
    updateUI(uiUpdates) {
        return this.setStateSlice('ui', uiUpdates);
    }
    
    /**
     * Обновить пользовательские настройки
     */
    updateUserPreferences(preferences) {
        return this.setStateSlice('userPreferences', preferences);
    }
    
    /**
     * Переключить тему
     */
    toggleTheme() {
        const newTheme = this.state.settings.theme === 'light' ? 'dark' : 'light';
        this.updateSettings({ theme: newTheme });
        
        // Применяем тему к DOM
        document.body.setAttribute('data-theme', newTheme);
        
        return newTheme;
    }
    
    /**
     * Переключить боковую панель
     */
    toggleSidebar() {
        const newState = !this.state.ui.sidebarOpen;
        this.updateUI({ sidebarOpen: newState });
        return newState;
    }
    
    /**
     * Переключить вид
     */
    switchView(view) {
        if (this.state.ui.currentView !== view) {
            this.updateUI({ currentView: view });
            this.updateUserPreferences({ defaultView: view });
        }
        return view;
    }
    
    /**
     * Открыть модальное окно
     */
    openModal(type, data = null) {
        this.updateUI({
            modalOpen: true,
            modalType: type,
            modalData: data
        });
    }
    
    /**
     * Закрыть модальное окно
     */
    closeModal() {
        this.updateUI({
            modalOpen: false,
            modalType: null,
            modalData: null
        });
    }
    
    /**
     * Установить состояние загрузки
     */
    setLoading(loading) {
        this.updateUI({ loading });
    }
    
    /**
     * Установить ошибку
     */
    setError(error) {
        this.updateUI({ error });
        
        // Автоматически очищаем ошибку через 5 секунд
        if (error) {
            setTimeout(() => {
                this.clearError();
            }, 5000);
        }
    }
    
    /**
     * Очистить ошибку
     */
    clearError() {
        this.updateUI({ error: null });
    }
    
    /**
     * Обновить фильтры
     */
    updateFilters(filters) {
        this.updateUserPreferences({ filters });
    }
    
    /**
     * Сбросить фильтры
     */
    resetFilters() {
        this.updateUserPreferences({ filters: {} });
    }
    
    /**
     * Обновить сортировку
     */
    updateSorting(sortBy, sortOrder = 'desc') {
        this.updateUserPreferences({ sortBy, sortOrder });
    }
    
    /**
     * Добавить действие в историю
     */
    addToHistory(action, details = {}) {
        const historyItem = {
            id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            action,
            details,
            timestamp: new Date().toISOString(),
            user: 'system' // В будущем можно добавить авторизацию
        };
        
        this.state.history.unshift(historyItem);
        
        // Ограничиваем историю 100 последними действиями
        if (this.state.history.length > 100) {
            this.state.history = this.state.history.slice(0, 100);
        }
        
        // Обновляем статистику
        this.state.usage.totalActions++;
        
        this.saveState();
        this.notify();
    }
    
    /**
     * Получить историю действий
     */
    getHistory(limit = 50) {
        return this.state.history.slice(0, limit);
    }
    
    /**
     * Очистить историю
     */
    clearHistory() {
        this.state.history = [];
        this.saveState();
        this.notify();
    }
    
    /**
     * Обновить статистику использования
     */
    updateUsageStats() {
        const now = new Date();
        const lastVisit = this.state.usage.lastVisit;
        
        // Увеличиваем счетчик посещений
        this.state.usage.totalVisits++;
        
        // Обновляем время последнего посещения
        this.state.usage.lastVisit = now.toISOString();
        
        // Если это первое посещение, устанавливаем базовые значения
        if (!lastVisit) {
            this.state.usage.firstVisit = now.toISOString();
        }
        
        this.saveState();
    }
    
    /**
     * Отметить использование функции
     */
    markFeatureUsage(feature) {
        const existingIndex = this.state.usage.favoriteFeatures.findIndex(f => f.name === feature);
        
        if (existingIndex !== -1) {
            this.state.usage.favoriteFeatures[existingIndex].count++;
        } else {
            this.state.usage.favoriteFeatures.push({
                name: feature,
                count: 1,
                firstUsed: new Date().toISOString()
            });
        }
        
        // Сортируем по частоте использования
        this.state.usage.favoriteFeatures.sort((a, b) => b.count - a.count);
        
        // Ограничиваем топ-10 функций
        this.state.usage.favoriteFeatures = this.state.usage.favoriteFeatures.slice(0, 10);
        
        this.saveState();
    }
    
    /**
     * Получить статистику использования
     */
    getUsageStats() {
        return { ...this.state.usage };
    }
    
    /**
     * Экспортировать состояние приложения
     */
    exportState() {
        try {
            return {
                settings: this.state.settings,
                userPreferences: this.state.userPreferences,
                history: this.state.history,
                usage: this.state.usage,
                exportDate: new Date().toISOString(),
                version: '1.0.0'
            };
        } catch (error) {
            console.error('Error exporting app state:', error);
            return null;
        }
    }
    
    /**
     * Импортировать состояние приложения
     */
    importState(data) {
        try {
            if (!data || typeof data !== 'object') {
                throw new Error('Неверный формат данных для импорта');
            }
            
            // Импортируем только безопасные части состояния
            if (data.settings) {
                this.state.settings = { ...this.state.settings, ...data.settings };
            }
            
            if (data.userPreferences) {
                this.state.userPreferences = { ...this.state.userPreferences, ...data.userPreferences };
            }
            
            if (data.history && Array.isArray(data.history)) {
                this.state.history = [...data.history];
            }
            
            if (data.usage) {
                this.state.usage = { ...this.state.usage, ...data.usage };
            }
            
            this.saveState();
            this.notify();
            
            return {
                success: true,
                message: 'Настройки приложения успешно импортированы'
            };
        } catch (error) {
            console.error('Error importing app state:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Сбросить настройки к значениям по умолчанию
     */
    resetToDefaults() {
        const defaultSettings = {
            theme: 'light',
            language: 'ru',
            notifications: true,
            autoSave: true,
            defaultView: 'matrix'
        };
        
        const defaultUI = {
            sidebarOpen: true,
            currentView: 'matrix',
            modalOpen: false,
            modalType: null,
            loading: false,
            error: null
        };
        
        const defaultPreferences = {
            filters: {},
            sortBy: 'level',
            sortOrder: 'desc',
            itemsPerPage: 20,
            showArchived: false
        };
        
        this.setState({
            settings: defaultSettings,
            ui: defaultUI,
            userPreferences: defaultPreferences
        });
        
        // Применяем тему к DOM
        document.body.setAttribute('data-theme', defaultSettings.theme);
        
        return true;
    }
    
    /**
     * Подписаться на изменения состояния
     */
    subscribe(callback) {
        this.subscribers.push(callback);
        
        // Сразу вызываем callback с текущим состоянием
        callback(this.state);
        
        // Возвращаем функцию для отписки
        return () => {
            const index = this.subscribers.indexOf(callback);
            if (index > -1) {
                this.subscribers.splice(index, 1);
            }
        };
    }
    
    /**
     * Уведомить всех подписчиков
     */
    notify() {
        this.subscribers.forEach(callback => {
            try {
                callback(this.state);
            } catch (error) {
                console.error('Error in app state subscriber callback:', error);
            }
        });
    }
    
    /**
     * Сохранить состояние в localStorage
     */
    saveState() {
        try {
            StorageService.save('app_settings', this.state);
        } catch (error) {
            console.error('Error saving app state:', error);
        }
    }
    
    /**
     * Загрузить состояние из localStorage
     */
    loadState() {
        try {
            const stored = StorageService.load('app_settings', null);
            if (stored) {
                // Объединяем с текущим состоянием, сохраняя структуру
                Object.keys(stored).forEach(key => {
                    if (this.state.hasOwnProperty(key)) {
                        if (typeof this.state[key] === 'object' && this.state[key] !== null) {
                            this.state[key] = { ...this.state[key], ...stored[key] };
                        } else {
                            this.state[key] = stored[key];
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error loading app state:', error);
        }
    }
    
    /**
     * Уничтожить store
     */
    destroy() {
        this.subscribers = [];
        this.state = null;
    }
}
