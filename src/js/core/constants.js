// Категории рисков
export const categories = {
    operational: {
        name: "Операционные и технологические риски",
        icon: "fas fa-cogs",
        count: 10,
        color: "#E8F8F5"
    },
    hr: {
        name: "Кадровые и HR риски",
        icon: "fas fa-users",
        count: 8,
        color: "#FEF9E7"
    },
    financial: {
        name: "Финансовые и экономические риски",
        icon: "fas fa-chart-line",
        count: 7,
        color: "#FADBD8"
    },
    reputation: {
        name: "Репутационные и маркетинговые риски",
        icon: "fas fa-star",
        count: 6,
        color: "#EBF5FB"
    },
    security: {
        name: "Безопасность и комплаенс",
        icon: "fas fa-lock",
        count: 7,
        color: "#F4ECF7"
    },
    external: {
        name: "Внешние риски",
        icon: "fas fa-external-link-alt",
        count: 8,
        color: "#E8F6F3"
    }
};

// Уровни рисков
export const riskLevels = {
    critical: {
        name: "Критический",
        color: "#dc2626",
        icon: "fas fa-radiation"
    },
    high: {
        name: "Высокий",
        color: "#ef4444",
        icon: "fas fa-exclamation-triangle"
    },
    medium: {
        name: "Средний",
        color: "#f97316",
        icon: "fas fa-exclamation-circle"
    },
    low: {
        name: "Низкий",
        color: "#22c55e",
        icon: "fas fa-check-circle"
    }
};
