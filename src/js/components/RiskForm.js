import { Risk, RiskCategory, RiskLevel, RiskStatus, RiskValidator } from '../types/Risk.js';

/**
 * Компонент формы для добавления и редактирования рисков
 */
export class RiskForm {
    constructor(container, riskStore, options = {}) {
        this.container = container;
        this.riskStore = riskStore;
        this.options = {
            mode: 'create', // 'create' или 'edit'
            risk: null, // для режима редактирования
            onSubmit: () => {},
            onCancel: () => {},
            ...options
        };
        
        this.validators = new FormValidators();
        if (container) {
            this.render();
            // attachEventListeners() будет вызван после вставки HTML в DOM
        }
    }
    
    /**
     * Рендер формы
     */
    render() {
        const isEditMode = this.options.mode === 'edit';
        const risk = this.options.risk || {};
        
        return `
            <div class="risk-form-container">
                <div class="form-header">
                    <h3>${isEditMode ? 'Редактировать риск' : 'Добавить новый риск'}</h3>
                    <button type="button" class="btn-close" id="formCloseBtn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form class="risk-form" id="riskForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="riskTitle">Название риска *</label>
                            <input 
                                type="text" 
                                id="riskTitle" 
                                name="title" 
                                value="${risk.title || ''}"
                                placeholder="Введите название риска"
                                required
                            >
                            <span class="error-message" id="titleError"></span>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="riskDescription">Описание *</label>
                            <textarea 
                                id="riskDescription" 
                                name="description" 
                                rows="4"
                                placeholder="Опишите риск подробно"
                                required
                            >${risk.description || ''}</textarea>
                            <span class="error-message" id="descriptionError"></span>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="riskCategory">Категория *</label>
                            <select id="riskCategory" name="category" required>
                                <option value="">Выберите категорию</option>
                                ${this.renderCategoryOptions(risk.category)}
                            </select>
                            <span class="error-message" id="categoryError"></span>
                        </div>
                        
                        <div class="form-group">
                            <label for="riskLevel">Уровень риска *</label>
                            <select id="riskLevel" name="level" required>
                                <option value="">Выберите уровень</option>
                                ${this.renderLevelOptions(risk.level)}
                            </select>
                            <span class="error-message" id="levelError"></span>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="riskProbability">Вероятность *</label>
                            <div class="probability-slider-container">
                                <input 
                                    type="range" 
                                    id="riskProbability" 
                                    name="probability" 
                                    min="1" 
                                    max="5" 
                                    value="${risk.probability || 3}"
                                    class="probability-slider"
                                >
                                <div class="slider-labels">
                                    <span>1 - Очень низкая</span>
                                    <span>5 - Очень высокая</span>
                                </div>
                                <div class="probability-value" id="probabilityValue">
                                    ${this.getProbabilityLabel(risk.probability || 3)}
                                </div>
                            </div>
                            <span class="error-message" id="probabilityError"></span>
                        </div>
                        
                        <div class="form-group">
                            <label for="riskImpact">Влияние *</label>
                            <div class="impact-slider-container">
                                <input 
                                    type="range" 
                                    id="riskImpact" 
                                    name="impact" 
                                    min="1" 
                                    max="5" 
                                    value="${risk.impact || 3}"
                                    class="impact-slider"
                                >
                                <div class="slider-labels">
                                    <span>1 - Незначительное</span>
                                    <span>5 - Катастрофическое</span>
                                </div>
                                <div class="impact-value" id="impactValue">
                                    ${this.getImpactLabel(risk.impact || 3)}
                                </div>
                            </div>
                            <span class="error-message" id="impactError"></span>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="riskTimeline">Временные рамки</label>
                            <select id="riskTimeline" name="timeline">
                                <option value="short" ${risk.timeline === 'short' ? 'selected' : ''}>Краткосрочные (до 3 месяцев)</option>
                                <option value="medium" ${risk.timeline === 'medium' ? 'selected' : ''}>Среднесрочные (3-12 месяцев)</option>
                                <option value="long" ${risk.timeline === 'long' ? 'selected' : ''}>Долгосрочные (более 12 месяцев)</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="riskStatus">Статус</label>
                            <select id="riskStatus" name="status">
                                ${this.renderStatusOptions(risk.status)}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="riskOwner">Владелец риска</label>
                            <input 
                                type="text" 
                                id="riskOwner" 
                                name="owner" 
                                value="${risk.owner || ''}"
                                placeholder="ФИО ответственного лица"
                            >
                        </div>
                        
                        <div class="form-group">
                            <label for="riskCost">Оценка стоимости (руб.)</label>
                            <input 
                                type="number" 
                                id="riskCost" 
                                name="cost" 
                                value="${risk.cost || ''}"
                                placeholder="0"
                                min="0"
                                step="1000"
                            >
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group full-width">
                            <label for="riskMitigation">Меры по снижению риска</label>
                            <textarea 
                                id="riskMitigation" 
                                name="mitigation" 
                                rows="3"
                                placeholder="Опишите планируемые меры по снижению риска"
                            >${risk.mitigation || ''}</textarea>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group full-width">
                            <label for="riskTags">Теги</label>
                            <input 
                                type="text" 
                                id="riskTags" 
                                name="tags" 
                                value="${(risk.tags || []).join(', ')}"
                                placeholder="Введите теги через запятую"
                            >
                            <small class="form-hint">Теги помогают группировать и искать риски</small>
                        </div>
                    </div>
                    
                    <div class="risk-score-preview" id="riskScorePreview">
                        <div class="score-item">
                            <span class="score-label">Риск-score:</span>
                            <span class="score-value" id="calculatedScore">0</span>
                        </div>
                        <div class="score-item">
                            <span class="score-label">Автоопределенный уровень:</span>
                            <span class="score-value" id="autoLevel">-</span>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i>
                            ${isEditMode ? 'Сохранить изменения' : 'Создать риск'}
                        </button>
                        <button type="button" class="btn btn-secondary" id="cancelBtn">
                            <i class="fas fa-times"></i>
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        `;
    }
    
