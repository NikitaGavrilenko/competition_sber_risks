import { getFilteredRisks } from '../filters/riskFilters.js';
import { riskLevels } from '../core/constants.js';
import { showRiskDetailsFromData } from '../ui/modal.js';

// 📋 ЗАГРУЗКА ВИДА СПИСКА
export function loadListView() {
    const tableBody = document.getElementById('riskTableBody');
    tableBody.innerHTML = '';
    
    const filteredRisks = getFilteredRisks();
    
    filteredRisks.forEach(risk => {
        const row = document.createElement('tr');
        row.onclick = () => window.showRiskDetailsFromData(risk);
        
        row.innerHTML = `
            <td>
                <strong>${risk.title}</strong>
                <br>
                <small style="color: var(--dark-4);">${risk.consequences.substring(0, 80)}...</small>
            </td>
            <td>
                <span class="table-category">
                    <i class="${risk.icon}"></i>
                    <span>${risk.categoryName}</span>
                </span>
            </td>
            <td>
                <span class="table-risk-level ${risk.level}">
                    ${riskLevels[risk.level].name}
                </span>
            </td>
            <td>${risk.probability}</td>
            <td>${riskLevels[risk.level].name}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn secondary" onclick="event.stopPropagation(); window.showRiskDetailsFromData(${JSON.stringify(risk).replace(/"/g, '&quot;')})">
                        <i class="fas fa-eye"></i>
                        Детали
                    </button>
                    <button class="action-btn secondary" onclick="event.stopPropagation(); window.editRisk('${risk.id}')">
                        <i class="fas fa-edit"></i>
                        Изменить
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// 📊 СОРТИРОВКА ТАБЛИЦЫ
export function sortTable(columnIndex) {
    const table = document.getElementById('riskTable');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // Определяем направление сортировки
    const isAsc = table.dataset.sortOrder !== 'asc';
    table.dataset.sortOrder = isAsc ? 'asc' : 'desc';
    
    // Сортируем строки
    rows.sort((a, b) => {
        const aText = a.cells[columnIndex].textContent.trim();
        const bText = b.cells[columnIndex].textContent.trim();
        
        if (isAsc) {
            return aText.localeCompare(bText, 'ru');
        } else {
            return bText.localeCompare(aText, 'ru');
        }
    });
    
    // Обновляем иконки сортировки
    document.querySelectorAll('.sort-icon').forEach(icon => {
        icon.className = 'fas fa-sort sort-icon';
    });
    
    const currentIcon = table.querySelectorAll('th')[columnIndex].querySelector('.sort-icon');
    currentIcon.className = `fas fa-sort-${isAsc ? 'up' : 'down'} sort-icon`;
    
    // Перестраиваем таблицу
    rows.forEach(row => tbody.appendChild(row));
    
    // Импортируем функцию уведомлений
    import('../ui/notifications.js').then(({ showNotification }) => {
        showNotification(`Таблица отсортирована ${isAsc ? '↑' : '↓'}`, 'success');
    });
}
