import { describe, it, expect } from "@jest/globals";
import {
  lookupIrsCode,
  formatRulingYear,
  formatActivityCodes,
  lookupSatActivityCode,
  lookupCcewClassificationCode,
  lookupCraCategoryCode,
} from "./irsCodeMaps";

describe("irsCodeMaps", () => {
  describe("lookupIrsCode", () => {
    it('should return "—" for null code', () => {
      expect(lookupIrsCode("deductibility", null)).toBe("—");
    });

    it('should return "—" for undefined code', () => {
      expect(lookupIrsCode("deductibility")).toBe("—");
    });

    it('should return "—" for empty string code', () => {
      expect(lookupIrsCode("deductibility", "")).toBe("—");
    });

    it("should return raw code for unknown code value", () => {
      expect(lookupIrsCode("deductibility", "99")).toBe("99");
    });

    it("should trim whitespace from code", () => {
      expect(lookupIrsCode("deductibility", " 1 ")).toBe(
        "Contributions are deductible",
      );
    });

    it("should look up deductibility codes", () => {
      expect(lookupIrsCode("deductibility", "1")).toBe(
        "Contributions are deductible",
      );
      expect(lookupIrsCode("deductibility", "2")).toBe(
        "Contributions are not deductible",
      );
      expect(lookupIrsCode("deductibility", "4")).toBe(
        "Contributions are deductible by treaty (foreign org)",
      );
    });

    it("should look up filing_req codes", () => {
      expect(lookupIrsCode("filing_req", "01")).toBe("Form 990 (all other)");
      expect(lookupIrsCode("filing_req", "03")).toBe("Form 990-PF required");
      expect(lookupIrsCode("filing_req", "00")).toBe("Not required to file");
    });

    it("should look up asset_cd codes", () => {
      expect(lookupIrsCode("asset_cd", "0")).toBe("$0 (none reported)");
      expect(lookupIrsCode("asset_cd", "5")).toBe("$500,000 – $999,999");
      expect(lookupIrsCode("asset_cd", "9")).toBe("$50M or more");
    });

    it("should look up income_cd codes", () => {
      expect(lookupIrsCode("income_cd", "0")).toBe("$0 (none reported)");
      expect(lookupIrsCode("income_cd", "6")).toBe("$1M – $4.9M");
      expect(lookupIrsCode("income_cd", "9")).toBe("$50M or more");
    });

    it("should look up affiliation codes", () => {
      expect(lookupIrsCode("affiliation", "1")).toBe("Central organization");
      expect(lookupIrsCode("affiliation", "3")).toBe(
        "Independent organization",
      );
      expect(lookupIrsCode("affiliation", "9")).toBe(
        "Subordinate in group ruling",
      );
    });

    it("should look up foundation codes", () => {
      expect(lookupIrsCode("foundation", "00")).toBe("Not classified");
      expect(lookupIrsCode("foundation", "10")).toBe("Church 170(b)(1)(A)(i)");
      expect(lookupIrsCode("foundation", "16")).toBe(
        "Public charity 509(a)(2)",
      );
    });
  });

  describe("formatRulingYear", () => {
    it('should return "—" for null', () => {
      expect(formatRulingYear(null)).toBe("—");
    });

    it('should return "—" for undefined', () => {
      expect(formatRulingYear()).toBe("—");
    });

    it('should return "—" for empty string', () => {
      expect(formatRulingYear("")).toBe("—");
    });

    it('should return "—" for string shorter than 4 characters', () => {
      expect(formatRulingYear("199")).toBe("—");
    });

    it("should extract 4-digit year from YYYYMM format", () => {
      expect(formatRulingYear("199201")).toBe("1992");
    });

    it("should extract 4-digit year from exactly 4 characters", () => {
      expect(formatRulingYear("2020")).toBe("2020");
    });
  });

  describe("formatActivityCodes", () => {
    it('should return "—" for null', () => {
      expect(formatActivityCodes(null)).toBe("—");
    });

    it('should return "—" for undefined', () => {
      expect(formatActivityCodes()).toBe("—");
    });

    it('should return "—" for empty string', () => {
      expect(formatActivityCodes("")).toBe("—");
    });

    it('should return "—" for all-zeros string', () => {
      expect(formatActivityCodes("000000000")).toBe("—");
    });

    it("should split 9-digit string into three 3-digit codes and skip zeros", () => {
      expect(formatActivityCodes("123456789")).toBe("123, 456, 789");
    });

    it('should skip "000" codes in the middle', () => {
      expect(formatActivityCodes("123000789")).toBe("123, 789");
    });

    it("should handle single non-zero code at start", () => {
      expect(formatActivityCodes("100000000")).toBe("100");
    });

    it('should return "—" when all extracted codes are "000"', () => {
      expect(formatActivityCodes("000000")).toBe("—");
    });
  });

  describe("lookupSatActivityCode", () => {
    it('should return "—" for null', () => {
      expect(lookupSatActivityCode(null)).toBe("—");
    });

    it('should return "—" for undefined', () => {
      expect(lookupSatActivityCode()).toBe("—");
    });

    it('should return "—" for empty string', () => {
      expect(lookupSatActivityCode("")).toBe("—");
    });

    it("should look up known SAT codes", () => {
      expect(lookupSatActivityCode("A")).toBe(
        "Asistencial (Welfare/Assistance)",
      );
      expect(lookupSatActivityCode("B")).toBe("Educativo (Education)");
      expect(lookupSatActivityCode("F")).toBe("Ecológico (Environmental)");
      expect(lookupSatActivityCode("M")).toBe(
        "Convenio Doble Imposición USA-MX (US-MX Tax Treaty)",
      );
    });

    it("should be case-insensitive", () => {
      expect(lookupSatActivityCode("a")).toBe(
        "Asistencial (Welfare/Assistance)",
      );
      expect(lookupSatActivityCode("b")).toBe("Educativo (Education)");
    });

    it("should trim whitespace before lookup", () => {
      expect(lookupSatActivityCode(" A ")).toBe(
        "Asistencial (Welfare/Assistance)",
      );
    });

    it("should return raw code for unknown SAT code", () => {
      expect(lookupSatActivityCode("Z")).toBe("Z");
    });
  });

  describe("lookupCcewClassificationCode", () => {
    it('should return "—" for null', () => {
      expect(lookupCcewClassificationCode(null)).toBe("—");
    });

    it('should return "—" for undefined', () => {
      expect(lookupCcewClassificationCode()).toBe("—");
    });

    it('should return "—" for empty string', () => {
      expect(lookupCcewClassificationCode("")).toBe("—");
    });

    it("should look up known CCEW classification codes", () => {
      expect(lookupCcewClassificationCode("101")).toBe(
        "General Charitable Purposes",
      );
      expect(lookupCcewClassificationCode("102")).toBe("Education/Training");
      expect(lookupCcewClassificationCode("103")).toBe(
        "Advancement of Health or Saving of Lives",
      );
      expect(lookupCcewClassificationCode("108")).toBe("Religious Activities");
      expect(lookupCcewClassificationCode("112")).toBe(
        "Environment/Conservation/Heritage",
      );
      expect(lookupCcewClassificationCode("117")).toBe(
        "Other Charitable Purposes",
      );
    });

    it("should trim whitespace from code", () => {
      expect(lookupCcewClassificationCode(" 101 ")).toBe(
        "General Charitable Purposes",
      );
    });

    it("should return raw code for unknown classification code", () => {
      expect(lookupCcewClassificationCode("999")).toBe("999");
    });
  });

  describe("lookupCraCategoryCode", () => {
    it('should return "—" for null', () => {
      expect(lookupCraCategoryCode(null)).toBe("—");
    });

    it('should return "—" for undefined', () => {
      expect(lookupCraCategoryCode()).toBe("—");
    });

    it('should return "—" for empty string', () => {
      expect(lookupCraCategoryCode("")).toBe("—");
    });

    it("should look up known CRA category codes", () => {
      expect(lookupCraCategoryCode("1")).toBe(
        "Organizations Relieving Poverty",
      );
      expect(lookupCraCategoryCode("30")).toBe("Christianity");
      expect(lookupCraCategoryCode("100")).toBe("Core Health Care");
      expect(lookupCraCategoryCode("170")).toBe("Environment");
      expect(lookupCraCategoryCode("180")).toBe("Animal Welfare");
      expect(lookupCraCategoryCode("210")).toBe("Foundations");
      expect(lookupCraCategoryCode("215")).toBe(
        "NASO (Not Allocated Specific Object)",
      );
    });

    it("should trim whitespace from code", () => {
      expect(lookupCraCategoryCode(" 30 ")).toBe("Christianity");
    });

    it("should return raw code for unknown CRA category code", () => {
      expect(lookupCraCategoryCode("999")).toBe("999");
    });
  });
});
