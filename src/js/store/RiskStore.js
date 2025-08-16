import { Risk, RiskValidator } from '../types/Risk.js';
import { StorageService } from '../services/StorageService.js';

/**
 * Store для управления состоянием рисков
 */
export class RiskStore {
    constructor() {
        this.risks = [];
        this.filters = {};
        this.subscribers = [];
        this.isLoading = false;
        this.error = null;
        
        // Загружаем данные из localStorage при инициализации
        this.loadFromStorage();
    }
    
    /**
     * Добавить новый риск
     */
    addRisk(riskData) {
        try {
            // Валидация данных
            const validation = RiskValidator.validate(riskData);
            if (!validation.isValid) {
                throw new Error(`Ошибка валидации: ${validation.errors.join(', ')}`);
            }
            
            const risk = new Risk(riskData);
            this.risks.push(risk);
            
            // Сохраняем в localStorage
            this.saveToStorage();
            
            // Уведомляем подписчиков
            this.notify();
            
            return { success: true, risk };
        } catch (error) {
            this.error = error.message;
            this.notify();
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Обновить существующий риск
     */
    updateRisk(id, updates) {
        try {
            const index = this.risks.findIndex(r => r.id === id);
            if (index === -1) {
                throw new Error(`Риск с ID ${id} не найден`);
            }
            
            // Валидация обновленных данных
            const updatedRisk = { ...this.risks[index], ...updates };
            const validation = RiskValidator.validate(updatedRisk);
            if (!validation.isValid) {
                throw new Error(`Ошибка валидации: ${validation.errors.join(', ')}`);
            }
            
            this.risks[index].update(updates);
            
            // Сохраняем в localStorage
            this.saveToStorage();
            
            // Уведомляем подписчиков
            this.notify();
            
            return { success: true, risk: this.risks[index] };
        } catch (error) {
            this.error = error.message;
            this.notify();
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Удалить риск
     */
    deleteRisk(id) {
        try {
            const index = this.risks.findIndex(r => r.id === id);
            if (index === -1) {
                throw new Error(`Риск с ID ${id} не найден`);
            }
            
            const deletedRisk = this.risks.splice(index, 1)[0];
            
            // Сохраняем в localStorage
            this.saveToStorage();
            
            // Уведомляем подписчиков
            this.notify();
            
            return { success: true, risk: deletedRisk };
        } catch (error) {
            this.error = error.message;
            this.notify();
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Получить риск по ID
     */
    getRisk(id) {
        return this.risks.find(r => r.id === id);
    }
    
    /**
     * Получить все риски
     */
    getRisks() {
        return [...this.risks];
    }
    
    /**
     * Получить отфильтрованные риски
     */
    getFilteredRisks(filters = {}) {
        let filtered = [...this.risks];
        
        // Фильтр по поиску
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(risk => 
                risk.title.toLowerCase().includes(searchTerm) ||
                risk.description.toLowerCase().includes(searchTerm) ||
                risk.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }
        
        // Фильтр по категории
        if (filters.category) {
            filtered = filtered.filter(risk => risk.category === filters.category);
        }
        
        // Фильтр по уровню риска
        if (filters.level) {
            filtered = filtered.filter(risk => risk.level === filters.level);
        }
        
        // Фильтр по статусу
        if (filters.status) {
            filtered = filtered.filter(risk => risk.status === filters.status);
        }
        
        // Фильтр по временному периоду
        if (filters.timeline) {
            filtered = filtered.filter(risk => risk.timeline === filters.timeline);
        }
        
        // Фильтр по владельцу
        if (filters.owner) {
            filtered = filtered.filter(risk => risk.owner === filters.owner);
        }
        
        // Сортировка
        if (filters.sortBy) {
            filtered.sort((a, b) => {
                switch (filters.sortBy) {
                    case 'title':
                        return a.title.localeCompare(b.title);
                    case 'level':
                        return this.getLevelPriority(b.level) - this.getLevelPriority(a.level);
                    case 'probability':
                        return b.probability - a.probability;
                    case 'impact':
                        return b.impact - a.impact;
                    case 'createdAt':
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    case 'updatedAt':
                        return new Date(b.updatedAt) - new Date(a.updatedAt);
                    default:
                        return 0;
                }
            });
        }
        
        return filtered;
    }
    
    /**
     * Получить статистику по рискам
     */
    getStatistics() {
        const total = this.risks.length;
        const byLevel = this.risks.reduce((acc, risk) => {
            acc[risk.level] = (acc[risk.level] || 0) + 1;
            return acc;
        }, {});
        
        const byCategory = this.risks.reduce((acc, risk) => {
            acc[risk.category] = (acc[risk.category] || 0) + 1;
            return acc;
        }, {});
        
        const byStatus = this.risks.reduce((acc, risk) => {
            acc[risk.status] = (acc[risk.status] || 0) + 1;
            return acc;
        }, {});
        
        const averageScore = total > 0 
            ? (this.risks.reduce((sum, risk) => sum + parseFloat(risk.calculateScore()), 0) / total).toFixed(2)
            : 0;
        
        return {
            total,
            byLevel,
            byCategory,
            byStatus,
            averageScore,
            criticalCount: byLevel.critical || 0,
            highCount: byLevel.high || 0,
            mediumCount: byLevel.medium || 0,
            lowCount: byLevel.low || 0
        };
    }
    
    /**
     * Установить фильтры
     */
    setFilters(filters) {
        this.filters = { ...this.filters, ...filters };
        this.notify();
    }
    
    /**
     * Сбросить фильтры
     */
    resetFilters() {
        this.filters = {};
        this.notify();
    }
    
    /**
     * Подписаться на изменения
     */
    subscribe(callback) {
        this.subscribers.push(callback);
        // Сразу вызываем callback с текущими данными
        callback(this.risks, this.filters, this.statistics);
        
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
        const statistics = this.getStatistics();
        this.subscribers.forEach(callback => {
            try {
                callback(this.risks, this.filters, statistics);
            } catch (error) {
                console.error('Error in subscriber callback:', error);
            }
        });
    }
    
    /**
     * Сохранить в localStorage
     */
    saveToStorage() {
        try {
            StorageService.save('risks_data', this.risks);
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }
    
    /**
     * Загрузить из localStorage
     */
    loadFromStorage() {
        try {
            const stored = StorageService.load('risks_data', []);
            this.risks = stored.map(riskData => new Risk(riskData));
            this.notify();
        } catch (error) {
            console.error('Error loading from storage:', error);
            this.risks = [];
        }
    }
    
    /**
     * Экспорт данных
     */
    exportData() {
        return {
            risks: this.risks.map(risk => risk.toJSON()),
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
    }
    
    /**
     * Импорт данных
     */
    importData(data) {
        try {
            if (data.risks && Array.isArray(data.risks)) {
                this.risks = data.risks.map(riskData => new Risk(riskData));
                this.saveToStorage();
                this.notify();
                return { success: true, count: this.risks.length };
            } else {
                throw new Error('Неверный формат данных для импорта');
            }
        } catch (error) {
            this.error = error.message;
            this.notify();
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Очистить все данные
     */
    clearAll() {
        this.risks = [];
        this.filters = {};
        this.saveToStorage();
        this.notify();
    }
    
    /**
     * Получить приоритет уровня риска для сортировки
     */
    getLevelPriority(level) {
        const priorities = {
            'critical': 4,
            'high': 3,
            'medium': 2,
            'low': 1
        };
        return priorities[level] || 0;
    }
}
