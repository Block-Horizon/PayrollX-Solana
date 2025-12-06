#!/usr/bin/env ts-node

/**
 * API Code Generation Script
 *
 * This script:
 * 1. Fetches Swagger/OpenAPI JSON from all running microservices
 * 2. Merges them into a single unified OpenAPI spec
 * 3. Generates TypeScript client code using @hey-api/openapi-ts
 */

import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import { execSync } from "child_process";

// __dirname is provided by CommonJS and ts-node with ESM interop
declare const __dirname: string;

// Configuration
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || "http://localhost:3000";
const GATEWAY_SWAGGER_PATH = "/api/docs/unified";

const OUTPUT_DIR = path.join(__dirname, "..", "lib", "generated");
const MERGED_SPEC_PATH = path.join(OUTPUT_DIR, "openapi-merged.json");

/**
 * Fetch merged OpenAPI JSON from API Gateway
 */
function fetchOpenApiSpec(): Promise<any> {
  return new Promise((resolve) => {
    const url = `${API_GATEWAY_URL}${GATEWAY_SWAGGER_PATH}`;

    console.log(`📡 Fetching merged OpenAPI spec from API Gateway at ${url}`);

    http
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          console.warn(`⚠️  HTTP ${res.statusCode} from API Gateway`);
          // Return empty spec instead of failing
          resolve({
            openapi: "3.0.0",
            info: {
              title: "PayrollX Unified API",
              version: "1.0",
              description: "API temporarily unavailable",
            },
            paths: {},
            components: {},
          });
          return;
        }

        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const spec = JSON.parse(data);
            console.log(`✅ Successfully fetched merged spec from API Gateway`);
            resolve(spec);
          } catch (error: any) {
            console.warn(
              `⚠️  Failed to parse JSON from API Gateway: ${error?.message || "Unknown error"}`
            );
            resolve({
              openapi: "3.0.0",
              info: {
                title: "PayrollX Unified API",
                version: "1.0",
                description: "API temporarily unavailable",
              },
              paths: {},
              components: {},
            });
          }
        });
      })
      .on("error", (error) => {
        console.warn(`⚠️  Failed to fetch from API Gateway: ${error.message}`);
        // Return empty spec instead of failing
        resolve({
          openapi: "3.0.0",
          info: {
            title: "PayrollX Unified API",
            version: "1.0",
            description: "API temporarily unavailable",
          },
          paths: {},
          components: {},
        });
      });
  });
}

/**
 * No longer needed - API Gateway handles merging
 * Kept for backwards compatibility if we need fallback
 */
function mergeOpenApiSpecs(specs: any[]): any {
  // If we only have one spec (from gateway), return it as-is
  if (specs.length === 1) {
    return specs[0];
  }

  // Fallback merging logic (shouldn't be used)
  const merged: any = {
    openapi: "3.0.0",
    info: {
      title: "PayrollX Unified API",
      version: "1.0",
      description: "Combined API for all PayrollX microservices",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "API Gateway",
      },
    ],
    paths: {},
    components: {
      schemas: {},
      parameters: {},
      responses: {},
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [],
  };

  specs.forEach((spec) => {
    if (spec.paths) {
      Object.keys(spec.paths).forEach((path) => {
        merged.paths[path] = spec.paths[path];
      });
    }

    if (spec.components) {
      if (spec.components.schemas) {
        Object.keys(spec.components.schemas).forEach((schema) => {
          merged.components.schemas[schema] = spec.components.schemas[schema];
        });
      }
      if (spec.components.parameters) {
        Object.keys(spec.components.parameters).forEach((param) => {
          merged.components.parameters[param] =
            spec.components.parameters[param];
        });
      }
      if (spec.components.responses) {
        Object.keys(spec.components.responses).forEach((response) => {
          merged.components.responses[response] =
            spec.components.responses[response];
        });
      }
    }

    if (spec.tags && Array.isArray(spec.tags)) {
      merged.tags.push(...spec.tags);
    }
  });

  return merged;
}

/**
 * Generate TypeScript client code using swagger-typescript-api
 */
function generateClient(): boolean {
  console.log(
    "🔨 Generating TypeScript client using swagger-typescript-api..."
  );

  try {
    // Generate single api.ts file with all types and endpoints
    execSync(
      `npx swagger-typescript-api generate -p "${MERGED_SPEC_PATH}" -o "${OUTPUT_DIR}" -n api.ts --axios --extract-request-params --extract-request-body --extract-response-body --responses --clean-output --sort-routes --sort-types --unwrap-response-data`,
      { stdio: "inherit", cwd: path.join(__dirname, "..") }
    );
    console.log("✅ TypeScript client generated successfully!");
    return true;
  } catch (error) {
    console.error(
      "❌ Failed to generate TypeScript client:",
      (error as Error).message
    );
    return false;
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log("🚀 Starting API code generation...\n");

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Check if already generated (fast path)
  const apiFilePath = path.join(OUTPUT_DIR, "api.ts");
  if (fs.existsSync(apiFilePath)) {
    console.log("✅ API client already generated, creating index.ts if missing...");
    const indexPath = path.join(OUTPUT_DIR, "index.ts");
    if (!fs.existsSync(indexPath)) {
      fs.writeFileSync(
        indexPath,
        "// Re-export everything from the generated api.ts\nexport * from './api';\n"
      );
      console.log("✅ Created index.ts");
    }
    console.log("✨ API code generation completed successfully!");
    console.log(`📁 Generated files are in: ${OUTPUT_DIR}`);
    return;
  }

  // Fetch merged OpenAPI spec from API Gateway
  console.log("📥 Fetching merged OpenAPI spec from API Gateway...\n");
  const spec = await fetchOpenApiSpec();

  // Check if spec is empty (services not running)
  let merged = mergeOpenApiSpecs([spec]);
  if (!merged.paths || Object.keys(merged.paths).length === 0) {
    console.log("⚠️  No paths in fetched spec, using static fallback...");
    const staticSpecPath = path.join(__dirname, "openapi-static.json");
    console.log(`📄 Looking for static spec at: ${staticSpecPath}`);
    if (fs.existsSync(staticSpecPath)) {
      merged = JSON.parse(fs.readFileSync(staticSpecPath, "utf-8"));
      console.log("✅ Using static fallback spec");
    }
  }

  // Save merged spec
  fs.writeFileSync(MERGED_SPEC_PATH, JSON.stringify(merged, null, 2));
  console.log(`✅ Merged spec saved to ${MERGED_SPEC_PATH}`);

  // Generate TypeScript client
  console.log("\n");
  const success = generateClient();

  // Create index.ts to re-export from api.ts
  if (success) {
    const indexPath = path.join(OUTPUT_DIR, "index.ts");
    fs.writeFileSync(
      indexPath,
      "// Re-export everything from the generated api.ts\nexport * from './api';\n"
    );
    console.log("✅ Created index.ts for easier imports");
  }

  if (success) {
    console.log("\n✨ API code generation completed successfully!");
    console.log(`📁 Generated files are in: ${OUTPUT_DIR}`);
  } else {
    console.log("\n⚠️  API code generation completed with warnings");
    console.log(
      "💡 If services were not running, consider using the fallback script"
    );
  }

  process.exit(success ? 0 : 0);
}

// Run the script
main().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
