// Глобальные переменные
let currentView = 'matrix';
let currentCategory = 'all';
let currentFilters = ['critical', 'high', 'medium', 'low'];
let currentPage = 1;
let itemsPerPage = 12;
let filteredRisks = [];
let searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');

// Определение типа устройства
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Адаптивные настройки для мобильных устройств
const mobileSettings = {
    itemsPerPage: isMobile ? 8 : 12,
    matrixColumns: isMobile ? (window.innerWidth <= 480 ? 2 : 3) : 5,
    matrixRows: isMobile ? (window.innerWidth <= 480 ? 3 : 4) : 5,
    touchDelay: isTouchDevice ? 300 : 0,
    swipeThreshold: 50
};

// Основные функции
function getRiskZone(probability, consequences) {
    const probScore = getProbabilityScore(probability);
    const consScore = getConsequencesScore(consequences);
    const totalScore = probScore + consScore;
    
    if (totalScore >= 8) return 'critical';
    if (totalScore >= 6) return 'high';
    if (totalScore >= 4) return 'medium';
    return 'low';
}

function getProbabilityScore(probability) {
    switch(probability.toLowerCase()) {
        case 'очень высокая': return 5;
        case 'высокая': return 4;
        case 'средняя': return 3;
        case 'низкая': return 2;
        case 'очень низкая': return 1;
        default: 
            console.warn(`Неизвестная вероятность: ${probability}, используем среднее значение`);
            return 3;
    }
}

function getConsequencesScore(consequences) {
    const text = consequences.toLowerCase();
    
    // Критические последствия (5 баллов)
    if (text.includes('$') || text.includes('млн') || text.includes('тыс') || 
        text.includes('закрытие') || text.includes('эвакуация') || 
        text.includes('смерть') || text.includes('катастрофа')) {
        return 5;
    }
    
    // Значительные последствия (4 балла)
    if (text.includes('штраф') || text.includes('судебные') || 
        text.includes('банкротство') || text.includes('лицензия')) {
        return 4;
    }
    
    // Умеренные последствия (3 балла)
    if (text.includes('репутационный') || text.includes('потеря') || 
        text.includes('снижение') || text.includes('невозможность')) {
        return 3;
    }
    
    // Незначительные последствия (2 балла)
    if (text.includes('недовольство') || text.includes('отзывы') || 
        text.includes('задержка') || text.includes('проблемы')) {
        return 2;
    }
    
    // Минимальные последствия (1 балл)
    return 1;
}

// Создание матрицы рисков
function createRiskMatrix() {
    const matrixGrid = document.getElementById('matrixGrid');
    if (!matrixGrid) return;
    
    matrixGrid.innerHTML = '';
    
    const probabilityLevels = ['Очень низкая', 'Низкая', 'Средняя', 'Высокая', 'Очень высокая'];
    const consequenceLevels = ['Критические', 'Значительные', 'Умеренные', 'Незначительные', 'Минимальные'];
    
    // Определяем количество колонок в зависимости от размера экрана
    const screenWidth = window.innerWidth;
    let columns = mobileSettings.matrixColumns;
    let rows = mobileSettings.matrixRows;
    
    // Дополнительная адаптация для очень маленьких экранов
    if (screenWidth <= 360) {
        columns = 2;
        rows = 2;
    } else if (screenWidth <= 480) {
        columns = 2;
        rows = 3;
    } else if (screenWidth <= 768) {
        columns = 3;
        rows = 4;
    } else if (screenWidth <= 1200) {
        columns = 4;
        rows = 5;
    }
    
    // Создаем адаптивную матрицу
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const cell = document.createElement('div');
            const probLevel = probabilityLevels[Math.min(col, 4)];
            const consLevel = consequenceLevels[Math.min(row, 4)];
            
            cell.className = 'matrix-cell';
            
            // Адаптивный контент для маленьких экранов
            if (screenWidth <= 360) {
                cell.innerHTML = `
                    <div class="matrix-cell-header">
                        <div>В: ${probLevel.split(' ')[0]}</div>
                        <div>П: ${consLevel.split(' ')[0]}</div>
                    </div>
                    <div class="risk-count-display">0</div>
                    <div class="empty-cell-message">Нет</div>
                    <div class="risk-count-indicator"></div>
                `;
            } else if (screenWidth <= 480) {
                cell.innerHTML = `
                    <div class="matrix-cell-header">
                        <div>Вер: ${probLevel.split(' ')[0]}</div>
                        <div>Посл: ${consLevel.split(' ')[0]}</div>
                    </div>
                    <div class="risk-count-display">0</div>
                    <div class="empty-cell-message">Нет</div>
                    <div class="risk-count-indicator"></div>
                `;
            } else if (screenWidth <= 768) {
                cell.innerHTML = `
                    <div class="matrix-cell-header">
                        <div>Вероят: ${probLevel.split(' ')[0]}</div>
                        <div>Послед: ${consLevel.split(' ')[0]}</div>
                    </div>
                    <div class="risk-count-display">0</div>
                    <div class="empty-cell-message">Нет рисков</div>
                    <div class="risk-count-indicator"></div>
                `;
            } else {
                cell.innerHTML = `
                    <div class="matrix-cell-header">
                        <div>Вероятность: ${probLevel}</div>
                        <div>Последствия: ${consLevel}</div>
                    </div>
                    <div class="risk-count-display">0</div>
                    <div class="empty-cell-message">Нет рисков</div>
                    <div class="risk-count-indicator"></div>
                `;
            }
            
            // Добавляем доступность
            cell.setAttribute('aria-label', `Ячейка: ${probLevel} вероятность, ${consLevel} последствия`);
            cell.setAttribute('tabindex', '0');
            cell.setAttribute('role', 'button');
            
            // Добавляем анимацию появления
            cell.style.opacity = '0';
            cell.style.transform = 'scale(0.8)';
            
            matrixGrid.appendChild(cell);
            
            // Анимация появления с задержкой
            setTimeout(() => {
                cell.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                cell.style.opacity = '1';
                cell.style.transform = 'scale(1)';
            }, (row * columns + col) * 100);
        }
    }
    
    // Обновляем CSS Grid для адаптивности
    matrixGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    
    populateMatrixWithRisks();
}

