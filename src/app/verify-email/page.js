"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';

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

    const [email, setEmail] = useState('');
    const [isResending, setIsResending] = useState(false);

    const handleResend = async (e) => {
        e.preventDefault();
        setIsResending(true);
        try {
            const res = await fetch('/api/users/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                setEmail('');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to resend email");
        } finally {
            setIsResending(false);
        }
    };

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
                <div className="w-full max-w-sm">
                    <FiXCircle className="w-16 h-16 text-red-500 mb-4 mx-auto" />
                    <h1 className="text-2xl font-bold text-gray-800">Verification Failed</h1>
                    <p className="text-gray-600 mt-2 mb-6">{message}</p>
                    
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-left">
                        <h3 className="font-bold text-gray-900 mb-2">Resend Verification Email</h3>
                        <p className="text-sm text-gray-500 mb-4">Enter your email address to receive a new verification link.</p>
                        <form onSubmit={handleResend} className="space-y-3">
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary transition-colors"
                            />
                            <button 
                                type="submit" 
                                disabled={isResending}
                                className="w-full bg-primary text-white font-bold py-2 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
                            >
                                {isResending ? "Sending..." : "Resend Link"}
                            </button>
                        </form>
                    </div>

                    <Link href="/" className="mt-6 inline-block text-primary hover:underline">
                        Return to Home
                    </Link>
                </div>
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
