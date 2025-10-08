import { colors } from '../colors';

describe('colors', () => {
  it('exports a colors object', () => {
    expect(colors).toBeDefined();
    expect(typeof colors).toBe('object');
  });

  describe('base colors', () => {
    it('has white color', () => {
      expect(colors.white).toBe('#FFFFFF');
    });

    it('has background colors', () => {
      expect(colors.background).toBeDefined();
      expect(colors.background.primary).toBe('#FFFFFF');
      expect(colors.background.secondary).toBe('#F8FAFC');
    });

    it('has text colors', () => {
      expect(colors.text).toBeDefined();
      expect(colors.text.primary).toBe('#1E293B');
      expect(colors.text.secondary).toBe('#64748B');
      expect(colors.text.inverse).toBe('#FFFFFF');
    });
  });

  describe('brand colors', () => {
    it('has brand color palette', () => {
      expect(colors.brand).toBeDefined();
      expect(colors.brand.primary).toBe('#0EA5E9');
      expect(colors.brand.secondary).toBe('#65A30D');
      expect(colors.brand.accent).toBe('#0369A1');
    });

    it('uses valid hex color format for brand colors', () => {
      Object.values(colors.brand).forEach(color => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });

  describe('semantic colors', () => {
    it('has status colors', () => {
      expect(colors.status).toBeDefined();
      expect(colors.status.error).toBe('#E11D48');
      expect(colors.status.success).toBe('#059669');
      expect(colors.status.warning).toBe('#B45309');
    });

    it('uses valid hex color format for status colors', () => {
      Object.values(colors.status).forEach(color => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });

  describe('component colors', () => {
    it('has button color configurations', () => {
      expect(colors.button).toBeDefined();
      expect(colors.button.primary).toBeDefined();
      expect(colors.button.secondary).toBeDefined();
    });

    it('has primary button colors', () => {
      expect(colors.button.primary.bg).toBe('#0EA5E9');
      expect(colors.button.primary.hover).toBe('#0284C7');
      expect(colors.button.primary.text).toBe('#FFFFFF');
    });

    it('has secondary button colors', () => {
      expect(colors.button.secondary.bg).toBe('#F8FAFC');
      expect(colors.button.secondary.hover).toBe('#F1F5F9');
      expect(colors.button.secondary.text).toBe('#0EA5E9');
    });

    it('has card colors', () => {
      expect(colors.card).toBeDefined();
      expect(colors.card.background).toBe('#FFFFFF');
      expect(colors.card.border).toBe('#E2E8F0');
      expect(colors.card.shadow).toBe('rgba(51, 65, 85, 0.1)');
    });
  });

  describe('color format validation', () => {
    it('uses valid hex colors for most values', () => {
      const hexColors = [
        colors.white,
        colors.background.primary,
        colors.background.secondary,
        colors.text.primary,
        colors.text.secondary,
        colors.text.inverse,
        colors.brand.primary,
        colors.brand.secondary,
        colors.brand.accent,
        colors.status.error,
        colors.status.success,
        colors.status.warning,
        colors.button.primary.bg,
        colors.button.primary.hover,
        colors.button.primary.text,
        colors.button.secondary.bg,
        colors.button.secondary.hover,
        colors.button.secondary.text,
        colors.card.background,
        colors.card.border
      ];

      hexColors.forEach(color => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it('uses valid rgba format for shadow', () => {
      expect(colors.card.shadow).toMatch(/^rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/);
    });
  });

  describe('color consistency', () => {
    it('maintains consistent primary brand color across components', () => {
      expect(colors.brand.primary).toBe(colors.button.primary.bg);
      expect(colors.brand.primary).toBe(colors.button.secondary.text);
    });

    it('uses white consistently across components', () => {
      expect(colors.white).toBe(colors.background.primary);
      expect(colors.white).toBe(colors.text.inverse);
      expect(colors.white).toBe(colors.button.primary.text);
      expect(colors.white).toBe(colors.card.background);
    });
  });

  describe('accessibility considerations', () => {
    it('provides different shades for hover states', () => {
      expect(colors.button.primary.bg).not.toBe(colors.button.primary.hover);
      expect(colors.button.secondary.bg).not.toBe(colors.button.secondary.hover);
    });

    it('has contrasting text colors', () => {
      expect(colors.text.primary).not.toBe(colors.text.inverse);
      expect(colors.text.primary).not.toBe(colors.background.primary);
    });

    it('provides distinct status colors', () => {
      const statusColors = Object.values(colors.status);
      const uniqueStatusColors = new Set(statusColors);
      expect(uniqueStatusColors.size).toBe(statusColors.length);
    });
  });

  describe('color object structure', () => {
    it('has expected top-level properties', () => {
      const expectedProps = ['white', 'background', 'text', 'brand', 'status', 'button', 'card'];
      expectedProps.forEach(prop => {
        expect(colors).toHaveProperty(prop);
      });
    });

    it('has nested object structures for component colors', () => {
      expect(typeof colors.background).toBe('object');
      expect(typeof colors.text).toBe('object');
      expect(typeof colors.brand).toBe('object');
      expect(typeof colors.status).toBe('object');
      expect(typeof colors.button).toBe('object');
      expect(typeof colors.card).toBe('object');
    });
  });
});