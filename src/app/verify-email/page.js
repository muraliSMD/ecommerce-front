"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }

        const verifyEmail = async () => {
            try {
                const res = await fetch(`/api/users/verify-email?token=${token}`);
                const data = await res.json();

                if (res.ok) {
                    setStatus('success');
                    setMessage(data.message);
                    // Optional: Redirect to login after a few seconds
                    // setTimeout(() => router.push('/'), 3000);
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Verification failed.');
                }
            } catch (error) {
                setStatus('error');
                setMessage('An error occurred. Please try again.');
            }
        };

        verifyEmail();
    }, [token, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
            {status === 'loading' && (
                <>
                    <FiLoader className="w-16 h-16 text-primary animate-spin mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800">Verifying...</h1>
                    <p className="text-gray-600 mt-2">{message}</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <FiCheckCircle className="w-16 h-16 text-green-500 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800">Email Verified!</h1>
                    <p className="text-gray-600 mt-2">{message}</p>
                    <Link href="/" className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                        Go to Home
                    </Link>
                </>
            )}

            {status === 'error' && (
                <>
                    <FiXCircle className="w-16 h-16 text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800">Verification Failed</h1>
                    <p className="text-gray-600 mt-2">{message}</p>
                    <Link href="/" className="mt-6 text-primary hover:underline">
                        Return to Home
                    </Link>
                </>
            )}
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-surface flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
                <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
                    <VerifyEmailContent />
                </Suspense>
            </div>
        </div>
    );
}
