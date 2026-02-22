
export function initFiltering(elements) {
    const updateIndexes = (elements, indexes) => {
        elements.searchBySeller.innerHTML = '<option value="" selected>-</option>';

        Object.values(indexes.sellers).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            elements.searchBySeller.appendChild(option);
        });
    };

    const applyFiltering = (query, state, action) => {
        if(action) {
            if(action.name === 'clear') {
                const field = action.dataset.field;
                if(field === 'date') {
                    elements.searchByDate.value = '';
                } else if(field === 'customer') {
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

        const filter = {};

        if(elements.searchByDate.value) {
            filter['filter[date]'] = elements.searchByDate.value;
        }
        if(elements.searchByCustomer.value) {
            filter['filter[customer]'] = elements.searchByCustomer.value;
        }
        if(elements.searchBySeller.value) {
            filter['filter[seller]'] = elements.searchBySeller.value;
        }
        if(elements.totalFrom.value || elements.totalTo.value) {
            if(elements.totalFrom.value) {
                filter['filter[totalFrom]'] = elements.totalFrom.value;
            }
            if(elements.totalTo.value) {
                filter['filter[totalTo]'] = elements.totalTo.value;
            }
        }

        return Object.keys(filter).length ? Object.assign({}, query, filter) : query;
    };

    return {updateIndexes, applyFiltering};
}