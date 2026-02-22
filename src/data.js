import {makeIndex} from "./lib/utils.js";
import {data as sourceData} from "./data/dataset_1.js";
// import { createComparison, defaultRules, rules } from "./lib/compare.js";
import { sortCollection } from "./lib/sort.js";

// const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

const sellers = makeIndex(sourceData.sellers, 'id', v => `${v.first_name} ${v.last_name}`);
const customers = makeIndex(sourceData.customers, 'id', v => `${v.first_name} ${v.last_name}`);

const allRecords = sourceData.purchase_records.map(item => ({
    id: item.receipt_id,
    date: item.date,
    seller: sellers[item.seller_id],
    customer: customers[item.customer_id],
    total: item.total_amount
}));


const getIndexes = async () => {
    await new Promise(resolve => setTimeout(resolve, 10)); // имитация задержки
    return { sellers, customers };
};

const getRecords = async (query, isUpdate = false) => {
    await new Promise(resolve => setTimeout(resolve, 10)); // имитация задержки

    let result = [...allRecords];

    if(query['filter[date]']) {
        const dateFilter = query['filter[date]'];
        result = result.filter(item => item.date.includes(dateFilter));
    }

    if(query['filter[customer]']) {
        const customerFilter = query['filter[customer]'].toLowerCase();
        result = result.filter(item => item.customer.toLowerCase().includes(customerFilter));
    }

    if(query['filter[seller]']) {
        const sellerFilter = query['filter[seller]'];
        result = result.filter(item => item.seller === sellerFilter);
    }

    const totalFrom = parseFloat(query['filter[totalFrom]']);
    const totalTo = parseFloat(query['filter[totalTo]']);
    if (!isNaN(totalFrom) || !isNaN(totalTo)) {
        result = result.filter(item => {
            if (!isNaN(totalFrom) && item.total < totalFrom) return false;
            if (!isNaN(totalTo) && item.total > totalTo) return false;
            return true;
        });
    }

    if (query.search) {
        const searchTerm = query.search.toLowerCase();
        result = result.filter(item =>
            item.date.toLowerCase().includes(searchTerm) ||
            item.customer.toLowerCase().includes(searchTerm) ||
            item.seller.toLowerCase().includes(searchTerm)
            // || item.total.toString().toLowerCase().includes(searchTerm)
        );
    }

    if (query.sort) {
        const [field, order] = query.sort.split(':');
        if (field && order) {
            result = sortCollection(result, field, order);
        }
    }

    const total = result.length;
    const limit = parseInt(query.limit) || 10;
    const page = parseInt(query.page) || 1;
    const start = (page - 1) * limit;
    const end = start + limit;
    const items = result.slice(start, end);

    return { total, items };
};

export function initData() {
    return { getIndexes, getRecords };
}