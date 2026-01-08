import {sortCollection, sortMap} from "../lib/sort.js";

export function initSorting(columns) {
    return (data, state, action) => {
        let field = null;
        let order = null;

        if (action && action.name === 'sort') {
            // @todo: #3.1 — запомнить выбранный режим сортировки
            action.dataset.value = sortMap[action.dataset.value]; // обновляем режим сортировки
            field = action.dataset.field; // получаем поле для сортировки
            order = action.dataset.value; // получаем режим сортировки

            // @todo: #3.2 — сбросить сортировки остальных колонок
            columns.forEach(col => {
                if (col.dataset.field !== action.dataset.field) {
                    col.dataset.value = 'none'; // сбрасываем режим сортировки
                }
            });
        } else {
            // @todo: #3.3 — получить выбранный режим сортировки
            columns.forEach(col => {
                if (col.dataset.value !== 'none') {
                    field = col.dataset.field; // получаем поле для сортировки
                    order = col.dataset.value; // получаем режим сортировки
                }
            });
        }

        return sortCollection(data, field, order);
    }
}