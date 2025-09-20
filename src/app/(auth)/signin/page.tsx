"use client";
import React, { useEffect, useState, useTransition } from "react";
import { CodeXml, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { signIn } from "@/utils/auth/actions";
import OAuthButtons from "@/app/_components/auth/OAuthButtons";
import { useRouter } from "next/navigation";

const SignInPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const isValid = formData.email && formData.password;

    setIsFormValid(!!isValid);
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || pending) return;
    setError(null);
    startTransition(async () => {
      const res = await signIn({
        email: formData.email.trim(),
        password: formData.password,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      router.push("/");
    });
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0F111A] text-gray-200 font-sans">
      <div className="hidden lg:flex flex-col justify-center items-start w-[40%] p-20 bg-[#161925] relative">
        <div className="flex items-center gap-4 mb-10">
          <CodeXml className="size-15 text-white" />
          <h1 className="text-4xl font-bold text-white">DevFlow</h1>
        </div>
        <h2 className="text-5xl font-bold mb-4 text-gray-300 max-w-md">
          Start your coding journey
        </h2>
        <p className="text-lg text-gray-400 max-w-md">
          Professional online code editor with multiple languages and powerful
          features.
        </p>
      </div>

      <div className="w-full lg:w-3/4 flex items-center justify-center flex-col lg:p-8 ">
        <div className="text-center lg:hidden mb-3">
          <div className="flex items-center justify-center gap-3 mb-4 mt-6">
            <CodeXml className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">DevFlow</h1>
          </div>
        </div>
        <div className="w-full max-w-xl bg-[#161925] border border-gray-800 md:rounded-2xl lg:rounded-2xl p-8">
          <div className="text-left mb-8">
            <h1 className="text-2xl font-bold mb-1 text-center">
              Welcome back
            </h1>
            <p className="text-gray-400 text-center">
              Sign in to your account to continue coding
            </p>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="text-sm font-medium mb-2 block" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full bg-[#2A2D3A] text-gray-200 py-2 px-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            {/* Password */}
            <div className="relative">
              <label
                className="text-sm font-medium mb-2 block"
                htmlFor="password"
              >
                Password
              </label>
              <input
                type={passwordVisible ? "text" : "password"}
                id="password"
                value={formData.password}
                required
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-[#2A2D3A] text-gray-200 py-2 px-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute right-3 top-10 text-gray-400 cursor-pointer"
              >
                {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={!isFormValid || pending}
              className="w-full cursor-pointer bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition-all duration-300 disabled:from-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Signing In..." : "Sign In"}
            </button>
            {error && (
              <p className="text-sm text-red-400 -mt-3" role="alert">
                {error}
              </p>
            )}
          </form>

          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-700" />
            <span className="px-4 text-xs text-gray-500">OR CONTINUE WITH</span>
            <hr className="flex-grow border-gray-700" />
          </div>

          <OAuthButtons redirectTo="/" />

          <p className="text-center text-sm text-gray-400 mt-8">
            Create a new account?{" "}
            <Link
              href="/signup"
              className="text-blue-400 font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
