require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');   

const app = express();

app.use(cors());
app.use(express.json()); 

const JWT_SECRET = process.env.JWT_SECRET || 'techstore_secret_key_2026'; // Khóa bí mật JWT

// -----------------------------
// KẾT NỐI MONGODB ATLAS
// -----------------------------
const mongoURI = process.env.MONGO_URI; 

mongoose.connect(mongoURI)
    .then(() => console.log('✅ Đã kết nối với MongoDB Atlas thành công!'))
    .catch(err => console.error('❌ Lỗi kết nối MongoDB Atlas:', err));

// -----------------------------
// TẠO SCHEMA VÀ MODEL
// -----------------------------
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    image: { type: String }
});
const Product = mongoose.model('Product', productSchema);

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' }
}, { timestamps: true });
const User = mongoose.model('User', userSchema);


// -----------------------------
// API ĐĂNG KÝ & ĐĂNG NHẬP
// -----------------------------

// 1. API Đăng ký tài khoản mới
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const u = username.trim();

        if (!u || !password || password.length < 4) {
            return res.status(400).json({ message: 'Dữ liệu không hợp lệ hoặc mật khẩu quá ngắn!' });
        }

        const existingUser = await User.findOne({ username: u });
        if (existingUser) {
            return res.status(400).json({ message: 'Username này đã tồn tại rồi!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const isFirstAccount = (await User.countDocuments({})) === 0;
        const role = isFirstAccount ? 'admin' : 'user';

        const newUser = new User({ username: u, password: hashedPassword, role });
        await newUser.save();

        res.status(201).json({ message: 'Đăng ký tài khoản thành công!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. API Đăng nhập hoàn chỉnh
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username.trim() });
        
        if (!user) {
            return res.status(400).json({ message: 'Tài khoản hoặc mật khẩu không chính xác!' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Tài khoản hoặc mật khẩu không chính xác!' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            message: 'Đăng nhập thành công!',
            token,
            user: { username: user.username, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// -----------------------------
// API ENDPOINTS SẢN PHẨM (ĐÃ TÍCH HỢP TÌM KIẾM MONGODB)
// -----------------------------

// Sửa lại hàm này để tìm kiếm trực tiếp trên dữ liệu thật MongoDB Atlas
app.get('/products', async (req, res) => {
    try {
        const keyword = req.query.q;
        let query = {};

        // Nếu có từ khóa tìm kiếm gửi từ Angular lên
        if (keyword) {
            // Tìm sản phẩm có tên chứa từ khóa, không phân biệt hoa thường ('i')
            query.name = { $regex: keyword, $options: 'i' };
        }

        const products = await Product.find(query); 
        res.json(products);
    } 
    catch (error) { 
        res.status(500).json({ message: error.message }); 
    }
});

app.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) { res.status(500).json({ message: 'Lỗi định dạng ID' }); }
});

app.post('/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ message: 'Product created successfully', data: newProduct });
    } catch (error) { res.status(400).json({ message: error.message }); }
});

app.put('/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product updated successfully', data: updatedProduct });
    } catch (error) { res.status(400).json({ message: error.message }); }
});

app.delete('/products/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) { 
        res.status(500).json({ message: error.message }); 
    }
});

app.get('/', (req, res) => { res.send('Product API is running with MongoDB Atlas...'); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Server is running at http://localhost:${PORT}`); });