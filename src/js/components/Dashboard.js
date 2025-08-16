import { AnalyticsService } from '../services/AnalyticsService.js';

/**
 * Компонент Dashboard для отображения аналитики и метрик
 */
export class Dashboard {
    constructor(container, riskStore) {
        this.container = container;
        this.riskStore = riskStore;
        this.charts = new Map();
        this.currentFilters = {};
        this.isInitialized = false;
        
        if (container) {
            this.render();
            this.initializeCharts();
            this.subscribeToStore();
        }
    }
    
    /**
     * Рендер Dashboard
     */
    render() {
        return `
            <div class="dashboard">
                <div class="dashboard-header">
                    <h2>📊 Аналитическая панель</h2>
                    <div class="dashboard-controls">
                        <div class="date-range-picker">
                            <input type="date" id="startDate" class="date-input">
                            <span class="date-separator">—</span>
                            <input type="date" id="endDate" class="date-input">
                            <button class="btn btn-primary" id="updateDateRange">
                                <i class="fas fa-sync-alt"></i>
                                Обновить
                            </button>
                        </div>
                        <div class="view-toggle">
                            <button class="btn btn-secondary active" data-view="overview">
                                <i class="fas fa-chart-pie"></i>
                                Обзор
                            </button>
                            <button class="btn btn-secondary" data-view="trends">
                                <i class="fas fa-chart-line"></i>
                                Тренды
                            </button>
                            <button class="btn btn-secondary" data-view="correlations">
                                <i class="fas fa-project-diagram"></i>
                                Корреляции
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="metrics-grid" id="metricsGrid">
                    <div class="metric-card critical">
                        <div class="metric-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="metric-content">
                            <h3>Критические риски</h3>
                            <div class="metric-value" id="criticalCount">0</div>
                            <div class="metric-trend" id="criticalTrend">↑ +0%</div>
                        </div>
                    </div>
                    
                    <div class="metric-card high">
                        <div class="metric-icon">
                            <i class="fas fa-exclamation-circle"></i>
                        </div>
                        <div class="metric-content">
                            <h3>Высокие риски</h3>
                            <div class="metric-value" id="highCount">0</div>
                            <div class="metric-trend" id="highTrend">↑ +0%</div>
                        </div>
                    </div>
                    
                    <div class="metric-card medium">
                        <div class="metric-icon">
                            <i class="fas fa-info-circle"></i>
                        </div>
                        <div class="metric-content">
                            <h3>Средние риски</h3>
                            <div class="metric-value" id="mediumCount">0</div>
                            <div class="metric-trend" id="mediumTrend">↑ +0%</div>
                        </div>
                    </div>
                    
                    <div class="metric-card low">
                        <div class="metric-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="metric-content">
                            <h3>Низкие риски</h3>
                            <div class="metric-value" id="lowCount">0</div>
                            <div class="metric-trend" id="lowTrend">↑ +0%</div>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-main">
                    <div class="main-metrics">
                        <div class="metric-card large">
                            <h3>Общий риск-score</h3>
                            <div class="metric-value large" id="overallRiskScore">0.0</div>
                            <div class="risk-gauge" id="riskGauge">
                                <div class="gauge-fill" id="gaugeFill"></div>
                            </div>
                            <div class="metric-description">Средний показатель по всем рискам</div>
                        </div>
                        
                        <div class="metric-card large">
                            <h3>Покрытие рисков</h3>
                            <div class="metric-value large" id="riskCoverage">0%</div>
                            <div class="coverage-bar" id="coverageBar">
                                <div class="coverage-fill" id="coverageFill"></div>
                            </div>
                            <div class="metric-description">Процент обработанных рисков</div>
                        </div>
                        
                        <div class="metric-card large">
                            <h3>Уровень зрелости</h3>
                            <div class="metric-value large" id="maturityLevel">N/A</div>
                            <div class="maturity-indicator" id="maturityIndicator">
                                <div class="maturity-bar">
                                    <div class="maturity-fill" id="maturityFill"></div>
                                </div>
                            </div>
                            <div class="metric-description">Система управления рисками</div>
                        </div>
                    </div>
                    
                    <div class="charts-grid" id="chartsGrid">
                        <div class="chart-container">
                            <h3>Распределение по категориям</h3>
                            <canvas id="categoryChart" width="400" height="300"></canvas>
                        </div>
                        
                        <div class="chart-container">
                            <h3>Динамика рисков</h3>
                            <canvas id="trendChart" width="400" height="300"></canvas>
                        </div>
                        
                        <div class="chart-container">
                            <h3>Распределение по статусам</h3>
                            <canvas id="statusChart" width="400" height="300"></canvas>
                        </div>
                        
                        <div class="chart-container">
                            <h3>Финансовое влияние</h3>
                            <canvas id="financialChart" width="400" height="300"></canvas>
                        </div>
                    </div>
                </div>
                
                <div class="recommendations-section" id="recommendationsSection">
                    <h3>💡 Рекомендации</h3>
                    <div class="recommendations-list" id="recommendationsList">
                        <div class="recommendation-item">
                            <i class="fas fa-lightbulb"></i>
                            <span>Добавьте первые риски для начала анализа</span>
                        </div>
                    </div>
                </div>
                
                <div class="correlations-section" id="correlationsSection" style="display: none;">
                    <h3>🔗 Корреляции между рисками</h3>
                    <div class="correlations-list" id="correlationsList">
                        <div class="correlation-item">
                            <span>Нет данных для анализа корреляций</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Прикрепить обработчики событий
     */
    attachEventListeners() {
        const updateBtn = document.getElementById('updateDateRange');
        const viewButtons = document.querySelectorAll('.view-toggle button');
        
        // Обновление диапазона дат
        updateBtn.addEventListener('click', () => this.updateDateRange());
        
        // Переключение видов
        viewButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
        });
        
        // Установка текущих дат
        this.setDefaultDates();
    }
    
    /**
     * Установить даты по умолчанию
     */
    setDefaultDates() {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
        document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
    }
    
    /**
     * Обновить диапазон дат
     */
    updateDateRange() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if (startDate && endDate) {
            this.currentFilters.startDate = startDate;
            this.currentFilters.endDate = endDate;
            this.updateDashboard();
        }
    }
    
    /**
     * Переключить вид Dashboard
     */
    switchView(view) {
        // Убираем активный класс со всех кнопок
        document.querySelectorAll('.view-toggle button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Добавляем активный класс к выбранной кнопке
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        // Показываем/скрываем соответствующие секции
        switch (view) {
            case 'overview':
                document.getElementById('recommendationsSection').style.display = 'block';
                document.getElementById('correlationsSection').style.display = 'none';
                break;
            case 'trends':
                document.getElementById('recommendationsSection').style.display = 'block';
                document.getElementById('correlationsSection').style.display = 'none';
                this.updateTrendCharts();
                break;
            case 'correlations':
                document.getElementById('recommendationsSection').style.display = 'none';
                document.getElementById('correlationsSection').style.display = 'block';
                this.updateCorrelations();
                break;
        }
    }
    
    /**
     * Инициализация компонента
     */
    initialize() {
        if (!this.isInitialized) {
            // render() теперь возвращает HTML, не устанавливает innerHTML
            // attachEventListeners() будет вызван после вставки HTML в DOM
            this.initializeCharts();
            this.subscribeToStore();
            this.updateDashboard();
            this.isInitialized = true;
        }
    }
    
    /**
     * Подписаться на изменения в store
     */
    subscribeToStore() {
        if (this.riskStore && this.riskStore.subscribe) {
            this.riskStore.subscribe((risks, filters, statistics) => {
                this.updateDashboard(risks, filters, statistics);
            });
        }
    }
    
    /**
     * Обновить Dashboard
     */
    updateDashboard(risks = null, filters = null, statistics = null) {
        if (!risks) {
            risks = this.riskStore.getRisks();
        }
        
        if (!statistics) {
            statistics = this.riskStore.getStatistics();
        }
        
        this.updateMetrics(statistics);
        this.updateCharts(risks);
        this.updateRecommendations(risks);
        this.updateCorrelations(risks);
        
        if (!this.isInitialized) {
            this.isInitialized = true;
        }
    }
    
    /**
     * Обновить метрики
     */
    updateMetrics(statistics) {
        // Обновляем счетчики рисков
        document.getElementById('criticalCount').textContent = statistics.criticalCount || 0;
        document.getElementById('highCount').textContent = statistics.highCount || 0;
        document.getElementById('mediumCount').textContent = statistics.mediumCount || 0;
        document.getElementById('lowCount').textContent = statistics.lowCount || 0;
        
        // Обновляем общий риск-score
        document.getElementById('overallRiskScore').textContent = statistics.averageScore || '0.0';
        
        // Обновляем покрытие рисков
        const totalRisks = statistics.total || 0;
        const treatedRisks = (statistics.byStatus?.treated || 0) + 
                            (statistics.byStatus?.monitored || 0) + 
                            (statistics.byStatus?.closed || 0);
        const coverage = totalRisks > 0 ? Math.round((treatedRisks / totalRisks) * 100) : 0;
        
        document.getElementById('riskCoverage').textContent = `${coverage}%`;
        
        // Обновляем индикаторы
        this.updateGauge(statistics.averageScore || 0);
        this.updateCoverageBar(coverage);
        this.updateMaturityIndicator(statistics);
        
        // Обновляем тренды (показываем статичные данные)
        this.updateTrends();
    }
    
    /**
     * Обновить тренды
     */
    updateTrends() {
        const trends = [
            { id: 'criticalTrend', value: '+12%', direction: 'up' },
            { id: 'highTrend', value: '+5%', direction: 'up' },
            { id: 'mediumTrend', value: '-3%', direction: 'down' },
            { id: 'lowTrend', value: '+8%', direction: 'up' }
        ];
        
        trends.forEach(trend => {
            const element = document.getElementById(trend.id);
            if (element) {
                element.textContent = `${trend.direction === 'up' ? '↑' : '↓'} ${trend.value}`;
                element.className = `metric-trend ${trend.direction}`;
            }
        });
    }
    
    /**
     * Обновить индикатор риска
     */
    updateGauge(score) {
        const gaugeFill = document.getElementById('gaugeFill');
        const maxScore = 25; // Максимальный score (5 * 5)
        const percentage = Math.min((score / maxScore) * 100, 100);
        
        gaugeFill.style.width = `${percentage}%`;
        
        // Меняем цвет в зависимости от уровня
        if (score >= 20) {
            gaugeFill.className = 'gauge-fill critical';
        } else if (score >= 15) {
            gaugeFill.className = 'gauge-fill high';
        } else if (score >= 8) {
            gaugeFill.className = 'gauge-fill medium';
        } else {
            gaugeFill.className = 'gauge-fill low';
        }
    }
    
    /**
     * Обновить индикатор покрытия
     */
    updateCoverageBar(coverage) {
        const coverageFill = document.getElementById('coverageFill');
        coverageFill.style.width = `${coverage}%`;
        
        // Меняем цвет в зависимости от покрытия
        if (coverage >= 80) {
            coverageFill.className = 'coverage-fill excellent';
        } else if (coverage >= 60) {
            coverageFill.className = 'coverage-fill good';
        } else if (coverage >= 40) {
            coverageFill.className = 'coverage-fill fair';
        } else {
            coverageFill.className = 'coverage-fill poor';
        }
    }
    
    /**
     * Обновить индикатор зрелости
     */
    updateMaturityIndicator(statistics) {
        const maturityLevel = document.getElementById('maturityLevel');
        const maturityFill = document.getElementById('maturityFill');
        
        // Определяем уровень зрелости
        let level = 'N/A';
        let percentage = 0;
        
        if (statistics.total > 0) {
            const criticalPercentage = (statistics.criticalCount / statistics.total) * 100;
            const treatedPercentage = ((statistics.byStatus?.treated || 0) + 
                                     (statistics.byStatus?.monitored || 0) + 
                                     (statistics.byStatus?.closed || 0)) / statistics.total * 100;
            
            if (treatedPercentage >= 80 && criticalPercentage <= 10) {
                level = 'Продвинутый';
                percentage = 100;
            } else if (treatedPercentage >= 60 && criticalPercentage <= 20) {
                level = 'Средний';
                percentage = 75;
            } else if (treatedPercentage >= 40 && criticalPercentage <= 30) {
                level = 'Базовый';
                percentage = 50;
            } else {
                level = 'Начальный';
                percentage = 25;
            }
        }
        
        maturityLevel.textContent = level;
        maturityFill.style.width = `${percentage}%`;
    }
    
    /**
     * Обновить графики
     */
    updateCharts(risks) {
        if (risks.length === 0) {
            this.showEmptyCharts();
            return;
        }
        
        this.updateCategoryChart(risks);
        this.updateStatusChart(risks);
        this.updateFinancialChart(risks);
    }
    
    /**
     * Показать пустые графики
     */
    showEmptyCharts() {
        const chartContainers = document.querySelectorAll('.chart-container');
        chartContainers.forEach(container => {
            const canvas = container.querySelector('canvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Показываем сообщение об отсутствии данных
                ctx.fillStyle = '#666';
                ctx.font = '16px Inter';
                ctx.textAlign = 'center';
                ctx.fillText('Нет данных для отображения', canvas.width / 2, canvas.height / 2);
            }
        });
    }
    
    /**
     * Обновить график категорий
     */
    updateCategoryChart(risks) {
        const canvas = document.getElementById('categoryChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const categoryData = AnalyticsService.getCategoryDistribution(risks);
        const categories = Object.keys(categoryData);
        const values = Object.values(categoryData);
        
        if (categories.length === 0) return;
        
        // Простая круговая диаграмма
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
        
        let currentAngle = 0;
        categories.forEach((category, index) => {
            const sliceAngle = (values[index] / values.reduce((a, b) => a + b, 0)) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();
            
            // Добавляем подписи
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
            
            ctx.fillStyle = '#333';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(category, labelX, labelY);
            
            currentAngle += sliceAngle;
        });
    }
    
    /**
     * Обновить график статусов
     */
    updateStatusChart(risks) {
        const canvas = document.getElementById('statusChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const statusData = AnalyticsService.getStatusDistribution(risks);
        const statuses = Object.keys(statusData);
        const values = Object.values(statusData);
        
        if (statuses.length === 0) return;
        
        // Простая столбчатая диаграмма
        const barWidth = (canvas.width - 40) / statuses.length;
        const maxValue = Math.max(...values);
        const barHeight = canvas.height - 60;
        
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
        
        statuses.forEach((status, index) => {
            const barHeightValue = (values[index] / maxValue) * barHeight;
            const x = 20 + index * barWidth;
            const y = canvas.height - 40 - barHeightValue;
            
            // Рисуем столбец
            ctx.fillStyle = colors[index % colors.length];
            ctx.fillRect(x, y, barWidth - 4, barHeightValue);
            
            // Добавляем подписи
            ctx.fillStyle = '#333';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(status, x + barWidth / 2, canvas.height - 20);
            ctx.fillText(values[index], x + barWidth / 2, y - 10);
        });
    }
    
    /**
     * Обновить финансовый график
     */
    updateFinancialChart(risks) {
        const canvas = document.getElementById('financialChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const financialData = AnalyticsService.calculateFinancialImpact(risks);
        if (!financialData) return;
        
        const costByLevel = financialData.costByLevel;
        const levels = Object.keys(costByLevel);
        const values = Object.values(costByLevel);
        
        if (levels.length === 0) return;
        
        // Простая линейная диаграмма
        const maxValue = Math.max(...values);
        const chartWidth = canvas.width - 40;
        const chartHeight = canvas.height - 60;
        
        ctx.strokeStyle = '#45B7D1';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        levels.forEach((level, index) => {
            const x = 20 + (index / (levels.length - 1)) * chartWidth;
            const y = canvas.height - 40 - (values[index] / maxValue) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            // Рисуем точки
            ctx.fillStyle = '#45B7D1';
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();
            
            // Добавляем подписи
            ctx.fillStyle = '#333';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(level, x, canvas.height - 20);
            ctx.fillText(`${values[index]}₽`, x, y - 15);
        });
        
        ctx.stroke();
    }
    
    /**
     * Обновить трендовые графики
     */
    updateTrendCharts() {
        // Здесь можно добавить более сложную логику для трендов
        console.log('Updating trend charts...');
    }
    
    /**
     * Обновить рекомендации
     */
    updateRecommendations(risks) {
        const recommendationsList = document.getElementById('recommendationsList');
        if (!recommendationsList) return;
        
        const recommendations = AnalyticsService.generateRecommendations(risks);
        
        recommendationsList.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item">
                <i class="fas fa-lightbulb"></i>
                <span>${rec}</span>
            </div>
        `).join('');
    }
    
    /**
     * Обновить корреляции
     */
    updateCorrelations(risks) {
        const correlationsList = document.getElementById('correlationsList');
        if (!correlationsList) return;
        
        if (risks.length < 2) {
            correlationsList.innerHTML = `
                <div class="correlation-item">
                    <span>Необходимо минимум 2 риска для анализа корреляций</span>
                </div>
            `;
            return;
        }
        
        const correlations = AnalyticsService.calculateRiskCorrelations(risks);
        
        if (correlations.length === 0) {
            correlationsList.innerHTML = `
                <div class="correlation-item">
                    <span>Значимых корреляций между рисками не обнаружено</span>
                </div>
            `;
            return;
        }
        
        correlationsList.innerHTML = correlations.map(corr => `
            <div class="correlation-item">
                <div class="correlation-header">
                    <span class="correlation-strength">${corr.correlation}</span>
                    <span class="correlation-reason">${corr.reason}</span>
                </div>
                <div class="correlation-risks">
                    <span>Риск 1: ${this.getRiskTitle(corr.risk1)}</span>
                    <span>Риск 2: ${this.getRiskTitle(corr.risk2)}</span>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Получить название риска по ID
     */
    getRiskTitle(riskId) {
        const risk = this.riskStore.getRisk(riskId);
        return risk ? risk.title : 'Неизвестный риск';
    }
    
    /**
     * Инициализировать графики
     */
    initializeCharts() {
        // Графики инициализируются при первом обновлении данных
        console.log('Dashboard charts initialized');
    }
    
    /**
     * Уничтожить компонент
     */
    destroy() {
        this.container.innerHTML = '';
    }
}
