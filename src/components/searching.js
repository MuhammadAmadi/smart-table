export function initSearching(searchField) {
    return (query, state, action) => {
        // ИЗМЕНЕНО: Игнорируем action для поиска, используем только state
        const searchValue = state[searchField];
        if (searchValue && searchValue.trim() !== '') {
            return {
                ...query,
                search: searchValue.trim()
            };
        }
        return query;
    };
}