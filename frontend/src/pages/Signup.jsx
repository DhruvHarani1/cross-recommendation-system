import { motion } from 'framer-motion';
import SignUpLayout from '../components/auth/SignUpLayout';
import SignUpForm from '../components/auth/SignUpForm';

export default function Signup() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <SignUpLayout>
        <SignUpForm />
      </SignUpLayout>
    </motion.div>
  );
}
