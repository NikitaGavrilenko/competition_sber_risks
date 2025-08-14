// 🏷️ ПОЛУЧЕНИЕ НАЗВАНИЯ УРОВНЯ РИСКА
export function getRiskLevelName(level) {
    const levelNames = {
        'critical': 'Критический',
        'high': 'Высокий',
        'medium': 'Средний',
        'low': 'Низкий'
    };
    return levelNames[level] || 'Неизвестно';
}

// 🔢 ПОЛУЧЕНИЕ ЧИСЛОВОГО ЗНАЧЕНИЯ ВЕРОЯТНОСТИ
export function getProbabilityValue(probability) {
    const probMap = {
        'Очень высокая': 5,
        'Высокая': 4,
        'Средняя': 3,
        'Низкая': 2,
        'Очень низкая': 1
    };
    return probMap[probability] || 3;
}

// 🔢 ПОЛУЧЕНИЕ ЧИСЛОВОГО ЗНАЧЕНИЯ ВОЗДЕЙСТВИЯ
export function getImpactValue(level) {
    const impactMap = {
        'critical': 5,
        'high': 4,
        'medium': 3,
        'low': 2
    };
    return impactMap[level] || 3;
}

// 🏷️ ПОЛУЧЕНИЕ ЛЕБЕЛОВ ВЕРОЯТНОСТИ
export function getProbabilityLabel(prob) {
    const labels = {
        5: 'Очень высокая',
        4: 'Высокая',
        3: 'Средняя',
        2: 'Низкая',
        1: 'Очень низкая'
    };
    return labels[prob] || '';
}

// 🏷️ ПОЛУЧЕНИЕ ЛЕБЕЛОВ ВОЗДЕЙСТВИЯ
export function getImpactLabel(impact) {
    const labels = {
        5: 'Критическое',
        4: 'Значительное',
        3: 'Умеренное',
        2: 'Малое',
        1: 'Минимальное'
    };
    return labels[impact] || '';
}

// 🔢 ПОЛУЧЕНИЕ ТЕКСТА КОЛИЧЕСТВА РИСКОВ
export function getRiskCountText(count) {
    if (count === 1) return 'риск';
    if (count >= 2 && count <= 4) return 'риска';
    return 'рисков';
}

// 📊 ПОЛУЧЕНИЕ УРОВНЯ РИСКА ДЛЯ ЯЧЕЙКИ
export function getRiskLevel(probability, impact) {
    const score = probability * impact;
    if (score >= 20) return 'critical';
    if (score >= 15) return 'high';
    if (score >= 10) return 'medium';
    return 'low';
}
