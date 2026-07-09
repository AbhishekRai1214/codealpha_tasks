const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require("./config/db")
dotenv.config();
const app = express();
connectDB();

const path = require('path');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/',(req,res)=>{
    res.send("Shopnest sever is working");
});


app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));


const PORT = process.env.PORT || 5000

app.listen(PORT, ()=>{
   console.log(`Server is started at Port ${PORT}`);  
})