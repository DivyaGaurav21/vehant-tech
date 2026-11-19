import { eventTypes, reviewStatuses } from '../models/TrafficEvent.js'
import { HttpError } from '../utils/httpError.js'

const cameraIdPattern = /^CAM-0[1-9]$/
const datePattern = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/

function isValidIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

function invalid(message, field) {
  throw new HttpError(400, 'VALIDATION_ERROR', message, field ? [{ path: [field], message }] : undefined)
}

function optionalString(query, field) {
  const value = query[field]
  if (value === undefined) return undefined
  if (typeof value !== 'string') invalid(`${field} must be a single string value`, field)
  return value
}

function parseDate(query, field) {
  const value = optionalString(query, field)
  if (value === undefined) return undefined
  const datePart = value.slice(0, 10)
  if (!isValidIsoDate(datePart) || !datePattern.test(value) || Number.isNaN(Date.parse(value))) {
    invalid(`${field} must be a valid ISO date or datetime`, field)
  }
  return value
}

function parsePagination(query) {
  const rawPage = optionalString(query, 'page')
  const rawLimit = optionalString(query, 'limit')
  const page = rawPage === undefined ? 1 : Number(rawPage)
  const limit = rawLimit === undefined ? 20 : Number(rawLimit)
  if (!Number.isInteger(page) || page < 1) invalid('page must be a positive integer', 'page')
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) invalid('limit must be an integer from 1 to 100', 'limit')
  return { page, limit }
}

function validateDateRange(from, to) {
  if (from && to && Date.parse(from) > Date.parse(to)) invalid('from must be earlier than or equal to to', 'from')
}

export function validatePaginationQuery(query) {
  return parsePagination(query)
}

export function validateAnalyticsQuery(query) {
  const date = optionalString(query, 'date')
  if (date && !isValidIsoDate(date)) {
    invalid('date must be a valid ISO date', 'date')
  }
  return { date }
}

export function validateEventQuery(query, { violations = false, cameraEvents = false } = {}) {
  const pagination = parsePagination(query)
  const plateNumber = cameraEvents ? undefined : optionalString(query, 'plateNumber')?.trim()
  const cameraId = cameraEvents ? undefined : optionalString(query, 'cameraId')
  const from = parseDate(query, 'from')
  const to = parseDate(query, 'to')
  validateDateRange(from, to)

  if (plateNumber && plateNumber.length > 20) invalid('plateNumber must be at most 20 characters', 'plateNumber')
  if (cameraId && !cameraIdPattern.test(cameraId)) invalid('cameraId must be CAM-01 through CAM-09', 'cameraId')

  const result = { ...pagination, ...(plateNumber ? { plateNumber } : {}), ...(cameraId ? { cameraId } : {}), ...(from ? { from } : {}), ...(to ? { to } : {}) }

  if (violations) {
    const violationType = optionalString(query, 'violationType')
    const reviewStatus = optionalString(query, 'reviewStatus')
    if (violationType && (!eventTypes.includes(violationType) || violationType === 'VEHICLE_DETECTED')) invalid('violationType is invalid', 'violationType')
    if (reviewStatus && !reviewStatuses.includes(reviewStatus)) invalid('reviewStatus is invalid', 'reviewStatus')
    if (violationType) result.violationType = violationType
    if (reviewStatus) result.reviewStatus = reviewStatus
  }

  return result
}

export function validateLoginBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) invalid('Request body must be an object')
  const { email, password } = body
  if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    invalid('A valid email address is required', 'email')
  }
  if (typeof password !== 'string' || password.length < 1 || password.length > 128 || Buffer.byteLength(password, 'utf8') > 72) {
    invalid('Password must be 1 to 128 characters and no more than 72 UTF-8 bytes', 'password')
  }
  return { email, password }
}

export function validateViolationStatusBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) invalid('Request body must be an object')
  if (!['REVIEWED', 'DISMISSED'].includes(body.reviewStatus)) invalid('reviewStatus must be REVIEWED or DISMISSED', 'reviewStatus')
  return { reviewStatus: body.reviewStatus }
}
