import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { api } from '../../lib/supabase';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthPageProps {
  onAuth: (token: string, user: any) => void;
}

export function AuthPage({ onAuth }: AuthPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { user, error } = await api.signup(email, password, name);

      if (error) {
        toast.error(error);
        setIsLoading(false);
        return;
      }

      // Auto sign in after signup
      const signInResponse = await api.signin(email, password);
      if (signInResponse.error) {
        toast.error(signInResponse.error);
      } else {
        toast.success('Account created successfully!');
        onAuth(signInResponse.session.access_token, signInResponse.user);
      }
    } catch (err) {
      toast.error('Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { session, user, error } = await api.signin(email, password);

      if (error) {
        toast.error(error);
      } else {
        toast.success('Signed in successfully!');
        onAuth(session.access_token, user);
      }
    } catch (err) {
      toast.error('Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Background Decor Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[100px] animate-float opacity-70" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/20 blur-[120px] animate-float opacity-70" style={{ animationDelay: '3s' }} />
      </div>

      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 p-4 z-10 items-center">

        {/* Left Side - Brand & Graphics */}
        <div className="hidden lg:flex flex-col justify-center space-y-8 p-8 animate-slide-in-right">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg">
                <Sparkles className="w-8 h-8 text-white animate-pulse-soft" />
              </div>
              <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary leading-tight">
                ConceptPulse
              </h1>
            </div>
            <h2 className="text-4xl font-bold text-foreground">
              Master Your Learning <br />
              <span className="text-muted-foreground">With Precision AI</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-md">
              Stop guessing. Start improving. Our AI-driven diagnostics identify your weak spots and guide you to mastery.
            </p>
          </div>

          <div className="space-y-4">
            {[
              "Personalized Learning Paths",
              "Real-time Performance Analytics",
              "Smart Revision Scheduling"
            ].map((feature, i) => (
              <div key={i} className="flex items-center space-x-3 p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/5 shadow-sm hover:translate-x-2 transition-transform duration-300">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="w-full max-w-md mx-auto animate-slide-up">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary inline-block mb-2">ConceptPulse</h1>
            <p className="text-muted-foreground">AI-Powered Precision Learning</p>
          </div>

          <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to continue your journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="animate-slide-up">
                  <form onSubmit={handleSignin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-white/50 dark:bg-slate-950/50 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-white/50 dark:bg-slate-950/50 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-lg shadow-primary/20" disabled={isLoading}>
                      {isLoading ? (
                        <span className="flex items-center gap-2">Processing...</span>
                      ) : (
                        <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4" /></span>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="animate-slide-up">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="bg-white/50 dark:bg-slate-950/50 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-white/50 dark:bg-slate-950/50 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="bg-white/50 dark:bg-slate-950/50 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-lg shadow-primary/20" disabled={isLoading}>
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
