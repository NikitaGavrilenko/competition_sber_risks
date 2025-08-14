// 🎯 ОСНОВНОЕ ПРИЛОЖЕНИЕ КАРТЫ РИСКОВ
import { loadMatrixView } from './views/matrix.js';
import { loadCardsView } from './views/cards.js';
import { loadListView, sortTable } from './views/list.js';
import { handleSearch, globalSearch, filterByCategory, filterByLevel, resetFilters, updateStatistics } from './filters/riskFilters.js';
import { showNotification } from './ui/notifications.js';
import { closeModal, showRiskDetailsFromData, showRisksInCell } from './ui/modal.js';
import { categories } from './core/constants.js';
import { downloadExcel, downloadCSV } from './core/export.js';

// 🎮 УПРАВЛЕНИЕ ВИДАМИ ОТОБРАЖЕНИЯ
let currentView = 'matrix';

function switchView(view) {
    // Убираем активный класс со всех кнопок
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Добавляем активный класс к выбранной кнопке
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    // Скрываем все виды
    document.getElementById('matrixView').style.display = 'none';
    document.getElementById('cardsView').style.display = 'none';
    document.getElementById('listView').style.display = 'none';
    
    // Показываем выбранный вид
    currentView = view;
    
    switch(view) {
        case 'matrix':
            document.getElementById('matrixView').style.display = 'block';
            loadMatrixView();
            showNotification('Переключено на вид "Матрица" 📊', 'success');
            break;
        case 'cards':
            document.getElementById('cardsView').style.display = 'block';
            loadCardsView();
            showNotification('Переключено на вид "Карточки" 🃏', 'success');
            break;
        case 'list':
            document.getElementById('listView').style.display = 'block';
            loadListView();
            showNotification('Переключено на вид "Список" 📋', 'success');
            break;
    }
}

// 🎮 ФУНКЦИИ ИНТЕРФЕЙСА
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    
    if (body.getAttribute('data-theme') === 'dark') {
        body.setAttribute('data-theme', 'light');
        themeIcon.className = 'fas fa-sun';
        showNotification('Светлая тема включена', 'success');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-moon';
        showNotification('Темная тема включена', 'success');
    }
}

function exportToExcel() {
    try {
        downloadExcel();
        showNotification('Excel файл скачан успешно! 📊', 'success');
    } catch (error) {
        showNotification('Ошибка при экспорте в Excel', 'error');
        console.error('Export error:', error);
    }
}

function exportToCSV() {
    try {
        downloadCSV();
        showNotification('CSV файл скачан успешно! 📄', 'success');
    } catch (error) {
        showNotification('Ошибка при экспорте в CSV', 'error');
        console.error('Export error:', error);
    }
}

function editRisk(riskId) {
    showNotification(`Редактирование риска ${riskId} 📝`, 'warning');
}

// 🌟 ЭФФЕКТЫ
setInterval(() => {
    const particles = document.querySelectorAll('.particle');
    particles.forEach(particle => {
        if (Math.random() > 0.98) {
            particle.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
        }
    });
}, 5000);

// 🎯 ОБРАБОТЧИКИ СОБЫТИЙ
document.addEventListener('DOMContentLoaded', function() {

    
    // Небольшая задержка для полной загрузки модулей
    setTimeout(() => {
        // Загружаем матрицу по умолчанию
        loadMatrixView();
        
        // Инициализируем статистику
        updateStatistics();
        
        showNotification('Карта рисков загружена успешно! 🚀', 'success');
    }, 200);
    
    // Закрытие модального окна по клику вне его
    document.getElementById('riskModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    // Закрытие модального окна по ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});

// 🔗 ЭКСПОРТ ФУНКЦИЙ В ГЛОБАЛЬНУЮ ОБЛАСТЬ ВИДИМОСТИ
setTimeout(() => {
    window.switchView = switchView;
    window.toggleSidebar = toggleSidebar;
    window.toggleTheme = toggleTheme;
    window.closeModal = closeModal;
    window.showRiskDetailsFromData = showRiskDetailsFromData;
    window.showRisksInCell = showRisksInCell;
    window.exportToExcel = exportToExcel;
    window.exportToCSV = exportToCSV;
    window.editRisk = editRisk;
    window.handleSearch = handleSearch;
    window.globalSearch = globalSearch;
    window.filterByCategory = filterByCategory;
    window.filterByLevel = filterByLevel;
    window.resetFilters = resetFilters;
    window.updateStatistics = updateStatistics;
    window.loadMatrixView = loadMatrixView;
    window.loadCardsView = loadCardsView;
    window.loadListView = loadListView;
    window.sortTable = sortTable;
    

}, 100);


