'use client';

import React, { useState } from 'react';
import { SignInForm } from '../../../components/auth/SignInForm';
import Logo from '../../../components/Logo';

export default function SignInPage() {
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleSuccess = () => {
    setError('');
    setSuccess('Check your email for the sign-in link!');
    // Don&apos;t redirect immediately for email link - user needs to check email
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccess('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo size="lg" className="mx-auto" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to MediaForge
          </h2>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <SignInForm onSuccess={handleSuccess} onError={handleError} />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account? Signing in will automatically create one for you.
          </p>
        </div>
      </div>
    </div>
  );
}