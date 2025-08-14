import { getFilteredRisks } from '../filters/riskFilters.js';
import { riskLevels } from '../core/constants.js';
import { showRiskDetailsFromData } from '../ui/modal.js';

// 🃏 ЗАГРУЗКА ВИДА КАРТОЧЕК
export function loadCardsView() {
    const cardsGrid = document.getElementById('cardsGrid');
    cardsGrid.innerHTML = '';
    
    const filteredRisks = getFilteredRisks();
    
    filteredRisks.forEach(risk => {
        const card = document.createElement('div');
        card.className = `risk-card ${risk.level}`;
        card.onclick = () => window.showRiskDetailsFromData(risk);
        
        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${risk.title}</h3>
                <span class="risk-level-badge ${risk.level}">
                    ${riskLevels[risk.level].name}
                </span>
            </div>
            
            <div class="card-category">
                <i class="${risk.icon}"></i>
                <span>${risk.categoryName}</span>
            </div>
            
            <p class="card-description">${risk.consequences.substring(0, 120)}...</p>
            
            <div class="card-metrics">
                <div class="metric">
                    <div class="metric-label">Вероятность</div>
                    <div class="metric-value">${risk.probability}</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Уровень</div>
                    <div class="metric-value">${riskLevels[risk.level].name}</div>
                </div>
            </div>
        `;
        
        cardsGrid.appendChild(card);
    });
}
