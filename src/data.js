// import {makeIndex} from "./lib/utils.js";
// import {data as sourceData} from "./data/dataset_1.js";

const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

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

    console.log('запрос', nextQuery);

    if(lastQuery === nextQuery && !isUpdate) {
        return lastResult;
    }

    const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
    const records = await response.json();

    console.log('ответ', records);

    lastQuery = nextQuery;
    lastResult = {
        total: records.total,
        items: mapRecords(records.items)
    };

    return lastResult;
};

export function initData() {
    return {getIndexes, getRecords};
}