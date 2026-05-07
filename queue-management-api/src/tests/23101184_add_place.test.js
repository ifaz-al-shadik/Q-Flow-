/**
 * ============================================================
 *  Test Suite  : Add Place Feature — Full CRUD
 *  Student ID  : 23101184
 *  File        : 23101184_add_place.test.js
 *  Stack       : Jest + Supertest + mongodb-memory-server
 * ============================================================
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app.js';

// ─── In-memory DB lifecycle ────────────────────────────────────────────────
let mongod;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
});

afterEach(async () => {
    // Wipe every collection between tests so tests are independent
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Register a user and return { token, userId }
 */
const registerUser = async (overrides = {}) => {
    const payload = {
        name: overrides.name || 'Test User',
        email: overrides.email || 'test@example.com',
        password: overrides.password || 'password123',
        role: overrides.role || 'visitor',
    };
    const res = await request(app).post('/api/auth/register').send(payload);
    return { token: res.body.token, userId: res.body._id, body: res.body };
};

/**
 * Register an ADMIN user and return { token, userId }
 */
const registerAdmin = async () =>
    registerUser({ name: 'Admin User', email: 'admin@example.com', role: 'admin' });

/**
 * A valid Place payload
 */
const validPlace = (overrides = {}) => ({
    name: 'City Hospital',
    type: 'Healthcare',
    address: '123 Main St, Dhaka',
    description: 'A public hospital',
    phone: '01700000000',
    services: ['Emergency', 'OPD'],
    location: { type: 'Point', coordinates: [90.3563, 23.685] },
    ...overrides,
});

