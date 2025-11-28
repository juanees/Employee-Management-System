"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const app_1 = require("../src/app");
(0, vitest_1.describe)('Validation error contract', () => {
    let app;
    (0, vitest_1.beforeAll)(async () => {
        app = (0, app_1.buildApp)();
        await app.ready();
    });
    (0, vitest_1.afterAll)(async () => {
        await app.close();
    });
    const expectInvalidInput = (payload) => {
        (0, vitest_1.expect)(payload).toMatchObject({
            error: 'Invalid input',
            error_code: 'INVALID_INPUT'
        });
        (0, vitest_1.expect)(Array.isArray(payload.issues)).toBe(true);
        (0, vitest_1.expect)((payload.issues ?? []).length).toBeGreaterThan(0);
    };
    (0, vitest_1.it)('returns contract for invalid employee payloads', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/employees',
            payload: {}
        });
        (0, vitest_1.expect)(response.statusCode).toBe(400);
        expectInvalidInput(response.json());
    });
    (0, vitest_1.it)('returns contract for invalid vehicle payloads', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/vehicles',
            payload: {}
        });
        (0, vitest_1.expect)(response.statusCode).toBe(400);
        expectInvalidInput(response.json());
    });
});
