import {createComparison, defaultRules} from "../lib/compare.js";

// @todo: #4.3 — настроить компаратор
const compare = createComparison(defaultRules);

export function initFiltering(elements, indexes) {
    // @todo: #4.1 — заполнить выпадающие списки опциями
    Object.keys(indexes).forEach(elementName => {
        elements[elementName].append(
            ...Object.values(indexes[elementName]).map(item => {
                const option = document.createElement('option');
                option.value = item;
                option.textContent = item;
                return option;
            })
        );
    });
    return (data, state, action) => {
        // @todo: #4.2 — обработать очистку поля
        if(action) {
            if(action.name === 'clear') {
                const field = action.dataset.field;
                if(field === 'date') {
                    elements.searchByDate.value = '';
                } else if (field === 'customer') {
                    elements.searchByCustomer.value = '';
                }
            } else if (action.dataset.name === 'reset') {
                elements.searchByDate.value = '';
                elements.searchByCustomer.value = '';
                elements.searchBySeller.value = '';
                elements.totalFrom.value = '';
                elements.totalTo.value = '';
            }
        }
        // @todo: #4.5 — отфильтровать данные используя компаратор
        const filterCriteria = {};
        Object.keys(state).forEach(key => {
            if (state[key] !== '') {
                filterCriteria[key] = state[key];
            }
        });

        if(state.totalFrom !== '' || state.totalTo !== '') { 
            const from = state.totalFrom !== '' ? parseFloat(state.totalFrom) : '';
            const to = state.totalTo !== '' ? parseFloat(state.totalTo) : '';
            filterCriteria.total = [from, to];
        }

        delete filterCriteria.totalFrom;
        delete filterCriteria.totalTo;

        return data.filter(row => compare(row, filterCriteria));
    }
}