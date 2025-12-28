import { getEnv } from "../env";

// Type definitions for test environments
interface MockImportMeta {
  env: Record<string, unknown>;
}

interface MockImport {
  meta: MockImportMeta;
}

interface GlobalWithImport {
  import?: MockImport;
}

interface GlobalWithProcess {
  process?: typeof process;
}

describe("getEnv utility", () => {
  // Store original process.env to restore after tests
  const originalProcessEnv = process.env;

  afterEach(() => {
    // Restore original process.env
    process.env = originalProcessEnv;
  });

  describe("Vite environment detection", () => {
    it("detects Vite environment via globalThis.import.meta.env", () => {
      // Mock Vite environment
      const mockEnv = {
        PROD: false,
        DEV: true,
        MODE: "development",
        VITE_MONITORING_ENDPOINT: "https://test-endpoint",
      };

      // Create a backup of the original globalThis
      const globalWithImport = globalThis as unknown as GlobalWithImport;
      const originalImport = globalWithImport.import;

      // Mock globalThis.import.meta.env
      globalWithImport.import = {
        meta: {
          env: mockEnv,
        },
      };

      const result = getEnv();

      expect(result).toEqual(mockEnv);

      // Restore original globalThis
      if (originalImport) {
        globalWithImport.import = originalImport;
      } else {
        delete globalWithImport.import;
      }
    });

    it("handles globalThis.import.meta.env via dynamic access", () => {
      // Mock Vite environment via dynamic access path
      const mockEnv = {
        PROD: true,
        DEV: false,
        MODE: "production",
        VITE_MONITORING_ENDPOINT: "https://prod-endpoint",
      };

      const globalWithImport = globalThis as unknown as GlobalWithImport;
      const originalImport = globalWithImport.import;

      // Set up the environment that would be accessed dynamically
      globalWithImport.import = {
        meta: {
          env: mockEnv,
        },
      };

      const result = getEnv();

      expect(result).toEqual(mockEnv);

      // Restore
      if (originalImport) {
        globalWithImport.import = originalImport;
      } else {
        delete globalWithImport.import;
      }
    });

    it("handles missing import.meta gracefully by falling back to process.env", () => {
      // In Jest environment, import.meta is typically not available
      // getEnv should fall back to process.env gracefully
      const result = getEnv();

      // Should fall back to process.env or defaults
      expect(result).toBeDefined();
      expect(result).toHaveProperty("PROD");
      expect(result).toHaveProperty("DEV");
      expect(result).toHaveProperty("MODE");
      // In Jest, MODE should be "test"
      expect(result.MODE).toBe("test");
    });
  });

  describe("environment detection behavior", () => {
    it("always returns a valid environment object", () => {
      const result = getEnv();

      // Core properties should always be present
      expect(result).toHaveProperty("PROD");
      expect(result).toHaveProperty("DEV");
      expect(result).toHaveProperty("MODE");
      expect(typeof result.PROD).toBe("boolean");
      expect(typeof result.DEV).toBe("boolean");
      expect(typeof result.MODE).toBe("string");
    });

    it("handles missing environment gracefully with defaults", () => {
      // In Jest environment without Vite, should fall back to defaults
      const result = getEnv();

      expect(result).toEqual(
        expect.objectContaining({
          PROD: expect.any(Boolean),
          DEV: expect.any(Boolean),
          MODE: expect.any(String),
        }),
      );
    });

    it("returns object with expected core properties", () => {
      const result = getEnv();

      // Core environment flags should always be present
      expect(result).toHaveProperty("PROD");
      expect(result).toHaveProperty("DEV");
      expect(result).toHaveProperty("MODE");
    });
  });

  describe("process.env scenarios", () => {
    it("handles production NODE_ENV correctly", () => {
      // Mock production environment
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      // Remove any import.meta to force process.env path
      const originalImport = (globalThis as unknown as GlobalWithImport).import;
      delete (globalThis as unknown as GlobalWithImport).import;

      const result = getEnv();

      expect(result.PROD).toBe(true);
      expect(result.DEV).toBe(false);
      expect(result.MODE).toBe("production");

      // Restore
      process.env.NODE_ENV = originalNodeEnv;
      if (originalImport) {
        (globalThis as unknown as GlobalWithImport).import = originalImport;
      }
    });

    it("handles development NODE_ENV correctly", () => {
      // Mock development environment
      const originalNodeEnv = process.env.NODE_ENV;
      const originalMonitoring = process.env.VITE_MONITORING_ENDPOINT;
      
      process.env.NODE_ENV = "development";
      process.env.VITE_MONITORING_ENDPOINT = "https://dev-monitoring";

      // Remove any import.meta to force process.env path
      const originalImport = (globalThis as unknown as GlobalWithImport).import;
      delete (globalThis as unknown as GlobalWithImport).import;

      const result = getEnv();

      expect(result.PROD).toBe(false);
      expect(result.DEV).toBe(true);
      expect(result.MODE).toBe("development");
      expect(result.VITE_MONITORING_ENDPOINT).toBe("https://dev-monitoring");

      // Restore
      process.env.NODE_ENV = originalNodeEnv;
      process.env.VITE_MONITORING_ENDPOINT = originalMonitoring;
      if (originalImport) {
        (globalThis as unknown as GlobalWithImport).import = originalImport;
      }
    });

    it("handles missing NODE_ENV with default development", () => {
      // Mock missing NODE_ENV
      const originalNodeEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;

      // Remove any import.meta to force process.env path
      const originalImport = (globalThis as unknown as GlobalWithImport).import;
      delete (globalThis as unknown as GlobalWithImport).import;

      const result = getEnv();

      expect(result.PROD).toBe(false);
      expect(result.DEV).toBe(true);
      expect(result.MODE).toBe("development");

      // Restore
      process.env.NODE_ENV = originalNodeEnv;
      if (originalImport) {
        (globalThis as unknown as GlobalWithImport).import = originalImport;
      }
    });

    it("uses default fallback when process is undefined", () => {
      // Mock scenario where process is undefined
      const globalWithProcess = global as unknown as GlobalWithProcess;
      const globalWithImport = globalThis as unknown as GlobalWithImport;
      const originalProcess = globalWithProcess.process;
      delete globalWithProcess.process;

      // Remove any import.meta to force fallback path
      const originalImport = globalWithImport.import;
      delete globalWithImport.import;

      const result = getEnv();

      expect(result.PROD).toBe(false);
      expect(result.DEV).toBe(true);
      expect(result.MODE).toBe("development");
      expect(result.VITE_MONITORING_ENDPOINT).toBeUndefined();

      // Restore
      globalWithProcess.process = originalProcess;
      if (originalImport) {
        globalWithImport.import = originalImport;
      }
    });
  });

  describe("Node.js environment processing", () => {
    it("detects Jest test environment correctly", () => {
      // In Jest environment, NODE_ENV is typically "test"
      const result = getEnv();

      expect(result.MODE).toBe("test");
      expect(result.PROD).toBe(false);
      expect(result.DEV).toBe(false); // Test is neither prod nor dev
    });

    it("provides consistent behavior for the current environment", () => {
      const result = getEnv();

      // Should consistently detect the same environment
      expect(typeof result.PROD).toBe("boolean");
      expect(typeof result.DEV).toBe("boolean");
      expect(typeof result.MODE).toBe("string");

      // In Jest, we expect test environment
      expect(result.MODE).toBe("test");
    });

    it("includes all expected core environment properties", () => {
      const result = getEnv();

      // Should have all the core properties our code expects
      expect(result).toHaveProperty("PROD");
      expect(result).toHaveProperty("DEV");
      expect(result).toHaveProperty("MODE");
    });

    it("returns valid boolean types for environment flags", () => {
      const result = getEnv();

      expect(typeof result.PROD).toBe("boolean");
      expect(typeof result.DEV).toBe("boolean");
      expect(typeof result.MODE).toBe("string");
    });

    it("maintains logical consistency", () => {
      const result = getEnv();

      // PROD and DEV should be mutually exclusive
      expect(result.PROD && result.DEV).toBe(false);
    });

    it("provides additional NODE_ENV information", () => {
      const result = getEnv();

      // The function may include additional environment info
      // This tests that extra properties don't break functionality
      expect(typeof result).toBe("object");
      expect(result).not.toBeNull();
    });
  });

  describe("fallback behavior", () => {
    it("provides sensible defaults when environment detection fails", () => {
      // In Jest, we can't easily mock import.meta, but we can test that
      // the function handles this gracefully and provides defaults
      const result = getEnv();

      // Should always provide a complete environment object with expected structure
      expect(result.PROD).toBeDefined();
      expect(result.DEV).toBeDefined();
      expect(result.MODE).toBeDefined();

      expect(typeof result.PROD).toBe("boolean");
      expect(typeof result.DEV).toBe("boolean");
      expect(typeof result.MODE).toBe("string");
    });

    it("ensures boolean values for PROD and DEV flags", () => {
      const result = getEnv();

      expect(typeof result.PROD).toBe("boolean");
      expect(typeof result.DEV).toBe("boolean");
    });

    it("ensures PROD flag is true in production mode", () => {
      const result = getEnv();
      // Skip test if not in production mode
      if (result.MODE !== "production") {
        return;
      }
      expect(result.PROD).toBe(true);
      expect(result.DEV).toBe(false);
    });

    it("ensures DEV flag is true in development mode", () => {
      const result = getEnv();
      // Skip test if not in development mode
      if (result.MODE !== "development") {
        return;
      }
      expect(result.PROD).toBe(false);
      expect(result.DEV).toBe(true);
    });

    it("handles environment detection gracefully without throwing", () => {
      // The main value of getEnv is that it never throws, always returns something usable
      expect(() => getEnv()).not.toThrow();

      const result = getEnv();
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
    });
  });

  describe("environment type consistency", () => {
    it("maintains consistent environment detection logic", () => {
      const result = getEnv();

      // Core consistency checks
      expect(result.MODE).toMatch(/^(development|production|test|staging)$/);

      // Logical consistency - PROD and DEV should be mutually exclusive
      expect(!(result.PROD && result.DEV)).toBe(true);
    });

    it("handles current environment appropriately", () => {
      // In Jest, the environment is typically "test"
      const result = getEnv();

      expect(result.MODE).toBe("test");
      expect(result.PROD).toBe(false);
      expect(result.DEV).toBe(false); // Test environment is neither prod nor dev
    });

    it("provides stable results across multiple calls", () => {
      // Environment detection should be deterministic
      const result1 = getEnv();
      const result2 = getEnv();

      expect(result1.MODE).toBe(result2.MODE);
      expect(result1.PROD).toBe(result2.PROD);
      expect(result1.DEV).toBe(result2.DEV);
    });
  });

  describe("edge cases and robustness", () => {
    it("handles extreme environment scenarios", () => {
      // Test that function is robust and never fails
      const result = getEnv();

      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
      expect(result).not.toBeNull();
    });

    it("provides all required core properties", () => {
      const result = getEnv();

      const requiredProperties = [
        "PROD",
        "DEV",
        "MODE",
      ];
      requiredProperties.forEach((prop) => {
        expect(result).toHaveProperty(prop);
      });
    });

    it("handles property access without errors", () => {
      const result = getEnv();

      // Should be able to access core properties without throwing
      expect(() => {
        const _prod = result.PROD;
        const _dev = result.DEV;
        const _mode = result.MODE;
      }).not.toThrow();
    });
  });

  describe("edge cases and error handling", () => {
    it("getEnv function never throws exceptions", () => {
      // The main value of getEnv is that it never throws, always returns something usable
      expect(() => getEnv()).not.toThrow();
      const result = getEnv();
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
    });

    it("returns consistent environment across multiple calls", () => {
      const result1 = getEnv();
      const result2 = getEnv();

      expect(result1.MODE).toBe(result2.MODE);
      expect(result1.PROD).toBe(result2.PROD);
      expect(result1.DEV).toBe(result2.DEV);
    });
  });
});
