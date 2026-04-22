"use client";

import Button from "@/components/buttons/button";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLoginMutation } from "@/store/features/auth/authAPI";
import { ClipLoader } from "react-spinners";
import { TextInput } from "@/components/inputs/textInput";
import GoogleButton from "@/components/buttons/googleButton";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [login, { isLoading, error }] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      await login({ email, password }).unwrap();
      router.push("/");
    } catch (err: any) {
      // Error is handled by Redux and displayed below
      console.error("Login failed:", err);
    }
  };

  const getErrorMessage = () => {
    if (!error) return null;
    if (typeof error === 'string') return error;
    if ('data' in error && error.data) {
      const data = error.data as any;
      return data?.message || data?.messages?.[0] || 'Login failed. Please try again.';
    }
    return 'Login failed. Please try again.';
  };

  const errorMessage = getErrorMessage();

  return (
    <form className="login-form" onSubmit={handleSubmit}>
  {errorMessage && (
    <div className="login-form__error">{errorMessage}</div>
  )}

  <div className="login-form__field">
    <label className="login-form__field-label">Email address</label>
    <TextInput
      placeholder="Enter your email"
      type="email"
      required
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      disabled={isLoading}
    />
  </div>

  <div className="login-form__field">
    <label className="login-form__field-label">Password</label>
    <TextInput
      placeholder="Enter your password"
      type="password"
      required
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      disabled={isLoading}
    />
  </div>

  <p className="login-form__text">
    Forgot your account?{" "}
    <Link href="/reset" className="login-form__link login-form__link--gray">
      Click here to reset.
    </Link>
  </p>

  <Button type="submit" className="login-form__button" disabled={isLoading}>
    {isLoading ? (
      <span className="flex items-center justify-center gap-2">
        <ClipLoader size={16} color="#fff" />
        Logging in...
      </span>
    ) : (
      "Login"
    )}
      </Button>
      
      <div className="other">
        <div className="other__divider">
          <div className="other__divider__line" />
          <p className="other__divider__text">OR</p>
          <div className="other__divider__line"/>
        </div>
        <GoogleButton/>
      </div>

  <p className="login-form__text login-form__text--center">
    Don't have an account?{" "}
    <Link href="/signup" className="login-form__link login-form__link--green">
      Create an account
    </Link>
  </p>
</form>

  );
}