// Заполнение матрицы рисками
function populateMatrixWithRisks() {
    const cells = document.querySelectorAll('.matrix-cell');
    const screenWidth = window.innerWidth;
    
    // Определяем размеры матрицы в зависимости от экрана
    let matrixSize = 25; // 5x5 по умолчанию
    let columns = 5;
    
    if (screenWidth <= 480) {
        matrixSize = 6; // 2x3
        columns = 2;
    } else if (screenWidth <= 768) {
        matrixSize = 12; // 3x4
        columns = 3;
    } else if (screenWidth <= 1200) {
        matrixSize = 20; // 4x5
        columns = 4;
    }
    
    const riskCounts = Array(matrixSize).fill(0);
    const cellRisks = Array(matrixSize).fill().map(() => []);
    
    // Отладочная информация для критических рисков
    console.log('=== ОТЛАДКА КРИТИЧЕСКИХ РИСКОВ ===');
    
    // Используем отфильтрованные риски
    console.log(`Всего рисков для отображения: ${filteredRisks.length}`);
    
    filteredRisks.forEach((risk, index) => {
        const probScore = getProbabilityScore(risk.probability);
        const consScore = getConsequencesScore(risk.consequences);
        
        // Адаптивное вычисление индекса ячейки
        let cellIndex;
        if (screenWidth <= 480) {
            // Для 2x3 матрицы: упрощенное распределение
            const row = Math.min(Math.floor((5 - consScore) / 2), 2);
            const col = Math.min(Math.floor((probScore - 1) / 2.5), 1);
            cellIndex = row * 2 + col;
        } else if (screenWidth <= 768) {
            // Для 3x4 матрицы
            const row = Math.min(Math.floor((5 - consScore) / 1.25), 3);
            const col = Math.min(Math.floor((probScore - 1) / 1.25), 2);
            cellIndex = row * 3 + col;
        } else if (screenWidth <= 1200) {
            // Для 4x5 матрицы
            const row = Math.min(Math.floor((5 - consScore) / 1), 4);
            const col = Math.min(Math.floor((probScore - 1) / 1), 3);
            cellIndex = row * 4 + col;
        } else {
            // Для 5x5 матрицы
            cellIndex = (5 - consScore) * 5 + (probScore - 1);
        }
        
        if (cellIndex >= 0 && cellIndex < matrixSize) {
            riskCounts[cellIndex]++;
            cellRisks[cellIndex].push(risk);
            
            // Отладочная информация для критических рисков
            if (risk.level === 'critical') {
                console.log(`Критический риск "${risk.title}":`);
                console.log(`  - Вероятность: ${risk.probability} (оценка: ${probScore})`);
                console.log(`  - Последствия: ${risk.consequences.substring(0, 100)}... (оценка: ${consScore})`);
                console.log(`  - Индекс ячейки: ${cellIndex} (строка: ${Math.floor(cellIndex / columns)}, колонка: ${cellIndex % columns})`);
            }
        }
    });
    
    console.log('=== РАСПРЕДЕЛЕНИЕ РИСКОВ ПО ЯЧЕЙКАМ ===');
    cellRisks.forEach((risks, index) => {
        if (risks.length > 0) {
            const criticalRisks = risks.filter(r => r.level === 'critical');
            if (criticalRisks.length > 0) {
                console.log(`Ячейка ${index}: ${risks.length} рисков, из них критических: ${criticalRisks.length}`);
                criticalRisks.forEach(r => console.log(`  - ${r.title}`));
            }
        }
    });
    
    // Обновляем ячейки с анимацией
    cells.forEach((cell, index) => {
        const count = riskCounts[index];
        const risks = cellRisks[index];
        
        if (count > 0) {
            // Определяем зону на основе рисков в ячейке
            const zone = getZoneFromRisks(risks);
            
            // Определяем цвет ячейки на основе позиции в матрице
            const row = Math.floor(index / 5);
            const col = index % 5;
            const cellColor = getCellColorByPosition(row, col);
            
            // Обновляем классы ячейки (зона риска + цвет позиции)
            cell.className = `matrix-cell ${zone} ${cellColor}`;
            
            // Обновляем счетчик с анимацией
            const countDisplay = cell.querySelector('.risk-count-display');
            const emptyMessage = cell.querySelector('.empty-cell-message');
            
            // Анимация появления числа
            countDisplay.style.opacity = '0';
            countDisplay.style.transform = 'scale(0.5)';
            countDisplay.textContent = count;
            countDisplay.style.display = 'block';
            emptyMessage.style.display = 'none';
            
            // Анимация появления
            setTimeout(() => {
                countDisplay.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                countDisplay.style.opacity = '1';
                countDisplay.style.transform = 'scale(1)';
            }, 100);
            
            // Добавляем индикатор риска
            const indicator = cell.querySelector('.risk-count-indicator');
            if (indicator) {
                indicator.style.display = 'block';
                indicator.className = `risk-count-indicator ${zone}`;
                
                // Анимация появления индикатора
                indicator.style.opacity = '0';
                indicator.style.transform = 'scale(0)';
                setTimeout(() => {
                    indicator.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                    indicator.style.opacity = '1';
                    indicator.style.transform = 'scale(1)';
                }, 200);
            }
            
            // Добавляем обработчики клика и клавиатуры
            cell.onclick = () => showCellRisks(cell, risks);
            cell.onkeydown = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    showCellRisks(cell, risks);
                }
            };
            
            // Добавляем эффект свечения для ячеек с рисками
            if (zone === 'critical') {
                cell.style.animation = 'glow 2s ease-in-out infinite alternate';
            }
        } else {
            // Пустые ячейки
            const countDisplay = cell.querySelector('.risk-count-display');
            const emptyMessage = cell.querySelector('.empty-cell-message');
            
            countDisplay.style.display = 'none';
            emptyMessage.style.display = 'block';
            
            // Определяем цвет пустой ячейки на основе позиции
            const row = Math.floor(index / 5);
            const col = index % 5;
            const cellColor = getCellColorByPosition(row, col);
            
            // Обновляем классы ячейки (только цвет позиции)
            cell.className = `matrix-cell ${cellColor}`;
            
            // Скрываем индикатор риска
            const indicator = cell.querySelector('.risk-count-indicator');
            if (indicator) {
                indicator.style.display = 'none';
            }
            
            // Убираем обработчик клика
            cell.onclick = null;
        }
    });
}

