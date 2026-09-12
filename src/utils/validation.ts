/**
 * AlphaERP Centralized Validation & Data Sanity Utility
 * 
 * Enforces enterprise-grade data entry rules:
 * - Mobile Numbers: Maximum 10 digits (with optional +91 country prefix), strictly 10 digits.
 * - Emails: RFC-compliant format containing '@' and valid domain with '.'.
 * - Appointment / Site Survey Dates: Within 2 months (60 days) from current date, cannot be in past.
 * - Date of Birth: Must not be in the future (<= today) and enforces minimum age (e.g. 18 years for employees).
 * - Date Ranges: End date must not precede start date.
 * - Tax & Identity: Indian PAN, Aadhaar, GSTIN validation.
 * - Financial & Numerical: Non-negative prices, quantities, stock, and capacities.
 */

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  error?: string;
}

export interface PhoneValidationResult extends ValidationResult {
  cleanNumber: string;
}

/**
 * Extracts raw 10-digit mobile number by stripping country code (+91, 0091, 0) and formatting characters.
 */
export function extract10DigitPhone(input: string): string {
  if (!input) return '';
  // Remove all non-digits
  let digits = input.replace(/\D/g, '');
  
  // If starts with 91 and has 12 digits, strip country code
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }
  // If starts with 0 and has 11 digits, strip leading zero
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  
  // Cap at 10 digits
  return digits.slice(0, 10);
}

/**
 * Validates mobile number:
 * - Clean number must not exceed 10 digits
 * - Must be exactly 10 digits for standard Indian mobile numbers
 * - Optional leading digit check (6, 7, 8, 9 for Indian cellular)
 */
export function validateMobile(phone: string, required: boolean = true): PhoneValidationResult {
  if (!phone || !phone.trim()) {
    if (!required) return { isValid: true, cleanNumber: '' };
    return { isValid: false, message: 'Mobile number is required.', cleanNumber: '' };
  }

  const rawDigits = phone.replace(/\D/g, '');
  const cleanNumber = extract10DigitPhone(phone);

  // Check if raw digits exceeded 10 (excluding 91 prefix)
  if (rawDigits.length > 10 && !(rawDigits.length === 12 && rawDigits.startsWith('91')) && !(rawDigits.length === 11 && rawDigits.startsWith('0'))) {
    return {
      isValid: false,
      message: 'Mobile number must not exceed 10 digits.',
      cleanNumber
    };
  }

  if (cleanNumber.length !== 10) {
    return {
      isValid: false,
      message: `Mobile number must be exactly 10 digits (currently ${cleanNumber.length}).`,
      cleanNumber
    };
  }

  if (!/^[6-9]\d{9}$/.test(cleanNumber)) {
    return {
      isValid: false,
      message: 'Invalid mobile number. Standard 10-digit numbers must start with 6, 7, 8, or 9.',
      cleanNumber
    };
  }

  return { isValid: true, cleanNumber };
}

/**
 * Format helper for input onChange events:
 * Prevents users from typing more than 10 digits into mobile inputs.
 */
export function formatMobileInput(currentValue: string): string {
  const digits = currentValue.replace(/\D/g, '');
  if (currentValue.startsWith('+91') || currentValue.startsWith('+91 ')) {
    const rawAfterPrefix = currentValue.replace(/^\+91\s*/, '').replace(/\D/g, '');
    const capped = rawAfterPrefix.slice(0, 10);
    return capped ? `+91 ${capped}` : '+91 ';
  }
  return digits.slice(0, 10);
}

/**
 * Validates email address format:
 * - Must contain '@' and '.'
 * - Must have valid characters before '@', between '@' and '.', and valid TLD (at least 2 chars).
 */
