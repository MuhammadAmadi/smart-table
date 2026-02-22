const express = require('express');
const cors = require('cors');

(async () => {
  const { data } = await import('./src/data/dataset_1.js');

  const app = express();
  const PORT = 3000;

  app.use(cors());

  const sellers = data.sellers.reduce((acc, seller) => {
    acc[seller.id] = `${seller.first_name} ${seller.last_name}`;
    return acc;
  }, {});

  const customers = data.customers.reduce((acc, customer) => {
    acc[customer.id] = `${customer.first_name} ${customer.last_name}`;
    return acc;
  }, {});

  const allRecords = data.purchase_records.map(item => ({
    receipt_id: item.receipt_id,
    date: item.date,
    seller_id: item.seller_id,
    customer_id: item.customer_id,
    total_amount: item.total_amount
  }));

  app.get('/sellers', (req, res) => {
    res.json(sellers);
  });

  app.get('/customers', (req, res) => {
    res.json(customers);
  });

  app.get('/records', (req, res) => {
    let result = [...allRecords];

    if (req.query['filter[date]']) {
      const dateFilter = req.query['filter[date]'];
      result = result.filter(item => item.date.includes(dateFilter));
    }

    if (req.query['filter[customer]']) {
      const customerFilter = req.query['filter[customer]'].toLowerCase();
      result = result.filter(item => customers[item.customer_id].toLowerCase().includes(customerFilter));
    }
    if (req.query['filter[seller]']) {
      const sellerFilter = req.query['filter[seller]'].toLowerCase();
      result = result.filter(item => sellers[item.seller_id] === sellerFilter);
    }
    if (req.query['filter[totalFrom]']) {
      const totalFrom = parseFloat(req.query['filter[totalFrom]']);
      if (!isNaN(totalFrom)) {
        result = result.filter(item => item.total_amount >= totalFrom);
      }
    }
    if (req.query['filter[totalTo]']) {
      const totalTo = parseFloat(req.query['filter[totalTo]']);
      if (!isNaN(totalTo)) {
        result = result.filter(item => item.total_amount <= totalTo);
      }
    }
    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      result = result.filter(item =>
        item.date.toLowerCase().includes(searchTerm) ||
        customers[item.customer_id].toLowerCase().includes(searchTerm) ||
        sellers[item.seller_id].toLowerCase().includes(searchTerm) ||
        item.total_amount.toString().includes(searchTerm)
      );
    }

    if (req.query.sort) {
      const [field, order] = req.query.sort.split(':');
      if (field === 'date' || field === 'total_amount') {
        result.sort((a, b) => {
          let valA = field === 'date' ? a.date : a.total_amount;
          let valB = field === 'date' ? b.date : b.total_amount;
          if (order === 'asc' || order === 'up') {
            return valA > valB ? 1 : -1;
          } else if (order === 'desc' || order === 'down') {
            return valA < valB ? 1 : -1;
          }
          return 0;
        });
      }
    }

    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const start = (page - 1) * limit;
    const end = start + limit;
    const items = result.slice(start, end);

    res.json({
      total: result.length,
      items: items
    });

  });

  app.listen(PORT, () => {
    console.log(`Мок сервер запущен на http://localhost:${PORT}`);
  });

})();