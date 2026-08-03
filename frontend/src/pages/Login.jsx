import { motion } from 'framer-motion';
import AuthLayout from '../components/auth/AuthLayout';
import LoginForm from '../components/auth/LoginForm';

export default function Login() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <AuthLayout>
        <LoginForm />
      </AuthLayout>
    </motion.div>
  );
}