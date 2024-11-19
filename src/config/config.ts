import dotenv from 'dotenv';

dotenv.config();

const config = {
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/taskCostCalculatorDB',
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key'
};

export default config; 