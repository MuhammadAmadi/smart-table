import { sortMap } from "../lib/sort.js";

export function initSorting(columns) {
    // ИЗМЕНЕНО: Убираем добавление обработчиков здесь, так как они добавляются в main.js
    // Теперь эта функция только возвращает applySorting
    
    return (query, state, action) => {
        let field = null;
        let order = null;

        // Если это событие от кнопки сортировки
        if (action && action.name === 'sort') {
            const button = action;
            
            // ИЗМЕНЕНО: Не меняем data-value здесь, так как это делает обработчик в main.js
            // Просто берем текущее значение
            field = button.dataset.field;
            order = button.dataset.value;
        } else {
            // Ищем активную сортировку
            columns.forEach(column => {
                if (column && column.dataset.value && column.dataset.value !== 'none') {
                    field = column.dataset.field;
                    order = column.dataset.value;
                }
            });
        }

        const sort = (field && order && order !== 'none') ? `${field}:${order}` : null;
        return sort ? { ...query, sort } : query;
    };
}