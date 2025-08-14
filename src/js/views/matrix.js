import { getFilteredRisks, getRisksInCell } from '../filters/riskFilters.js';
import { getRiskLevel, getProbabilityLabel, getImpactLabel, getRiskCountText, getRiskLevelName } from '../core/utils.js';
import { showRisksInCell } from '../ui/modal.js';

// 📊 ЗАГРУЗКА МАТРИЦЫ РИСКОВ
export function loadMatrixView() {
    console.log('loadMatrixView вызвана');
    const matrixGrid = document.getElementById('matrixGrid');
    if (!matrixGrid) {
        console.error('Элемент matrixGrid не найден');
        return;
    }
    matrixGrid.innerHTML = '';
    
    // Создаем заголовки матрицы
    const headerRow = document.createElement('div');
    headerRow.className = 'matrix-row header-row';
    
    // Пустая ячейка для левого верхнего угла
    const emptyCell = document.createElement('div');
    emptyCell.className = 'matrix-label empty';
    headerRow.appendChild(emptyCell);
    
    // Заголовки столбцов (воздействие)
    for (let i = 1; i <= 5; i++) {
        const headerCell = document.createElement('div');
        headerCell.className = 'matrix-label';
        headerCell.innerHTML = `
            <div style="font-size: 1.2rem; font-weight: 700;">${i}</div>
            <small>${getImpactLabel(i)}</small>
        `;
        headerRow.appendChild(headerCell);
    }
    matrixGrid.appendChild(headerRow);
    
    // Создаем строки матрицы (вероятность)
    for (let prob = 5; prob >= 1; prob--) {
        const row = document.createElement('div');
        row.className = 'matrix-row';
        
        // Заголовок строки (вероятность)
        const rowHeader = document.createElement('div');
        rowHeader.className = 'matrix-label';
        rowHeader.innerHTML = `
            <div style="font-size: 1.2rem; font-weight: 700;">${prob}</div>
            <small>${getProbabilityLabel(prob)}</small>
        `;
        row.appendChild(rowHeader);
        
        // Ячейки матрицы
        for (let impact = 1; impact <= 5; impact++) {
            const cell = document.createElement('div');
            const cellKey = `${prob}-${impact}`;
            const risksInCell = getRisksInCell(prob, impact);
            const riskLevel = getRiskLevel(prob, impact);
            

            
            // Определяем классы для ячейки
            let cellClasses = `matrix-cell ${riskLevel}`;
            if (risksInCell.length === 0) {
                cellClasses += ' empty-cell';
            } else if (risksInCell.length > 1) {
                cellClasses += ' multiple-risks';
            }
            
            cell.className = cellClasses;
            cell.onclick = () => window.showRisksInCell(prob, impact, risksInCell);
            
            if (risksInCell.length > 0) {
                // Ячейка с рисками
                cell.innerHTML = `
                    <div class="risk-count">${risksInCell.length}</div>
                    <div class="risk-label">${getRiskCountText(risksInCell.length)}</div>
                `;
                cell.title = `${getRiskLevelName(riskLevel)} риск - ${risksInCell.length} ${getRiskCountText(risksInCell.length)}`;
                
                // Добавляем атрибут для счетчика в правом верхнем углу
                if (risksInCell.length > 1) {
                    cell.setAttribute('data-count', risksInCell.length);
                }
            } else {
                // Пустая ячейка
                cell.innerHTML = `
                    <div class="risk-count">0</div>
                    <div class="risk-label">рисков</div>
                `;
                cell.title = 'Нет рисков в данной ячейке';
            }
            
            row.appendChild(cell);
        }
        
        matrixGrid.appendChild(row);
    }
    
    // Добавляем легенду под матрицей
    const legendRow = document.createElement('div');
    legendRow.className = 'matrix-legend';
    legendRow.style.cssText = 'grid-column: 1 / -1; display: flex; justify-content: center; gap: 2rem; margin-top: 1rem; padding: 1rem; background: var(--light-2); border-radius: var(--border-radius); border: 1px solid var(--light-4);';
    
    const legendItems = [
        { class: 'critical', label: 'Критический риск' },
        { class: 'high', label: 'Высокий риск' },
        { class: 'medium', label: 'Средний риск' },
        { class: 'low', label: 'Низкий риск' }
    ];
    
    legendItems.forEach(item => {
        const legendItem = document.createElement('div');
        legendItem.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 500; color: var(--dark-2);';
        
        const colorBox = document.createElement('div');
        colorBox.style.cssText = `width: 16px; height: 16px; border-radius: 4px; background: var(--${item.class}-bg); border: 2px solid var(--${item.class});`;
        
        legendItem.appendChild(colorBox);
        legendItem.appendChild(document.createTextNode(item.label));
        legendRow.appendChild(legendItem);
    });
    
    matrixGrid.appendChild(legendRow);
}
