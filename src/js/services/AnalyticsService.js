import { RiskLevel, RiskCategory } from '../types/Risk.js';

/**
 * Сервис для аналитики рисков
 */
export class AnalyticsService {
    
    /**
     * Рассчитать тренды рисков за период
     */
    static calculateRiskTrends(risks, timeframe = 30) {
        try {
            const now = new Date();
            const pastDate = new Date(now.getTime() - timeframe * 24 * 60 * 60 * 1000);
            
            const recentRisks = risks.filter(risk => 
                new Date(risk.createdAt) >= pastDate
            );
            
            const trends = recentRisks.reduce((acc, risk) => {
                const key = risk.level;
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {});
            
            // Рассчитываем процентные изменения
            const totalRecent = recentRisks.length;
            const totalAll = risks.length;
            
            return {
                trends,
                totalRecent,
                totalAll,
                percentageChange: totalAll > 0 ? ((totalRecent / totalAll) * 100).toFixed(2) : 0,
                timeframe
            };
        } catch (error) {
            console.error('Error calculating risk trends:', error);
            return null;
        }
    }
    
    /**
     * Рассчитать риск-score для конкретного риска
     */
    static calculateRiskScore(risk) {
        try {
            const probabilityWeight = this.getProbabilityWeight(risk.probability);
            const impactWeight = this.getImpactWeight(risk.level);
            const timeWeight = this.getTimeWeight(risk.timeline);
            
            return (probabilityWeight * impactWeight * timeWeight).toFixed(2);
        } catch (error) {
            console.error('Error calculating risk score:', error);
            return 0;
        }
    }
    
    /**
     * Получить вес вероятности
     */
    static getProbabilityWeight(probability) {
        const weights = {
            1: 0.2, // Очень низкая
            2: 0.4, // Низкая
            3: 0.6, // Средняя
            4: 0.8, // Высокая
            5: 1.0  // Очень высокая
        };
        return weights[probability] || 0.6;
    }
    
    /**
     * Получить вес влияния
     */
    static getImpactWeight(level) {
        const weights = {
            'low': 0.25,
            'medium': 0.5,
            'high': 0.75,
            'critical': 1.0
        };
        return weights[level] || 0.5;
    }
    
    /**
     * Получить временной вес
     */
    static getTimeWeight(timeline) {
        const weights = {
            'short': 1.0,   // Краткосрочные риски имеют больший вес
            'medium': 0.7,
            'long': 0.4
        };
        return weights[timeline] || 0.7;
    }
    
    /**
     * Сгенерировать отчет о зрелости управления рисками
     */
    static generateMaturityReport(risks) {
        try {
            const totalRisks = risks.length;
            if (totalRisks === 0) {
                return {
                    totalRisks: 0,
                    averageScore: 0,
                    categoryDistribution: {},
                    riskMaturity: 'N/A',
                    recommendations: ['Добавьте первые риски для начала анализа']
                };
            }
            
            const averageScore = this.getAverageRiskScore(risks);
            const categoryDistribution = this.getCategoryDistribution(risks);
            const riskMaturity = this.calculateMaturityLevel(risks);
            const recommendations = this.generateRecommendations(risks);
            
            return {
                totalRisks,
                averageScore,
                categoryDistribution,
                riskMaturity,
                recommendations,
                riskLevels: this.getRiskLevelDistribution(risks),
                statusDistribution: this.getStatusDistribution(risks),
                timelineDistribution: this.getTimelineDistribution(risks)
            };
        } catch (error) {
            console.error('Error generating maturity report:', error);
            return null;
        }
    }
    
    /**
     * Получить средний риск-score
     */
    static getAverageRiskScore(risks) {
        try {
            const totalScore = risks.reduce((sum, risk) => {
                return sum + parseFloat(this.calculateRiskScore(risk));
            }, 0);
            
            return (totalScore / risks.length).toFixed(2);
        } catch (error) {
            console.error('Error calculating average risk score:', error);
            return 0;
        }
    }
    
    /**
     * Получить распределение по категориям
     */
    static getCategoryDistribution(risks) {
        try {
            return risks.reduce((acc, risk) => {
                acc[risk.category] = (acc[risk.category] || 0) + 1;
                return acc;
            }, {});
        } catch (error) {
            console.error('Error calculating category distribution:', error);
            return {};
        }
    }
    
    /**
     * Получить распределение по уровням риска
     */
    static getRiskLevelDistribution(risks) {
        try {
            return risks.reduce((acc, risk) => {
                acc[risk.level] = (acc[risk.level] || 0) + 1;
                return acc;
            }, {});
        } catch (error) {
            console.error('Error calculating risk level distribution:', error);
            return {};
        }
    }
    
    /**
     * Получить распределение по статусам
     */
    static getStatusDistribution(risks) {
        try {
            return risks.reduce((acc, risk) => {
                acc[risk.status] = (acc[risk.status] || 0) + 1;
                return acc;
            }, {});
        } catch (error) {
            console.error('Error calculating status distribution:', error);
            return {};
        }
    }
    
    /**
     * Получить распределение по временным рамкам
     */
    static getTimelineDistribution(risks) {
        try {
            return risks.reduce((acc, risk) => {
                acc[risk.timeline] = (acc[risk.timeline] || 0) + 1;
                return acc;
            }, {});
        } catch (error) {
            console.error('Error calculating timeline distribution:', error);
            return {};
        }
    }
    
    /**
     * Рассчитать уровень зрелости управления рисками
     */
    static calculateMaturityLevel(risks) {
        try {
            const totalRisks = risks.length;
            if (totalRisks === 0) return 'N/A';
            
            // Критерии для определения уровня зрелости
            const criticalRisks = risks.filter(r => r.level === 'critical').length;
            const treatedRisks = risks.filter(r => r.status === 'treated').length;
            const monitoredRisks = risks.filter(r => r.status === 'monitored').length;
            const closedRisks = risks.filter(r => r.status === 'closed').length;
            
            const riskTreatmentRate = ((treatedRisks + monitoredRisks + closedRisks) / totalRisks) * 100;
            const criticalRiskPercentage = (criticalRisks / totalRisks) * 100;
            
            if (riskTreatmentRate >= 80 && criticalRiskPercentage <= 10) {
                return 'ADVANCED'; // Продвинутый
            } else if (riskTreatmentRate >= 60 && criticalRiskPercentage <= 20) {
                return 'INTERMEDIATE'; // Средний
            } else if (riskTreatmentRate >= 40 && criticalRiskPercentage <= 30) {
                return 'BASIC'; // Базовый
            } else {
                return 'INITIAL'; // Начальный
            }
        } catch (error) {
            console.error('Error calculating maturity level:', error);
            return 'UNKNOWN';
        }
    }
    
    /**
     * Сгенерировать рекомендации
     */
    static generateRecommendations(risks) {
        try {
            const recommendations = [];
            const totalRisks = risks.length;
            
            if (totalRisks === 0) {
                recommendations.push('Начните с добавления первых рисков в систему');
                return recommendations;
            }
            
            const criticalRisks = risks.filter(r => r.level === 'critical');
            const untreatedRisks = risks.filter(r => r.status === 'identified');
            const highProbabilityRisks = risks.filter(r => r.probability >= 4);
            
            // Рекомендации по критическим рискам
            if (criticalRisks.length > 0) {
                recommendations.push(`Приоритетно обработайте ${criticalRisks.length} критических рисков`);
            }
            
            // Рекомендации по необработанным рискам
            if (untreatedRisks.length > 0) {
                recommendations.push(`Оцените и обработайте ${untreatedRisks.length} необработанных рисков`);
            }
            
            // Рекомендации по высоковероятным рискам
            if (highProbabilityRisks.length > 0) {
                recommendations.push(`Разработайте планы по снижению ${highProbabilityRisks.length} высоковероятных рисков`);
            }
            
            // Рекомендации по категориям
            const categoryDistribution = this.getCategoryDistribution(risks);
            const dominantCategory = Object.entries(categoryDistribution)
                .sort(([,a], [,b]) => b - a)[0];
            
            if (dominantCategory) {
                recommendations.push(`Обратите внимание на категорию "${dominantCategory[0]}" - ${dominantCategory[1]} рисков`);
            }
            
            // Общие рекомендации
            if (totalRisks < 10) {
                recommendations.push('Расширьте базу рисков для более полного анализа');
            }
            
            if (recommendations.length === 0) {
                recommendations.push('Система управления рисками работает эффективно');
            }
            
            return recommendations;
        } catch (error) {
            console.error('Error generating recommendations:', error);
            return ['Ошибка при генерации рекомендаций'];
        }
    }
    
    /**
     * Рассчитать корреляции между рисками
     */
    static calculateRiskCorrelations(risks) {
        try {
            const correlations = [];
            
            for (let i = 0; i < risks.length; i++) {
                for (let j = i + 1; j < risks.length; j++) {
                    const risk1 = risks[i];
                    const risk2 = risks[j];
                    
                    // Простая корреляция на основе категории и уровня
                    let correlation = 0;
                    
                    if (risk1.category === risk2.category) correlation += 0.3;
                    if (risk1.level === risk2.level) correlation += 0.3;
                    if (risk1.timeline === risk2.timeline) correlation += 0.2;
                    if (risk1.owner === risk2.owner) correlation += 0.2;
                    
                    if (correlation > 0.5) {
                        correlations.push({
                            risk1: risk1.id,
                            risk2: risk2.id,
                            correlation: correlation.toFixed(2),
                            reason: this.getCorrelationReason(risk1, risk2)
                        });
                    }
                }
            }
            
            return correlations.sort((a, b) => b.correlation - a.correlation);
        } catch (error) {
            console.error('Error calculating risk correlations:', error);
            return [];
        }
    }
    
    /**
     * Получить причину корреляции
     */
    static getCorrelationReason(risk1, risk2) {
        const reasons = [];
        
        if (risk1.category === risk2.category) {
            reasons.push('Одинаковая категория');
        }
        if (risk1.level === risk2.level) {
            reasons.push('Одинаковый уровень');
        }
        if (risk1.timeline === risk2.timeline) {
            reasons.push('Одинаковые временные рамки');
        }
        if (risk1.owner === risk2.owner) {
            reasons.push('Одинаковый владелец');
        }
        
        return reasons.join(', ');
    }
    
    /**
     * Рассчитать финансовое влияние рисков
     */
    static calculateFinancialImpact(risks) {
        try {
            const totalCost = risks.reduce((sum, risk) => sum + (risk.cost || 0), 0);
            const averageCost = totalCost / risks.length || 0;
            
            const costByLevel = risks.reduce((acc, risk) => {
                acc[risk.level] = (acc[risk.level] || 0) + (risk.cost || 0);
                return acc;
            }, {});
            
            const costByCategory = risks.reduce((acc, risk) => {
                acc[risk.category] = (acc[risk.category] || 0) + (risk.cost || 0);
                return acc;
            }, {});
            
            return {
                totalCost: totalCost.toFixed(2),
                averageCost: averageCost.toFixed(2),
                costByLevel,
                costByCategory,
                highestCostRisk: risks.reduce((max, risk) => 
                    (risk.cost || 0) > (max.cost || 0) ? risk : max
                , risks[0])
            };
        } catch (error) {
            console.error('Error calculating financial impact:', error);
            return null;
        }
    }
}