    /**
     * Инициализация компонента
     */
    initialize() {
        if (this.container) {
            // render() теперь возвращает HTML, не устанавливает innerHTML
            this.attachEventListeners();
        }
    }
    
    /**
     * Прикрепить обработчики событий
     */
    attachEventListeners() {
        const form = document.getElementById('riskForm');
        const closeBtn = document.getElementById('formCloseBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        
        // Обработка отправки формы
        form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Кнопка закрытия
        closeBtn.addEventListener('click', () => this.options.onCancel());
        
        // Кнопка отмены
        cancelBtn.addEventListener('click', () => this.options.onCancel());
        
        // Обновление риск-score в реальном времени
        this.attachScoreUpdateListeners();
        
        // Валидация в реальном времени
        this.attachValidationListeners();
    }
    
    /**
     * Прикрепить обработчики для обновления риск-score
     */
    attachScoreUpdateListeners() {
        const probabilitySlider = document.getElementById('riskProbability');
        const impactSlider = document.getElementById('riskImpact');
        const levelSelect = document.getElementById('riskLevel');
        
        const updateScore = () => {
            const probability = parseInt(probabilitySlider.value);
            const impact = parseInt(impactSlider.value);
            const level = levelSelect.value;
            
            // Обновляем значения слайдеров
            document.getElementById('probabilityValue').textContent = this.getProbabilityLabel(probability);
            document.getElementById('impactValue').textContent = this.getImpactLabel(impact);
            
            // Рассчитываем риск-score
            const score = (probability * impact).toFixed(2);
            document.getElementById('calculatedScore').textContent = score;
            
            // Автоопределяем уровень
            const autoLevel = this.calculateAutoLevel(score);
            document.getElementById('autoLevel').textContent = this.getLevelLabel(autoLevel);
            
            // Подсвечиваем автоопределенный уровень
            this.highlightAutoLevel(autoLevel);
        };
        
        probabilitySlider.addEventListener('input', updateScore);
        impactSlider.addEventListener('input', updateScore);
        levelSelect.addEventListener('change', updateScore);
        
        // Инициализируем значения
        updateScore();
    }
    
    /**
     * Прикрепить обработчики валидации
     */
    attachValidationListeners() {
        const inputs = this.container.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }
    
    /**
     * Обработка отправки формы
     */
    handleSubmit(e) {
        e.preventDefault();
        
        // Очищаем предыдущие ошибки
        this.clearAllErrors();
        
        // Собираем данные формы
        const formData = this.getFormData();
        
        // Валидируем данные
        const validation = RiskValidator.validate(formData);
        if (!validation.isValid) {
            this.showValidationErrors(validation.errors);
            return;
        }
        
        // Вызываем callback
        this.options.onSubmit(formData);
    }
    
    /**
     * Получить данные формы
     */
    getFormData() {
        const form = document.getElementById('riskForm');
        const formData = new FormData(form);
        
        const data = {
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            level: formData.get('level'),
            probability: parseInt(formData.get('probability')),
            impact: parseInt(formData.get('impact')),
            timeline: formData.get('timeline'),
            status: formData.get('status'),
            owner: formData.get('owner'),
            cost: parseFloat(formData.get('cost')) || 0,
            mitigation: formData.get('mitigation'),
            tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag)
        };
        
        // Если это режим редактирования, добавляем ID
        if (this.options.mode === 'edit' && this.options.risk) {
            data.id = this.options.risk.id;
        }
        
        return data;
    }
    
    /**
     * Валидация поля
     */
    validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        
        let isValid = true;
        let errorMessage = '';
        
        switch (fieldName) {
            case 'title':
                if (!value || value.length < 3) {
                    isValid = false;
                    errorMessage = 'Название должно содержать минимум 3 символа';
                }
                break;
                
            case 'description':
                if (!value || value.length < 10) {
                    isValid = false;
                    errorMessage = 'Описание должно содержать минимум 10 символов';
                }
                break;
                
            case 'category':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Выберите категорию';
                }
                break;
                