// ══════════════════════════════════════════════════════════════════════════
//  1. AUTH — Register & Login  (prerequisite for all protected routes)
// ══════════════════════════════════════════════════════════════════════════
describe('Auth — Register & Login', () => {
    test('TC-01: should register a new visitor successfully', async () => {
        const res = await request(app).post('/api/auth/register').send({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'pass1234',
        });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.email).toBe('john@example.com');
        expect(res.body.role).toBe('visitor');
    });

    test('TC-02: should reject registration when required fields are missing', async () => {
        const res = await request(app).post('/api/auth/register').send({
            email: 'missing@example.com',
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/all fields/i);
    });

    test('TC-03: should reject duplicate email registration', async () => {
        await registerUser({ email: 'dup@example.com' });
        const res = await request(app).post('/api/auth/register').send({
            name: 'Dup',
            email: 'dup@example.com',
            password: 'pass1234',
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/already exists/i);
    });

    test('TC-04: should login with correct credentials', async () => {
        await registerUser({ email: 'login@example.com', password: 'mypass' });
        const res = await request(app).post('/api/auth/login').send({
            email: 'login@example.com',
            password: 'mypass',
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    test('TC-05: should reject login with wrong password', async () => {
        await registerUser({ email: 'wrong@example.com', password: 'correctpass' });
        const res = await request(app).post('/api/auth/login').send({
            email: 'wrong@example.com',
            password: 'wrongpass',
        });

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toMatch(/invalid credentials/i);
    });
});

// ══════════════════════════════════════════════════════════════════════════
//  2. ADD PLACE (FR-1) — POST /api/places
// ══════════════════════════════════════════════════════════════════════════
describe('Add Place — POST /api/places', () => {
    test('TC-06: visitor can suggest a place (status becomes pending)', async () => {
        const { token } = await registerUser();
        const res = await request(app)
            .post('/api/places')
            .set('Authorization', `Bearer ${token}`)
            .send(validPlace());

        expect(res.statusCode).toBe(201);
        expect(res.body.name).toBe('City Hospital');
        expect(res.body.status).toBe('pending');
    });

    test('TC-07: admin-added place is auto-approved', async () => {
        const { token } = await registerAdmin();
        const res = await request(app)
            .post('/api/places')
            .set('Authorization', `Bearer ${token}`)
            .send(validPlace({ name: 'Admin Hospital' }));

        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe('approved');
    });

    test('TC-08: unauthenticated request is rejected with 401', async () => {
        const res = await request(app).post('/api/places').send(validPlace());

        expect(res.statusCode).toBe(401);
    });

    test('TC-09: missing required field "name" returns 400', async () => {
        const { token } = await registerUser();
        const res = await request(app)
            .post('/api/places')
            .set('Authorization', `Bearer ${token}`)
            .send(validPlace({ name: undefined }));

        expect(res.statusCode).toBe(400);
    });

    test('TC-10: invalid enum type returns 400', async () => {
        const { token } = await registerUser();
        const res = await request(app)
            .post('/api/places')
            .set('Authorization', `Bearer ${token}`)
            .send(validPlace({ type: 'InvalidType' }));

        expect(res.statusCode).toBe(400);
    });

    test('TC-11: place is saved with correct services array', async () => {
        const { token } = await registerUser();
        const res = await request(app)
            .post('/api/places')
            .set('Authorization', `Bearer ${token}`)
            .send(validPlace({ services: ['X-Ray', 'MRI'] }));

        expect(res.statusCode).toBe(201);
        expect(res.body.services).toEqual(expect.arrayContaining(['X-Ray', 'MRI']));
    });
});

// ══════════════════════════════════════════════════════════════════════════
//  3. GET PLACES (FR-3) — GET /api/places  (search & filter)
// ══════════════════════════════════════════════════════════════════════════
describe('Get Places — GET /api/places', () => {
    beforeEach(async () => {
        // Seed two approved places directly via the admin route
        const { token } = await registerAdmin();
        await request(app)
            .post('/api/places')
            .set('Authorization', `Bearer ${token}`)
            .send(validPlace({ name: 'Alpha Hospital', type: 'Healthcare' }));
        await request(app)
            .post('/api/places')
            .set('Authorization', `Bearer ${token}`)
            .send(validPlace({ name: 'Beta Bank', type: 'Financial' }));
    });

    test('TC-12: returns all approved places', async () => {
        const res = await request(app).get('/api/places');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);
    });

    test('TC-13: search by name returns matching places', async () => {
        const res = await request(app).get('/api/places?search=Alpha');

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe('Alpha Hospital');
    });

    test('TC-14: filter by type returns correct subset', async () => {
        const res = await request(app).get('/api/places?type=Financial');

        expect(res.statusCode).toBe(200);
        expect(res.body.every(p => p.type === 'Financial')).toBe(true);
    });

    test('TC-15: search with no matches returns empty array', async () => {
        const res = await request(app).get('/api/places?search=ZZZNonExistent');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(0);
    });
});

// ══════════════════════════════════════════════════════════════════════════
//  4. GET PLACE BY ID (FR-2) — GET /api/places/:id
// ══════════════════════════════════════════════════════════════════════════
describe('Place Profile — GET /api/places/:id', () => {
    let placeId;

    beforeEach(async () => {
        const { token } = await registerAdmin();
        const res = await request(app)
            .post('/api/places')
            .set('Authorization', `Bearer ${token}`)
            .send(validPlace());
        placeId = res.body._id;
    });

    test('TC-16: returns a place by valid ID', async () => {
        const res = await request(app).get(`/api/places/${placeId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body._id).toBe(placeId);
    });

    test('TC-17: returns 404 for a non-existent ObjectId', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app).get(`/api/places/${fakeId}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toMatch(/not found/i);
    });
});

// ══════════════════════════════════════════════════════════════════════════
//  5. UPDATE PLACE (FR-1) — PATCH /api/places/:id
// ══════════════════════════════════════════════════════════════════════════
describe('Update Place — PATCH /api/places/:id', () => {
    let placeId, adminToken, visitorToken;

    beforeEach(async () => {
        const admin = await registerAdmin();
        adminToken = admin.token;
        const visitor = await registerUser({ email: 'visitor2@example.com' });
        visitorToken = visitor.token;

        const res = await request(app)
            .post('/api/places')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(validPlace());
        placeId = res.body._id;
    });

    test('TC-18: admin can update place details', async () => {
        const res = await request(app)
            .patch(`/api/places/${placeId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ phone: '01900000000' });

        expect(res.statusCode).toBe(200);
        expect(res.body.phone).toBe('01900000000');
    });

    test('TC-19: visitor cannot update a place (403 Forbidden)', async () => {
        const res = await request(app)
            .patch(`/api/places/${placeId}`)
            .set('Authorization', `Bearer ${visitorToken}`)
            .send({ phone: '01900000000' });

        expect(res.statusCode).toBe(403);
    });

    test('TC-20: update returns 404 for non-existent place', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .patch(`/api/places/${fakeId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ phone: '00000000' });

        expect(res.statusCode).toBe(404);
    });
});

// ══════════════════════════════════════════════════════════════════════════
//  6. APPROVE / REJECT PLACE (FR-1) — PATCH /api/places/:id/approve
// ══════════════════════════════════════════════════════════════════════════
describe('Approve/Reject Place — PATCH /api/places/:id/approve', () => {
    let pendingPlaceId, adminToken, visitorToken;

    beforeEach(async () => {
        const admin = await registerAdmin();
        adminToken = admin.token;
        const visitor = await registerUser({ email: 'vis3@example.com' });
        visitorToken = visitor.token;

        // Visitor creates a pending place
        const res = await request(app)
            .post('/api/places')
            .set('Authorization', `Bearer ${visitorToken}`)
            .send(validPlace({ name: 'Pending Clinic' }));
        pendingPlaceId = res.body._id;
    });

    test('TC-21: admin can approve a pending place', async () => {
        const res = await request(app)
            .patch(`/api/places/${pendingPlaceId}/approve`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'approved' });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('approved');
    });

    test('TC-22: admin can reject a pending place', async () => {
        const res = await request(app)
            .patch(`/api/places/${pendingPlaceId}/approve`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'rejected' });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('rejected');
    });

    test('TC-23: visitor cannot approve a place (403)', async () => {
        const res = await request(app)
            .patch(`/api/places/${pendingPlaceId}/approve`)
            .set('Authorization', `Bearer ${visitorToken}`)
            .send({ status: 'approved' });

        expect(res.statusCode).toBe(403);
    });
});

// ══════════════════════════════════════════════════════════════════════════
//  7. DELETE PLACE — DELETE /api/places/:id
// ══════════════════════════════════════════════════════════════════════════
describe('Delete Place — DELETE /api/places/:id', () => {
    let placeId, adminToken, visitorToken;

    beforeEach(async () => {
        const admin = await registerAdmin();
        adminToken = admin.token;
        const visitor = await registerUser({ email: 'vis4@example.com' });
        visitorToken = visitor.token;

        const res = await request(app)
            .post('/api/places')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(validPlace({ name: 'Delete Me' }));
        placeId = res.body._id;
    });

    test('TC-24: admin can delete a place', async () => {
        const res = await request(app)
            .delete(`/api/places/${placeId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/deleted/i);
    });

    test('TC-25: deleted place is no longer retrievable', async () => {
        await request(app)
            .delete(`/api/places/${placeId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        const res = await request(app).get(`/api/places/${placeId}`);
        expect(res.statusCode).toBe(404);
    });

    test('TC-26: visitor cannot delete a place (403)', async () => {
        const res = await request(app)
            .delete(`/api/places/${placeId}`)
            .set('Authorization', `Bearer ${visitorToken}`);

        expect(res.statusCode).toBe(403);
    });

    test('TC-27: delete returns 404 for non-existent place', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .delete(`/api/places/${fakeId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(404);
    });
});

// ══════════════════════════════════════════════════════════════════════════
//  8. ADMIN — GET ALL PLACES (including pending)
// ══════════════════════════════════════════════════════════════════════════
describe('Admin All Places — GET /api/places/admin/all', () => {
    test('TC-28: admin can fetch all places (pending + approved)', async () => {
        const admin = await registerAdmin();
        const visitor = await registerUser({ email: 'v5@example.com' });

        // Admin adds 1 approved, visitor adds 1 pending
        await request(app)
            .post('/api/places')
            .set('Authorization', `Bearer ${admin.token}`)
            .send(validPlace({ name: 'Approved Place' }));
        await request(app)
            .post('/api/places')
            .set('Authorization', `Bearer ${visitor.token}`)
            .send(validPlace({ name: 'Pending Place' }));

        const res = await request(app)
            .get('/api/places/admin/all')
            .set('Authorization', `Bearer ${admin.token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
    });

    test('TC-29: visitor cannot access admin/all (403)', async () => {
        const visitor = await registerUser({ email: 'v6@example.com' });
        const res = await request(app)
            .get('/api/places/admin/all')
            .set('Authorization', `Bearer ${visitor.token}`);

        expect(res.statusCode).toBe(403);
    });

    test('TC-30: unauthenticated request to admin/all returns 401', async () => {
        const res = await request(app).get('/api/places/admin/all');

        expect(res.statusCode).toBe(401);
    });
});

// ══════════════════════════════════════════════════════════════════════════
//  9. HEALTH CHECK
// ══════════════════════════════════════════════════════════════════════════
describe('Health Check — GET /api/health', () => {
    test('TC-31: health endpoint returns 200', async () => {
        const res = await request(app).get('/api/health');

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
    });
});