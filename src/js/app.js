// 🎯 ОСНОВНОЕ ПРИЛОЖЕНИЕ КАРТЫ РИСКОВ
import { loadMatrixView } from './views/matrix.js';
import { loadCardsView } from './views/cards.js';
import { loadListView, sortTable } from './views/list.js';
import { handleSearch, globalSearch, filterByCategory, filterByLevel, resetFilters, updateStatistics } from './filters/riskFilters.js';
import { showNotification } from './ui/notifications.js';
import { closeModal, showRiskDetailsFromData, showRisksInCell } from './ui/modal.js';
import { categories } from './core/constants.js';
import { downloadExcel, downloadCSV } from './core/export.js';

// 🆕 НОВАЯ АРХИТЕКТУРА
import { RiskStore } from './store/RiskStore.js';
import { AppStore } from './store/AppStore.js';
import { StorageService } from './services/StorageService.js';
import { AnalyticsService } from './services/AnalyticsService.js';
import { Dashboard } from './components/Dashboard.js';
import { RiskForm } from './components/RiskForm.js';

// 🆕 НОВАЯ АРХИТЕКТУРА - ИНИЦИАЛИЗАЦИЯ
let riskStore;
let appStore;
let dashboard;
let riskForm;

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

// 🆕 ФУНКЦИИ НОВОЙ АРХИТЕКТУРЫ
function openDashboard() {
    console.log('🔍 Попытка открыть Dashboard...');
    console.log('dashboard:', dashboard);
    console.log('typeof dashboard:', typeof dashboard);
    console.log('dashboard instanceof Dashboard:', dashboard instanceof Dashboard);
    
    // Проверяем доступность функции
    console.log('🔍 Функция openDashboard доступна:', typeof openDashboard);
    console.log('🔍 Функция в window:', typeof window.openDashboard);
    
    const modal = document.getElementById('dashboardModal');
    const modalBody = document.getElementById('dashboardModalBody');
    
    console.log('🔍 Элементы модального окна:');
    console.log('modal:', modal);
    console.log('modalBody:', modalBody);
    
    if (!modal || !modalBody) {
        console.error('❌ Не найдены элементы модального окна Dashboard');
        showNotification('Ошибка: элементы Dashboard не найдены', 'error');
        return;
    }
    
    if (dashboard) {
        try {
            console.log('✅ Dashboard найден, открываем...');
            console.log('🔍 Свойства dashboard:');
            console.log('- container:', dashboard.container);
            console.log('- riskStore:', dashboard.riskStore);
            console.log('- isInitialized:', dashboard.isInitialized);
            
            // Устанавливаем container для dashboard
            dashboard.container = modalBody;
            console.log('✅ Container установлен');
            
            const html = dashboard.render();
            console.log('✅ HTML сгенерирован');
            console.log('🔍 Длина HTML:', html.length);
            console.log('🔍 Первые 200 символов HTML:', html.substring(0, 200));
            
            modalBody.innerHTML = html;
            console.log('✅ HTML вставлен в DOM');
            
            // Теперь можно прикрепить обработчики событий
            dashboard.attachEventListeners();
            console.log('✅ Обработчики событий прикреплены');
            
            dashboard.initialize();
            console.log('✅ Dashboard инициализирован');
            
            modal.classList.add('show');
            console.log('✅ Модальное окно показано');
            
            showNotification('Dashboard открыт успешно! 📊', 'success');
            
        } catch (error) {
            console.error('❌ Ошибка при открытии Dashboard:', error);
            console.error('🔍 Детали ошибки:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            showNotification(`Ошибка открытия Dashboard: ${error.message}`, 'error');
        }
    } else {
        console.error('❌ Dashboard не инициализирован');
        showNotification('Dashboard еще не инициализирован', 'warning');
    }
}

function closeDashboard() {
    const modal = document.getElementById('dashboardModal');
    modal.classList.remove('show');
}

function openRiskForm() {
    console.log('🔍 Попытка открыть форму риска...');
    console.log('riskForm:', riskForm);
    
    const modal = document.getElementById('riskFormModal');
    const modalBody = document.getElementById('riskFormModalBody');
    
    if (!modal || !modalBody) {
        console.error('❌ Не найдены элементы модального окна формы риска');
        showNotification('Ошибка: элементы формы риска не найдены', 'error');
        return;
    }
    
    if (riskForm) {
        try {
            console.log('✅ Форма риска найдена, открываем...');
            
            // Устанавливаем container для riskForm
            riskForm.container = modalBody;
            console.log('✅ Container установлен');
            
            const html = riskForm.render();
            console.log('✅ HTML сгенерирован');
            
            modalBody.innerHTML = html;
            console.log('✅ HTML вставлен в DOM');
            
            // Теперь можно прикрепить обработчики событий
            riskForm.attachEventListeners();
            console.log('✅ Обработчики событий прикреплены');
            
            riskForm.initialize();
            console.log('✅ Форма риска инициализирована');
            
            modal.classList.add('show');
            console.log('✅ Модальное окно показано');
            
            showNotification('Форма риска открыта успешно! 📝', 'success');
            
        } catch (error) {
            console.error('❌ Ошибка при открытии формы риска:', error);
            showNotification(`Ошибка открытия формы: ${error.message}`, 'error');
        }
    } else {
        console.error('❌ Форма риска не инициализирована');
        showNotification('Форма риска еще не инициализирована', 'warning');
    }
}

function closeRiskForm() {
    const modal = document.getElementById('riskFormModal');
    modal.classList.remove('show');
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

    // 🆕 ИНИЦИАЛИЗАЦИЯ НОВОЙ АРХИТЕКТУРЫ
    try {
        console.log('🚀 Инициализация новой архитектуры...');
        
        // Проверяем доступность классов
        console.log('🔍 Проверяем доступность классов:');
        console.log('- RiskStore:', typeof RiskStore);
        console.log('- AppStore:', typeof AppStore);
        console.log('- Dashboard:', typeof Dashboard);
        console.log('- RiskForm:', typeof RiskForm);
        
        // Инициализируем хранилища
        riskStore = new RiskStore();
        console.log('✅ RiskStore создан');
        
        appStore = new AppStore();
        console.log('✅ AppStore создан');
        
        // Инициализируем компоненты
        dashboard = new Dashboard(null, riskStore); // container будет установлен позже
        console.log('✅ Dashboard создан');
        console.log('🔍 Тип dashboard:', typeof dashboard);
        console.log('🔍 dashboard instanceof Dashboard:', dashboard instanceof Dashboard);
        
        riskForm = new RiskForm(null, riskStore); // container будет установлен позже
        console.log('✅ RiskForm создан');
        
        // Загружаем данные из localStorage
        riskStore.loadFromStorage();
        appStore.loadState();
        
        console.log('✅ Данные загружены из localStorage');
        showNotification('Новая архитектура инициализирована! 🚀', 'success');
        
    } catch (error) {
        console.error('❌ Ошибка инициализации новой архитектуры:', error);
        showNotification(`Ошибка инициализации: ${error.message}`, 'error');
        
        // Показываем детали ошибки в консоли
        console.error('Детали ошибки:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
    }
    
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
    
    // 🆕 Закрытие новых модальных окон по клику вне их
    document.getElementById('dashboardModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeDashboard();
        }
    });
    
    document.getElementById('riskFormModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeRiskForm();
        }
    });
});

// 🔗 ЭКСПОРТ ФУНКЦИЙ В ГЛОБАЛЬНУЮ ОБЛАСТЬ ВИДИМОСТИ
function exportFunctionsToGlobal() {
    console.log('🔗 Экспортируем функции в глобальную область видимости...');
    
    // Основные функции
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
    
    // 🆕 НОВЫЕ ФУНКЦИИ
    window.openDashboard = openDashboard;
    window.closeDashboard = closeDashboard;
    window.openRiskForm = openRiskForm;
    window.closeRiskForm = closeRiskForm;
    
    console.log('✅ Все функции экспортированы в глобальную область видимости');
    console.log('🔍 Проверяем доступность функций:');
    console.log('openDashboard:', typeof window.openDashboard);
    console.log('openRiskForm:', typeof window.openRiskForm);
}

// Экспортируем функции после загрузки DOM
setTimeout(exportFunctionsToGlobal, 100);


