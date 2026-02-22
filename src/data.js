import {makeIndex} from "./lib/utils.js";
import {data as sourceData} from "./data/dataset_1.js";
import { createComparison, defaultRules, rules } from "./lib/compare.js";
import { sortCollection } from "./lib/sort.js";

const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

const sellers = makeIndex(sourceData.sellers, 'id', v => `${v.first_name} ${v.last_name}`);
const customers = makeIndex(sourceData.customers, 'id', v => `${v.first_name} ${v.last_name}`);

const allRecords = sourceData.purchase_records.map(item => ({
    id: item.receipt_id,
    date: item.date,
    seller: sellers[item.seller_id],
    customer: customers[item.customer_id],
    total: item.total_amount
}));

const compare = createComparison(defaultRules);

const parseFilter = (query) => {
    const filter = {};
    if(query['filter[date]']) filter.date = query['filter[date]'];
    if(query['filter[customer]']) filter.customer = query['filter[customer]'];
    if(query['filter[seller]']) filter.seller = query['filter[seller]'];
    if(query['filter[totalFrom]'] || query['filter[totalTo]']) {
        const from = parseFloat(query['filter[totalFrom]']);
        const to = parseFloat(query['filter[totalTo]']);
        if(!isNaN(from) || !isNaN(to)) {
            filter.total = [isNaN(from) ? null : from, isNaN(to) ? null : to];
        }
    }
    return filter;
};

let lastResult = null;
let lastQuery = null;

const getIndexes = async () => {
    await new Promise(resolve => setTimeout(resolve, 10)); // имитация задержки
    return { sellers, customers };
};

const getRecords = async (query, isUpdate = false) => {
    await new Promise(resolve => setTimeout(resolve, 10)); // имитация задержки

    const nextQuery = JSON.stringify(query);

    if(lastQuery === nextQuery && !isUpdate && lastResult) {
        return lastResult;
    }
    let result = [...allRecords];

    const filter = parseFilter(query);
    if(Object.keys(filter).length > 0) {
        result = result.filter(item => compare(item, filter, [
            rules.skipNonExistentSourceFields(item),
            rules.skipEmptyTargetValues(),
            rules.failOnEmptySource(),
            rules.arrayAsRange(),
            rules.stringIncludes(),
            rules.exactEquality()
        ]));
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

    lastQuery = nextQuery;
    lastResult = { total, items };

    return lastResult;
};

export function initData() {
    return { getIndexes, getRecords };
}