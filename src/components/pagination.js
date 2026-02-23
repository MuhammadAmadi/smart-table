import {getPages} from "../lib/utils.js";

export const initPagination = ({pages, fromRow, toRow, totalRows}, createPage) => {
    // @todo: #2.3 — подготовить шаблон кнопки для страницы и очистить контейнер
    const pageTemplate = pages.firstElementChild.cloneNode(true); // клонируем шаблон страницы
    pages.firstElementChild.remove(); // очищаем контейнер страниц

    return (data, state, action) => {
        // @todo: #2.1 — посчитать количество страниц, объявить переменные и константы
        const rowsPerPage = state.rowsPerPage; // количество строк на странице
        const pageCount = Math.ceil(data.length / rowsPerPage); // общее количество страниц
        let page = state.page; // текущая страница

        // @todo: #2.6 — обработать действия
        if (action) switch (action.name) { 
            case 'prev': page = Math.max(1, page - 1); break; //переход на предыдущую страницу
            case 'next': page = Math.min(pageCount, page + 1); break; //переход на следующую страницу
            case 'first': page = 1; break; //переход на первую страницу
            case 'last': page = pageCount; break; //переход на последнюю страницу
        }

        // @todo: #2.4 — получить список видимых страниц и вывести их
        const visiblePages = getPages(page, pageCount, 5); // получаем видимые страницы с лимитом 5
        pages.replaceChildren(...visiblePages.map(pageNumber => { // создаем элементы страниц
            const el = pageTemplate.cloneNode(true); // клонируем шаблон страницы
            return createPage(el, pageNumber, pageNumber === page); // создаем страницу с выделением текущей
        }));

        // @todo: #2.5 — обновить статус пагинации
        fromRow.textContent = (page - 1) * rowsPerPage + 1; // вычисляем номер первой строки на странице
        toRow.textContent = Math.min(page * rowsPerPage, data.length); // вычисляем номер последней строки на странице
        totalRows.textContent = data.length; // общее количество строк

        // @todo: #2.2 — посчитать сколько строк нужно пропустить и получить срез данных
        const skip = (page - 1) * rowsPerPage; // количество строк для пропуска
        return data.slice(skip, skip + rowsPerPage); // возвращаем срез данных для текущей страницы
    }
}