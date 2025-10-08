import { resources } from '../index';

describe('i18n resources', () => {
  it('exports a resources object', () => {
    expect(resources).toBeDefined();
    expect(typeof resources).toBe('object');
  });

  it('contains all expected language codes', () => {
    const expectedLanguages = [
      'en', 'es', 'de', 'fr', 'ja', 
      'zh-CN', 'zh-TW', 'th', 'vi', 
      'ko', 'ar', 'hi'
    ];
    
    expectedLanguages.forEach(lang => {
      expect(resources).toHaveProperty(lang);
    });
  });

  it('contains exactly 12 languages', () => {
    const languageKeys = Object.keys(resources);
    expect(languageKeys).toHaveLength(12);
  });

  it('has resources for each language as objects', () => {
    Object.values(resources).forEach(langResource => {
      expect(typeof langResource).toBe('object');
      expect(langResource).not.toBeNull();
    });
  });

  it('includes major world languages', () => {
    expect(resources).toHaveProperty('en'); // English
    expect(resources).toHaveProperty('es'); // Spanish
    expect(resources).toHaveProperty('de'); // German
    expect(resources).toHaveProperty('fr'); // French
    expect(resources).toHaveProperty('ja'); // Japanese
    expect(resources).toHaveProperty('zh-CN'); // Chinese Simplified
    expect(resources).toHaveProperty('ar'); // Arabic
    expect(resources).toHaveProperty('hi'); // Hindi
  });

  it('uses consistent language code format', () => {
    const languageKeys = Object.keys(resources);
    languageKeys.forEach(key => {
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(1);
      expect(key.length).toBeLessThanOrEqual(5); // zh-CN is longest at 5 chars
    });
  });

  it('includes Asian languages with proper locale codes', () => {
    expect(resources).toHaveProperty('zh-CN'); // Chinese Simplified
    expect(resources).toHaveProperty('zh-TW'); // Chinese Traditional
    expect(resources).toHaveProperty('ja'); // Japanese
    expect(resources).toHaveProperty('ko'); // Korean
    expect(resources).toHaveProperty('th'); // Thai
    expect(resources).toHaveProperty('vi'); // Vietnamese
  });

  it('has unique language resources', () => {
    const resourceValues = Object.values(resources);
    const uniqueResources = new Set(resourceValues);
    expect(uniqueResources.size).toBe(resourceValues.length);
  });

  it('maintains proper language code standards', () => {
    const keys = Object.keys(resources);
    
    // Check for proper ISO language codes
    keys.forEach(key => {
      // All keys should be valid language codes (2 chars) or locale codes (5 chars with dash)
      expect(key).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
    });
  });

  it('supports both LTR and RTL languages', () => {
    // LTR languages
    expect(resources).toHaveProperty('en');
    expect(resources).toHaveProperty('es');
    expect(resources).toHaveProperty('de');
    
    // RTL language
    expect(resources).toHaveProperty('ar');
  });
});