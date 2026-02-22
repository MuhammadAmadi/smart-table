import {getPages} from "../lib/utils.js";

export const initPagination = ({pages, fromRow, toRow, totalRows}, createPage) => {
    // @todo: #2.3 — подготовить шаблон кнопки для страницы и очистить контейнер
    const pageTemplate = pages.firstElementChild.cloneNode(true); // клонируем шаблон страницы
    pages.firstElementChild.remove(); // очищаем контейнер страниц

    let pageCount; // счетчик страниц для нумерации

    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        let page = state.page;

        if(action) {
            switch (action.name) {
                case 'prev': page = Math.max(1, page - 1); break; //переход на предыдущую страницу
                case 'next': page = Math.min(pageCount, page + 1); break; //переход на следующую страницу
                case 'first': page = 1; break; //переход на первую страницу
                case 'last': page = pageCount; break; //переход на последнюю страницу
            }
        }

        return Object.assign({}, query, {
            limit,
            page
        });
    };

    const updatePagination = (total, {page, limit}) => {

        if(!page || !limit) {
            console.error('Не указаны обязательные параметры пагинации: page и limit', {page, limit});
            return;
        }

        pageCount = Math.ceil(total / limit);

        // if(pageCount === 0) {
        //     const el = pageTemplate.cloneNode(true); // клонируем шаблон страницы
        //     pages.replaceChildren(createPage(el, 1, true)); // очищаем контейнер страниц, если нет данных
        //     fromRow.textContent = '0'; // обновляем номер первой строки
        //     toRow.textContent = '0'; // обновляем номер последней строки
        //     totalRows.textContent = '0'; // обновляем общее количество строк
        //     return;
        // }
        const displayPageCount = pageCount > 0 ? pageCount : 5; // количество отображаемых страниц (не менее 5)
        const visiblePages = getPages(page, displayPageCount, 5); // получаем массив видимых страниц

        pages.replaceChildren(...visiblePages.map(pageNumber => {
            const el = pageTemplate.cloneNode(true); // клонируем шаблон страницы
            return createPage(el, pageNumber, pageNumber === page); // создаем элемент страницы и возвращаем его
        }));

        fromRow.textContent = total === 0 ? '0' : (page - 1) * limit + 1; // обновляем номер первой строки
        toRow.textContent = total === 0 ? '0' : Math.min(page * limit, total); // обновляем номер последней строки
        totalRows.textContent = total; // обновляем общее количество строк
    };

    return {applyPagination, updatePagination};
}