// Определение зоны риска на основе рисков в ячейке
function getZoneFromRisks(risks) {
    if (!risks || risks.length === 0) return 'low';
    
    // Определяем зону на основе максимального уровня риска в ячейке
    const maxRiskLevel = risks.reduce((max, risk) => {
        const levels = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
        return levels[risk.level] > levels[max] ? risk.level : max;
    }, 'low');
    
    return maxRiskLevel;
}

// Определение цвета ячейки на основе позиции в матрице
function getCellColorByPosition(row, col) {
    // Критическая зона (красная) - верхний правый угол
    if (col >= 3 && row <= 1) return 'critical';
    
    // Высокая зона (оранжевая) - диагональ выше середины
    if (col >= 2 && row <= 2) return 'high';
    
    // Средняя зона (желтая) - средняя диагональ
    if (col >= 1 && row <= 3) return 'medium';
    
    // Низкая зона (зеленая) - нижний левый угол
    return 'low';
}

// Показать риски в ячейке
function showCellRisks(cell, risks) {
    const modal = document.getElementById('riskModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (!modal || !modalTitle || !modalBody) return;
    
    const cellHeader = cell.querySelector('.matrix-cell-header').textContent;
    const isMobile = window.innerWidth <= 768;
    
    // Адаптивный заголовок для мобильных устройств
    if (isMobile) {
        modalTitle.textContent = `Риски`;
    } else {
        modalTitle.textContent = `Риски: ${cellHeader}`;
    }
    
    let risksHtml = '<div class="cell-risks-list">';
    risks.forEach((risk, index) => {
        // Адаптивный контент для мобильных устройств
        const title = isMobile && risk.title.length > 50 ? 
            risk.title.substring(0, 50) + '...' : risk.title;
        
        const consequences = isMobile && risk.consequences.length > 80 ? 
            risk.consequences.substring(0, 80) + '...' : risk.consequences;
        
        const mitigation = isMobile && risk.mitigation.length > 80 ? 
            risk.mitigation.substring(0, 80) + '...' : risk.mitigation;
        
        // Добавляем дополнительный класс для последнего элемента
        const isLast = index === risks.length - 1;
        const itemClass = isLast ? 'cell-risk-item last-item' : 'cell-risk-item';
        
        risksHtml += `
            <div class="${itemClass}" onclick="showRiskDetailsFromCell(${risk.id})" style="cursor: pointer;">
                <div class="cell-risk-header">
                    <h3>${title}</h3>
                    <span class="risk-level ${risk.level}">${riskLevels[risk.level].name}</span>
                </div>
                <div class="cell-risk-consequences">
                    <strong>Последствия:</strong> ${consequences}
                </div>
                <div class="cell-risk-consequences">
                    <strong>Меры митигации:</strong> ${mitigation}
                </div>
                <div class="cell-risk-hint">
                    <i class="fas fa-info-circle"></i> ${isMobile ? 'Нажмите для подробностей' : 'Кликните для подробной информации'}
                </div>
            </div>
        `;
    });
    
    // Добавляем дополнительный отступ внизу списка
    risksHtml += '<div class="list-bottom-spacer"></div>';
    risksHtml += '</div>';
    
    modalBody.innerHTML = risksHtml;
    showModal();
}

// Показать детали риска из ячейки матрицы (заменяет содержимое модального окна)
function showRiskDetailsFromCell(riskId) {
    const risk = risksData.find(r => r.id === riskId);
    if (!risk) return;
    
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const isMobile = window.innerWidth <= 768;
    
    // Адаптивный заголовок для мобильных устройств
    if (isMobile && risk.title.length > 40) {
        modalTitle.textContent = risk.title.substring(0, 40) + '...';
    } else {
        modalTitle.textContent = risk.title;
    }
    
    // Адаптивный контент для мобильных устройств
    const title = isMobile && risk.title.length > 60 ? 
        risk.title.substring(0, 60) + '...' : risk.title;
    
    const consequences = isMobile && risk.consequences.length > 120 ? 
        risk.consequences.substring(0, 120) + '...' : risk.consequences;
    
    const mitigation = isMobile && risk.mitigation.length > 120 ? 
        risk.mitigation.substring(0, 120) + '...' : risk.mitigation;
    
    // Создаем красивый заголовок с уровнем риска
    const riskLevelBadge = `
        <div class="risk-detail-header">
            <div class="risk-detail-title">
                <h2>${title}</h2>
                <span class="risk-level-badge ${risk.level}">${riskLevels[risk.level].name}</span>
            </div>
            <div class="risk-detail-meta">
                <span class="risk-category-badge">
                    <i class="fas fa-tag"></i>
                    ${isMobile && risk.categoryName.length > 20 ? 
                        risk.categoryName.substring(0, 20) + '...' : risk.categoryName}
                </span>
                <span class="risk-probability-badge">
                    <i class="fas fa-chart-line"></i>
                    ${isMobile && risk.probability.length > 15 ? 
                        risk.probability.substring(0, 15) + '...' : risk.probability}
                </span>
            </div>
        </div>
    `;
    
    modalBody.innerHTML = `
        ${riskLevelBadge}
        
        <div class="risk-detail-content">
            <div class="risk-detail-section">
                <h3><i class="fas fa-exclamation-triangle"></i> ${isMobile ? 'Последствия' : 'Последствия'}</h3>
                <div class="risk-detail-text">
                    <p>${consequences}</p>
                </div>
            </div>
            
            <div class="risk-detail-section">
                <h3><i class="fas fa-shield-alt"></i> ${isMobile ? 'Меры защиты' : 'Меры митигации'}</h3>
                <div class="risk-detail-text">
                    <p>${mitigation}</p>
                </div>
            </div>
            
            <div class="risk-detail-section">
                <h3><i class="fas fa-info-circle"></i> ${isMobile ? 'Информация' : 'Дополнительная информация'}</h3>
                <div class="risk-detail-info">
                    <div class="info-item">
                        <span class="info-label">ID:</span>
                        <span class="info-value">#${risk.id}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Категория:</span>
                        <span class="info-value">${risk.categoryName}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Уровень:</span>
                        <span class="info-value">${riskLevels[risk.level].name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Вероятность:</span>
                        <span class="info-value">${risk.probability}</span>
                    </div>
                </div>
            </div>
            
            <div class="risk-detail-actions">
                <button class="btn-secondary" onclick="showCellRisksFromDetails()">
                    <i class="fas fa-arrow-left"></i> ${isMobile ? 'Назад к списку' : 'Вернуться к списку рисков'}
                </button>
            </div>
        </div>
    `;
    
    showModal();
}

// Функция для возврата к списку рисков в ячейке
function showCellRisksFromDetails() {
    closeModal();
    // Показываем матрицу с выделенной ячейкой
    createRiskMatrix();
}

// Переключение видов отображения
function switchView() {
    const currentViewAttr = document.body.getAttribute('data-view') || 'matrix';
    const newView = currentViewAttr === 'matrix' ? 'list' : 'matrix';
    
    document.body.setAttribute('data-view', newView);
    
    if (newView === 'matrix') {
        createRiskMatrix();
    } else {
        displayRisksAsList();
    }
}

// Фильтрация по категории
function filterByCategory(category) {
    currentCategory = category;
    currentPage = 1;
    
    document.querySelectorAll('.category-list li').forEach(li => {
        li.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // Обновляем интерфейс в зависимости от текущего вида
    const currentViewAttr = document.body.getAttribute('data-view') || 'matrix';
    if (currentViewAttr === 'matrix') {
        updateStats();
        createRiskMatrix();
    } else {
        displayRisksAsList();
    }
}

// Обработка фильтра по уровню риска
function handleRiskLevelFilter() {
    const selectedLevels = Array.from(document.querySelectorAll('.risk-filter input:checked'))
        .map(input => input.value);
    
    if (selectedLevels.length === 0) {
        // Если ничего не выбрано, показываем все риски
        filteredRisks = [...risks];
    } else {
        filteredRisks = risks.filter(risk => selectedLevels.includes(risk.level));
    }
    
    // Сбрасываем страницу на первую
    currentPage = 1;
    
    // Обновляем отображение
    const currentViewAttr = document.body.getAttribute('data-view') || 'matrix';
    if (currentViewAttr === 'matrix') {
        createRiskMatrix();
    } else {
        displayRisksAsList();
    }
}

// Применение фильтров
function applyFilters() {
    const selectedLevels = Array.from(document.querySelectorAll('.filter-select'))
        .map(select => select.value)
        .filter(value => value !== 'all');
    
    if (selectedLevels.length === 0) {
        // Если ничего не выбрано, показываем все риски
        filteredRisks = [...risks];
    } else {
        filteredRisks = risks.filter(risk => selectedLevels.includes(risk.level));
    }
    
    // Сбрасываем страницу на первую
    currentPage = 1;
    
    // Обновляем отображение
    const currentViewAttr = document.body.getAttribute('data-view') || 'matrix';
    if (currentViewAttr === 'matrix') {
        createRiskMatrix();
    } else {
        displayRisksAsList();
    }
}

// Рендеринг рисков
function renderRisks() {
    const risksGrid = document.getElementById('risksGrid');
    if (!risksGrid) return;
    
    // Адаптивное количество элементов на странице для мобильных устройств
    const adaptiveItemsPerPage = isMobile ? mobileSettings.itemsPerPage : itemsPerPage;
    
    const startIndex = (currentPage - 1) * adaptiveItemsPerPage;
    const endIndex = startIndex + adaptiveItemsPerPage;
    const pageRisks = filteredRisks.slice(startIndex, endIndex);
    
    const currentViewAttr = document.body.getAttribute('data-view') || 'matrix';
    if (currentViewAttr === 'cards') {
        risksGrid.className = 'risks-grid';
        risksGrid.innerHTML = pageRisks.map(risk => createRiskCard(risk)).join('');
    } else {
        risksGrid.className = 'risks-grid list-view';
        risksGrid.innerHTML = pageRisks.map(risk => createRiskListItem(risk)).join('');
    }
    
    updatePagination();
    updateStats();
}

// Отображение рисков в виде списка
function displayRisksAsList() {
    const risksGrid = document.getElementById('risksGrid');
    if (!risksGrid) return;
    
    // Адаптивное количество элементов на странице для мобильных устройств
    const adaptiveItemsPerPage = isMobile ? mobileSettings.itemsPerPage : itemsPerPage;
    
    const startIndex = (currentPage - 1) * adaptiveItemsPerPage;
    const endIndex = startIndex + adaptiveItemsPerPage;
    const pageRisks = filteredRisks.slice(startIndex, endIndex);
    
    const currentViewAttr = document.body.getAttribute('data-view') || 'matrix';
    if (currentViewAttr === 'cards') {
        risksGrid.className = 'risks-grid';
        risksGrid.innerHTML = pageRisks.map(risk => createRiskCard(risk)).join('');
    } else {
        risksGrid.className = 'risks-grid list-view';
        risksGrid.innerHTML = pageRisks.map(risk => createRiskListItem(risk)).join('');
    }
    
    updatePagination();
    updateStats();
}

// Создание карточки риска
function createRiskCard(risk) {
    return `
        <div class="risk-card" data-risk-id="${risk.id}">
            <div class="risk-header">
                <span class="risk-category">${risk.categoryName}</span>
                <span class="risk-level ${risk.level}">${riskLevels[risk.level].name}</span>
            </div>
            <h3 class="risk-title">${risk.title}</h3>
            <p class="risk-consequences">${risk.consequences}</p>
            <div class="risk-actions">
                <button class="btn-secondary" onclick="showRiskDetails(${risk.id})">Подробнее</button>
            </div>
        </div>
    `;
}

// Создание элемента списка рисков
function createRiskListItem(risk) {
    return `
        <div class="risk-list-item" data-risk-id="${risk.id}">
            <div class="risk-list-header">
                <h3>${risk.title}</h3>
                <span class="risk-level ${risk.level}">${riskLevels[risk.level].name}</span>
            </div>
            <div class="risk-meta">
                <span class="risk-category">${risk.categoryName}</span>
                <span>Вероятность: ${risk.probability}</span>
            </div>
            <p class="risk-consequences">${risk.consequences}</p>
            <div class="risk-actions">
                <button class="btn-secondary" onclick="showRiskDetails(${risk.id})">Подробнее</button>
            </div>
        </div>
    `;
}

// Показать детали риска
function showRiskDetails(riskId) {
    const risk = risksData.find(r => r.id === riskId);
    if (!risk) return;
    
    const modal = document.getElementById('riskModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = risk.title;
    
    // Создаем красивый заголовок с уровнем риска
    const riskLevelBadge = `
        <div class="risk-detail-header">
            <div class="risk-detail-title">
                <h2>${risk.title}</h2>
                <span class="risk-level-badge ${risk.level}">${riskLevels[risk.level].name}</span>
            </div>
            <div class="risk-detail-meta">
                <span class="risk-category-badge">
                    <i class="fas fa-tag"></i>
                    ${risk.categoryName}
                </span>
                <span class="risk-probability-badge">
                    <i class="fas fa-chart-line"></i>
                    ${risk.probability}
                </span>
            </div>
        </div>
    `;
    
    modalBody.innerHTML = `
        ${riskLevelBadge}
        
        <div class="risk-detail-content">
            <div class="risk-detail-section">
                <h3><i class="fas fa-exclamation-triangle"></i> Последствия</h3>
                <div class="risk-detail-text">
                    <p>${risk.consequences}</p>
                </div>
            </div>
            
            <div class="risk-detail-section">
                <h3><i class="fas fa-shield-alt"></i> Меры митигации</h3>
                <div class="risk-detail-text">
                    <p>${risk.mitigation}</p>
                </div>
            </div>
            
            <div class="risk-detail-section">
                <h3><i class="fas fa-info-circle"></i> Дополнительная информация</h3>
                <div class="risk-detail-info">
                    <div class="info-item">
                        <span class="info-label">ID риска:</span>
                        <span class="info-value">#${risk.id}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Категория:</span>
                        <span class="info-value">${risk.categoryName}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Уровень риска:</span>
                        <span class="info-value">${riskLevels[risk.level].name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Вероятность:</span>
                        <span class="info-value">${risk.probability}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    showModal();
}

// Модальные окна
function showModal() {
    const modal = document.getElementById('riskModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.getElementById('riskModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Обработка поиска
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredRisks = [...risks];
    } else {
        filteredRisks = risks.filter(risk => 
            risk.title.toLowerCase().includes(searchTerm) ||
            risk.description.toLowerCase().includes(searchTerm) ||
            risk.consequences.toLowerCase().includes(searchTerm) ||
            risk.categoryName.toLowerCase().includes(searchTerm)
        );
    }
    
    // Сбрасываем страницу на первую
    currentPage = 1;
    
    // Обновляем отображение
    const currentViewAttr = document.body.getAttribute('data-view') || 'matrix';
    if (currentViewAttr === 'matrix') {
        createRiskMatrix();
    } else {
        displayRisksAsList();
    }
}

// Очистка поиска
function clearSearch() {
    document.getElementById('searchInput').value = '';
    filteredRisks = risksData;
    currentPage = 1;
    
    // Обновляем индикатор поиска
    updateSearchIndicator('');
    
    // Обновляем интерфейс в зависимости от текущего вида
    if (currentView === 'matrix') {
        // Для матрицы обновляем статистику и пересоздаем матрицу
        updateStats();
        createRiskMatrix();
        
        // Убираем подсветку поиска
        document.querySelectorAll('.matrix-cell').forEach(cell => {
            cell.classList.remove('search-highlight');
        });
    } else {
        // Для других видов обновляем список рисков
        renderRisks();
    }
    
    // Показываем уведомление
    showNotification('Поиск очищен', 'info');
}

// Обновление статистики
function updateStats() {
    const totalRisks = filteredRisks.length;
    const statsContainer = document.querySelector('.stats-container');
    
    if (statsContainer) {
        const riskCounts = {};
        riskLevels.forEach(level => {
            riskCounts[level.key] = 0;
        });
        
        filteredRisks.forEach(risk => {
            if (riskCounts[risk.level] !== undefined) {
                riskCounts[risk.level]++;
            }
        });
        
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Всего рисков:</span>
                <span class="stat-value">${totalRisks}</span>
            </div>
            ${Object.entries(riskCounts).map(([level, count]) => `
                <div class="stat-item">
                    <span class="stat-label">${riskLevels[level].name}:</span>
                    <span class="stat-value ${level}">${count}</span>
                </div>
            `).join('')}
        `;
    }
}

// Обновление статистики отчета
function updateReportStats() {
    const stats = {
        total: risksData.length,
        critical: risksData.filter(r => r.level === 'critical').length,
        high: risksData.filter(r => r.level === 'high').length,
        medium: risksData.filter(r => r.level === 'medium').length,
        low: risksData.filter(r => r.level === 'low').length
    };
    
    document.getElementById('totalRisksReport').textContent = stats.total;
    document.getElementById('criticalRisksReport').textContent = stats.critical;
    document.getElementById('highRisksReport').textContent = stats.high;
    document.getElementById('mediumRisksReport').textContent = stats.medium;
    document.getElementById('lowRisksReport').textContent = stats.low;
}

// Пагинация
function updatePagination() {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;
    
    const totalPages = Math.ceil(filteredRisks.length / itemsPerPage);
    
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }
    
    paginationContainer.style.display = 'flex';
    
    let paginationHTML = '';
    
    // Кнопка "Предыдущая"
    if (currentPage > 1) {
        paginationHTML += `<button class="page-btn" data-page="${currentPage - 1}">Предыдущая</button>`;
    }
    
    // Номера страниц
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="page-btn active" data-page="${i}">${i}</button>`;
        } else if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHTML += `<button class="page-btn" data-page="${i}">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += `<span class="page-dots">...</span>`;
        }
    }
    
    // Кнопка "Следующая"
    if (currentPage < totalPages) {
        paginationHTML += `<button class="page-btn" data-page="${currentPage + 1}">Следующая</button>`;
    }
    
    paginationContainer.innerHTML = paginationHTML;
}

