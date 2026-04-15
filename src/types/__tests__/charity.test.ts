import { CharityCategory } from '../charity';

describe('CharityCategory', () => {
  it('has all expected category values', () => {
    expect(CharityCategory._EDUCATION).toBe('education');
    expect(CharityCategory._HEALTHCARE).toBe('healthcare');
    expect(CharityCategory._ENVIRONMENT).toBe('environment');
    expect(CharityCategory._POVERTY).toBe('poverty');
    expect(CharityCategory._DISASTER_RELIEF).toBe('disaster_relief');
    expect(CharityCategory._ANIMAL_WELFARE).toBe('animal_welfare');
    expect(CharityCategory._ARTS_CULTURE).toBe('arts_culture');
    expect(CharityCategory._COMMUNITY).toBe('community');
  });

  it('contains exactly 8 category values', () => {
    const categoryValues = Object.values(CharityCategory);
    expect(categoryValues).toHaveLength(8);
  });

  it('has unique category values', () => {
    const categoryValues = Object.values(CharityCategory);
    const uniqueValues = new Set(categoryValues);
    expect(uniqueValues.size).toBe(categoryValues.length);
  });

  it('uses lowercase string values with underscores', () => {
    Object.values(CharityCategory).forEach(category => {
      expect(typeof category).toBe('string');
      expect(category).toBe(category.toLowerCase());
      expect(category).toMatch(/^[a-z_]+$/);
    });
  });

  it('includes common charity categories', () => {
    const categoryValues = Object.values(CharityCategory);
    expect(categoryValues).toContain('education');
    expect(categoryValues).toContain('healthcare');
    expect(categoryValues).toContain('environment');
    expect(categoryValues).toContain('poverty');
  });
});

describe('Charity types enum integrity', () => {
  it('maintains consistent naming pattern for unused enums', () => {
    const categoryKeys = Object.keys(CharityCategory);

    categoryKeys.forEach(key => {
      expect(key).toMatch(/^_[A-Z_]+$/); // Should start with _ and be uppercase
    });
  });

  it('enum keys correspond to values appropriately', () => {
    expect(CharityCategory._EDUCATION).toBe('education');
    expect(CharityCategory._HEALTHCARE).toBe('healthcare');
    expect(CharityCategory._DISASTER_RELIEF).toBe('disaster_relief');
  });
});