export function validateEmail(email: string, required: boolean = true): ValidationResult {
  if (!email || !email.trim()) {
    if (!required) return { isValid: true };
    return { isValid: false, message: 'Email address is required.' };
  }

  const trimmed = email.trim();
  
  if (!trimmed.includes('@')) {
    return { isValid: false, message: "Email address must contain an '@' symbol." };
  }

  if (!trimmed.includes('.')) {
    return { isValid: false, message: "Email address must contain a domain extension with a '.' (e.g. .com, .in)." };
  }

  // RFC 5322 standard regex subset
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(trimmed)) {
    return { isValid: false, message: 'Please enter a valid email address (e.g., name@company.com).' };
  }

  return { isValid: true };
}

/**
 * Validates appointment / site survey / commissioning schedule dates:
 * - Date must be valid
 * - Cannot be in the past (before today's midnight)
 * - Must NOT be beyond 2 months (60 days) from current date
 */
export function validateAppointmentDate(
  dateStr: string,
  maxMonthsAhead: number = 2,
  allowToday: boolean = true
): ValidationResult {
  if (!dateStr || !dateStr.trim()) {
    return { isValid: false, message: 'Appointment date is required.' };
  }

  const appointmentDate = new Date(dateStr);
  if (isNaN(appointmentDate.getTime())) {
    return { isValid: false, message: 'Invalid date format provided.' };
  }

  // Normalize to local midnight for comparison
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const apptStart = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate(), 0, 0, 0, 0);

  if (allowToday) {
    if (apptStart.getTime() < todayStart.getTime()) {
      return { isValid: false, message: 'Appointment date cannot be in the past.' };
    }
  } else {
    if (apptStart.getTime() <= todayStart.getTime()) {
      return { isValid: false, message: 'Appointment date must be in the future (after today).' };
    }
  }

  // Maximum allowed date: 2 months ahead (60 days or exactly +2 calendar months)
  const maxAllowedDate = new Date(todayStart);
  maxAllowedDate.setMonth(maxAllowedDate.getMonth() + maxMonthsAhead);
  // Add 1 day tolerance for month boundary transitions
  maxAllowedDate.setDate(maxAllowedDate.getDate() + 1);

  if (apptStart.getTime() > maxAllowedDate.getTime()) {
    return {
      isValid: false,
      message: `Appointment date must not be beyond ${maxMonthsAhead} months from the current date (max allowed: ${maxAllowedDate.toISOString().split('T')[0]}).`
    };
  }

  return { isValid: true };
}

/**
 * Returns the maximum allowed date string (YYYY-MM-DD) for appointment inputs (2 months ahead).
 */
export function getMaxAppointmentDateString(monthsAhead: number = 2): string {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsAhead);
  return d.toISOString().split('T')[0];
}

/**
 * Returns today's date string (YYYY-MM-DD).
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Validates Date of Birth (DOB):
 * - Must NOT be in the future (<= current date)
 * - Optional: minimum working age verification (default 18 years for employment)
 */
export function validateDateOfBirth(
  dobStr: string,
  minAgeYears: number = 0,
  maxAgeYears: number = 100
): ValidationResult {
  if (!dobStr || !dobStr.trim()) {
    return { isValid: false, message: 'Date of birth is required.' };
  }

  const dob = new Date(dobStr);
  if (isNaN(dob.getTime())) {
    return { isValid: false, message: 'Invalid date of birth format.' };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (dob.getTime() > today.getTime()) {
    return { isValid: false, message: 'Date of birth cannot be in the future.' };
  }

  // Check minimum age if specified (e.g. 18 for HR staff)
  if (minAgeYears > 0) {
    const minAdultDate = new Date(now.getFullYear() - minAgeYears, now.getMonth(), now.getDate());
    if (dob.getTime() > minAdultDate.getTime()) {
      return {
        isValid: false,
        message: `Employee must be at least ${minAgeYears} years old (born on or before ${minAdultDate.toISOString().split('T')[0]}).`
      };
    }
  }

  // Check reasonable upper age limit
  if (maxAgeYears > 0) {
    const maxOldDate = new Date(now.getFullYear() - maxAgeYears, now.getMonth(), now.getDate());
    if (dob.getTime() < maxOldDate.getTime()) {
      return {
        isValid: false,
        message: `Date of birth cannot be more than ${maxAgeYears} years in the past.`
      };
    }
  }

  return { isValid: true };
}

/**
 * Validates Date Range (e.g. Contract Start Date vs End Date, Quote Validity):
 */
export function validateDateRange(
  startDateStr: string,
  endDateStr: string,
  label: string = 'Contract',
  _endLabel?: string
): ValidationResult {
  if (!startDateStr || !endDateStr) {
    return { isValid: false, message: 'Both start and end dates are required.', error: 'Both start and end dates are required.' };
  }

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: false, message: 'Invalid date range provided.', error: 'Invalid date range provided.' };
  }

  if (end.getTime() < start.getTime()) {
    const errorMsg = `${label} end date cannot be earlier than start date.`;
    return {
      isValid: false,
      message: errorMsg,
      error: errorMsg
    };
  }

  return { isValid: true };
}

