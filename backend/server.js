const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const adminRoutes = require('./routes/admin');

dotenv.config({ path: path.resolve(__dirname, '.env') });


connectDB();

const app = express();


app.use(cors());
app.use(express.json()); 
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', adminRoutes);


app.get('/', (req, res) => {
  res.send('AlumniConnect Backend Engine is Running...');
});

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`⚡ Server blazing on port ${PORT}`);
});