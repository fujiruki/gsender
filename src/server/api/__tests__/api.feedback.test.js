import fs from 'fs';
import os from 'os';
import path from 'path';

jest.mock('../../services/configstore', () => {
    let data = {};
    return {
        __esModule: true,
        default: {
            file: '',
            get: jest.fn((key, defaultValue) => (key in data ? data[key] : defaultValue)),
            set: jest.fn((key, value) => { data[key] = value; }),
            __reset: () => { data = {}; },
        },
    };
});

import configstore from '../../services/configstore';
import * as feedback from '../api.feedback';

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
};

const fakeImageBuffer = () => Buffer.from('fake-image-bytes');

describe('api.feedback', () => {
    let tmpDir;

    beforeAll(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gsender-feedback-test-'));
        configstore.file = path.join(tmpDir, '.test_rc');
    });

    afterAll(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    afterEach(() => {
        configstore.__reset();
    });

    describe('create', () => {
        test('rejects an empty body', () => {
            const req = { body: { body: '' }, files: [] };
            const res = mockRes();

            feedback.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({ msg: expect.any(String) }),
            );
        });

        test('rejects an invalid priority', () => {
            const req = { body: { body: 'help', priority: 'urgent' }, files: [] };
            const res = mockRes();

            feedback.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('creates a record with defaults and persists it', () => {
            const req = { body: { body: 'Jog feels laggy' }, files: [] };
            const res = mockRes();

            feedback.create(req, res);

            expect(res.status).not.toHaveBeenCalled();
            const sent = res.send.mock.calls[0][0];
            expect(sent.err).toBeNull();
            expect(sent.feedback).toEqual(
                expect.objectContaining({
                    body: 'Jog feels laggy',
                    priority: 'medium',
                    sourceScreen: '',
                    images: [],
                    resolved: false,
                }),
            );
            expect(sent.feedback.id).toEqual(expect.any(String));
            expect(sent.feedback.createdAt).toEqual(expect.any(String));

            const records = configstore.get('feedback', []);
            expect(records).toHaveLength(1);
            expect(records[0].id).toBe(sent.feedback.id);
        });

        test('saves attached images to disk and records their filenames', () => {
            const req = {
                body: { body: 'See attached screenshot', priority: 'high', sourceScreen: '/carve' },
                files: [
                    { originalname: 'screenshot.png', buffer: fakeImageBuffer() },
                ],
            };
            const res = mockRes();

            feedback.create(req, res);

            const sent = res.send.mock.calls[0][0];
            expect(sent.feedback.images).toHaveLength(1);

            const imagePath = path.join(feedback.getImagesDir(), sent.feedback.images[0]);
            expect(fs.existsSync(imagePath)).toBe(true);
            expect(fs.readFileSync(imagePath)).toEqual(fakeImageBuffer());
        });
    });

    describe('fetch', () => {
        test('returns all stored records', () => {
            feedback.create({ body: { body: 'first' }, files: [] }, mockRes());
            feedback.create({ body: { body: 'second' }, files: [] }, mockRes());

            const res = mockRes();
            feedback.fetch({ query: {} }, res);

            const sent = res.send.mock.calls[0][0];
            expect(sent.records).toHaveLength(2);
            expect(sent.records.map((r) => r.body)).toEqual(['first', 'second']);
        });
    });

    describe('resolve', () => {
        test('marks a record as resolved', () => {
            const createRes = mockRes();
            feedback.create({ body: { body: 'fix this' }, files: [] }, createRes);
            const { id } = createRes.send.mock.calls[0][0].feedback;

            const res = mockRes();
            feedback.resolve({ params: { id } }, res);

            const sent = res.send.mock.calls[0][0];
            expect(sent.err).toBeNull();
            expect(sent.feedback.resolved).toBe(true);
            expect(sent.feedback.resolvedAt).toEqual(expect.any(String));

            const records = configstore.get('feedback', []);
            expect(records[0].resolved).toBe(true);
        });

        test('returns 404 for an unknown id', () => {
            const res = mockRes();
            feedback.resolve({ params: { id: 'does-not-exist' } }, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
