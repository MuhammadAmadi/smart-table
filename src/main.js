import './fonts/ys-display/fonts.css';
import './style.css';

import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
// @todo: подключение
import { initPagination } from './components/pagination.js';
import { initSorting } from './components/sorting.js';
import { initFiltering } from './components/filtering.js';
import { initSearching } from './components/searching.js';

import {initData} from "./data.js";

let isLoading = false;
let loadingEl = null

let api;
let applyPagination;
let updatePagination;
let applyFiltering;
let updateIndexes;
let applySearching;
let applySorting;

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    const rowsPerPage = parseInt(state.rowsPerPage);
    const page = parseInt(state.page ?? 1);

    return {
        ...state,
        rowsPerPage,
        page
    };
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search','header', 'filter'],
    after: ['pagination']
}, render);

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
async function render(action) {
    isLoading = true;
    if(loadingEl) loadingEl.style.display = 'block'; // отображаем индикатор загрузки, если он есть

    let state = collectState(); // состояние полей из таблицы

    if(!state.rowsPerPage) state.rowsPerPage = 10; // значение по умолчанию для количества строк на странице
    if(!state.page) state.page = 1; // значение по умолчанию для текущей страницы

    let query = {
       limit: state.rowsPerPage,
       page: state.page
    }; // копируем для последующего изменения
    // @todo: использование
    // result = applySearching(result, state, action);
    // result = applyFiltering(result, state, action);
    // result = applySorting(result, state, action);
    // result = applyPagination(result, state, action);

    if(action?.dataset?.name === 'reset') {
        console.log('Сброс фильтров');
    }
    
    if(applyFiltering) {
        query = applyFiltering(query, state, action);
    }
    if(applySearching) {
        query = applySearching(query, state, action);
    }
    if(applySorting) {
        query = applySorting(query, state, action);
    }
    if(applyPagination) {
        query = applyPagination(query, state, action);
    }

    console.log('Итоговый запрос', query);

    const {total, items} = await api.getRecords(query);

    isLoading = false;
    if(loadingEl) loadingEl.style.display = 'none'; // скрываем индикатор загрузки, если он есть

    if(updatePagination) {
        updatePagination(total, query);
    }

    if(items && items.length > 0) {
        sampleTable.render(items);
    } else {
        console.warn('Нет данных для отображения');
        sampleTable.render([]);
    }
}



// @todo: инициализация
// const applyPagination = initPagination(
//     sampleTable.pagination.elements,
//     (el, page, isCurrent) => {
//         const input = el.querySelector('input');
//         const label = el.querySelector('span');
//         input.value = page;
//         input.checked = isCurrent;
//         label.textContent = page;
//         return el;  
//     }
// );

async function init() {
    console.log('Инициализация приложения...');
    api = initData();
    try {    
        const indexes = await api.getIndexes();
        console.log('Полученные индексы', indexes);

        applySearching = initSearching('search');

        applySorting = initSorting([
            sampleTable.header.elements.sortByDate,
            sampleTable.header.elements.sortByTotal
        ]);

        const filteringHandlers = initFiltering(sampleTable.filter.elements);
        applyFiltering = filteringHandlers.applyFiltering;
        updateIndexes = filteringHandlers.updateIndexes;

        updateIndexes(sampleTable.filter.elements, indexes);

        const paginationHandlers = initPagination(
            sampleTable.pagination.elements,
            (el, page, isCurrent) => {
                const input = el.querySelector('input');
                const label = el.querySelector('span');
                input.value = page;
                input.checked = isCurrent;
                label.textContent = page;
                return el;
            }
        );

        applyPagination = paginationHandlers.applyPagination;
        updatePagination = paginationHandlers.updatePagination;
        console.log('Инициализация завершена, выполняется первый рендер...');
        await render();
        console.log('Первый рендер завершен');
    } catch (error) {
        console.error('Ошибка при инициализации приложения', error);
        if(loadingEl) {
            loadingEl.style.display = 'none'; // скрываем индикатор загрузки, если он есть
            const errorEl = document.createElement('div');
            errorEl.style.cssText = 'padding: 20px; background: #ffdddd; border: 1px solid #ff0000; margin: 10px; color: #000;';
            errorEl.textContent = 'Ошибка при загрузке данных: ' + error.message;
           appRoot.prepend(errorEl);
        }
    }
}

// const applySorting = initSorting([
//     sampleTable.header.elements.sortByDate,
//     sampleTable.header.elements.sortByTotal
// ]);

// const applyFiltering = initFiltering(sampleTable.filter.elements, {
//     searchBySeller: indexes.sellers
// });

// const applySearching = initSearching('search');


const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

loadingEl = document.createElement('div');
loadingEl.id = 'loading';
loadingEl.style.cssText = 'display: none; padding: 20px; text-align: center; background: #f0f0f0; border: 1px solid #ccc; margin: 10px;';
loadingEl.textContent = 'Загрузка...';
appRoot.prepend(loadingEl);

document.addEventListener('DOMContentLoaded', async() => {
    try {
        console.log('Инициализация приложения...');
        await init();
        console.log('Приложение успешно инициализировано');
    } catch (error) {
        console.error('Ошибка при инициализации приложения', error);
    }
});
