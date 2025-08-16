/**
 * Утилиты для работы с датами
 */

/**
 * Форматировать дату в читаемый вид
 */
export function formatDate(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options
    };
    
    try {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        if (!(date instanceof Date) || isNaN(date)) {
            return 'Неверная дата';
        }
        
        return date.toLocaleDateString('ru-RU', defaultOptions);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Неверная дата';
    }
}

/**
 * Форматировать дату и время
 */
export function formatDateTime(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...options
    };
    
    try {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        if (!(date instanceof Date) || isNaN(date)) {
            return 'Неверная дата';
        }
        
        return date.toLocaleDateString('ru-RU', defaultOptions);
    } catch (error) {
        console.error('Error formatting date time:', error);
        return 'Неверная дата';
    }
}

/**
 * Получить относительное время (например, "2 часа назад")
 */
export function getRelativeTime(date) {
    try {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        if (!(date instanceof Date) || isNaN(date)) {
            return 'Неверная дата';
        }
        
        const now = new Date();
        const diffInMs = now - date;
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const diffInWeeks = Math.floor(diffInDays / 7);
        const diffInMonths = Math.floor(diffInDays / 30);
        const diffInYears = Math.floor(diffInDays / 365);
        
        if (diffInMinutes < 1) {
            return 'Только что';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes} ${getPluralForm(diffInMinutes, 'минуту', 'минуты', 'минут')} назад`;
        } else if (diffInHours < 24) {
            return `${diffInHours} ${getPluralForm(diffInHours, 'час', 'часа', 'часов')} назад`;
        } else if (diffInDays < 7) {
            return `${diffInDays} ${getPluralForm(diffInDays, 'день', 'дня', 'дней')} назад`;
        } else if (diffInWeeks < 4) {
            return `${diffInWeeks} ${getPluralForm(diffInWeeks, 'неделю', 'недели', 'недель')} назад`;
        } else if (diffInMonths < 12) {
            return `${diffInMonths} ${getPluralForm(diffInMonths, 'месяц', 'месяца', 'месяцев')} назад`;
        } else {
            return `${diffInYears} ${getPluralForm(diffInYears, 'год', 'года', 'лет')} назад`;
        }
    } catch (error) {
        console.error('Error getting relative time:', error);
        return 'Неверная дата';
    }
}

/**
 * Получить правильную форму множественного числа для русского языка
 */
function getPluralForm(number, one, few, many) {
    const mod10 = number % 10;
    const mod100 = number % 100;
    
    if (mod100 >= 11 && mod100 <= 19) {
        return many;
    }
    
    if (mod10 === 1) {
        return one;
    } else if (mod10 >= 2 && mod10 <= 4) {
        return few;
    } else {
        return many;
    }
}

/**
 * Проверить, является ли дата сегодняшней
 */
export function isToday(date) {
    try {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        if (!(date instanceof Date) || isNaN(date)) {
            return false;
        }
        
        const today = new Date();
        return date.toDateString() === today.toDateString();
    } catch (error) {
        console.error('Error checking if date is today:', error);
        return false;
    }
}

/**
 * Проверить, является ли дата вчерашней
 */
export function isYesterday(date) {
    try {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        if (!(date instanceof Date) || isNaN(date)) {
            return false;
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return date.toDateString() === yesterday.toDateString();
    } catch (error) {
        console.error('Error checking if date is yesterday:', error);
        return false;
    }
}

/**
 * Проверить, является ли дата в прошлой неделе
 */
export function isLastWeek(date) {
    try {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        if (!(date instanceof Date) || isNaN(date)) {
            return false;
        }
        
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date >= weekAgo && date < now;
    } catch (error) {
        console.error('Error checking if date is last week:', error);
        return false;
    }
}

/**
 * Проверить, является ли дата в прошлом месяце
 */
export function isLastMonth(date) {
    try {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        if (!(date instanceof Date) || isNaN(date)) {
            return false;
        }
        
        const now = new Date();
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return date >= monthAgo && date < now;
    } catch (error) {
        console.error('Error checking if date is last month:', error);
        return false;
    }
}

/**
 * Получить начало дня
 */
export function getStartOfDay(date) {
    try {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        if (!(date instanceof Date) || isNaN(date)) {
            return null;
        }
        
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        return startOfDay;
    } catch (error) {
        console.error('Error getting start of day:', error);
        return null;
    }
}

/**
 * Получить конец дня
 */
export function getEndOfDay(date) {
    try {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        if (!(date instanceof Date) || isNaN(date)) {
            return null;
        }
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return endOfDay;
    } catch (error) {
        console.error('Error getting end of day:', error);
        return null;
    }
}

/**
 * Получить начало недели
 */
export function getStartOfWeek(date) {
    try {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        if (!(date instanceof Date) || isNaN(date)) {
            return null;
        }
        
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);
        return startOfWeek;
    } catch (error) {
        console.error('Error getting start of week:', error);
        return null;
    }
}

/**
 * Получить начало месяца
 */
export function getStartOfMonth(date) {
    try {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        if (!(date instanceof Date) || isNaN(date)) {
            return null;
        }
        
        const startOfMonth = new Date(date);
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        return startOfMonth;
    } catch (error) {
        console.error('Error getting start of month:', error);
        return null;
    }
}

/**
 * Получить количество дней между двумя датами
 */
export function getDaysBetween(date1, date2) {
    try {
        if (typeof date1 === 'string') {
            date1 = new Date(date1);
        }
        if (typeof date2 === 'string') {
            date2 = new Date(date2);
        }
        
        if (!(date1 instanceof Date) || isNaN(date1) || !(date2 instanceof Date) || isNaN(date2)) {
            return 0;
        }
        
        const timeDiff = Math.abs(date2.getTime() - date1.getTime());
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    } catch (error) {
        console.error('Error getting days between dates:', error);
        return 0;
    }
}

/**
 * Добавить дни к дате
 */
export function addDays(date, days) {
    try {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        if (!(date instanceof Date) || isNaN(date)) {
            return null;
        }
        
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + days);
        return newDate;
    } catch (error) {
        console.error('Error adding days to date:', error);
        return null;
    }
}

/**
 * Добавить месяцы к дате
 */
export function addMonths(date, months) {
    try {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        if (!(date instanceof Date) || isNaN(date)) {
            return null;
        }
        
        const newDate = new Date(date);
        newDate.setMonth(newDate.getMonth() + months);
        return newDate;
    } catch (error) {
        console.error('Error adding months to date:', error);
        return null;
    }
}

/**
 * Проверить, находится ли дата в диапазоне
 */
export function isDateInRange(date, startDate, endDate) {
    try {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        if (typeof startDate === 'string') {
            startDate = new Date(startDate);
        }
        if (typeof endDate === 'string') {
            endDate = new Date(endDate);
        }
        
        if (!(date instanceof Date) || isNaN(date) || 
            !(startDate instanceof Date) || isNaN(startDate) ||
            !(endDate instanceof Date) || isNaN(endDate)) {
            return false;
        }
        
        return date >= startDate && date <= endDate;
    } catch (error) {
        console.error('Error checking if date is in range:', error);
        return false;
    }
}

/**
 * Получить возраст в годах
 */
export function getAge(birthDate) {
    try {
        if (typeof birthDate === 'string') {
            birthDate = new Date(birthDate);
        }
        
        if (!(birthDate instanceof Date) || isNaN(birthDate)) {
            return 0;
        }
        
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    } catch (error) {
        console.error('Error calculating age:', error);
        return 0;
    }
}

/**
 * Форматировать продолжительность в читаемый вид
 */
export function formatDuration(milliseconds) {
    try {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            return `${days} ${getPluralForm(days, 'день', 'дня', 'дней')}`;
        } else if (hours > 0) {
            return `${hours} ${getPluralForm(hours, 'час', 'часа', 'часов')}`;
        } else if (minutes > 0) {
            return `${minutes} ${getPluralForm(minutes, 'минута', 'минуты', 'минут')}`;
        } else {
            return `${seconds} ${getPluralForm(seconds, 'секунда', 'секунды', 'секунд')}`;
        }
    } catch (error) {
        console.error('Error formatting duration:', error);
        return 'Неизвестно';
    }
}
