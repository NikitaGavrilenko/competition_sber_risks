// 📊 МОДУЛЬ ЭКСПОРТА ДАННЫХ РИСКОВ
import { risksData } from './data.js';

// Функция для конвертации данных в CSV
export function convertToCSV(data) {
    const header = data[0];
    const rows = data.slice(1);
    
    const csvContent = [
        header.join(','),
        ...rows.map(row => 
            row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
        )
    ].join('\n');
    
    return csvContent;
}

// Функция для создания Excel файла
export function createExcelFile(data) {
    // Создаем HTML таблицу для Excel с правильной структурой: сначала статистика, потом риски
    let excelContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8">
            <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:Name>Карта рисков</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        </head>
        <body>
            <!-- СТАТИСТИКА ПО РИСКАМ -->
            <table border="1">
                <tr style="background-color: #2E8B57; color: white; font-weight: bold; font-size: 14px;">
                    <th colspan="2" style="text-align: center; padding: 10px;">СТАТИСТИКА ПО РИСКАМ</th>
                </tr>
                <tr style="background-color: #F0F8FF;">
                    <td style="font-weight: bold; padding: 8px;">Общее количество рисков</td>
                    <td style="text-align: center; padding: 8px;">${risksData.length}</td>
                </tr>
                <tr style="background-color: #FFFFFF;">
                    <td style="font-weight: bold; padding: 8px;">Количество категорий</td>
                    <td style="text-align: center; padding: 8px;">${getUniqueCategoriesCount()}</td>
                </tr>
                <tr style="background-color: #F0F8FF;">
                    <td style="font-weight: bold; padding: 8px;">Критических рисков</td>
                    <td style="text-align: center; padding: 8px; color: #DC2626;">${getRisksByLevel('critical').length}</td>
                </tr>
                <tr style="background-color: #FFFFFF;">
                    <td style="font-weight: bold; padding: 8px;">Высоких рисков</td>
                    <td style="text-align: center; padding: 8px; color: #EF4444;">${getRisksByLevel('high').length}</td>
                </tr>
                <tr style="background-color: #F0F8FF;">
                    <td style="font-weight: bold; padding: 8px;">Средних рисков</td>
                    <td style="text-align: center; padding: 8px; color: #F97316;">${getRisksByLevel('medium').length}</td>
                </tr>
                <tr style="background-color: #FFFFFF;">
                    <td style="font-weight: bold; padding: 8px;">Низких рисков</td>
                    <td style="text-align: center; padding: 8px; color: #22C55E;">${getRisksByLevel('low').length}</td>
                </tr>
            </table>
            
            <!-- Статистика по категориям -->
            <table border="1" style="margin-top: 20px;">
                <tr style="background-color: #4682B4; color: white; font-weight: bold; font-size: 14px;">
                    <th colspan="3" style="text-align: center; padding: 10px;">СТАТИСТИКА ПО КАТЕГОРИЯМ</th>
                </tr>
                <tr style="background-color: #E6F3FF; font-weight: bold;">
                    <td style="padding: 8px;">Категория</td>
                    <td style="padding: 8px;">Количество рисков</td>
                    <td style="padding: 8px;">Критических</td>
                </tr>
    `;
    
    // Добавляем статистику по каждой категории
    const categoryStats = getCategoryStatistics();
    categoryStats.forEach(stat => {
        excelContent += `
            <tr style="background-color: #FFFFFF;">
                <td style="padding: 8px;">${stat.categoryName}</td>
                <td style="text-align: center; padding: 8px;">${stat.totalRisks}</td>
                <td style="text-align: center; padding: 8px; color: #DC2626;">${stat.criticalRisks}</td>
            </tr>
        `;
    });
    
    excelContent += `
            </table>
            
            <!-- Статистика по вероятности -->
            <table border="1" style="margin-top: 20px;">
                <tr style="background-color: #9370DB; color: white; font-weight: bold; font-size: 14px;">
                    <th colspan="2" style="text-align: center; padding: 10px;">СТАТИСТИКА ПО ВЕРОЯТНОСТИ</th>
                </tr>
                <tr style="background-color: #F0F8FF;">
                    <td style="font-weight: bold; padding: 8px;">Высокая вероятность</td>
                    <td style="text-align: center; padding: 8px; color: #DC2626;">${getRisksByProbability('Высокая').length}</td>
                </tr>
                <tr style="background-color: #FFFFFF;">
                    <td style="font-weight: bold; padding: 8px;">Средняя вероятность</td>
                    <td style="text-align: center; padding: 8px; color: #F97316;">${getRisksByProbability('Средняя').length}</td>
                </tr>
                <tr style="background-color: #F0F8FF;">
                    <td style="font-weight: bold; padding: 8px;">Низкая вероятность</td>
                    <td style="text-align: center; padding: 8px; color: #22C55E;">${getRisksByProbability('Низкая').length}</td>
                </tr>
            </table>
            
            <!-- Топ-5 критических рисков -->
            <table border="1" style="margin-top: 20px;">
                <tr style="background-color: #DC2626; color: white; font-weight: bold; font-size: 14px;">
                    <th colspan="2" style="text-align: center; padding: 10px;">ТОП-5 КРИТИЧЕСКИХ РИСКОВ</th>
                </tr>
                <tr style="background-color: #FEE2E2; font-weight: bold;">
                    <td style="padding: 8px;">Название риска</td>
                    <td style="padding: 8px;">Категория</td>
                </tr>
    `;
    
    // Добавляем топ-5 критических рисков
    const criticalRisks = getRisksByLevel('critical').slice(0, 5);
    criticalRisks.forEach((risk, index) => {
        excelContent += `
            <tr style="background-color: #FFFFFF;">
                <td style="padding: 8px;">${index + 1}. ${risk.title}</td>
                <td style="padding: 8px;">${risk.categoryName}</td>
            </tr>
        `;
    });
    
    excelContent += `
            </table>
            
            <!-- РАЗДЕЛИТЕЛЬ -->
            <div style="height: 30px;"></div>
            
            <!-- ПОЛНЫЙ СПИСОК РИСКОВ -->
            <table border="1">
                <tr style="background-color: #34495E; color: white; font-weight: bold;">
                    ${data[0].map(header => `<th>${header}</th>`).join('')}
                </tr>
    `;
    
    // Добавляем все риски
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const isNewCategory = row[0] !== '';
        const bgColor = isNewCategory ? getRowColor(row[0]) : '#ffffff';
        
        excelContent += `<tr style="background-color: ${bgColor};">`;
        row.forEach(cell => {
            excelContent += `<td>${cell}</td>`;
        });
        excelContent += '</tr>';
    }
    
    excelContent += `
            </table>
        </body>
        </html>
    `;
    
    return excelContent;
}

// Функция для получения цвета строки по категории
function getRowColor(category) {
    const colors = {
        'Операционные и технологические риски': '#E8F8F5',
        'Кадровые и HR риски': '#FEF9E7',
        'Финансовые и экономические риски': '#FADBD8',
        'Репутационные и маркетинговые риски': '#EBF5FB',
        'Безопасность и комплаенс': '#F4ECF7',
        'Внешние риски': '#E8F6F3'
    };
    return colors[category] || '#ffffff';
}

// Функция для получения читаемого названия уровня риска
function getRiskLevelName(level) {
    const levelNames = {
        'critical': 'Критический',
        'high': 'Высокий',
        'medium': 'Средний',
        'low': 'Низкий'
    };
    return levelNames[level] || level;
}

// Вспомогательные функции для статистики
function getUniqueCategoriesCount() {
    const uniqueCategories = new Set(risksData.map(risk => risk.categoryName));
    return uniqueCategories.size;
}

function getRisksByLevel(level) {
    return risksData.filter(risk => risk.level === level);
}

function getRisksByProbability(probability) {
    return risksData.filter(risk => risk.probability === probability);
}

function getCategoryStatistics() {
    const categoryMap = new Map();
    
    risksData.forEach(risk => {
        if (!categoryMap.has(risk.categoryName)) {
            categoryMap.set(risk.categoryName, {
                categoryName: risk.categoryName,
                totalRisks: 0,
                criticalRisks: 0
            });
        }
        
        const stat = categoryMap.get(risk.categoryName);
        stat.totalRisks++;
        
        if (risk.level === 'critical') {
            stat.criticalRisks++;
        }
    });
    
    return Array.from(categoryMap.values());
}

// Функция для подготовки данных для экспорта
export function prepareExportData() {
    const exportData = [
        ["Категория риска", "Риск", "Уровень риска", "Вероятность", "Последствия", "Меры митигации"]
    ];
    
    let currentCategory = '';
    
    risksData.forEach(risk => {
        // Если это новая категория, добавляем заголовок
        if (risk.categoryName !== currentCategory) {
            currentCategory = risk.categoryName;
            exportData.push([
                currentCategory,
                risk.title,
                getRiskLevelName(risk.level),
                risk.probability,
                risk.consequences,
                risk.mitigation
            ]);
        } else {
            // Подпункт категории
            exportData.push([
                '',
                risk.title,
                getRiskLevelName(risk.level),
                risk.probability,
                risk.consequences,
                risk.mitigation
            ]);
        }
    });
    
    return exportData;
}

// Функция для скачивания Excel файла
export function downloadExcel() {
    const exportData = prepareExportData();
    const excelContent = createExcelFile(exportData);
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
}

// Функция для скачивания CSV файла
export function downloadCSV() {
    const exportData = prepareExportData();
    const csvContent = convertToCSV(exportData);
    const blob = new Blob(['\ufeff' + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
    });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Карта_рисков_гостеприимство_2025.csv';
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
