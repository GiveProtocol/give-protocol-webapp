import { CharityStatus, CharityCategory } from '../charity';

describe('CharityStatus', () => {
  it('has all expected status values', () => {
    expect(CharityStatus._PENDING).toBe('pending');
    expect(CharityStatus._ACTIVE).toBe('active');
    expect(CharityStatus._PAUSED).toBe('paused');
    expect(CharityStatus._COMPLETED).toBe('completed');
    expect(CharityStatus._ARCHIVED).toBe('archived');
  });

  it('contains exactly 5 status values', () => {
    const statusValues = Object.values(CharityStatus);
    expect(statusValues).toHaveLength(5);
  });

  it('has unique status values', () => {
    const statusValues = Object.values(CharityStatus);
    const uniqueValues = new Set(statusValues);
    expect(uniqueValues.size).toBe(statusValues.length);
  });

  it('uses lowercase string values', () => {
    Object.values(CharityStatus).forEach(status => {
      expect(typeof status).toBe('string');
      expect(status).toBe(status.toLowerCase());
    });
  });
});

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
    const statusKeys = Object.keys(CharityStatus);
    const categoryKeys = Object.keys(CharityCategory);
    
    statusKeys.forEach(key => {
      expect(key).toMatch(/^_[A-Z_]+$/); // Should start with _ and be uppercase
    });
    
    categoryKeys.forEach(key => {
      expect(key).toMatch(/^_[A-Z_]+$/); // Should start with _ and be uppercase
    });
  });

  it('enum keys correspond to values appropriately', () => {
    // Test status enum key-value relationship
    expect(CharityStatus._PENDING).toBe('pending');
    expect(CharityStatus._ACTIVE).toBe('active');
    
    // Test category enum key-value relationship  
    expect(CharityCategory._EDUCATION).toBe('education');
    expect(CharityCategory._HEALTHCARE).toBe('healthcare');
    expect(CharityCategory._DISASTER_RELIEF).toBe('disaster_relief');
  });
});