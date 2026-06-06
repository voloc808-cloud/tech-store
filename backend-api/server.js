const express = require('express');
const cors = require('cors');

//tao ung dung express
const app = express();


// Cho phép Angular gọi API, neu khong co cors(), browser se chan request khac port
app.use(cors());
// Cho phép server Express đọc dữ liệu JSON gửi lên tu request body
app.use(express.json()); 

// ĐÂY CHÍNH LÀ MOCK DATA 
//nhung trong thuc te thi dung mysql, sqlserver, mongodb
let products = [
    {
        id: 1,
        name: 'iPhone 15',
        price: 1200,
        stock: 10,
        image: 'https://picsum.photos/300?1'
    },
    {
        id: 2,
        name: 'MacBook M3',
        price: 2000,
        stock: 5,
        image: 'https://picsum.photos/300?2'
    }
];

// API Endpoint: Gửi danh sách sản phẩm về cho Angular
app.get('/products', (req, res) => {
    res.json(products);
});

//-----------------------------
//get product by id
//-----------------------------

app.get('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const product = products.find(p => p.id === id);

    if  (!product){
        return res.status(404).json({
            message: 'Product not found'
        });
    }

    res.json(product);
});

//-----------------------------
//create product (POST prooduct)
//-----------------------------

app.post('/products', (req, res) => {
    const newProduct = req.body;

    products.push(newProduct);

    res.status(201).json({
        message: 'Product created successfully',
        data: newProduct
    });
});

//-----------------------------
//update product
//-----------------------------

app.put('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: 'Product not found'
        });
    }

    const updateProduct = req.body;

    // Đảm bảo id không bị lệch nếu client không gửi id
    products[index] = { ...products[index], ...updateProduct, id };

    res.json({
        message: 'Product updated successfully',
        data: products[index]
    });
});

//-----------------------------
//delete product
//-----------------------------

app.delete('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);

    products = products.filter(p => p.id !== id);

    res.json({
        message: 'Product deleted successfully'
    });

});

//-----------------------------
//home route
//-----------------------------

app.get('/', (req, res) => {
    res.send('Product api is running...');
});

//-----------------------------
//start server in port 3000
//-----------------------------
const PORT = 3000;
//khoi dong server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});