import {makeIndex} from "./lib/utils.js";
import {data as sourceData} from "./data/dataset_1.js";

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

    console.log('входные данные', data[0]);
    console.log('продавцы', sellers);
    console.log('покупатели', customers);

    return data.map(item => {
        const sellerName = sellers ? sellers[item.seller_id] : 'Неизвестно';
        const customerName = customers ? customers[item.customer_id] : 'Неизвестно';

        if(item.receipt_id === 'receipt_1') {
            console.log('Преобразование записи', {
                id: item.receipt_id,
                seller_id: item.seller_id,
                customer_id: item.customer_id,
                customer_name: customerName,
                expected_seller: 'Nikolai Ivanov',
                expected_customer: 'Andrey Alekseev'
            });
        }

        return {
            id: item.receipt_id,
            date: item.date,
            seller: sellerName,
            customer: customerName,
            total: item.total_amount
        }
    });
};

const getIndexes = async () => {
    if(!sellers || !customers) {
        [sellers, customers] = await Promise.all([
            fetch(`${BASE_URL}/sellers`).then(res => res.json()),
            fetch(`${BASE_URL}/customers`).then(res => res.json())
        ]);

        console.log('Загруженные продавцы', sellers);
        console.log('Загруженные покупатели', customers);

        const localData = initLocalData(sourceData);
        console.log('Локальные продавцы', localData.sellers);
        console.log('Локальные покупатели', localData.customers);
    }
    return { sellers, customers };
};

function initLocalData(sourceData) {
    const sellers = makeIndex(sourceData.sellers, 'id', v => `${v.first_name} ${v.last_name}`);
    const customers = makeIndex(sourceData.customers, 'id', v => `${v.first_name} ${v.last_name}`);
    return { sellers, customers };
}

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

        console.log('Преобразованные данные (первые 3)', lastResult.items.slice(0, 3));
        console.log('Ожидаемые данные (первые 3):', [
            { date: '2023-12-04', customer: 'Andrey Alekseev', seller: 'Nikolai Ivanov', total: 4657.56 },
            { date: '2023-12-04', customer: 'Andrey Alekseev', seller: 'Alexey Petrov', total: 5015.02 },
            { date: '2024-01-04', customer: 'Andrey Alekseev', seller: 'Alexey Petrov', total: 875.65 }
        ]);

        return lastResult;
    } catch (error) {
        console.error('Ошибка при загрузке данных', error);
        return { total: 0, items: [] };
    }
};

export function initData() {
    return { getIndexes, getRecords };
}