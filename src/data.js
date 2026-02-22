// import {makeIndex} from "./lib/utils.js";
// import {data as sourceData} from "./data/dataset_1.js";

const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

let sellers;
let customers;
let lastResult;
let lastQuery;

const mapRecords = (data) => {
    if(!data || !Array.isArray(data)) {
        console.error('Некорректные данные для отображения', data);
        return [];
    }

    return data.map(item => {
        const mapped = {
            id: item.receipt_id,
            date: item.date,
            seller: sellers ? sellers[item.seller_id] : 'Неизвестно',
            customer: customers ? customers[item.customer_id] : 'Неизвестно',
            total: item.total_amount
        };
        return mapped;
    });
};

const getIndexes = async () => {
    if(!sellers || !customers) {
        [sellers, customers] = await Promise.all([
            fetch(`${BASE_URL}/sellers`).then(res => res.json()),
            fetch(`${BASE_URL}/customers`).then(res => res.json())
        ]);
    }
    return { sellers, customers };
};

const getRecords = async (query, isUpdate = false) => {
    const nextQuery = new URLSearchParams(query).toString();

    console.log('=== ВЫЗОВ API ===');
    console.log('Объект запроса', query);
    console.log('Строка запроса', nextQuery);
    console.log('Полный URL', `${BASE_URL}/records?${nextQuery}`);

    if(lastQuery === nextQuery && !isUpdate) {
        console.log('=== ИСПОЛЬЗОВАНИЕ КЭША ===');
        return lastResult;
    }

    try {
        const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
        console.log('Статус ответа', response.status);
        if(!response.ok) {
            throw new Error(`Ошибка при загрузке данных: ${response.status}`);
        }

        const records = await response.json();
        console.log('Ответ API', records);

        if(!records || !records.items) {
            console.error('Некорректный ответ API', records);
            return { total: 0, items: [] };
        }

        lastQuery = nextQuery;
        lastResult = {
            total: records.total,
            items: mapRecords(records.items)
        };

        console.log('Преобразованные данные', lastResult.items);

        return lastResult;
    } catch (error) {
        console.error('Ошибка при загрузке данных', error);
        return { total: 0, items: [] };
    }
};

export function initData() {
    return { getIndexes, getRecords };
}