function nextPage() {
    const totalPages = Math.ceil(filteredRisks.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderRisks();
    }
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderRisks();
    }
}

function goToPage(page) {
    const totalPages = Math.ceil(filteredRisks.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderRisks();
    }
}

// Переключение темы
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Обновляем иконку
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.className = `theme-icon fas fa-${newTheme === 'dark' ? 'sun' : 'moon'}`;
    }
}

function updateThemeIcon() {
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');
    const currentTheme = document.body.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        icon.className = 'fas fa-sun';
        themeToggle.title = 'Переключить на светлую тему';
    } else {
        icon.className = 'fas fa-moon';
        themeToggle.title = 'Переключить на темную тему';
    }
}

// Экспорт данных
function downloadExcel() {
    const risks = applyFilters();
    const data = prepareExcelData(risks);
    
    // Создаем простую HTML таблицу для Excel
    let excelContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8">
            <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Карта рисков</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        </head>
        <body>
            <table border="1">
                <tr style="background-color: #34495E; color: white; font-weight: bold;">
                    <th>ID</th>
                    <th>Категория риска</th>
                    <th>Название риска</th>
                    <th>Уровень риска</th>
                    <th>Вероятность</th>
                    <th>Последствия</th>
                    <th>Меры митигации</th>
                </tr>
    `;
    
    data.forEach(risk => {
        const riskLevel = risk['Уровень риска'];
        const bgColor = getRiskLevelColor(riskLevel);
        
        excelContent += `<tr style="background-color: ${bgColor};">`;
        excelContent += `<td>${risk.ID}</td>`;
        excelContent += `<td>${risk.Категория}</td>`;
        excelContent += `<td>${risk['Название риска']}</td>`;
        excelContent += `<td>${riskLevel}</td>`;
        excelContent += `<td>${risk.Вероятность}</td>`;
        excelContent += `<td>${risk.Последствия}</td>`;
        excelContent += `<td>${risk['Меры митигации']}</td>`;
        excelContent += '</tr>';
    });
    
    excelContent += `
            </table>
        </body>
        </html>
    `;
    
    // Создаем blob и скачиваем файл
    const blob = new Blob([excelContent], { 
        type: 'application/vnd.ms-excel;charset=utf-8;' 
    });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Карта_рисков_гостеприимство_2025.xls';
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Показываем уведомление
    showNotification('Excel отчет успешно скачан!', 'success');
}

// Функция для получения цвета строки по уровню риска
function getRiskLevelColor(riskLevel) {
    if (riskLevel.includes('Критический')) {
        return '#FADBD8'; // Светло-красный
    } else if (riskLevel.includes('Высокий')) {
        return '#FEF9E7'; // Светло-желтый
    } else if (riskLevel.includes('Средний')) {
        return '#EBF5FB'; // Светло-синий
    } else {
        return '#E8F6F3'; // Светло-зеленый
    }
}


function downloadCSV() {
    const risks = applyFilters();
    const csv = convertToCSV(risks);
    
    // Добавляем BOM для корректного отображения кириллицы в Excel
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'карта_рисков_гостеприимство_2025.csv');
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('CSV файл успешно скачан!', 'success');
}

function prepareExcelData(risks) {
    return risks.map(risk => ({
        'ID': risk.id,
        'Категория': risk.categoryName,
        'Название риска': risk.title,
        'Уровень риска': riskLevels[risk.level].name,
        'Вероятность': risk.probability,
        'Последствия': risk.consequences,
        'Меры митигации': risk.mitigation
    }));
}

function convertToCSV(data) {
    const headers = ['ID', 'Категория', 'Название риска', 'Уровень риска', 'Вероятность', 'Последствия', 'Меры митигации'];
    
    const csvContent = [
        headers.join(','),
        ...data.map(row => [
            row.id,
            `"${row.categoryName.replace(/"/g, '""')}"`,
            `"${row.title.replace(/"/g, '""')}"`,
            `"${riskLevels[row.level].name.replace(/"/g, '""')}"`,
            `"${row.probability.replace(/"/g, '""')}"`,
            `"${row.consequences.replace(/"/g, '""')}"`,
            `"${row.mitigation.replace(/"/g, '""')}"`
        ].join(','))
    ].join('\n');
    
    return csvContent;
}

