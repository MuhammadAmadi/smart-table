
export function initSearching(searchField) {
    // @todo: #5.1 — настроить компаратор
    return (query, state, action) => {
        if(state[searchField] && state[searchField].trim() !== '') {
            return Object.assign({}, query, {
                search: state[searchField].trim()
            });
        }
        return query;
    };
}