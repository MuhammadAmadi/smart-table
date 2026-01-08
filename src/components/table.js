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
        root[item] =cloneTemplate(item);
        root.container.prepend(root[item].container);
    });

    after.forEach(item => {
        root[item] =cloneTemplate(item);
        root.container.append(root[item].container);
    });

    // @todo: #1.3 —  обработать события и вызвать onAction()
    root.container.addEventListener('change', () => {
        onAction();
    });

    root.container.addEventListener('reset', () => {
        setTimeout(() => {
            onAction();
        }, 0);
    });

    root.container.addEventListener('submit', (event) => {
        event.preventDefault();
        onAction(event.submitter);
    });

    const render = (data) => {
        // @todo: #1.1 — преобразовать данные в массив строк на основе шаблона rowTemplate
        
        const nextRows = data.map(item => { // item — объект с данными для одной строки
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
        root.elements.rows.replaceChildren(...nextRows); // заменяем старые строки на новые
    }

    return {...root, render}; // возвращаем контейнер, элементы и функцию render
}