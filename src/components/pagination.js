import { getPages } from "../lib/utils.js";

export const initPagination = ({ pages, fromRow, toRow, totalRows }, createPage) => {
    // Сохраняем шаблон страницы
    const pageTemplate = pages.firstElementChild ? pages.firstElementChild.cloneNode(true) : null;
    pages.innerHTML = ''; // Очищаем контейнер

    let pageCount = 1;

    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        let page = state.page;

        if (action) {
            switch (action.name) {
                case 'prev':
                    page = Math.max(1, page - 1);
                    break;
                case 'next':
                    page = Math.min(pageCount, page + 1);
                    break;
                case 'first':
                    page = 1;
                    break;
                case 'last':
                    page = pageCount;
                    break;
            }
        }

        return {
            ...query,
            limit,
            page
        };
    };

    const updatePagination = (total, { page, limit }) => {
        if (!page || !limit) {
            console.error('Не указаны обязательные параметры пагинации: page и limit', { page, limit });
            return;
        }

        pageCount = Math.ceil(total / limit) || 1;

        if (pageCount === 0 || total === 0 || !pageTemplate) {
            pages.innerHTML = '';
            fromRow.textContent = '0';
            toRow.textContent = '0';
            totalRows.textContent = '0';
            return;
        }

        const visiblePages = getPages(page, pageCount, 5);

        pages.innerHTML = ''; // Очищаем перед добавлением новых
        visiblePages.forEach(pageNumber => {
            const el = pageTemplate.cloneNode(true);
            const pageElement = createPage(el, pageNumber, pageNumber === page);
            pages.appendChild(pageElement);
        });

        fromRow.textContent = total === 0 ? '0' : (page - 1) * limit + 1;
        toRow.textContent = total === 0 ? '0' : Math.min(page * limit, total);
        totalRows.textContent = total;
    };

    return { applyPagination, updatePagination };
};