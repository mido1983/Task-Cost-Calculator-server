import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database';
import authRoutes from './routes/auth';
import { User } from './models/User';

const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
    credentials: true
}));

app.use(express.json());

app.get('/', async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); // Исключаем пароль из результата
        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: {
                totalUsers: users.length,
                users: users.map(user => ({
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    createdAt: user.createdAt,
                    role: user.role
                }))
            }
        });
    } catch (error: unknown) {
        console.error('Error fetching users:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            timestamp: new Date().toISOString(),
            error: {
                message: 'Server error while fetching users',
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            }
        });
    }
});
app.use('/api/auth', authRoutes);

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app; 