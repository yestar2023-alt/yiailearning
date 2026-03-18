import { calculateReadingTime, formatReadingTime } from '../reading-time';

describe('reading-time utilities', () => {
  describe('calculateReadingTime', () => {
    it('calculates reading time correctly for standard text', () => {
      const text = 'This is a test post with some content. '.repeat(100);
      const result = calculateReadingTime(text);

      expect(result.words).toBeGreaterThan(0);
      expect(result.minutes).toBeGreaterThan(0);
      expect(result.minutes).toBeLessThan(10);
    });

    it('handles empty text', () => {
      const result = calculateReadingTime('');

      expect(result.words).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
    });

    it('handles text with special characters', () => {
      const text = 'Hello @#$%^&*() world!';
      const result = calculateReadingTime(text);

      expect(result.words).toBe(2);
    });

    it('handles text with Chinese characters', () => {
      const text = '这是中文内容测试。这是另一句。';
      const result = calculateReadingTime(text);

      expect(result.words).toBeGreaterThan(0);
    });

    it('handles null input gracefully', () => {
      const result = calculateReadingTime(null as any);

      expect(result.words).toBe(0);
      expect(result.minutes).toBe(0);
    });

    it('handles undefined input gracefully', () => {
      const result = calculateReadingTime(undefined as any);

      expect(result.words).toBe(0);
      expect(result.minutes).toBe(0);
    });
  });

  describe('formatReadingTime', () => {
    it('formats reading time with minutes', () => {
      const result = formatReadingTime({
        text: '',
        words: 500,
        minutes: 2,
        seconds: 30,
      });

      expect(result).toContain('2');
      expect(result).toContain('分钟');
    });

    it('formats reading time with seconds', () => {
      const result = formatReadingTime({
        text: '',
        words: 50,
        minutes: 0,
        seconds: 30,
      });

      expect(result).toContain('30');
      expect(result).toContain('秒');
    });

    it('formats fast reading time', () => {
      const result = formatReadingTime(
        {
          text: '',
          words: 1000,
          minutes: 5,
          seconds: 0,
        },
        'fast'
      );

      expect(result).toContain('5');
    });

    it('formats slow reading time', () => {
      const result = formatReadingTime(
        {
          text: '',
          words: 1000,
          minutes: 5,
          seconds: 0,
        },
        'slow'
      );

      expect(result).toContain('5');
    });

    it('returns dash for zero time', () => {
      const result = formatReadingTime({
        text: '',
        words: 0,
        minutes: 0,
        seconds: 0,
      });

      expect(result).toBe('—');
    });
  });
});
