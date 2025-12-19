/**
 * Date Helper Utilities
 *
 * Comprehensive date and time formatting utilities for appointment management.
 * All functions are pure and framework-agnostic.
 */

/**
 * Format date to YYYY-MM-DD
 *
 * @param date - Date object to format
 * @returns Formatted date string (YYYY-MM-DD)
 *
 * @example
 * formatDate(new Date('2025-01-20')) // '2025-01-20'
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format time to 12-hour format (e.g., "09:30 AM")
 *
 * @param time24 - Time in 24-hour format (HH:MM)
 * @returns Time in 12-hour format with AM/PM
 *
 * @example
 * formatTime12Hour('09:30') // '9:30 AM'
 * formatTime12Hour('14:45') // '2:45 PM'
 * formatTime12Hour('00:00') // '12:00 AM'
 */
export const formatTime12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Get day name from date
 *
 * @param date - Date object
 * @param short - Return short (3-letter) or full day name
 * @returns Day name (e.g., 'Mon' or 'Monday')
 *
 * @example
 * getDayName(new Date('2025-01-20')) // 'Mon'
 * getDayName(new Date('2025-01-20'), false) // 'Monday'
 */
export const getDayName = (date: Date, short = true): string => {
  const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const days = short ? shortDays : fullDays;
  return days[date.getDay()];
};

/**
 * Get month name from date
 *
 * @param date - Date object
 * @param short - Return short (3-letter) or full month name
 * @returns Month name (e.g., 'Jan' or 'January')
 *
 * @example
 * getMonthName(new Date('2025-01-20')) // 'Jan'
 * getMonthName(new Date('2025-01-20'), false) // 'January'
 */
export const getMonthName = (date: Date, short = true): string => {
  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const months = short ? shortMonths : fullMonths;
  return months[date.getMonth()];
};

/**
 * Format duration in minutes to human-readable format
 *
 * @param minutes - Duration in minutes
 * @returns Formatted duration (e.g., "30 min", "1h 30m", "2 hr")
 *
 * @example
 * formatDuration(30) // '30 min'
 * formatDuration(60) // '1 hr'
 * formatDuration(90) // '1h 30m'
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) return `${hours} hr`;
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Check if a date is today
 *
 * @param date - Date to check
 * @returns True if date is today
 *
 * @example
 * isToday(new Date()) // true
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return formatDate(date) === formatDate(today);
};

/**
 * Check if a date is in the past
 *
 * @param date - Date to check
 * @returns True if date is before current time
 *
 * @example
 * isPast(new Date('2020-01-01')) // true
 */
export const isPast = (date: Date): boolean => {
  const now = new Date();
  return date < now;
};

/**
 * Check if a date is in the future
 *
 * @param date - Date to check
 * @returns True if date is after current time
 *
 * @example
 * isFuture(new Date('2030-01-01')) // true
 */
export const isFuture = (date: Date): boolean => {
  const now = new Date();
  return date > now;
};

/**
 * Add days to a date
 *
 * @param date - Starting date
 * @param days - Number of days to add
 * @returns New date with days added
 *
 * @example
 * addDays(new Date('2025-01-20'), 7) // Date for 2025-01-27
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Get date range for next N days
 *
 * @param startDate - Starting date (defaults to today)
 * @param days - Number of days in range
 * @returns Array of dates
 *
 * @example
 * getDateRange(new Date(), 7) // Array of next 7 days
 */
export const getDateRange = (startDate: Date = new Date(), days: number): Date[] => {
  const dates: Date[] = [];
  for (let i = 0; i < days; i++) {
    dates.push(addDays(startDate, i));
  }
  return dates;
};

/**
 * Format date to readable format (e.g., "Mon, Jan 20")
 *
 * @param date - Date to format
 * @returns Formatted date string
 *
 * @example
 * formatReadableDate(new Date('2025-01-20')) // 'Mon, Jan 20'
 */
export const formatReadableDate = (date: Date): string => {
  const day = getDayName(date, true);
  const month = getMonthName(date, true);
  const dayNum = date.getDate();
  return `${day}, ${month} ${dayNum}`;
};

/**
 * Format full date (e.g., "Monday, January 20, 2025")
 *
 * @param date - Date to format
 * @returns Formatted full date string
 *
 * @example
 * formatFullDate(new Date('2025-01-20')) // 'Monday, January 20, 2025'
 */
export const formatFullDate = (date: Date): string => {
  const day = getDayName(date, false);
  const month = getMonthName(date, false);
  const dayNum = date.getDate();
  const year = date.getFullYear();
  return `${day}, ${month} ${dayNum}, ${year}`;
};

/**
 * Get time difference in minutes between two dates
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Difference in minutes
 *
 * @example
 * getTimeDifferenceMinutes(new Date('2025-01-20 10:00'), new Date('2025-01-20 10:30')) // 30
 */
export const getTimeDifferenceMinutes = (date1: Date, date2: Date): number => {
  const diff = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diff / (1000 * 60));
};

/**
 * Parse time string to hours and minutes
 *
 * @param timeString - Time string in HH:MM format
 * @returns Object with hours and minutes
 *
 * @example
 * parseTime('14:30') // { hours: 14, minutes: 30 }
 */
export const parseTime = (timeString: string): { hours: number; minutes: number } => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
};

/**
 * Combine date and time into a single Date object
 *
 * @param date - Date object
 * @param timeString - Time string in HH:MM format
 * @returns Combined Date object
 *
 * @example
 * combineDateAndTime(new Date('2025-01-20'), '14:30') // Date for 2025-01-20 14:30:00
 */
export const combineDateAndTime = (date: Date, timeString: string): Date => {
  const { hours, minutes } = parseTime(timeString);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
};

/**
 * Check if two dates are on the same day
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if dates are on same day
 *
 * @example
 * isSameDay(new Date('2025-01-20 10:00'), new Date('2025-01-20 14:30')) // true
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return formatDate(date1) === formatDate(date2);
};

/**
 * Get relative time description (e.g., "Today", "Tomorrow", "In 3 days")
 *
 * @param date - Date to describe
 * @returns Relative time description
 *
 * @example
 * getRelativeTime(new Date()) // 'Today'
 * getRelativeTime(addDays(new Date(), 1)) // 'Tomorrow'
 * getRelativeTime(addDays(new Date(), 3)) // 'In 3 days'
 */
export const getRelativeTime = (date: Date): string => {
  if (isToday(date)) return 'Today';

  const tomorrow = addDays(new Date(), 1);
  if (isSameDay(date, tomorrow)) return 'Tomorrow';

  const yesterday = addDays(new Date(), -1);
  if (isSameDay(date, yesterday)) return 'Yesterday';

  const diffDays = Math.floor((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays > 0 && diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays > -7) return `${Math.abs(diffDays)} days ago`;

  return formatReadableDate(date);
};
