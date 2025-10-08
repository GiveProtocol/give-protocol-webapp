import { jest } from '@jest/globals';
import { MOCK_TEMPLATE_EXAMPLES } from "../templates";
import type {
  MockComponentTemplate,
  MockDataTemplate,
  MockOverridesTemplate,
} from "../templates";

describe("templates", () => {
  describe("MockComponentTemplate", () => {
    it("allows component props to be typed correctly", () => {
      const props: MockComponentTemplate = {
        children: "Test",
        className: "test-class",
        onClick: jest.fn(),
        onClose: jest.fn(),
        disabled: false,
        customProp: "custom value",
      };

      expect(props.children).toBe("Test");
      expect(props.className).toBe("test-class");
      expect(typeof props.onClick).toBe("function");
      expect(typeof props.onClose).toBe("function");
      expect(props.disabled).toBe(false);
      expect(props.customProp).toBe("custom value");
    });
  });

  describe("MockDataTemplate", () => {
    it("allows mock data to be typed correctly", () => {
      interface User {
        id: string;
        name: string;
      }

      const mockData: MockDataTemplate<User> = {
        data: { id: "123", name: "Test User" },
        error: null,
        loading: false,
      };

      expect(mockData.data).toEqual({ id: "123", name: "Test User" });
      expect(mockData.error).toBeNull();
      expect(mockData.loading).toBe(false);
    });

    it("supports array data", () => {
      const mockData: MockDataTemplate<string> = {
        data: ["item1", "item2"],
        error: null,
      };

      expect(mockData.data).toEqual(["item1", "item2"]);
    });

    it("supports error state", () => {
      const mockData: MockDataTemplate = {
        data: null,
        error: new Error("Test error"),
      };

      expect(mockData.data).toBeNull();
      expect(mockData.error).toBeInstanceOf(Error);
    });
  });

  describe("MockOverridesTemplate", () => {
    it("allows method overrides to be typed correctly", () => {
      const overrides: MockOverridesTemplate = {
        fetchData: jest.fn(),
        updateData: jest.fn(),
        customConfig: { timeout: 5000 },
      };

      expect(typeof overrides.fetchData).toBe("function");
      expect(typeof overrides.updateData).toBe("function");
      expect(overrides.customConfig).toEqual({ timeout: 5000 });
    });
  });

  describe("MOCK_TEMPLATE_EXAMPLES", () => {
    it("contains example code string", () => {
      expect(MOCK_TEMPLATE_EXAMPLES).toContain(
        "Example 1: Creating a typed mock component",
      );
      expect(MOCK_TEMPLATE_EXAMPLES).toContain(
        "Example 2: Creating typed mock data",
      );
      expect(MOCK_TEMPLATE_EXAMPLES).toContain(
        "Example 3: Creating a mock factory",
      );
    });
  });
});