            case 'level':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Выберите уровень риска';
                }
                break;
        }
        
        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }
        
        return isValid;
    }
    
    /**
     * Показать ошибку поля
     */
    showFieldError(field, message) {
        const errorElement = document.getElementById(`${field.name}Error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            field.classList.add('error');
        }
    }
    
    /**
     * Очистить ошибку поля
     */
    clearFieldError(field) {
        const errorElement = document.getElementById(`${field.name}Error`);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
            field.classList.remove('error');
        }
    }
    
    /**
     * Очистить все ошибки
     */
    clearAllErrors() {
        const errorElements = this.container.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });
        
        const errorFields = this.container.querySelectorAll('.error');
        errorFields.forEach(field => field.classList.remove('error'));
    }
    
    /**
     * Показать ошибки валидации
     */
    showValidationErrors(errors) {
        errors.forEach(error => {
            // Пытаемся найти соответствующее поле по тексту ошибки
            if (error.includes('название')) {
                this.showFieldError(document.getElementById('riskTitle'), error);
            } else if (error.includes('описание')) {
                this.showFieldError(document.getElementById('riskDescription'), error);
            } else if (error.includes('категория')) {
                this.showFieldError(document.getElementById('riskCategory'), error);
            } else if (error.includes('уровень')) {
                this.showFieldError(document.getElementById('riskLevel'), error);
            }
        });
    }
    
    /**
     * Рассчитать автоопределенный уровень по score
     */
    calculateAutoLevel(score) {
        const numScore = parseFloat(score);
        if (numScore >= 20) return 'critical';
        if (numScore >= 15) return 'high';
        if (numScore >= 8) return 'medium';
        return 'low';
    }
    
    /**
     * Подсветить автоопределенный уровень
     */
    highlightAutoLevel(level) {
        const levelSelect = document.getElementById('riskLevel');
        const options = levelSelect.querySelectorAll('option');
        
        options.forEach(option => {
            option.classList.remove('auto-selected');
            if (option.value === level) {
                option.classList.add('auto-selected');
            }
        });
    }
    
    /**
     * Рендер опций категорий
     */
    renderCategoryOptions(selectedCategory = '') {
        const categories = {
            'operational': '🔧 Операционные',
            'financial': '💰 Финансовые',
            'regulatory': '📋 Регуляторные',
            'technological': '💻 Технологические',
            'reputation': '🌟 Репутационные',
            'environmental': '🌱 Экологические'
        };
        
        return Object.entries(categories)
            .map(([value, label]) => 
                `<option value="${value}" ${value === selectedCategory ? 'selected' : ''}>${label}</option>`
            )
            .join('');
    }
    
    /**
     * Рендер опций уровней риска
     */
    renderLevelOptions(selectedLevel = '') {
        const levels = {
            'low': '🟢 Низкий',
            'medium': '🟡 Средний',
            'high': '🟠 Высокий',
            'critical': '🔴 Критический'
        };
        
        return Object.entries(levels)
            .map(([value, label]) => 
                `<option value="${value}" ${value === selectedLevel ? 'selected' : ''}>${label}</option>`
            )
            .join('');
    }
    
    /**
     * Рендер опций статусов
     */
    renderStatusOptions(selectedStatus = '') {
        const statuses = {
            'identified': '🔍 Выявлен',
            'assessed': '📊 Оценен',
            'treated': '✅ Обработан',
            'monitored': '👁️ Мониторится',
            'closed': '🔒 Закрыт'
        };
        
        return Object.entries(statuses)
            .map(([value, label]) => 
                `<option value="${value}" ${value === selectedStatus ? 'selected' : ''}>${label}</option>`
            )
            .join('');
    }
    
    /**
     * Получить метку вероятности
     */
    getProbabilityLabel(probability) {
        const labels = {
            1: 'Очень низкая',
            2: 'Низкая',
            3: 'Средняя',
            4: 'Высокая',
            5: 'Очень высокая'
        };
        return labels[probability] || 'Средняя';
    }
    
    /**
     * Получить метку влияния
     */
    getImpactLabel(impact) {
        const labels = {
            1: 'Незначительное',
            2: 'Минимальное',
            3: 'Умеренное',
            4: 'Значительное',
            5: 'Катастрофическое'
        };
        return labels[impact] || 'Умеренное';
    }
    
    /**
     * Получить метку уровня
     */
    getLevelLabel(level) {
        const labels = {
            'low': '🟢 Низкий',
            'medium': '🟡 Средний',
            'high': '🟠 Высокий',
            'critical': '🔴 Критический'
        };
        return labels[level] || 'Неопределен';
    }
    
    /**
     * Уничтожить компонент
     */
    destroy() {
        this.container.innerHTML = '';
    }
}

/**
 * Валидаторы для формы
 */
class FormValidators {
    validateRequired(value, fieldName) {
        if (!value || value.trim().length === 0) {
            return `${fieldName} обязателен для заполнения`;
        }
        return null;
    }
    
    validateMinLength(value, minLength, fieldName) {
        if (value && value.trim().length < minLength) {
            return `${fieldName} должен содержать минимум ${minLength} символов`;
        }
        return null;
    }
    
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            return 'Введите корректный email адрес';
        }
        return null;
    }
}
