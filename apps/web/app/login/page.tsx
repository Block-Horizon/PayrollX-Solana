"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { toast } from "sonner";
import { Zap, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const loginFromApiResponse = useAuthStore(
    (state) => state.loginFromApiResponse
  );
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const authUser = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || !authUser) {
      return;
    }

    const hasCookie = typeof document !== "undefined" &&
      document.cookie.split(';').some(c => c.trim().startsWith('auth-storage='));

    if (hasCookie) {
      const role = authUser.role?.toLowerCase() || "";
      const normalizedRole = role.replace(/_/g, "").toLowerCase();

      let redirectPath = "/dashboard";

      if (normalizedRole === "employee") {
        redirectPath = "/employee-portal";
      } else if (
        normalizedRole === "orgadmin" ||
        normalizedRole === "superadmin" ||
        normalizedRole === "hrmanager" ||
        normalizedRole === "org_admin" ||
        normalizedRole === "super_admin" ||
        normalizedRole === "hr_manager"
      ) {
        redirectPath = "/dashboard";
      }

      const currentPath = window.location.pathname;
      if (currentPath === "/login" || currentPath === "/register") {
        router.replace(redirectPath);
      }
    }
  }, [isAuthenticated, hasHydrated, authUser, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const response = await apiClient.auth.login({
        email: data.email,
        password: data.password,
      });

      if (!response?.user || !response?.accessToken) {
        throw new Error("Invalid response from server");
      }

      const user = response.user;
      if (!user.email || !user.firstName || !user.lastName || !user.id) {
        throw new Error("Invalid user data from server");
      }

      loginFromApiResponse(
        {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        response.accessToken
      );

      const role = response.user.role?.toLowerCase() || "";
      const normalizedRole = role.replace(/_/g, "").toLowerCase();

      let redirectPath = "/dashboard";

      if (normalizedRole === "employee") {
        redirectPath = "/employee-portal";
      } else if (
        normalizedRole === "orgadmin" ||
        normalizedRole === "superadmin" ||
        normalizedRole === "hrmanager" ||
        normalizedRole === "org_admin" ||
        normalizedRole === "super_admin" ||
        normalizedRole === "hr_manager"
      ) {
        redirectPath = "/dashboard";
      }

      if (typeof document !== "undefined") {
        const expires = new Date();
        expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000);
        document.cookie = `auth-storage=authenticated; path=/; expires=${expires.toUTCString()}; SameSite=Lax; Secure=${window.location.protocol === "https:"}`;
      }

      toast.success("Login successful!", {
        description: `Welcome back, ${response.user.firstName || ""} ${response.user.lastName || ""}!`,
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      router.push(redirectPath);
    } catch (err: unknown) {
      console.error("Login error:", err);

      let errorMessage = "Login failed. Please check your credentials.";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      } else if (
        err &&
        typeof err === "object" &&
        "response" in err
      ) {
        const axiosError = err as {
          response?: {
            data?: {
              message?: string;
            };
          };
        };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }

      toast.error("Login Error", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4"
      >
        <Card className="bg-[#18181b] border-[#27272a] shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-[#5eead4] rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-[#09090b]" />
              </div>
            </div>
            <CardTitle className="text-2xl text-[#fafafa]">Welcome back</CardTitle>
            <CardDescription className="text-[#71717a]">
              Sign in to your PayrollX account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-[#fafafa] text-sm font-medium"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="bg-[#09090b] border-[#27272a] text-[#fafafa] placeholder:text-[#52525b] focus:border-[#5eead4] focus:ring-[#5eead4]"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-[#fafafa] text-sm font-medium"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="bg-[#09090b] border-[#27272a] text-[#fafafa] placeholder:text-[#52525b] focus:border-[#5eead4] focus:ring-[#5eead4] pr-10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#71717a] hover:text-[#fafafa] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-[#5eead4] hover:bg-[#5eead4]/90 text-[#09090b] font-medium shadow-lg transition-all duration-200"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => router.push("/register")}
                className="text-[#71717a] hover:text-[#fafafa]"
              >
                Don't have an account? Sign up
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
