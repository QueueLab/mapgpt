import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { firebaseConfig } from './config';

initializeApp(firebaseConfig);

/**
 * SignIn component handles the user sign-in process using Firebase authentication.
 * It provides a form for users to enter their email and password, and handles the sign-in logic.
 */
const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/app'); // Redirect to the app when authenticated
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

  /**
   * Handles the sign-in process when the form is submitted.
   * It uses Firebase authentication to sign in the user with the provided email and password.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/app'); // Redirect to the app on successful sign-in
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
      console.error('Error in signInWithEmailAndPassword:', err);
    }
  };

  return (
    <div className="container">
      <h1>Sign In</h1>
      <form onSubmit={handleSignIn}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit"> Sign In </button>
      </form>

      <style jsx>{`
        .container {
          max-width: 400px;
          margin: 0 auto;
          padding: 2rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        input {
          display: block;
          width: 100%;
          margin-bottom: 1rem;
          padding: 0.5rem;
          font-size: 1rem;
        }
        button {
          width: 100%;
          padding: 0.75rem;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .error {
          color: red;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default SignIn;
