import assert from 'node:assert/strict'
import test from 'node:test'
import {
  validateAnalyticsQuery,
  validateEventQuery,
  validateLoginBody,
  validatePaginationQuery,
  validateViolationStatusBody,
} from './requestValidation.js'

test('applies pagination defaults and rejects invalid pagination values', () => {
  assert.deepEqual(validatePaginationQuery({}), { page: 1, limit: 20 })
  assert.deepEqual(validatePaginationQuery({ page: '3', limit: '50' }), { page: 3, limit: 50 })
  assert.throws(() => validatePaginationQuery({ page: ['1'] }), { code: 'VALIDATION_ERROR' })
  assert.throws(() => validatePaginationQuery({ page: '' }), { code: 'VALIDATION_ERROR' })
  assert.throws(() => validatePaginationQuery({ limit: '101' }), { code: 'VALIDATION_ERROR' })
})

test('validates event filters and date ranges', () => {
  assert.deepEqual(
    validateEventQuery({ plateNumber: ' ab123 ', cameraId: 'CAM-02', from: '2026-03-01', to: '2026-03-02' }),
    { page: 1, limit: 20, plateNumber: 'ab123', cameraId: 'CAM-02', from: '2026-03-01', to: '2026-03-02' },
  )
  assert.throws(() => validateEventQuery({ from: '2026-03-03', to: '2026-03-02' }), { code: 'VALIDATION_ERROR' })
  assert.throws(() => validateEventQuery({ from: '2026-02-30' }), { code: 'VALIDATION_ERROR' })
  assert.throws(() => validateEventQuery({ from: '' }), { code: 'VALIDATION_ERROR' })
  assert.throws(() => validateEventQuery({ violationType: 'VEHICLE_DETECTED' }, { violations: true }), { code: 'VALIDATION_ERROR' })
})

test('validates analytics dates, login credentials, and review status', () => {
  assert.deepEqual(validateAnalyticsQuery({ date: '2026-11-09' }), { date: '2026-11-09' })
  assert.throws(() => validateAnalyticsQuery({ date: '2026-11-31' }), { code: 'VALIDATION_ERROR' })
  assert.deepEqual(validateLoginBody({ email: 'admin@example.com', password: 'a secure password' }), {
    email: 'admin@example.com',
    password: 'a secure password',
  })
  assert.throws(() => validateLoginBody({ email: 'admin@example.com', password: '😀'.repeat(19) }), { code: 'VALIDATION_ERROR' })
  assert.throws(() => validateViolationStatusBody({ reviewStatus: 'PENDING' }), { code: 'VALIDATION_ERROR' })
})
