import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

/**
 * Higher order component to ensure user sign in.
 * It wraps the given component and checks if the user is authenticated.
 * If the user is not authenticated, it redirects to the sign-in page.
 * @param {React.FC} WrappedComponent - The component to wrap with authentication check.
 * @returns {React.FC} - The wrapped component with authentication check.
 */
const withAuth = (WrappedComponent: React.FC) => {
  return (props: any) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const router = useRouter();
    const auth = getAuth();

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setAuthenticated(true);
        } else {
          router.push('/signin'); // Redirect to sign-in page if not authenticated
        }
        setLoading(false);
      });

      // Error handling for onAuthStateChanged
      try {
        return () => unsubscribe();
      } catch (error) {
        console.error('Error in onAuthStateChanged:', error);
      }
    }, [auth, router]);

    // Show loading indicator while checking auth status
    if (loading) {
      return <p>Loading</p>;
    }

    // Show nothing if not authenticated
    if (!authenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
