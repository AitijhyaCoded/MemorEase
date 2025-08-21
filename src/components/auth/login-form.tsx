'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp, signIn, googleSignIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      // Redirect or handle login state will be managed by the AuthProvider
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await googleSignIn();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{isSignUp ? 'Create Account' : 'Sign In'}</CardTitle>
        <CardDescription>
          {isSignUp ? 'Enter your details to create an account.' : 'Enter your credentials to access your account.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>
         <div className="my-4 flex items-center">
          <div className="flex-grow border-t border-muted-foreground"></div>
          <span className="mx-4 text-xs text-muted-foreground">OR</span>
          <div className="flex-grow border-t border-muted-foreground"></div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
           {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in with Google
        </Button>
        <div className="mt-4 text-center text-sm">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} className="px-1">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
