import { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { api } from '../../lib/supabase';
import { TrendingUp, Award, Zap, BookOpen } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface ProgressPageProps {
  user: any;
  token: string;
  onLogout: () => void;
}

export function ProgressPage({ user, token, onLogout }: ProgressPageProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any[]>([]);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const { progress: progressData } = await api.getProgress(token);
      setProgress(progressData || []);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMasteryColor = (level: string) => {
    switch (level) {
      case 'mastered': return 'bg-green-500 hover:bg-green-600';
      case 'improving': return 'bg-blue-500 hover:bg-blue-600';
      case 'learning': return 'bg-amber-500 hover:bg-amber-600';
      default: return 'bg-slate-500';
    }
  };

  const getMasteryLabel = (level: string) => {
    switch (level) {
      case 'mastered': return 'Mastered';
      case 'improving': return 'Improving';
      case 'learning': return 'Learning';
      default: return 'Needs Focus';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const masteredCount = progress.filter(p => p.mastery_level === 'mastered').length;
  const learningCount = progress.filter(p => p.mastery_level === 'learning').length;
  const improvingCount = progress.filter(p => p.mastery_level === 'improving').length;
  const totalTopics = progress.length;

  // Transform data for charts
  const chartData = progress.filter(p => p.day1_score || p.day7_score).map(p => ({
    name: p.topic.substring(0, 10) + '...',
    fullTopic: p.topic,
    day1: p.day1_score || 0,
    day7: p.day7_score || p.day3_score || 0 // Fallback to day3 if day7 not present
  }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <Navbar user={user} onLogout={onLogout} />

      <main className="max-w-6xl mx-auto p-6 md:p-8 animate-in fade-in slide-in-from-bottom-5">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 font-serif">Learning Analytics</h1>
          <p className="text-muted-foreground text-lg">Visualizing your journey from confusion to mastery.</p>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Topics</p>
                <h3 className="text-2xl font-bold">{totalTopics}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-full">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Mastered</p>
                <h3 className="text-2xl font-bold">{masteredCount}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">In Progress</p>
                <h3 className="text-2xl font-bold">{learningCount + improvingCount}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Avg Recall</p>
                <h3 className="text-2xl font-bold">
                  {progress.length > 0 ? Math.round(progress.reduce((acc, curr) => acc + (curr.day1_score || 0), 0) / progress.length) : 0}%
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <Card className="lg:col-span-2 border-none shadow-lg">
            <CardHeader>
              <CardTitle>Retention Growth</CardTitle>
              <CardDescription>Comparing initial recall vs current recall mastery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                      <Tooltip
                        cursor={{ fill: '#f1f5f9' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="day1" name="Initial Recall" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="day7" name="Current Recall" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    Not enough data to display chart yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mastery Feed */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Topic Status</CardTitle>
              <CardDescription>Real-time mastery tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {progress.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <p className="font-medium text-sm text-slate-900 dark:text-slate-200 line-clamp-1">{item.topic}</p>
                    <p className="text-xs text-slate-500">{item.subject}</p>
                  </div>
                  <Badge className={`${getMasteryColor(item.mastery_level)} text-white border-none shadow-sm min-w-[80px] justify-center`}>
                    {getMasteryLabel(item.mastery_level)}
                  </Badge>
                </div>
              ))}
              {progress.length === 0 && (
                <p className="text-center text-slate-500 py-4 text-sm">
                  Complete your diagnostic tests to see mastery data here.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
