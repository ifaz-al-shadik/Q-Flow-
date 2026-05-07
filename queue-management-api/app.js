import express from 'express';
import cors from 'cors';

import placesRouter from './routes/places.js';
import reportsRouter from './routes/reports.js';
import authRouter from './routes/auth.js';
import queuesRouter from './routes/queues.js';
import analyticsRouter from './routes/analytics.js';
import notificationsRouter from './routes/notifications.js';
import usersRouter from './routes/users.js';
import ratingsRouter from './routes/ratings.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/places', placesRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/auth', authRouter);
app.use('/api/queues', queuesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/users', usersRouter);
app.use('/api/ratings', ratingsRouter);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Q-Flow API is up and running' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

export default app;
