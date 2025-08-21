import LoginForm from '@/components/auth/login-form';
import { BrainCircuit } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <header className="flex items-center gap-4 mb-8">
        <BrainCircuit className="h-12 w-12 text-primary" />
        <h1 className="text-4xl font-bold tracking-tighter">MemorEase</h1>
      </header>
      <LoginForm />
    </div>
  );
}
