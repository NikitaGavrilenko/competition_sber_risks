/**
 * Демонстрационный файл для тестирования новой архитектуры
 * Запустите этот файл в браузере для проверки работы всех компонентов
 */

import { RiskStore } from './store/RiskStore.js';
import { AppStore } from './store/AppStore.js';
import { Dashboard } from './components/Dashboard.js';
import { RiskForm } from './components/RiskForm.js';
import { AnalyticsService } from './services/AnalyticsService.js';
import { StorageService } from './services/StorageService.js';

class RiskAppDemo {
    constructor() {
        this.riskStore = null;
        this.appStore = null;
        this.dashboard = null;
        this.riskForm = null;
        this.isInitialized = false;
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🚀 Инициализация демо приложения...');
            
            // Создаем stores
            this.riskStore = new RiskStore();
            this.appStore = new AppStore();
            
            // Загружаем демо данные
            await this.loadDemoData();
            
            // Инициализируем компоненты
            this.initComponents();
            
            // Запускаем демо
            this.runDemo();
            
            this.isInitialized = true;
            console.log('✅ Демо приложение успешно инициализировано!');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
        }
    }
    
    async loadDemoData() {
        console.log('📊 Загрузка демо данных...');
        
        try {
            // Проверяем, есть ли уже данные
            const existingRisks = this.riskStore.getRisks();
            
            if (existingRisks.length === 0) {
                // Загружаем демо риски из JSON файла
                const response = await fetch('../data/risks.json');
                if (response.ok) {
                    const demoRisks = await response.json();
                    
                    // Добавляем каждый риск в store
                    demoRisks.forEach(riskData => {
                        this.riskStore.addRisk(riskData);
                    });
                    
                    console.log(`✅ Загружено ${demoRisks.length} демо рисков`);
                } else {
                    console.warn('⚠️ Не удалось загрузить демо данные, создаем тестовые риски');
                    this.createTestRisks();
                }
            } else {
                console.log(`✅ Найдено ${existingRisks.length} существующих рисков`);
            }
            
        } catch (error) {
            console.warn('⚠️ Ошибка загрузки демо данных, создаем тестовые риски');
            this.createTestRisks();
        }
    }
    
    createTestRisks() {
        console.log('🔧 Создание тестовых рисков...');
        
        const testRisks = [
            {
                title: 'Тестовый операционный риск',
                description: 'Это тестовый риск для демонстрации функциональности',
                category: 'operational',
                level: 'medium',
                probability: 3,
                impact: 4,
                timeline: 'short',
                owner: 'Демо пользователь',
                mitigation: 'Тестовые меры по снижению риска',
                cost: 50000,
                tags: ['тест', 'демо', 'операционный']
            },
            {
                title: 'Тестовый финансовый риск',
                description: 'Тестовый финансовый риск с высокой вероятностью',
                category: 'financial',
                level: 'high',
                probability: 4,
                impact: 5,
                timeline: 'medium',
                owner: 'Демо пользователь',
                mitigation: 'Финансовые меры по снижению риска',
                cost: 150000,
                tags: ['тест', 'демо', 'финансовый']
            }
        ];
        
        testRisks.forEach(riskData => {
            this.riskStore.addRisk(riskData);
        });
        
        console.log(`✅ Создано ${testRisks.length} тестовых рисков`);
    }
    
    initComponents() {
        console.log('🎨 Инициализация компонентов...');
        
        // Создаем контейнеры для компонентов
        this.createDemoContainers();
        
        // Инициализируем Dashboard
        const dashboardContainer = document.getElementById('demo-dashboard');
        if (dashboardContainer) {
            this.dashboard = new Dashboard(dashboardContainer, this.riskStore);
            console.log('✅ Dashboard инициализирован');
        }
        
        // Инициализируем форму риска
        const formContainer = document.getElementById('demo-risk-form');
        if (formContainer) {
            this.riskForm = new RiskForm(formContainer, {
                onSubmit: (data) => this.handleRiskSubmit(data),
                onCancel: () => this.handleRiskCancel()
            });
            console.log('✅ RiskForm инициализирована');
        }
    }
    
    createDemoContainers() {
        // Создаем основной контейнер для демо
        const demoContainer = document.createElement('div');
        demoContainer.id = 'risk-app-demo';
        demoContainer.innerHTML = `
            <div class="demo-header">
                <h1>🎯 Демо: Карта рисков</h1>
                <p>Демонстрация новой архитектуры приложения</p>
            </div>
            
            <div class="demo-content">
                <div class="demo-section">
                    <h2>📊 Dashboard</h2>
                    <div id="demo-dashboard"></div>
                </div>
                
                <div class="demo-section">
                    <h2>📝 Форма риска</h2>
                    <div id="demo-risk-form"></div>
                </div>
                
                <div class="demo-section">
                    <h2>🔧 Тестирование API</h2>
                    <div class="demo-controls">
                        <button id="test-add-risk" class="btn btn-primary">Добавить тестовый риск</button>
                        <button id="test-analytics" class="btn btn-secondary">Тест аналитики</button>
                        <button id="test-storage" class="btn btn-secondary">Тест хранилища</button>
                        <button id="test-clear" class="btn btn-danger">Очистить все</button>
                    </div>
                    <div id="demo-output" class="demo-output"></div>
                </div>
            </div>
        `;
        
        // Добавляем в body
        document.body.appendChild(demoContainer);
        
        // Добавляем стили для демо
        this.addDemoStyles();
        
        // Привязываем обработчики событий
        this.bindDemoEvents();
    }
    
    addDemoStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #risk-app-demo {
                font-family: 'Inter', sans-serif;
                max-width: 1200px;
                margin: 0 auto;
                padding: 2rem;
                background: #f8f9fa;
                min-height: 100vh;
            }
            
            .demo-header {
                text-align: center;
                margin-bottom: 3rem;
                padding: 2rem;
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            .demo-header h1 {
                color: #2c3e50;
                margin-bottom: 0.5rem;
            }
            
            .demo-header p {
                color: #7f8c8d;
                font-size: 1.1rem;
            }
            
            .demo-section {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                margin-bottom: 2rem;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            .demo-section h2 {
                color: #2c3e50;
                margin-bottom: 1.5rem;
                padding-bottom: 0.5rem;
                border-bottom: 2px solid #ecf0f1;
            }
            
            .demo-controls {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
                margin-bottom: 1.5rem;
            }
            
            .demo-controls .btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .btn-primary {
                background: #3498db;
                color: white;
            }
            
            .btn-primary:hover {
                background: #2980b9;
                transform: translateY(-1px);
            }
            
            .btn-secondary {
                background: #95a5a6;
                color: white;
            }
            
            .btn-secondary:hover {
                background: #7f8c8d;
                transform: translateY(-1px);
            }
            
            .btn-danger {
                background: #e74c3c;
                color: white;
            }
            
            .btn-danger:hover {
                background: #c0392b;
                transform: translateY(-1px);
            }
            
            .demo-output {
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 6px;
                padding: 1rem;
                font-family: 'Monaco', 'Menlo', monospace;
                font-size: 0.9rem;
                max-height: 300px;
                overflow-y: auto;
                white-space: pre-wrap;
            }
            
            @media (max-width: 768px) {
                #risk-app-demo {
                    padding: 1rem;
                }
                
                .demo-controls {
                    flex-direction: column;
                }
                
                .demo-controls .btn {
                    width: 100%;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    bindDemoEvents() {
        // Тест добавления риска
        document.getElementById('test-add-risk')?.addEventListener('click', () => {
            this.testAddRisk();
        });
        
        // Тест аналитики
        document.getElementById('test-analytics')?.addEventListener('click', () => {
            this.testAnalytics();
        });
        
        // Тест хранилища
        document.getElementById('test-storage')?.addEventListener('click', () => {
            this.testStorage();
        });
        
        // Очистить все
        document.getElementById('test-clear')?.addEventListener('click', () => {
            this.testClear();
        });
    }
    
    testAddRisk() {
        console.log('🧪 Тест добавления риска...');
        
        const testRisk = {
            title: `Тестовый риск ${Date.now()}`,
            description: 'Автоматически созданный тестовый риск для демонстрации',
            category: 'technological',
            level: 'low',
            probability: 2,
            impact: 3,
            timeline: 'medium',
            owner: 'Демо система',
            mitigation: 'Автоматические меры по снижению риска',
            cost: Math.floor(Math.random() * 100000) + 10000,
            tags: ['автотест', 'демо', 'технологический']
        };
        
        const result = this.riskStore.addRisk(testRisk);
        
        if (result.success) {
            this.logOutput(`✅ Риск успешно добавлен:\n${JSON.stringify(result.risk, null, 2)}`);
        } else {
            this.logOutput(`❌ Ошибка добавления риска:\n${result.error}`);
        }
    }
    
    testAnalytics() {
        console.log('🧪 Тест аналитики...');
        
        const risks = this.riskStore.getRisks();
        
        if (risks.length === 0) {
            this.logOutput('⚠️ Нет рисков для анализа');
            return;
        }
        
        // Тестируем различные методы аналитики
        const trends = AnalyticsService.calculateRiskTrends(risks, 30);
        const maturityReport = AnalyticsService.generateMaturityReport(risks);
        const correlations = AnalyticsService.calculateRiskCorrelations(risks);
        const financialImpact = AnalyticsService.calculateFinancialImpact(risks);
        
        this.logOutput(`📊 Результаты аналитики:\n\n` +
            `Тренды (30 дней):\n${JSON.stringify(trends, null, 2)}\n\n` +
            `Отчет о зрелости:\n${JSON.stringify(maturityReport, null, 2)}\n\n` +
            `Корреляции:\n${JSON.stringify(correlations, null, 2)}\n\n` +
            `Финансовое влияние:\n${JSON.stringify(financialImpact, null, 2)}`
        );
    }
    
    testStorage() {
        console.log('🧪 Тест хранилища...');
        
        try {
            // Тестируем статистику хранилища
            const storageStats = StorageService.getStorageStats();
            
            // Тестируем создание резервной копии
            const backup = StorageService.createBackup();
            
            // Тестируем экспорт данных
            const exportData = this.riskStore.exportData();
            
            this.logOutput(`💾 Статистика хранилища:\n${JSON.stringify(storageStats, null, 2)}\n\n` +
                `Резервная копия:\n${JSON.stringify(backup, null, 2)}\n\n` +
                `Экспорт данных:\n${JSON.stringify(exportData, null, 2)}`
            );
            
        } catch (error) {
            this.logOutput(`❌ Ошибка тестирования хранилища:\n${error.message}`);
        }
    }
    
    testClear() {
        console.log('🧪 Тест очистки...');
        
        if (confirm('Вы уверены, что хотите очистить все данные? Это действие нельзя отменить.')) {
            // Очищаем риски
            this.riskStore.clearAll();
            
            // Очищаем настройки приложения
            this.appStore.resetToDefaults();
            
            // Очищаем localStorage
            StorageService.clearAppData();
            
            this.logOutput('🗑️ Все данные успешно очищены');
            
            // Перезагружаем страницу для применения изменений
            setTimeout(() => {
                location.reload();
            }, 2000);
        }
    }
    
    handleRiskSubmit(riskData) {
        console.log('📝 Обработка отправки формы риска:', riskData);
        
        const result = this.riskStore.addRisk(riskData);
        
        if (result.success) {
            this.logOutput(`✅ Новый риск успешно создан:\n${JSON.stringify(result.risk, null, 2)}`);
            
            // Очищаем форму
            if (this.riskForm) {
                this.riskForm.destroy();
                this.riskForm = new RiskForm(document.getElementById('demo-risk-form'), {
                    onSubmit: (data) => this.handleRiskSubmit(data),
                    onCancel: () => this.handleRiskCancel()
                });
            }
        } else {
            this.logOutput(`❌ Ошибка создания риска:\n${result.error}`);
        }
    }
    
    handleRiskCancel() {
        console.log('❌ Отмена создания риска');
        this.logOutput('❌ Создание риска отменено');
    }
    
    logOutput(message) {
        const output = document.getElementById('demo-output');
        if (output) {
            output.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        }
        console.log(message);
    }
    
    runDemo() {
        console.log('🎬 Запуск демо...');
        
        // Показываем приветственное сообщение
        this.logOutput('🎉 Демо приложение запущено!\n\n' +
            'Доступные тесты:\n' +
            '• Добавить тестовый риск - создает новый риск\n' +
            '• Тест аналитики - показывает результаты анализа\n' +
            '• Тест хранилища - проверяет работу с данными\n' +
            '• Очистить все - удаляет все данные\n\n' +
            'Попробуйте добавить несколько рисков и протестировать аналитику!'
        );
        
        // Автоматически запускаем тест аналитики через 3 секунды
        setTimeout(() => {
            this.testAnalytics();
        }, 3000);
    }
}

// Запускаем демо при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌐 Страница загружена, запускаем демо...');
    window.riskAppDemo = new RiskAppDemo();
});

// Экспортируем для использования в консоли браузера
window.RiskAppDemo = RiskAppDemo;
