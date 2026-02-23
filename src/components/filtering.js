// import {createComparison, defaultRules} from "../lib/compare.js";

// @todo: #4.3 — настроить компаратор
// const compare = createComparison(defaultRules);

export function initFiltering(elements) {
    // @todo: #4.1 — заполнить выпадающие списки опциями
    const updateIndexes = (indexes) => {
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
    }
    
    
    const applyFiltering = (query, state, action) => {
        // @todo: #4.2 — обработать очистку поля
        if(action) {
            if(action.name === 'clear') {
                const field = action.dataset.field;
                if(field === 'date') {
                    elements.searchByDate.value = '';
                } else if (field === 'customer') {
                    elements.searchByCustomer.value = '';
                }
            } else if (action.dataset?.name === 'reset') {
                elements.searchByDate.value = '';
                elements.searchByCustomer.value = '';
                elements.searchBySeller.value = '';
                elements.totalFrom.value = '';
                elements.totalTo.value = '';
            }
        }
        // @todo: #4.5 — отфильтровать данные используя компаратор
        const filterCriteria = {};
        // Object.keys(state).forEach(key => {
        //     if (state[key] !== '') {
        //         filterCriteria[key] = state[key];
        //     }
        // });

        Object.keys(elements).forEach(key => {
            
            const element = elements[key];
            if (element && ['INPUT', 'SELECT'].includes(element.tagName) && element.value) {
                let value = element.value
                if (key === 'totalFrom' || key === "totalTo") {
                    value = value.replace(/,/g, '.').replace(/\s/g, '');

                    if (isNaN(parseFloat(value))) return;
                }
                filterCriteria[`filter[${element.name}]`] = value;
            }

        })

        return Object.keys(filterCriteria).length ? Object.assign({}, query, filterCriteria) : query;
    }

    return { updateIndexes, applyFiltering };
}