// Функция для показа уведомлений
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    // Устанавливаем цвет в зависимости от типа
    if (type === 'success') {
        notification.style.backgroundColor = '#22c55e';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#ef4444';
    } else {
        notification.style.backgroundColor = '#667eea';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Автоматическое скрытие через 3 секунды
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Переключение мобильного меню
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('mobile-open');
    }
}

// Закрытие мобильного меню при клике на пункт
function closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const body = document.body;
    const overlay = document.querySelector('.mobile-overlay');
    
    sidebar.classList.remove('show');
    body.style.overflow = '';
    
    if (overlay) {
        overlay.remove();
    }
}

// Обработка пагинации
function handlePagination(e) {
    if (e.target.classList.contains('page-btn')) {
        e.preventDefault();
        const page = parseInt(e.target.getAttribute('data-page'));
        if (!isNaN(page)) {
            currentPage = page;
            const currentViewAttr = document.body.getAttribute('data-view') || 'matrix';
            if (currentViewAttr === 'matrix') {
                createRiskMatrix();
            } else {
                displayRisksAsList();
            }
        }
    }
}

// Инициализация приложения
function initializeApp() {
    // Установить тему
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon();
    
    // Адаптивные настройки для мобильных устройств
    if (isMobile) {
        // Уменьшаем количество элементов на странице для мобильных
        itemsPerPage = mobileSettings.itemsPerPage;
        
        // Добавляем класс для мобильных устройств
        document.body.classList.add('mobile-device');
        
        // Показываем уведомление о мобильной версии
        if (isTouchDevice) {
            showNotification('Используйте жесты для навигации: свайп влево для закрытия меню, двойной тап для переключения вида', 'info');
        }
    }
    
    // Создать матрицу
    createRiskMatrix();
    
    // Обновить статистику
    updateStats();
    
    // Настроить обработчики событий
    setupEventListeners();
    
    // Показать матрицу по умолчанию
    document.body.setAttribute('data-view', 'matrix');
    createRiskMatrix();
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Обработчик для кнопки переключения темы
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Обработчик для кнопки мобильного меню
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }

    // Обработчик для поиска
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Обработчик для кнопки очистки поиска
    const clearSearchBtn = document.querySelector('.clear-search');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearSearch);
    }

    // Обработчик для переключения представлений
    const viewToggle = document.getElementById('viewToggle');
    if (viewToggle) {
        viewToggle.addEventListener('click', switchView);
    }

    // Обработчик для фильтров
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', handleRiskLevelFilter);
    });

    // Обработчик для пагинации
    const paginationContainer = document.querySelector('.pagination');
    if (paginationContainer) {
        paginationContainer.addEventListener('click', handlePagination);
    }

    // Обработчик для закрытия модального окна по клику вне его
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('riskModal');
        if (modal && e.target === modal) {
            closeModal();
        }
    });

    // Обработчик для закрытия модального окна по клавише Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Утилиты
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Функция подсветки результатов поиска в матрице
function highlightSearchResults(searchTerm) {
    const cells = document.querySelectorAll('.matrix-cell');
    
    cells.forEach(cell => {
        // Убираем предыдущую подсветку
        cell.classList.remove('search-highlight');
        
        // Проверяем, есть ли в ячейке риски, соответствующие поиску
        const cellHeader = cell.querySelector('.matrix-cell-header');
        if (cellHeader) {
            const cellText = cellHeader.textContent.toLowerCase();
            if (cellText.includes(searchTerm.toLowerCase())) {
                cell.classList.add('search-highlight');
            }
        }
    });
}

