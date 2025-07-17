// src/app.js
import express from 'express';
import cors from 'cors';
import reviewRoutes from './routes/review.route.js';
import authRoute from './routes/auth.route.js';
import storeAdminRoute from './routes/admin/store.admin.route.js';
import categoryAdminRoute from './routes/admin/category.admin.route.js';
import userAdminRoute from './routes/admin/user.admin.route.js';
import publicStoreRoutes from './routes/public/store.public.route.js';
import publicCategoryRoutes from './routes/public/category.public.route.js';
import imageAdminRoute from './routes/admin/image.admin.route.js';
import visitorRoutes from './routes/visitor.routes.js';
import { startCronJobs } from './cron.js';

const app = express();

// ✅ CORS ก่อนทุกอย่าง
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));

// ✅ Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use('/api/admin/stores', storeAdminRoute);
app.use('/api/admin/categories', categoryAdminRoute);
app.use('/api/users', userAdminRoute);
app.use('/api/auth', authRoute);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin/images', imageAdminRoute);
app.use('/api/stores', publicStoreRoutes);
app.use('/api/categories', publicCategoryRoutes);
app.use('/api/visitor', visitorRoutes);

// ✅ Cron Job
startCronJobs();

export default app;