export function initFiltering(elements) {
    const updateIndexes = (elements, indexes) => {
        // Очищаем и заполняем селект продавцов
        elements.searchBySeller.innerHTML = '<option value="" selected>-</option>';

        // Добавляем опции для каждого продавца
        if (indexes.sellers) {
            Object.values(indexes.sellers).forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                elements.searchBySeller.appendChild(option);
            });
        }
    };

    const applyFiltering = (query, state, action) => {
        // ИЗМЕНЕНО: Обработка action для очистки полей
        if (action) {
            if (action.name === 'clear') {
                const field = action.dataset.field;
                if (field === 'date') {
                    elements.searchByDate.value = '';
                } else if (field === 'customer') {
                    elements.searchByCustomer.value = '';
                }
                // Возвращаем query без изменений, но поля уже очищены
                // Данные обновятся при следующем render
            } else if (action.dataset?.name === 'reset') {
                elements.searchByDate.value = '';
                elements.searchByCustomer.value = '';
                elements.searchBySeller.value = '';
                elements.totalFrom.value = '';
                elements.totalTo.value = '';
                
                // Также очищаем поиск
                const searchInput = document.querySelector('input[name="search"]');
                if (searchInput) searchInput.value = '';
            }
        }

        const filter = {};

        // ИЗМЕНЕНО: Проверяем наличие элементов перед доступом к value
        if (elements.searchByDate && elements.searchByDate.value) {
            filter['filter[date]'] = elements.searchByDate.value;
        }
        
        if (elements.searchByCustomer && elements.searchByCustomer.value) {
            filter['filter[customer]'] = elements.searchByCustomer.value;
        }
        
        if (elements.searchBySeller && elements.searchBySeller.value && elements.searchBySeller.value !== '-') {
            filter['filter[seller]'] = elements.searchBySeller.value;
        }
        
        if (elements.totalFrom && elements.totalFrom.value) {
            filter['filter[totalFrom]'] = elements.totalFrom.value;
        }
        
        if (elements.totalTo && elements.totalTo.value) {
            filter['filter[totalTo]'] = elements.totalTo.value;
        }

        return Object.keys(filter).length ? { ...query, ...filter } : query;
    };

    return { updateIndexes, applyFiltering };
}