import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { api } from '../../lib/supabase';
import { Clock, TrendingUp, Flame, ArrowRight, Upload, PlayCircle, BarChart3, AlertCircle, BookOpen, Quote } from 'lucide-react';

interface DashboardPageProps {
  user: any;
  token: string;
  onLogout: () => void;
}

export function DashboardPage({ user, token, onLogout }: DashboardPageProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [weakConcepts, setWeakConcepts] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashboardData, weakConceptsData] = await Promise.all([
        api.getDashboard(token),
        api.getWeakConcepts(token),
      ]);

      setStats(dashboardData);
      setWeakConcepts(weakConceptsData.weakConcepts || []);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <Navbar user={user} onLogout={onLogout} />
        <div className="max-w-7xl mx-auto p-8 flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-muted-foreground font-medium">Preparing your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  // Stat Cards Configuration
  const statCards = [
    {
      title: "Focus Areas",
      value: stats?.weakConceptsCount || 0,
      icon: AlertCircle,
      desc: "Requires attention",
      color: "text-rose-600 dark:text-rose-400",
      bgIcon: "bg-rose-50 dark:bg-rose-900/20",
    },
    {
      title: "Due Revisions",
      value: stats?.upcomingRevisionsCount || 0,
      icon: Clock,
      desc: "Scheduled for today",
      color: "text-amber-600 dark:text-amber-400",
      bgIcon: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      title: "Mastery Score",
      value: stats?.masteryProgress || 0,
      icon: TrendingUp,
      desc: "Overall growth",
      color: "text-emerald-600 dark:text-emerald-400",
      bgIcon: "bg-emerald-50 dark:bg-emerald-900/20",
      suffix: "%"
    },
    {
      title: "Study Streak",
      value: stats?.streak || 0,
      icon: Flame,
      desc: "Consecutive days",
      color: "text-indigo-600 dark:text-indigo-400",
      bgIcon: "bg-indigo-50 dark:bg-indigo-900/20",
      suffix: stats?.streak === 1 ? ' Day' : ' Days'
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navbar user={user} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Welcome Section - Clean & Academic */}
        <div className="mb-10 animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 font-serif">
                Welcome back, {user?.name?.split(' ')[0] || 'Scholar'}.
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Your learning analytics are ready. You have <span className="font-semibold text-foreground">{stats?.upcomingRevisionsCount || 0} revisions</span> waiting for you today.
              </p>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid - Card Based */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {statCards.map((stat, i) => (
            <Card key={i} className="border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</span>
                      {stat.suffix && <span className="text-lg text-muted-foreground font-medium">{stat.suffix}</span>}
                    </div>
                  </div>
                  <div className={`p-2.5 rounded-xl ${stat.bgIcon} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground/80 font-medium flex items-center gap-1.5">
                  {stat.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>

          {/* Main Content - Focus Areas (Academic List) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Priority Concepts
              </h2>
            </div>

            <Card className="border border-border/60 shadow-sm overflow-hidden bg-card">
              <CardContent className="p-0">
                {weakConcepts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-full mb-4">
                      <TrendingUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Excellent Progress</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">
                      Your understanding is solid across all tracked topics. Challenge yourself with advanced material.
                    </p>
                    <Button onClick={() => navigate('/upload')} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-6 h-10 shadow-sm">
                      Upload New Material
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {weakConcepts.map((concept, idx) => (
                      <div key={idx} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors group">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-secondary text-secondary-foreground border border-secondary">
                              {concept.subject}
                            </span>
                            <span className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-full">
                              Score: {Math.round(concept.score)}%
                            </span>
                          </div>
                          <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
                            {concept.topic}
                          </h3>
                        </div>
                        <Button
                          onClick={() => navigate(`/correction/${encodeURIComponent(concept.topic)}`)}
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm"
                        >
                          Review Topic <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-0.5" />
                        </Button>
                      </div>
                    ))}
                    <div className="bg-muted/20 p-4 text-center border-t border-border/50">
                      <Button variant="ghost" className="text-sm text-muted-foreground hover:text-primary">
                        View Full Concept Map
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Quick Actions & Quote */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Tools & Actions</h2>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/upload')}
                className="w-full group flex items-start gap-4 p-4 rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-md transition-all text-left"
              >
                <div className="shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">Upload Notes</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Systematic analysis of new learning modules (PDF/Img)</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/revision')}
                className="w-full group flex items-start gap-4 p-4 rounded-xl border border-border/60 bg-card hover:border-amber-400/30 hover:shadow-md transition-all text-left"
              >
                <div className="shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-colors">
                  <PlayCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground group-hover:text-amber-600 transition-colors">Active Recall</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Start your scheduled spaced repetition session</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/progress')}
                className="w-full group flex items-start gap-4 p-4 rounded-xl border border-border/60 bg-card hover:border-emerald-400/30 hover:shadow-md transition-all text-left"
              >
                <div className="shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground group-hover:text-emerald-600 transition-colors">Analytics</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Review mastery curves and performance metrics</p>
                </div>
              </button>
            </div>

            {/* Academic Quote Card */}
            <div className="relative overflow-hidden p-6 rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900">
              <Quote className="absolute top-4 left-4 w-8 h-8 text-indigo-200 dark:text-indigo-900 -z-0 opacity-50" />
              <div className="relative z-10">
                <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200 italic leading-relaxed mb-3">
                  "Learning is not attained by chance, it must be sought for with ardor and attended to with diligence."
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-px w-8 bg-indigo-300 dark:bg-indigo-700"></div>
                  <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide">Abigail Adams</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
