export type HealthIndicatorStatus = "up" | "down";

export interface HealthIndicatorResult {
  [key: string]: {
    status: HealthIndicatorStatus;
    message?: string;
  };
}

export interface HealthCheckOptions {
  serviceName: string;
  performHealthCheck: () => Promise<Record<string, unknown>>;
  performReadinessCheck?: () => Promise<void>;
}

export interface HealthCheckResult {
  status: string;
  timestamp: string;
  service: string;
  version: string;
  uptime: number;
  memory: NodeJS.MemoryUsage;
  [key: string]: unknown;
}

export const createHealthCheck = (options: HealthCheckOptions) => {
  const { serviceName, performHealthCheck, performReadinessCheck } = options;

  const check = async (): Promise<HealthCheckResult> => {
    try {
      const healthData = await performHealthCheck();

      return {
        status: "ok",
        timestamp: new Date().toISOString(),
        service: serviceName,
        version: process.env.npm_package_version || "1.0.0",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        ...healthData,
      };
    } catch (error) {
      console.error("Health check failed:", error);
      throw new Error("Service unhealthy");
    }
  };

  const ready = async (): Promise<{ status: string; timestamp: string }> => {
    try {
      if (performReadinessCheck) {
        await performReadinessCheck();
      } else {
        await performHealthCheck();
      }

      return {
        status: "ready",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Readiness check failed:", error);
      throw new Error("Service not ready");
    }
  };

  const live = async (): Promise<{ status: string; timestamp: string }> => {
    return {
      status: "alive",
      timestamp: new Date().toISOString(),
    };
  };

  const isHealthy = async (key: string): Promise<HealthIndicatorResult> => {
    try {
      await performHealthCheck();
      return {
        [key]: {
          status: "up" as HealthIndicatorStatus,
        },
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        [key]: {
          status: "down" as HealthIndicatorStatus,
          message,
        },
      };
    }
  };

  return {
    check,
    ready,
    live,
    isHealthy,
  };
};