// Функция обновления индикатора поиска
function updateSearchIndicator(text) {
    let indicator = document.getElementById('searchIndicator');
    
    if (!indicator) {
        // Создаем индикатор, если его нет
        indicator = document.createElement('div');
        indicator.id = 'searchIndicator';
        indicator.className = 'search-indicator';
        
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.appendChild(indicator);
        }
    }
    
    if (text) {
        indicator.textContent = text;
        indicator.style.display = 'block';
    } else {
        indicator.style.display = 'none';
    }
}

// Функция показа подсказок для поиска
function showSearchSuggestions() {
    let suggestions = document.getElementById('searchSuggestions');
    
    if (!suggestions) {
        suggestions = document.createElement('div');
        suggestions.id = 'searchSuggestions';
        suggestions.className = 'search-suggestions';
        
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.appendChild(suggestions);
        }
    }
    
    // Показываем историю поиска и популярные запросы
    const popularTerms = [
        'кибератаки', 'персонал', 'финансы', 'отказ', 
        'безопасность', 'технологии', 'критический', 'отравления'
    ];
    
    let suggestionsHtml = '';
    
    // История поиска
    if (searchHistory.length > 0) {
        suggestionsHtml += `
            <div class="suggestions-section">
                <div class="suggestions-header">История поиска:</div>
                <div class="suggestions-list">
                    ${searchHistory.map(term => 
                        `<span class="suggestion-item history" onclick="setSearchTerm('${term}')">${term}</span>`
                    ).join('')}
                </div>
            </div>
        `;
    }
    
    // Популярные запросы
    suggestionsHtml += `
        <div class="suggestions-section">
            <div class="suggestions-header">Популярные запросы:</div>
            <div class="suggestions-list">
                ${popularTerms.map(term => 
                    `<span class="suggestion-item popular" onclick="setSearchTerm('${term}')">${term}</span>`
                ).join('')}
            </div>
        </div>
    `;
    
    suggestions.innerHTML = suggestionsHtml;
    
    suggestions.style.display = 'block';
}

