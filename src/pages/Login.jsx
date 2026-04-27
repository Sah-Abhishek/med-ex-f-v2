import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthLayout from '../layouts/AuthLayout';
import LoginForm from '../components/auth/LoginForm';

const Login = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
