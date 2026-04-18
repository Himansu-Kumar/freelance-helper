import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: ['https://freelance-helper-six.vercel.app', 'http://localhost:5173'],
  credentials: true
}));

// Route files
import auth from './routes/auth.js';
import clients from './routes/clients.js';
import projects from './routes/projects.js';
import invoices from './routes/invoices.js';

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/clients', clients);
app.use('/api/v1/projects', projects);
app.use('/api/v1/invoices', invoices);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
