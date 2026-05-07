import request from 'supertest';
import { jest } from '@jest/globals';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';

import queuesRouter from '../routes/queues.js';
import User from '../models/User.js';
import Place from '../models/Place.js';
import Queue from '../models/Queue.js';

const app = express();
app.use(express.json());

// Set mock JWT secret for test environment
process.env.JWT_SECRET = 'testsecret';

app.use('/api/queues', queuesRouter);

let mongoServer;
let authToken = '';
let userId;
let placeId;

jest.setTimeout(600000); // 10 minutes for mongodb binary download

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // Create a mock user
    const user = await User.create({
        name: 'Test User',
        email: 'test@user.com',
        password: 'password123',
        avatar: 'TU',
        role: 'visitor'
    });
    userId = user._id;

    // Generate token programmatically as required
    authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Create a mock place
    const place = await Place.create({
        name: 'Test Place',
        type: 'Healthcare',
        location: { type: 'Point', coordinates: [0, 0] },
        currentWaitTime: 10,
        liveQueueCount: 0
    });
    placeId = place._id;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    // Clear queues after each test
    await Queue.deleteMany({});
});

describe('Feature: Queue Management (ID: 22101330)', () => {
    let queueId;

    // Case A: Positive Flow (Happy Path)
    describe('Case A: Positive Flow', () => {
        it('should join a new queue (Create)', async () => {
            const res = await request(app)
                .post('/api/queues')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    serviceId: placeId,
                    serviceName: 'Test Place',
                    serviceType: 'Healthcare'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.status).toBe('waiting');
            queueId = res.body._id;
        });

        it('should retrieve active queues (Read)', async () => {
            // Setup a queue first
            await Queue.create({
                user: userId,
                serviceId: placeId,
                serviceName: 'Test Place',
                serviceType: 'Healthcare',
                position: 1,
                estimatedWait: 10,
                status: 'waiting'
            });

            const res = await request(app)
                .get('/api/queues')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBe(1);
        });

        it('should mark queue as arrived (Update)', async () => {
            const q = await Queue.create({
                user: userId,
                serviceId: placeId,
                serviceName: 'Test Place',
                serviceType: 'Healthcare',
                position: 1,
                estimatedWait: 10,
                status: 'waiting'
            });

            const res = await request(app)
                .patch(`/api/queues/${q._id}/arrive`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('arrived');
        });
    });

    // Case B: Negative Flow (Error Handling)
    describe('Case B: Negative Flow', () => {
        it('should return 400 if service details are missing (Validation Error)', async () => {
            const res = await request(app)
                .post('/api/queues')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    serviceName: 'Test Place'
                    // Missing serviceId and serviceType
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toBe('Please provide all service details');
        });

        it('should return 404 for arriving at non-existent queue (Resource Not Found)', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .patch(`/api/queues/${fakeId}/arrive`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toBe('Queue entry not found');
        });
    });

    // Case C: Security & Boundary
    describe('Case C: Security & Boundary', () => {
        it('should return 401 if unauthorized access (No Token)', async () => {
            const res = await request(app)
                .get('/api/queues'); // No auth header

            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toBe('Not authorized, no token');
        });
    });
});
