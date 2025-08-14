import { riskLevels } from '../core/constants.js';

// 💫 МОДАЛЬНОЕ ОКНО
export function showRiskDetailsFromData(risk) {
    document.getElementById('modalTitle').textContent = risk.title;
    document.getElementById('modalBody').innerHTML = `
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">ID риска</span>
                <span class="info-value">${risk.id}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Категория</span>
                <span class="info-value"><i class="${risk.icon}"></i> ${risk.categoryName}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Уровень риска</span>
                <span class="info-value">${riskLevels[risk.level].name}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Вероятность</span>
                <span class="info-value">${risk.probability}</span>
            </div>
        </div>
        
        <div style="margin-top: 1.5rem;">
            <div class="info-label">Последствия</div>
            <p style="margin-bottom: 1rem; color: var(--dark-3);">${risk.consequences}</p>
            
            <div class="info-label">Меры митигации</div>
            <p style="color: var(--dark-3);">${risk.mitigation}</p>
        </div>
    `;

    document.getElementById('riskModal').classList.add('show');
}

export function showRisksInCell(probability, impact, risks) {
    if (risks.length === 0) {
        // Импортируем функцию уведомлений
        import('../ui/notifications.js').then(({ showNotification }) => {
            showNotification('В данной ячейке нет рисков', 'info');
        });
        return;
    }
    
                        if (risks.length === 1) {
        window.showRiskDetailsFromData(risks[0]);
        return;
    }
    
    // Показываем список рисков в ячейке
    document.getElementById('modalTitle').textContent = `Риски в ячейке ${probability}-${impact}`;
    
    let risksList = '';
    risks.forEach(risk => {
        risksList += `
            <div class="risk-item ${risk.level}" onclick="window.showRiskDetailsFromData(${JSON.stringify(risk).replace(/"/g, '&quot;')})">
                <div class="risk-item-header">
                    <h4>${risk.title}</h4>
                    <span class="risk-level-badge ${risk.level}">${riskLevels[risk.level].name}</span>
                </div>
                <p>${risk.consequences.substring(0, 100)}...</p>
                <small>Категория: ${risk.categoryName}</small>
            </div>
        `;
    });
    
    document.getElementById('modalBody').innerHTML = `
        <div class="risks-in-cell">
            <p>Найдено рисков: <strong>${risks.length}</strong></p>
            <div class="risks-list">
                ${risksList}
            </div>
        </div>
    `;

    document.getElementById('riskModal').classList.add('show');
}

export function closeModal() {
    document.getElementById('riskModal').classList.remove('show');
}
