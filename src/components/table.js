import {cloneTemplate} from "../lib/utils.js";

/**
 * Инициализирует таблицу и вызывает коллбэк при любых изменениях и нажатиях на кнопки
 *
 * @param {Object} settings
 * @param {(action: HTMLButtonElement | undefined) => void} onAction
 * @returns {{container: Node, elements: *, render: render}}
 */
export function initTable(settings, onAction) {
    const {tableTemplate, rowTemplate, before, after} = settings;
    const root = cloneTemplate(tableTemplate);

    // @todo: #1.2 —  вывести дополнительные шаблоны до и после таблицы
    [...before].reverse().forEach(item => {
        root[item] = cloneTemplate(item);
        root.container.prepend(root[item].container);
    });

    after.forEach(item => {
        root[item] = cloneTemplate(item);
        root.container.append(root[item].container);
    });

    // @todo: #1.3 —  обработать события и вызвать onAction()
    root.container.addEventListener('change', () => {
        console.log('Изменение в таблице');
        onAction();
    });

    root.container.addEventListener('reset', () => {
        console.log('Сброс фильтров');
        setTimeout(() => {
            onAction();
        }, 0);
    });

    root.container.addEventListener('submit', (event) => {
        event.preventDefault();
        console.log('Отправка формы', event.submitter);
        onAction(event.submitter);
    });

    const render = (data) => {
        // @todo: #1.1 — преобразовать данные в массив строк на основе шаблона rowTemplate
        console.log('Рендер данных', data);
        console.log('Количество строк данных', data.length);

        if(!data || !Array.isArray(data)) {
            console.error('Некорректные данные для рендера', data);
            return;
        }

        if(!root.elements || !root.elements.rows) {
            console.error('Контейнер для строк не найден', root.elements);
            return;
        }

        console.log('Очищение старых строк');

        const nextRows = data.map((item, index) => { // item — объект с данными для одной строки
            console.log(`Создание строки ${index}`, item);
            const row = cloneTemplate(rowTemplate); // row — клонированный шаблон строки
            Object.keys(item).forEach(key => { // перебираем ключи объекта с данными
                const element = row.elements[key]; // ищем элемент в строке по имени ключа
                if(element) { // если элемент найден, заполняем его значением из объекта
                    if( element instanceof HTMLInputElement ||  // если это поле ввода
                        element instanceof HTMLSelectElement || // если это поле выбора
                        element instanceof HTMLTextAreaElement) // если это поле ввода
                    {
                        element.value = item[key]; // заполняем значение
                    } else {
                        element.textContent = item[key]; // заполняем текстовое содержимое
                    }
                }
            });
            return row.container; // возвращаем готовую строку
        });

        console.log('Готовые строки для рендера', nextRows.length);
        console.log('Заменяем старые строки на новые');
        root.elements.rows.replaceChildren(...nextRows); // заменяем старые строки на новые
        console.log('Рендер завершен');
    }
    console.log('Таблица инициализирована', root);
    return {...root, render}; // возвращаем контейнер, элементы и функцию render
}