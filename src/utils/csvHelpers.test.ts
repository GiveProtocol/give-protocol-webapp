import { jest } from "@jest/globals";
import { convertToCSV, downloadCSV } from "./csvHelpers";

describe("csvHelpers", () => {
  describe("convertToCSV", () => {
    it("should convert array of objects to CSV format", () => {
      const data = [
        { name: "John", age: 30, city: "New York" },
        { name: "Jane", age: 25, city: "Los Angeles" },
      ];

      const result = convertToCSV(data);
      const lines = result.split("\n");

      expect(lines[0]).toBe("name,age,city");
      expect(lines[1]).toBe('"John","30","New York"');
      expect(lines[2]).toBe('"Jane","25","Los Angeles"');
    });

    it("should handle empty array", () => {
      const result = convertToCSV([]);
      expect(result).toBe("");
    });

    it("should escape double quotes in values", () => {
      const data = [{ name: 'John "The King" Doe', city: "New York" }];

      const result = convertToCSV(data);
      const lines = result.split("\n");

      expect(lines[1]).toBe('"John ""The King"" Doe","New York"');
    });

    it("should handle null and undefined values", () => {
      const data = [
        { name: "John", age: null, city: undefined },
      ];

      const result = convertToCSV(data);
      const lines = result.split("\n");

      expect(lines[1]).toBe('"John","",""');
    });

    it("should handle values with commas", () => {
      const data = [{ address: "123 Main St, Apt 4", city: "New York" }];

      const result = convertToCSV(data);
      const lines = result.split("\n");

      expect(lines[1]).toBe('"123 Main St, Apt 4","New York"');
    });

    it("should convert numbers to strings", () => {
      const data = [{ count: 42, price: 99.99 }];

      const result = convertToCSV(data);
      const lines = result.split("\n");

      expect(lines[1]).toBe('"42","99.99"');
    });
  });

  describe("downloadCSV", () => {
    let createElementSpy: jest.SpyInstance;
    let createObjectURLSpy: jest.SpyInstance;
    let revokeObjectURLSpy: jest.SpyInstance;
    let appendChildSpy: jest.SpyInstance;
    let mockLink: {
      setAttribute: jest.Mock;
      click: jest.Mock;
      remove: jest.Mock;
      style: { visibility: string };
    };

    beforeEach(() => {
      // Mock document.createElement
      mockLink = {
        setAttribute: jest.fn(),
        click: jest.fn(),
        remove: jest.fn(),
        style: { visibility: "" },
      };

      createElementSpy = jest
        .spyOn(document, "createElement")
        .mockReturnValue(mockLink as unknown as HTMLElement);

      // Mock document.body.appendChild
      appendChildSpy = jest.spyOn(document.body, "appendChild").mockImplementation(() => {
        // Empty mock to prevent actual execution
        return mockLink as unknown as Node;
      });

      // Mock URL methods by assigning them to global URL
      URL.createObjectURL = jest.fn().mockReturnValue("blob:mock-url");
      URL.revokeObjectURL = jest.fn();

      createObjectURLSpy = jest.spyOn(URL, "createObjectURL");
      revokeObjectURLSpy = jest.spyOn(URL, "revokeObjectURL");

      // Mock Blob
      global.Blob = jest.fn().mockImplementation((content, options) => ({
        content,
        options,
      })) as unknown as typeof Blob;
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should create a blob with correct content and type", () => {
      const csvData = "name,age\nJohn,30";
      const filename = "test.csv";

      downloadCSV(csvData, filename);

      expect(global.Blob).toHaveBeenCalledWith([csvData], {
        type: "text/csv;charset=utf-8;",
      });
    });

    it("should create object URL from blob", () => {
      const csvData = "name,age\nJohn,30";
      const filename = "test.csv";

      downloadCSV(csvData, filename);

      expect(createObjectURLSpy).toHaveBeenCalled();
    });

    it("should create link element with correct attributes", () => {
      const csvData = "name,age\nJohn,30";
      const filename = "test.csv";

      downloadCSV(csvData, filename);

      expect(createElementSpy).toHaveBeenCalledWith("a");
      expect(mockLink.setAttribute).toHaveBeenCalledWith("href", "blob:mock-url");
      expect(mockLink.setAttribute).toHaveBeenCalledWith("download", filename);
      expect(mockLink.style.visibility).toBe("hidden");
    });

    it("should trigger download and cleanup", () => {
      const csvData = "name,age\nJohn,30";
      const filename = "test.csv";

      downloadCSV(csvData, filename);

      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.remove).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");
    });

    it("should handle different filenames", () => {
      const csvData = "data";
      const filename = "custom-export-2024.csv";

      downloadCSV(csvData, filename);

      expect(mockLink.setAttribute).toHaveBeenCalledWith("download", filename);
    });
  });
});
