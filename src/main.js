import './fonts/ys-display/fonts.css';
import './style.css';

import { processFormData } from "./lib/utils.js";
import { initTable } from "./components/table.js";
import { initPagination } from './components/pagination.js';
import { initSorting } from './components/sorting.js';
import { initFiltering } from './components/filtering.js';
import { initSearching } from './components/searching.js';
import { initData } from "./data.js";

let api;
let applyPagination;
let updatePagination;
let applyFiltering;
let updateIndexes;
let applySearching;
let applySorting;

// ИЗМЕНЕНО: Добавлена функция debounce для оптимизации поиска и фильтров
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    const rowsPerPage = parseInt(state.rowsPerPage) || 10;
    const page = parseInt(state.page) || 1;

    return {
        ...state,
        rowsPerPage,
        page
    };
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
async function render(action) {
    console.log('Render called with action:', action); // Для отладки
    const state = collectState();

    let query = {
        limit: state.rowsPerPage,
        page: state.page
    };
    
    if (applyFiltering) query = applyFiltering(query, state, action);
    if (applySearching) query = applySearching(query, state, action);
    if (applySorting) query = applySorting(query, state, action);
    if (applyPagination) query = applyPagination(query, state, action);

    try {
        const { total, items } = await api.getRecords(query, true);
        
        if (updatePagination) {
            updatePagination(total, query);
        }
        
        sampleTable.render(items);
    } catch (error) {
        console.error('Ошибка при рендеринге:', error);
    }
}

async function init() {
    api = initData();

    // Инициализируем пагинацию
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

    // Показываем начальные данные
    const initialData = api.getLocalData();
    if (initialData) {
        updatePagination(initialData.total, { page: 1, limit: 10 });
        sampleTable.render(initialData.items);
    }

    try {    
        const indexes = await api.getIndexes();

        applySearching = initSearching('search');

        // ИЗМЕНЕНО: Инициализируем сортировку и добавляем обработчики
        applySorting = initSorting([
            sampleTable.header.elements.sortByDate,
            sampleTable.header.elements.sortByTotal
        ]);

        // Добавляем обработчики кликов для кнопок сортировки
        const sortButtons = [
            sampleTable.header.elements.sortByDate,
            sampleTable.header.elements.sortByTotal
        ];
        
        sortButtons.forEach(btn => {
            if (btn) {
                // Удаляем старые обработчики, чтобы не было дублирования
                btn.removeEventListener('click', handleSortClick);
                // Добавляем новый обработчик
                btn.addEventListener('click', handleSortClick);
            }
        });

        // Инициализируем фильтрацию
        const filteringHandlers = initFiltering(sampleTable.filter.elements);
        applyFiltering = filteringHandlers.applyFiltering;
        updateIndexes = filteringHandlers.updateIndexes;

        updateIndexes(sampleTable.filter.elements, indexes);

        // ИЗМЕНЕНО: Добавляем обработчики для всех полей фильтрации
        const filterElements = sampleTable.filter.elements;
        
        // Обработчик для текстовых полей фильтрации (с debounce)
        const filterInputs = [
            filterElements.searchByDate,
            filterElements.searchByCustomer,
            filterElements.totalFrom,
            filterElements.totalTo
        ];
        
        filterInputs.forEach(input => {
            if (input) {
                // Удаляем старые обработчики
                input.removeEventListener('input', debouncedRender);
                // Добавляем новый с debounce
                input.addEventListener('input', debouncedRender);
            }
        });

        // Обработчик для селекта продавца
        if (filterElements.searchBySeller) {
            filterElements.searchBySeller.removeEventListener('change', renderHandler);
            filterElements.searchBySeller.addEventListener('change', renderHandler);
        }

        // ИЗМЕНЕНО: Обработчик для кнопок очистки полей
        const clearButtons = sampleTable.filter.container.querySelectorAll('button[name="clear"]');
        clearButtons.forEach(btn => {
            btn.removeEventListener('click', handleClearClick);
            btn.addEventListener('click', handleClearClick);
        });

        // ИЗМЕНЕНО: Обработчик для поиска
        const searchInput = sampleTable.container.querySelector('input[name="search"]');
        if (searchInput) {
            searchInput.removeEventListener('input', debouncedRender);
            searchInput.addEventListener('input', debouncedRender);
        }

        // ИЗМЕНЕНО: Обработчик для кнопки сброса
        const resetButton = sampleTable.container.querySelector('button[type="reset"]');
        if (resetButton) {
            resetButton.removeEventListener('click', handleResetClick);
            resetButton.addEventListener('click', handleResetClick);
        }

        // ИЗМЕНЕНО: Обработчик для изменения количества строк
        const rowsPerPageSelect = sampleTable.container.querySelector('select[name="rowsPerPage"]');
        if (rowsPerPageSelect) {
            rowsPerPageSelect.removeEventListener('change', handleRowsPerPageChange);
            rowsPerPageSelect.addEventListener('change', handleRowsPerPageChange);
        }

        // ИЗМЕНЕНО: Обработчики для кнопок пагинации
        const paginationButtons = sampleTable.pagination.container.querySelectorAll('button[type="submit"]');
        paginationButtons.forEach(btn => {
            btn.removeEventListener('click', handlePaginationClick);
            btn.addEventListener('click', handlePaginationClick);
        });

        // ИЗМЕНЕНО: Обработчик для радио-кнопок страниц
        const pageRadios = sampleTable.pagination.container.querySelectorAll('input[name="page"]');
        pageRadios.forEach(radio => {
            radio.removeEventListener('change', renderHandler);
            radio.addEventListener('change', renderHandler);
        });
        
    } catch (error) {
        console.error('Ошибка при инициализации приложения', error);
    }
}

// ИЗМЕНЕНО: Выносим обработчики в отдельные функции для удобства
function handleSortClick(e) {
    e.preventDefault();
    render(e.currentTarget);
}

function handleClearClick(e) {
    e.preventDefault();
    render(e.currentTarget);
}

function handleResetClick(e) {
    e.preventDefault();
    render(e.currentTarget);
}

function handleRowsPerPageChange(e) {
    // Сбрасываем на первую страницу
    const pageInput = sampleTable.container.querySelector('input[name="page"][value="1"]');
    if (pageInput) pageInput.checked = true;
    render();
}

function handlePaginationClick(e) {
    e.preventDefault();
    render(e.currentTarget);
}

function renderHandler() {
    render();
}

const debouncedRender = debounce(() => render(), 300);

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

// Запускаем инициализацию
init();