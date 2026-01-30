import { convertMinutes } from '../convertMinutes';

describe('convertMinutes', () => {
  it('should convert minutes to min format when less than an hour', () => {
    expect(convertMinutes(0)).toBe('0 min');
    expect(convertMinutes(1)).toBe('1 min');
    expect(convertMinutes(30)).toBe('30 min');
    expect(convertMinutes(59)).toBe('59 min');
  });

  it('should convert minutes to hours and min format when 1 hour or more but less than a day', () => {
    expect(convertMinutes(60)).toBe('1 hours 0 min');
    expect(convertMinutes(90)).toBe('1 hours 30 min');
    expect(convertMinutes(120)).toBe('2 hours 0 min');
    expect(convertMinutes(150)).toBe('2 hours 30 min');
    expect(convertMinutes(1439)).toBe('23 hours 59 min');
  });

  it('should convert minutes to days, hours, and min format when 1 day or more', () => {
    expect(convertMinutes(1440)).toBe('1 days 0 hours 0 min');
    expect(convertMinutes(1500)).toBe('1 days 1 hours 0 min');
    expect(convertMinutes(1530)).toBe('1 days 1 hours 30 min');
    expect(convertMinutes(2880)).toBe('2 days 0 hours 0 min');
    expect(convertMinutes(2940)).toBe('2 days 1 hours 0 min');
  });

  it('should handle large numbers correctly', () => {
    expect(convertMinutes(10080)).toBe('7 days 0 hours 0 min');
    expect(convertMinutes(43200)).toBe('30 days 0 hours 0 min');
  });

  it('should round minutes correctly', () => {
    // The function uses Math.round for minutes
    expect(convertMinutes(60.4)).toBe('1 hours 0 min');
    expect(convertMinutes(60.5)).toBe('1 hours 1 min');
    expect(convertMinutes(90.7)).toBe('1 hours 31 min');
  });

  it('should handle edge case of exactly 24 hours', () => {
    expect(convertMinutes(1440)).toBe('1 days 0 hours 0 min');
  });

  it('should handle mixed values correctly', () => {
    // 2 days, 3 hours, 45 minutes = 2880 + 180 + 45 = 3105
    expect(convertMinutes(3105)).toBe('2 days 3 hours 45 min');
    
    // 5 days, 12 hours, 30 minutes = 7200 + 720 + 30 = 7950
    expect(convertMinutes(7950)).toBe('5 days 12 hours 30 min');
  });
});