/**
 * Validates Indian PAN (Permanent Account Number):
 * Format: 5 uppercase letters + 4 numbers + 1 uppercase letter (e.g., ABCDE1234F).
 */
export function validatePan(pan: string, required: boolean = true): ValidationResult {
  if (!pan || !pan.trim()) {
    if (!required) return { isValid: true };
    return { isValid: false, message: 'PAN number is required.' };
  }

  const upper = pan.trim().toUpperCase();
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(upper)) {
    return {
      isValid: false,
      message: 'Invalid PAN format. Must be 10 characters: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F).'
    };
  }

  return { isValid: true };
}

/**
 * Validates Indian Aadhaar Number:
 * Format: 12 numeric digits.
 */
export function validateAadhaar(aadhaar: string, required: boolean = true): ValidationResult {
  if (!aadhaar || !aadhaar.trim()) {
    if (!required) return { isValid: true };
    return { isValid: false, message: 'Aadhaar number is required.' };
  }

  const digits = aadhaar.replace(/\D/g, '');
  if (digits.length !== 12) {
    return {
      isValid: false,
      message: `Aadhaar number must be exactly 12 numeric digits (currently ${digits.length}).`
    };
  }

  return { isValid: true };
}

/**
 * Validates Indian GSTIN Number:
 * Format: 15 alphanumeric characters (e.g., 27ABCDE1234F1Z5).
 */
export function validateGstin(gstin: string, required: boolean = true): ValidationResult {
  if (!gstin || !gstin.trim()) {
    if (!required) return { isValid: true };
    return { isValid: false, message: 'GSTIN is required.' };
  }

  const upper = gstin.trim().toUpperCase();
  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(upper)) {
    return {
      isValid: false,
      message: 'Invalid GSTIN format. Must be 15 characters (e.g., 27ABCDE1234F1Z5).'
    };
  }

  return { isValid: true };
}

/**
 * Validates positive numerical values:
 */
export function validatePositiveNumber(
  val: number | string,
  fieldName: string = 'Value',
  allowZero: boolean = false
): ValidationResult {
  const num = Number(val);
  if (isNaN(num)) {
    return { isValid: false, message: `${fieldName} must be a valid numeric number.` };
  }

  if (allowZero) {
    if (num < 0) {
      return { isValid: false, message: `${fieldName} cannot be negative (must be >= 0).` };
    }
  } else {
    if (num <= 0) {
      return { isValid: false, message: `${fieldName} must be greater than 0.` };
    }
  }

  return { isValid: true };
}

/**
 * Validates percentage values (0% to 100%):
 */
export function validatePercentage(val: number | string, fieldName: string = 'Percentage'): ValidationResult {
  const num = Number(val);
  if (isNaN(num) || num < 0 || num > 100) {
    return { isValid: false, message: `${fieldName} must be between 0% and 100%.` };
  }
  return { isValid: true };
}
