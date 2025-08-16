/**
 * Сервис для работы с localStorage
 */
export class StorageService {
    static KEYS = {
        RISKS: 'risks_data',
        SETTINGS: 'app_settings',
        FILTERS: 'user_filters',
        THEME: 'app_theme',
        VIEW_PREFERENCES: 'view_preferences',
        EXPORT_HISTORY: 'export_history'
    };
    
    /**
     * Сохранить данные в localStorage
     */
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Storage save error:', error);
            return false;
        }
    }
    
    /**
     * Загрузить данные из localStorage
     */
    static load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Storage load error:', error);
            return defaultValue;
        }
    }
    
    /**
     * Удалить данные из localStorage
     */
    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }
    
    /**
     * Проверить доступность localStorage
     */
    static isAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Получить размер используемого хранилища
     */
    static getStorageSize() {
        try {
            let total = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length;
                }
            }
            return total;
        } catch (error) {
            console.error('Error calculating storage size:', error);
            return 0;
        }
    }
    
    /**
     * Очистить все данные приложения
     */
    static clearAppData() {
        try {
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing app data:', error);
            return false;
        }
    }
    
    /**
     * Экспорт всех данных приложения
     */
    static exportData() {
        try {
            const data = {};
            Object.entries(this.KEYS).forEach(([name, key]) => {
                data[name] = this.load(key);
            });
            
            return {
                ...data,
                exportDate: new Date().toISOString(),
                version: '1.0.0',
                storageSize: this.getStorageSize()
            };
        } catch (error) {
            console.error('Error exporting data:', error);
            return null;
        }
    }
    
    /**
     * Импорт данных в приложение
     */
    static importData(data) {
        try {
            if (!data || typeof data !== 'object') {
                throw new Error('Неверный формат данных для импорта');
            }
            
            let importedCount = 0;
            Object.entries(this.KEYS).forEach(([name, key]) => {
                if (data[name] !== undefined) {
                    this.save(key, data[name]);
                    importedCount++;
                }
            });
            
            return {
                success: true,
                importedCount,
                message: `Импортировано ${importedCount} элементов`
            };
        } catch (error) {
            console.error('Error importing data:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Создать резервную копию данных
     */
    static createBackup() {
        try {
            const backup = this.exportData();
            const backupKey = `backup_${Date.now()}`;
            this.save(backupKey, backup);
            
            // Ограничиваем количество резервных копий (храним только 5 последних)
            this.cleanupOldBackups();
            
            return {
                success: true,
                backupKey,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error creating backup:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Восстановить данные из резервной копии
     */
    static restoreFromBackup(backupKey) {
        try {
            const backup = this.load(backupKey);
            if (!backup) {
                throw new Error('Резервная копия не найдена');
            }
            
            const result = this.importData(backup);
            if (result.success) {
                return {
                    success: true,
                    message: 'Данные успешно восстановлены из резервной копии',
                    restoredCount: result.importedCount
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error restoring from backup:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Получить список доступных резервных копий
     */
    static getAvailableBackups() {
        try {
            const backups = [];
            for (let key in localStorage) {
                if (key.startsWith('backup_')) {
                    const backup = this.load(key);
                    if (backup && backup.exportDate) {
                        backups.push({
                            key,
                            timestamp: backup.exportDate,
                            size: JSON.stringify(backup).length
                        });
                    }
                }
            }
            
            // Сортируем по времени создания (новые сначала)
            return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } catch (error) {
            console.error('Error getting available backups:', error);
            return [];
        }
    }
    
    /**
     * Очистить старые резервные копии
     */
    static cleanupOldBackups() {
        try {
            const backups = this.getAvailableBackups();
            if (backups.length > 5) {
                const toRemove = backups.slice(5);
                toRemove.forEach(backup => {
                    this.remove(backup.key);
                });
                console.log(`Removed ${toRemove.length} old backups`);
            }
        } catch (error) {
            console.error('Error cleaning up old backups:', error);
        }
    }
    
    /**
     * Получить статистику хранилища
     */
    static getStorageStats() {
        try {
            const totalSize = this.getStorageSize();
            const backups = this.getAvailableBackups();
            const appDataSize = Object.values(this.KEYS).reduce((total, key) => {
                const data = this.load(key);
                return total + (data ? JSON.stringify(data).length : 0);
            }, 0);
            
            return {
                totalSize,
                appDataSize,
                backupCount: backups.length,
                backupSize: backups.reduce((total, backup) => total + backup.size, 0),
                available: this.isAvailable(),
                quota: this.getStorageQuota()
            };
        } catch (error) {
            console.error('Error getting storage stats:', error);
            return null;
        }
    }
    
    /**
     * Получить информацию о квоте хранилища (если доступно)
     */
    static getStorageQuota() {
        try {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                return navigator.storage.estimate();
            }
            return null;
        } catch (error) {
            console.error('Error getting storage quota:', error);
            return null;
        }
    }
}
