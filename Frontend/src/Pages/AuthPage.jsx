import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { HashLoader } from "react-spinners"; // Import HashLoader

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const AuthPage = () => {
    // State to manage which form (Sign In or Sign Up) is currently active
    const [activeForm, setActiveForm] = useState('signin'); // Default to 'signin'
    // State to trigger banner content animation
    const [bannerAnimate, setBannerAnimate] = useState(false);
    // State to manage initial loading for the entire page
    const [pageLoading, setPageLoading] = useState(true);

    // Effect to determine the initial active form based on URL query parameter
    // and to handle initial page loading
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode'); // Check for '?mode=signup' or '?mode=signin' in URL

        if (mode === 'signup') {
            setActiveForm('signup');
        } else {
            // Default to signin if no mode or an unknown mode is specified
            setActiveForm('signin');
        }
        // Set a timeout to hide the page loader after a short delay (e.g., 500ms)
        const loaderTimer = setTimeout(() => {
            setPageLoading(false);
            // After loader is hidden, immediately set bannerAnimate to true to show initial content
            setBannerAnimate(true);
        }, 500); // Adjust this duration as needed

        return () => clearTimeout(loaderTimer); // Cleanup the timer
    }, []); // Run only once on component mount

    // Function to toggle between Sign In and Sign Up forms
    const toggleAuthForms = (formType) => {
        // Start banner content animation out
        setBannerAnimate(false);

        // Delay the form switch and "in" animation to allow "out" animation to play
        setTimeout(() => {
            setActiveForm(formType);
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('mode', formType);
            window.history.pushState({ path: newUrl.href }, '', newUrl.href);
            // Trigger "in" animation for new content
            setBannerAnimate(true);
        }, 300); // This delay should match your banner-content CSS transition duration
    };

    // Handler for successful Google authentication
    const handleGoogleSuccess = async (credentialResponse) => {
        console.log("Google Login/Signup Success:", credentialResponse);
        try {
            const response = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: credentialResponse.credential }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Google authentication failed on backend.');
            }

            const userData = await response.json();
            console.log("Backend response (user data/session):", userData);
            alert(`Welcome, ${userData.name || userData.email || 'User'}! You are authenticated.`);

        } catch (error) {
            console.error("Error during Google authentication with backend:", error.message);
            alert(`Authentication failed: ${error.message}. Please check console for details.`);
        }
    };

    // Handler for failed Google authentication
    const handleGoogleError = () => {
        console.log('Google Login/Signup Failed');
        alert('Google authentication failed. Please try again.');
    };

    // Show HashLoader while pageLoading is true
    if (pageLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white">
                <HashLoader color="#42d9e4" size={80} /> {/* Using the same blue from your design */}
            </div>
        );
    }

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <style>{`
                body {
                    font-family: 'Inter', sans-serif;
                    background-color: #f0f2f5;
                    margin: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    padding: 1.25rem;
                    box-sizing: border-box;
                }

                .main-container {
                    margin: auto;
                    display: flex;
                    flex-direction: column; /* Default for mobile */
                    width: 100%;
                    max-width: 75rem;
                    background-color: #fff;
                    box-shadow: 0 0.625rem 1.5625rem rgba(148, 187, 10, 0.1);
                    border-radius: 0.75rem;
                    overflow: hidden;
                    transition: flex-direction 0.5s ease-in-out; /* Smooth transition for reordering */
                }

                @media (min-width: 768px) {
                    .main-container {
                        flex-direction: row; /* Default for desktop (auth on left, banner on right) */
                    }
                    .main-container.reverse-layout {
                        flex-direction: row-reverse; /* For signup (auth on right, banner on left) */
                    }

                    .banner-section {
                        border-radius: 0.75rem 0 0 0.75rem; /* Default position (right) */
                    }
                    .reverse-layout .banner-section {
                        border-radius: 0 0.75rem 0.75rem 0; /* Flipped position (left) */
                    }
                    .auth-section {
                        border-radius: 0 0.75rem 0.75rem 0; /* Default position (left) */
                    }
                    .reverse-layout .auth-section {
                        border-radius: 0.75rem 0 0 0.75rem; /* Flipped position (right) */
                    }
                }

                .auth-section {
                    padding: 2.5rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    width: 100%;
                }

                .auth-section h1 {
                    font-size: 2.25rem;
                    font-weight: 700;
                    color: #333;
                    margin-bottom: 1.875rem;
                    text-align: center;
                }

                .tab-buttons {
                    display: flex;
                    background-color: #f0f2f5;
                    border-radius: 0.5rem;
                    padding: 0.25rem;
                    margin-bottom: 2.5rem;
                }

                .tab-button {
                    flex: 1;
                    padding: 0.875rem 1.25rem;
                    font-size: 1rem;
                    font-weight: 500;
                    color: #555;
                    background-color: transparent;
                    border: none;
                    border-radius: 0.375rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-align: center;
                }

                .tab-button:hover { background-color: #e5e7eb; }
                .tab-button.active {
                    background-color: #42d9e4; /* Your theme color */
                    color: #fff;
                    box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.1);
                }

                .form-section { display: none; }
                .form-section.active { display: block; }

                .form-group { margin-bottom: 1.5rem; }
                .form-group label {
                    display: block;
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: #444;
                    margin-bottom: 0.5rem;
                }
                .form-input {
                    width: 100%;
                    padding: 0.875rem 1rem;
                    border: 1px solid #d1d5db;
                    border-radius: 0.5rem;
                    font-size: 1rem;
                    color: #333;
                    transition: border-color 0.3s ease, box-shadow 0.3s ease;
                }
                .form-input:focus {
                    outline: none;
                    border-color: #42d9e4; /* Your theme color */
                    box-shadow: 0 0 0 0.1875rem rgba(59, 130, 246, 0.2);
                }

                .btn {
                    width: 100%;
                    padding: 0.875rem 1.25rem;
                    border: none;
                    border-radius: 0.5rem;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.3s ease, box-shadow 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.625rem;
                }
                .btn-primary {
                    background-color: #3b82f6;
                    color: #fff;
                    box-shadow: 0 0.25rem 0.75rem rgba(59, 130, 246, 0.3);
                    margin-bottom: 1rem;
                }
                .btn-primary:hover {
                    background-color: #2563eb;
                    box-shadow: 0 0.375rem 1rem rgba(59, 130, 246, 0.4);
                }

                .google-login-button-wrapper > div {
                    width: 100% !important;
                    display: flex;
                    justify-content: center;
                }

                .divider {
                    display: flex;
                    align-items: center;
                    text-align: center;
                    margin: 1.5rem 0;
                }
                .divider::before, .divider::after {
                    content: '';
                    flex: 1;
                    border-bottom: 1px solid #d1d5db;
                }
                .divider span {
                    padding: 0 1rem;
                    font-size: 0.85rem;
                    color: #6b7280;
                }

                .banner-section {
                    background: linear-gradient(135deg, #3b82f6, #9333ea);
                    padding: 2.5rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    color: #fff;
                    width: 100%;
                    min-height: 15.625rem;
                    border-bottom-left-radius: 0.75rem;
                    border-bottom-right-radius: 0.75rem;
                    position: relative;
                    overflow: hidden;
                }
                .banner-content {
                    transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
                    opacity: 0;
                    transform: translateY(20px);
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    color: #fff;
                }

                .banner-content.active {
                    opacity: 1;
                    transform: translateY(0);
                }
            `}</style>

            <div className={`main-container ${activeForm === 'signup' ? 'reverse-layout' : ''}`}>
                {/* Banner Section with Animation */}
                <div className="banner-section">
                    <div className={`banner-content ${bannerAnimate ? 'active' : ''}`}>
                        <h2>Your Journey Starts Here!</h2>
                        <p>Sign in or sign up to explore amazing products and exclusive offers.</p>
                        <img src="https://placehold.co/350x200/007bff/ffffff?text=Great+Deals+Await!" alt="E-commerce promotional banner" className="banner-image" />
                    </div>
                </div>

                <div className="auth-section">
                    <h1>Welcome!</h1>
                    <div className="tab-buttons">
                        <button
                            id="signup-tab"
                            className={`tab-button ${activeForm === 'signup' ? 'active' : ''}`}
                            onClick={() => toggleAuthForms('signup')}
                        >
                            Sign Up
                        </button>
                        <button
                            id="signin-tab"
                            className={`tab-button ${activeForm === 'signin' ? 'active' : ''}`}
                            onClick={() => toggleAuthForms('signin')}
                        >
                            Sign In
                        </button>
                    </div>

                    {/* Sign In Form Section */}
                    <div id="signin-form-section" className={`form-section ${activeForm === 'signin' ? 'active' : ''}`}>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="form-group">
                                <label htmlFor="signin-email">Email or Mobile Number</label>
                                <input type="text" id="signin-email" name="email" className="form-input" placeholder="Enter your email or mobile number" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="signin-password">Password</label>
                                <input type="password" id="signin-password" name="password" className="form-input" placeholder="Enter your password" />
                            </div>
                            <button type="submit" className="btn btn-primary">Login</button>

                            <div className="divider">
                                <span>OR</span>
                            </div>

                            <div className="google-login-button-wrapper">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                />
                            </div>
                        </form>
                    </div>

                    {/* Sign Up Form Section */}
                    <div id="signup-form-section" className={`form-section ${activeForm === 'signup' ? 'active' : ''}`}>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="form-group">
                                <label htmlFor="signup-name">Full Name</label>
                                <input type="text" id="signup-name" name="name" className="form-input" placeholder="Enter your full name" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="signup-email">Email Address</label>
                                <input type="email" id="signup-email" name="email" className="form-input" placeholder="Enter your email address" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="signup-phone">Mobile Number</label>
                                <input type="tel" id="signup-phone" name="phone" className="form-input" placeholder="Enter your mobile number" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="signup-password">Set Password</label>
                                <input type="password" id="signup-password" name="password" className="form-input" placeholder="Set your password" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirm-password">Confirm Password</label>
                                <input type="password" id="confirm-password" name="confirm_password" className="form-input" placeholder="Confirm your password" />
                            </div>
                            <button type="submit" className="btn btn-primary">Sign Up</button>

                            <div className="divider">
                                <span>OR</span>
                            </div>

                            <div className="google-login-button-wrapper">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};

export default AuthPage;
