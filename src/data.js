import {makeIndex} from "./lib/utils.js";

const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

export function initData() {
    let sellers;
    let customers;
    let lastResult;
    let lastQuery;

    const mapRecords = (data) => data.map(item => ({
        id: item.receipt_id,
        date: item.date,
        seller: sellers[item.seller_id],
        customer: customers[item.customer_id],
        total: item.total_amount
    }))

    const getIndexes = async () => {
        if (!sellers || !customers) {
            try {
                sellers = await fetch(`${BASE_URL}/sellers`).then(res => res.json());
                customers = await fetch(`${BASE_URL}/customers`).then(res => res.json())
            } catch (err) {
                console.error('Ошибка при получении sellers/customers в функции data/getIndexes', err)
            }
        }

        return { sellers, customers };
    }

    const getRecords = async (query, isUpdate = false) => {
        console.log('Функция data/getRecords')
        const qs = new URLSearchParams(query);
        const nextQuery = qs.toString();
        console.log('функция data/getRecords параметр query', query)
        console.log('функция data/getRecords переменная nextQuery', nextQuery)

        if (lastQuery === nextQuery && !isUpdate){
            console.log('Запрос data/getRecords не поменялся / выход из getRecords')
            return lastResult;
        }

        console.log('Запрос data/getRecords поменялся продолжить')

        const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
        const records = await response.json();

        lastQuery = nextQuery;
        lastResult = {
            total: records.total,
            items: mapRecords(records.items)
        };

        return lastResult;
    };

    return {
        getIndexes,
        getRecords
    }
}