// Функция установки поискового запроса
function setSearchTerm(term) {
    document.getElementById('searchInput').value = term;
    handleSearch();
    
    // Скрываем подсказки
    const suggestions = document.getElementById('searchSuggestions');
    if (suggestions) {
        suggestions.style.display = 'none';
    }
}

// Функция сохранения поиска в историю
function saveSearchToHistory(term) {
    // Убираем дубликаты
    searchHistory = searchHistory.filter(item => item !== term);
    
    // Добавляем в начало
    searchHistory.unshift(term);
    
    // Ограничиваем историю 10 последними запросами
    if (searchHistory.length > 10) {
        searchHistory = searchHistory.slice(0, 10);
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}

// Функция настройки жестов для мобильных устройств
function setupTouchGestures() {
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    
    // Обработка свайпов для сайдбара
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        });
        
        sidebar.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const endTime = Date.now();
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = endTime - startTime;
            
            // Свайп влево для закрытия сайдбара
            if (deltaX < -mobileSettings.swipeThreshold && 
                Math.abs(deltaY) < mobileSettings.swipeThreshold && 
                deltaTime < 500) {
                closeMobileMenu();
            }
        });
    }
    
    // Обработка свайпов для модальных окон
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        });
        
        modal.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = Date.now() - startTime;
            
            // Свайп вниз для закрытия модального окна
            if (deltaY > mobileSettings.swipeThreshold && 
                Math.abs(deltaX) < mobileSettings.swipeThreshold && 
                deltaTime < 500) {
                closeModal();
            }
        });
    });
    
    // Обработка двойного тапа для увеличения матрицы
    const matrixContainer = document.querySelector('.matrix-container');
    if (matrixContainer) {
        let lastTap = 0;
        matrixContainer.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 500 && tapLength > 0) {
                // Двойной тап - переключаем вид матрицы
                const currentView = document.querySelector('.view-list li.active').dataset.view;
                if (currentView === 'matrix') {
                    switchView('cards');
                } else {
                    switchView('matrix');
                }
            }
            lastTap = currentTime;
        });
    }
    
    // Обработка длительного нажатия для контекстного меню
    let longPressTimer;
    const matrixCells = document.querySelectorAll('.matrix-cell');
    
    matrixCells.forEach(cell => {
        cell.addEventListener('touchstart', (e) => {
            longPressTimer = setTimeout(() => {
                // Показываем контекстное меню или дополнительную информацию
                if (cell.querySelector('.risk-count-display')) {
                    const riskCount = cell.querySelector('.risk-count-display').textContent;
                    showNotification(`В этой ячейке ${riskCount} рисков`, 'info');
                }
            }, 800);
        });
        
        cell.addEventListener('touchend', () => {
            clearTimeout(longPressTimer);
        });
        
        cell.addEventListener('touchmove', () => {
            clearTimeout(longPressTimer);
        });
    });
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', initializeApp); 