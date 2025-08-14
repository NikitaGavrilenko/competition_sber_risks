import { risksData } from '../core/data.js';
import { categories, riskLevels } from '../core/constants.js';
import { showNotification } from '../ui/notifications.js';
import { getProbabilityValue, getImpactValue } from '../core/utils.js';

// Глобальная переменная для отфильтрованных данных
let filteredRisks = [...risksData];
console.log('riskFilters.js: risksData загружен:', risksData.length, 'рисков');
console.log('riskFilters.js: filteredRisks инициализированы:', filteredRisks.length, 'рисков');


// 🔍 ПОИСК И ФИЛЬТРАЦИЯ
export function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    applyFilters();
}

export function globalSearch() {
    const searchTerm = document.getElementById('globalSearch').value.toLowerCase();
    applyFilters();
}

export function filterByCategory() {
    applyFilters();
}

export function filterByLevel() {
    applyFilters();
}

// 🔄 ПРИМЕНЕНИЕ ВСЕХ ФИЛЬТРОВ
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const globalSearchTerm = document.getElementById('globalSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const levelFilter = document.getElementById('levelFilter').value;
    
    // Применяем фильтры
    filteredRisks = risksData.filter(risk => {
        // Поиск по названию, описанию и мерам митигации
        const matchesSearch = !searchTerm || 
            risk.title.toLowerCase().includes(searchTerm) ||
            risk.consequences.toLowerCase().includes(searchTerm) ||
            risk.mitigation.toLowerCase().includes(searchTerm);
        
        // Глобальный поиск
        const matchesGlobalSearch = !globalSearchTerm ||
            risk.title.toLowerCase().includes(globalSearchTerm) ||
            risk.consequences.toLowerCase().includes(globalSearchTerm) ||
            risk.mitigation.toLowerCase().includes(globalSearchTerm);
        
        // Фильтр по категории
        const matchesCategory = !categoryFilter || risk.category === categoryFilter;
        
        // Фильтр по уровню риска
        const matchesLevel = !levelFilter || risk.level === levelFilter;
        
        return matchesSearch && matchesGlobalSearch && matchesCategory && matchesLevel;
    });
    
    // Показываем уведомление
    const totalRisks = risksData.length;
    const filteredCount = filteredRisks.length;
    
    if (filteredCount === totalRisks) {
        showNotification(`Показаны все ${totalRisks} рисков`, 'info');
    } else {
        showNotification(`Найдено ${filteredCount} из ${totalRisks} рисков`, 'success');
    }
    
    // Обновляем отображение
    updateCurrentView();
    updateStatistics();
}

// 🔄 СБРОС ФИЛЬТРОВ
export function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('globalSearch').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('levelFilter').value = '';
    
    filteredRisks = [...risksData];
    updateCurrentView();
    updateStatistics();
    showNotification('Все фильтры сброшены', 'info');
}

// 🔄 ОБНОВЛЕНИЕ ТЕКУЩЕГО ВИДА
function updateCurrentView() {
    const currentView = document.querySelector('.view-btn.active').getAttribute('data-view');
    
    switch(currentView) {
        case 'matrix':
            window.loadMatrixView();
            break;
        case 'cards':
            window.loadCardsView();
            break;
        case 'list':
            window.loadListView();
            break;
    }
}

// 📊 ОБНОВЛЕНИЕ СТАТИСТИКИ
export function updateStatistics() {
    console.log('updateStatistics вызвана, filteredRisks:', filteredRisks.length);
    const totalRisks = filteredRisks.length;
    const criticalCount = filteredRisks.filter(r => r.level === 'critical').length;
    const highCount = filteredRisks.filter(r => r.level === 'high').length;
    const mediumCount = filteredRisks.filter(r => r.level === 'medium').length;
    const lowCount = filteredRisks.filter(r => r.level === 'low').length;
    
    // Обновляем статистику в сайдбаре
    const totalElement = document.getElementById('totalRisks');
    const criticalElement = document.getElementById('criticalCount');
    const highElement = document.getElementById('highCount');
    const mediumElement = document.getElementById('mediumCount');
    const lowElement = document.getElementById('lowCount');
    
    if (totalElement) totalElement.textContent = totalRisks;
    if (criticalElement) criticalElement.textContent = criticalCount;
    if (highElement) highElement.textContent = highCount;
    if (mediumElement) mediumElement.textContent = mediumCount;
    if (lowElement) lowElement.textContent = lowCount;
    
    // Обновляем заголовок
    const headerRiskElement = document.getElementById('headerRiskCount');
    const headerCategoryElement = document.getElementById('headerCategoryCount');
    
    if (headerRiskElement) headerRiskElement.textContent = `${totalRisks} рисков`;
    if (headerCategoryElement) headerCategoryElement.textContent = `${Object.keys(categories).length} категорий`;
}

// 🔍 ПОЛУЧЕНИЕ ОТФИЛЬТРОВАННЫХ РИСКОВ
export function getFilteredRisks() {
    return filteredRisks;
}

// 🔍 ПОЛУЧЕНИЕ РИСКОВ В ЯЧЕЙКЕ МАТРИЦЫ
export function getRisksInCell(probability, impact) {
    return filteredRisks.filter(risk => {
        const riskProb = getProbabilityValue(risk.probability);
        const riskImpact = getImpactValue(risk.level);
        return riskProb === probability && riskImpact === impact;
    });
}


