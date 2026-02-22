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
    let state = collectState(); // состояние полей из таблицы

    if(!state.rowsPerPage) state.rowsPerPage = 10; // значение по умолчанию для количества строк на странице
    if(!state.page) state.page = 1; // значение по умолчанию для текущей страницы

    let query = {
       limit: state.rowsPerPage,
       page: state.page
    }; // копируем для последующего изменения
    
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

    const {total, items} = await api.getRecords(query);

    if(updatePagination) {
        updatePagination(total, query);
    }

    sampleTable.render([]);
}

async function init() {
    api = initData();
    try {    
        const indexes = await api.getIndexes();

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
        
        await render();
        
    } catch (error) {
        console.error('Ошибка при инициализации приложения', error);
    }
}


const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

Promise.resolve().then(() => {
    init();
});
