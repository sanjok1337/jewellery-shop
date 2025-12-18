"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

interface FormErrors {
  email?: string;
  password?: string;
  code?: string;
}

type Step = 'form' | 'verification';

const Signin = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState<Step>('form');
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  
  // Verification state
  const [verificationToken, setVerificationToken] = useState<string>("");
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Please enter your password";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle code input
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    if (errors.code) {
      setErrors((prev) => ({ ...prev, code: undefined }));
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);
    const lastIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  // Step 1: Send verification code
  const handleSendCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/send-login-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send verification code");
      }

      setVerificationToken(data.verificationToken);
      setStep('verification');
      setResendTimer(60);
      toast.success("Verification code sent to your email!");
      
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code and complete login
  const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fullCode = code.join("");
    
    if (fullCode.length !== 6) {
      setErrors({ code: "Please enter the 6-digit code" });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/verify-login-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verificationToken,
          code: fullCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid code");
      }

      login(data.token, data.user);
      toast.success("Login successful! Welcome back!");
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Verification failed");
      setErrors({ code: error instanceof Error ? error.message : "Invalid code" });
    } finally {
      setLoading(false);
    }
  };

  // Resend code
  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/send-login-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send code");
      }

      setVerificationToken(data.verificationToken);
      setCode(["", "", "", "", "", ""]);
      setResendTimer(60);
      toast.success("New code sent!");
      inputRefs.current[0]?.focus();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Sign In"} pages={["Sign In"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            
            {step === 'form' ? (
              <>
                <div className="text-center mb-11">
                  <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                    Sign In to Your Account
                  </h2>
                  <p>Enter your details below</p>
                </div>

                <div>
                  <form onSubmit={handleSendCode}>
                    <div className="mb-5">
                      <label htmlFor="email" className="block mb-2.5">
                        Email <span className="text-red">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-gold/30 ${
                          errors.email ? 'border-red' : 'border-gray-3'
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red text-sm mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div className="mb-5">
                      <label htmlFor="password" className="block mb-2.5">
                        Password <span className="text-red">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        id="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        className={`rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-gold/30 ${
                          errors.password ? 'border-red' : 'border-gray-3'
                        }`}
                      />
                      {errors.password && (
                        <p className="text-red text-sm mt-1">{errors.password}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center font-medium text-white bg-gradient-to-r from-gold to-gold-dark py-3 px-6 rounded-lg ease-out duration-200 hover:from-gold-dark hover:to-gold mt-7.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          Sending code...
                        </span>
                      ) : (
                        "Continue"
                      )}
                    </button>

                    <a
                      href="#"
                      className="block text-center text-dark-4 mt-4.5 ease-out duration-200 hover:text-dark"
                    >
                      Forgot your password?
                    </a>

                    <p className="text-center mt-6">
                      Don&apos;t have an account?
                      <Link
                        href="/signup"
                        className="text-dark ease-out duration-200 hover:text-gold pl-2"
                      >
                        Sign Up Now!
                      </Link>
                    </p>
                  </form>
                </div>
              </>
            ) : (
              <>
                {/* Verification Step */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-gold to-gold-dark rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="font-semibold text-xl sm:text-2xl text-dark mb-2">
                    Verify Your Identity
                  </h2>
                  <p className="text-gray-600">
                    We sent a 6-digit code to
                  </p>
                  <p className="font-semibold text-dark">{formData.email}</p>
                </div>

                <form onSubmit={handleVerifyCode}>
                  <div className="mb-6">
                    <label className="block text-center mb-4 text-gray-700">
                      Enter verification code
                    </label>
                    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleCodePaste}>
                      {code.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => { inputRefs.current[index] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeChange(index, e.target.value)}
                          onKeyDown={(e) => handleCodeKeyDown(index, e)}
                          className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-lg border-2 outline-none transition-all duration-200 ${
                            errors.code 
                              ? 'border-red bg-red-50' 
                              : digit 
                                ? 'border-gold bg-gold/5' 
                                : 'border-gray-3 bg-gray-1'
                          } focus:border-gold focus:ring-2 focus:ring-gold/20`}
                        />
                      ))}
                    </div>
                    {errors.code && (
                      <p className="text-red text-sm mt-3 text-center">{errors.code}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || code.join("").length !== 6}
                    className="w-full flex justify-center font-medium text-white bg-gradient-to-r from-gold to-gold-dark py-3 px-6 rounded-lg ease-out duration-200 hover:from-gold-dark hover:to-gold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      "Verify & Sign In"
                    )}
                  </button>

                  <div className="text-center mt-6">
                    <p className="text-gray-600 mb-2">Didn't receive the code?</p>
                    {resendTimer > 0 ? (
                      <p className="text-gray-500">
                        Resend in <span className="font-semibold text-gold">{resendTimer}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={loading}
                        className="text-gold hover:text-gold-dark font-medium transition-colors disabled:opacity-50"
                      >
                        Resend code
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('form');
                      setCode(["", "", "", "", "", ""]);
                      setErrors({});
                    }}
                    className="w-full mt-4 text-gray-600 hover:text-dark transition-colors"
                  >
                    ← Back to login
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Signin;

