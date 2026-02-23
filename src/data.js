import { data as localData } from './data/dataset_1.js'
const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

let sellers;
let customers;
let lastResult;
let lastQuery;
let localDataStore = null;

function buildLocalData() {
    const sellersIndex = localData.sellers.reduce((acc, s) => {
        acc[s.id] = `${s.first_name} ${s.last_name}`;
        return acc;
    }, {})

    const customersIndex = localData.customers.reduce((acc, c) => {
        acc[c.id] = `${c.first_name} ${c.last_name}`;
        return acc;
    }, {})

    const records = localData.purchase_records.map(r => ({
        id: r.receipt_id,
        date: r.date,
        seller: sellersIndex[r.seller_id],
        customer: customersIndex[r.customer_id],
        total: r.total_amount
    }))

    return {
        sellers: sellersIndex,
        customers: customersIndex,
        records
    }
}

const mapRecords = (data) => data.map(item => ({
    id: item.receipt_id,
    date: item.date,
    seller: sellers[item.seller_id],
    customer: customers[item.customer_id],
    total: item.total_amount
}));

function filterRecords(records, query) {
    return records.filter(record => {
        if (query['filter[date]'] && !record.date.includes(query['filter[date]'])) {
            return false;
        }

        if (query['filter[customer]'] && !record.customer.toLowerCase().includes(query['filter[customer]'].toLowerCase())) {
            return false;
        }

        if (query['filter[seller]'] && !record.seller.toLowerCase().includes(query['filter[seller]'].toLowerCase())) {
            return false;
        }

        if (query['filter[totalFrom]']) {
            const from = parseFloat(query['filter[totalFrom]']);
            if (!isNaN(from) && record.total < from) return false;
        }

        if (query['filter[totalTo]']) {
            const to = parseFloat(query['filter[totalTo]']);
            if (!isNaN(to) && record.total > to) return false;
        }

        if (query.search) {
            const searchTerm = query.search.toLowerCase();
            const inDate = record.date.toLowerCase().includes(searchTerm);
            const inCustomer = record.customer.toLowerCase().includes(searchTerm);
            const inSeller = record.seller.toLowerCase().includes(searchTerm);
            const inTotal = record.total.toString().includes(searchTerm);
            
            if (!inDate && !inCustomer && !inSeller && !inTotal) return false;
        }
        
        return true;
    })
}

function sortRecords(records, sortParam) {
    if (!sortParam) return records;
    
    const [field, order] = sortParam.split(':');
    if (!field || !order) return records;

    return [...records].sort((a, b) => {
        let valA, valB;
        
        if (field === 'date') {
            // Правильное сравнение дат
            valA = new Date(a.date).getTime();
            valB = new Date(b.date).getTime();
        } else if (field === 'total') {
            valA = a.total;
            valB = b.total;
        } else {
            return 0;
        }

        if (order === 'up') {
            return valA > valB ? 1 : valA < valB ? -1 : 0;
        } else if (order === 'down') {
            return valA < valB ? 1 : valA > valB ? -1 : 0;
        }
        
        return 0;
    });
}

const getIndexes = async () => {
    if (!sellers || !customers) {
        try {
            [sellers, customers] = await Promise.all([
                fetch(`${BASE_URL}/sellers`).then(res => {
                    if (!res.ok) throw new Error('Ошибка получения продавцов');
                    return res.json();
                }),
                fetch(`${BASE_URL}/customers`).then(res => {
                    if (!res.ok) throw new Error('Ошибка получения покупателей');
                    return res.json();
                })
            ]);
        } catch (e) {
            console.warn('Ошибка API получения продавцов/покупателей, используются локальные данные', e);
            if (!localDataStore) localDataStore = buildLocalData();
            sellers = localDataStore.sellers;
            customers = localDataStore.customers;
        }
    }

    return {
        sellers,
        customers
    };
};

const getRecords = async (query, isUpdate = false) => {
    const qs = new URLSearchParams(query);
    const nextQuery = qs.toString();

    if (lastQuery === nextQuery && !isUpdate) {
        return lastResult;
    }

    try {
        const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
        if (!response.ok) throw new Error(`Ошибка при загрузке данных: ${response.statusText}`);

        const records = await response.json();

        lastQuery = nextQuery;
        lastResult = {
            total: records.total,
            items: mapRecords(records.items)
        };

        return lastResult;
    } catch (e) {
        console.warn('Ошибка API получения записей, используются локальные данные', e);
        
        // Инициализируем локальные данные если нужно
        if (!localDataStore) localDataStore = buildLocalData();

        // Применяем фильтрацию
        let filtered = filterRecords(localDataStore.records, query);
        
        // Применяем сортировку
        const sorted = sortRecords(filtered, query.sort);
        
        // Получаем общее количество после фильтрации
        const total = sorted.length;

        // Применяем пагинацию
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const start = (page - 1) * limit;
        const end = start + limit;
        const items = sorted.slice(start, end);

        lastQuery = nextQuery;
        lastResult = { total, items };
        
        return lastResult;
    }
};

function getLocalData() {
    if (!localDataStore) localDataStore = buildLocalData();
    const items = localDataStore.records.slice(0, 10);
    return {
        total: localDataStore.records.length,
        items
    };
}

export function initData() {
    return { getIndexes, getRecords, getLocalData };
}