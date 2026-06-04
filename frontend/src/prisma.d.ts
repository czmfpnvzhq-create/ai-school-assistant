declare module "prisma" {
  export interface PrismaConfig {
    schema?: string;
    migrations?: {
      path?: string;
      seed?: string;
    };
    datasource?: {
      url?: string;
    };
    // Add other Prisma config fields as needed
  }

  /** Define Prisma configuration
   * @param config Prisma configuration object
   * @returns the same config object (used by Next.js build)
   */
  export function defineConfig(config: PrismaConfig): PrismaConfig;
}
