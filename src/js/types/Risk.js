/**
 * Типы данных для системы управления рисками
 */

export const RiskLevel = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
};

export const RiskCategory = {
    OPERATIONAL: 'operational',
    FINANCIAL: 'financial',
    REGULATORY: 'regulatory',
    TECHNOLOGICAL: 'technological',
    REPUTATION: 'reputation',
    ENVIRONMENTAL: 'environmental'
};

export const RiskStatus = {
    IDENTIFIED: 'identified',
    ASSESSED: 'assessed',
    TREATED: 'treated',
    MONITORED: 'monitored',
    CLOSED: 'closed'
};

export const RiskProbability = {
    VERY_LOW: 1,
    LOW: 2,
    MEDIUM: 3,
    HIGH: 4,
    VERY_HIGH: 5
};

export const RiskImpact = {
    NEGLIGIBLE: 1,
    MINOR: 2,
    MODERATE: 3,
    MAJOR: 4,
    CATASTROPHIC: 5
};

/**
 * Основной класс риска
 */
export class Risk {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.title = data.title || '';
        this.description = data.description || '';
        this.category = data.category || RiskCategory.OPERATIONAL;
        this.level = data.level || RiskLevel.MEDIUM;
        this.status = data.status || RiskStatus.IDENTIFIED;
        this.probability = data.probability || RiskProbability.MEDIUM;
        this.impact = data.impact || RiskImpact.MODERATE;
        this.timeline = data.timeline || 'short'; // short, medium, long
        this.owner = data.owner || '';
        this.mitigation = data.mitigation || '';
        this.cost = data.cost || 0;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.tags = data.tags || [];
        this.attachments = data.attachments || [];
        this.history = data.history || [];
    }

    generateId() {
        return 'risk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    calculateScore() {
        return (this.probability * this.impact).toFixed(2);
    }

    getLevelByScore() {
        const score = this.calculateScore();
        if (score >= 20) return RiskLevel.CRITICAL;
        if (score >= 15) return RiskLevel.HIGH;
        if (score >= 8) return RiskLevel.MEDIUM;
        return RiskLevel.LOW;
    }

    update(data) {
        Object.assign(this, data);
        this.updatedAt = new Date().toISOString();
        this.addToHistory('Обновлен', data);
    }

    addToHistory(action, details = {}) {
        this.history.push({
            action,
            details,
            timestamp: new Date().toISOString(),
            user: 'system' // В будущем можно добавить авторизацию
        });
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            category: this.category,
            level: this.level,
            status: this.status,
            probability: this.probability,
            impact: this.impact,
            timeline: this.timeline,
            owner: this.owner,
            mitigation: this.mitigation,
            cost: this.cost,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            tags: this.tags,
            attachments: this.attachments,
            history: this.history
        };
    }

    static fromJSON(json) {
        return new Risk(json);
    }
}

/**
 * Валидация данных риска
 */
export class RiskValidator {
    static validate(risk) {
        const errors = [];

        if (!risk.title || risk.title.trim().length < 3) {
            errors.push('Название риска должно содержать минимум 3 символа');
        }

        if (!risk.description || risk.description.trim().length < 10) {
            errors.push('Описание риска должно содержать минимум 10 символов');
        }

        if (!Object.values(RiskCategory).includes(risk.category)) {
            errors.push('Неверная категория риска');
        }

        if (!Object.values(RiskLevel).includes(risk.level)) {
            errors.push('Неверный уровень риска');
        }

        if (risk.probability < 1 || risk.probability > 5) {
            errors.push('Вероятность должна быть от 1 до 5');
        }

        if (risk.impact < 1 || risk.impact > 5) {
            errors.push('Влияние должно быть от 1 до 5');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
