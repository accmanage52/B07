import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Shield, Users, ArrowRight, Sparkles, Zap, Globe } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent glow-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Floating orbs for visual effect */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-primary rounded-full opacity-20 animate-float blur-xl"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-secondary rounded-full opacity-20 animate-float delay-1000 blur-xl"></div>
      <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-gradient-accent rounded-full opacity-20 animate-float delay-2000 blur-xl"></div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <header className="flex flex-col items-center text-center mb-20 animate-fade-in">
          <div className="flex items-center gap-3 mb-6 group">
            <div className="relative">
              <Building2 className="h-12 w-12 text-primary animate-glow" />
              <Sparkles className="h-4 w-4 text-secondary absolute -top-1 -right-1 animate-float" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Financial CRM
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-3xl leading-relaxed">
            Transform your financial operations with our modern, 
            <span className="bg-gradient-secondary bg-clip-text text-transparent font-semibold"> colorful </span>
            and intuitive banking solution
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-gradient-primary hover:scale-105 transition-all duration-300 glow-hover text-lg px-8 py-4 rounded-xl font-semibold group"
            >
              Get Started 
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/auth')}
              className="border-2 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300 text-lg px-8 py-4 rounded-xl font-semibold backdrop-blur-sm"
            >
              Sign In
            </Button>
          </div>
        </header>

        {/* Features Section */}
        <section className="mb-20">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Features for Modern Banking
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to manage accounts, merchants, and financial operations in one beautiful platform
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 animate-scale-in">
            <Card className="glass glow-card hover:glow-hover transition-all duration-300 border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-primary rounded-lg">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-foreground">Account Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Effortlessly manage customer accounts, debit cards, and banking details with our intuitive interface and secure storage.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass glow-card hover:glow-hover transition-all duration-300 border-l-4 border-l-secondary">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-secondary rounded-lg">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-foreground">Merchant Integration</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Seamlessly integrate with popular payment gateways like PayTM, PhonePe, GPay, and BharatPe for comprehensive coverage.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass glow-card hover:glow-hover transition-all duration-300 border-l-4 border-l-accent">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-accent rounded-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-foreground">Security & Access</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Role-based access control with admin and accountant permissions, ensuring data security and proper workflow management.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass glow-card hover:glow-hover transition-all duration-300 border-l-4 border-l-warning">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-primary rounded-lg">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-foreground">Real-time Updates</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Get instant updates on transactions, account changes, and merchant activities with live notifications and alerts.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass glow-card hover:glow-hover transition-all duration-300 border-l-4 border-l-info">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-secondary rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-foreground">User Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Comprehensive user management system with profile controls, password management, and detailed audit trails.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass glow-card hover:glow-hover transition-all duration-300 border-l-4 border-l-success">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-accent rounded-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-foreground">Modern Design</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Beautiful, responsive interface with glassmorphism effects, vibrant colors, and smooth animations for the best user experience.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center glass rounded-3xl p-12 glow-card animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Transform Your Banking?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using our platform to streamline their financial operations.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="bg-gradient-primary hover:scale-105 transition-all duration-300 glow-hover text-lg px-12 py-4 rounded-xl font-semibold group"
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </section>

        {/* Footer */}
        <footer className="mt-20 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Building2 className="h-5 w-5" />
            <span className="text-lg">Financial CRM - Modern Banking Made Simple</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
