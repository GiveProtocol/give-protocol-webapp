import en from '../en';

describe('English translations (en)', () => {
  it('exports default object with translation property', () => {
    expect(en).toBeDefined();
    expect(en).toHaveProperty('translation');
    expect(typeof en.translation).toBe('object');
  });

  it('contains app name and tagline', () => {
    expect(en.translation['app.name']).toBeDefined();
    expect(en.translation['app.tagline']).toBeDefined();
    expect(en.translation['app.name']).toBe('Give Protocol');
    expect(en.translation['app.tagline']).toBe('Empower Change Through Smart Giving');
  });

  it('has translation keys as strings', () => {
    Object.keys(en.translation).forEach(key => {
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });
  });

  it('has translation values as strings', () => {
    Object.values(en.translation).forEach(value => {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    });
  });

  it('uses dot notation for nested keys', () => {
    const keys = Object.keys(en.translation);
    const dottedKeys = keys.filter(key => key.includes('.'));
    expect(dottedKeys.length).toBeGreaterThan(0);
  });

  it('contains basic UI translations', () => {
    expect(en.translation['app.name']).toBeDefined();
    expect(en.translation['app.tagline']).toBeDefined();
  });
});