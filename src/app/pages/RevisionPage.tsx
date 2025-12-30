import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Slider } from '../components/ui/slider';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { api } from '../../lib/supabase';
import { Calendar, CheckCircle, Clock, AlertTriangle, ArrowRight, BrainCircuit } from 'lucide-react';
import { Badge } from '../components/ui/badge';

interface RevisionPageProps {
  user: any;
  token: string;
  onLogout: () => void;
}

export function RevisionPage({ user, token, onLogout }: RevisionPageProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [selectedRevision, setSelectedRevision] = useState<any>(null);
  const [recallScore, setRecallScore] = useState([5]);

  useEffect(() => {
    loadRevisions();
  }, []);

  const loadRevisions = async () => {
    try {
      const { revisions: revData, error } = await api.getRevisions(token);

      if (error) {
        toast.error(error);
      } else {
        setRevisions(revData || []);
      }
    } catch (err) {
      toast.error('Failed to load revisions');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedRevision) return;

    try {
      const { error } = await api.completeRevision(
        token,
        selectedRevision.id,
        recallScore[0]
      );

      if (error) {
        toast.error(error);
      } else {
        toast.success('Revision completed! Great job.');
        setSelectedRevision(null);
        setRecallScore([5]);
        loadRevisions();
      }
    } catch (err) {
      toast.error('Failed to complete revision');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // ACTIVE REVISION QUIZ MODE
  if (selectedRevision) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        <Navbar user={user} onLogout={onLogout} />
        <main className="flex-1 max-w-2xl w-full mx-auto p-6 flex flex-col justify-center">
          <Card className="border-none shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-primary/5 p-6 border-b border-primary/10">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="bg-white border-primary/20 text-primary">Day {selectedRevision.revision_day} Revision</Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> ~2 mins
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-serif">{selectedRevision.topic}</h2>
            </div>

            <CardContent className="p-8 space-y-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="bg-primary/20 p-2 rounded-full text-primary mt-1">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm uppercase text-muted-foreground mb-1">Recall Task</p>
                    <p className="text-lg font-medium leading-normal">
                      Without looking at your notes, explain the core concept of {selectedRevision.topic} out loud.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium text-slate-500">Self-Check Questions:</p>
                  <ul className="space-y-3">
                    <li className="flex gap-3 text-slate-700 dark:text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      What are the key formulas or rules?
                    </li>
                    <li className="flex gap-3 text-slate-700 dark:text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      Can you apply it to a real-world example?
                    </li>
                    <li className="flex gap-3 text-slate-700 dark:text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      What was the 'tricky part' you learned last time?
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base">Honest Recall Rating</Label>
                    <span className={`text-xl font-bold ${recallScore[0] > 7 ? 'text-green-600' : recallScore[0] < 4 ? 'text-red-500' : 'text-amber-500'}`}>
                      {recallScore[0]}/10
                    </span>
                  </div>
                  <Slider
                    value={recallScore}
                    onValueChange={setRecallScore}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    <span>Forgot it</span>
                    <span>Vague memory</span>
                    <span>Mastered</span>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedRevision(null)}
                    className="flex-1 text-muted-foreground hover:text-slate-900"
                  >
                    Recall Later
                  </Button>
                  <Button onClick={handleComplete} className="flex-[2] h-12 text-lg shadow-lg shadow-primary/20">
                    Submit Review
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // REVISION LIST VIEW
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <Navbar user={user} onLogout={onLogout} />

      <main className="max-w-4xl mx-auto p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 font-serif">Daily Revision</h1>
            <p className="text-muted-foreground text-lg">
              Spaced repetition is the key to long-term memory.
            </p>
          </div>
          {revisions.length > 0 && (
            <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {revisions.length} Due Today
            </div>
          )}
        </div>

        {revisions.length === 0 ? (
          <Card className="border-dashed border-2 shadow-none bg-slate-50/50">
            <CardContent className="p-16 text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-3 font-serif">All Caught Up!</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
                You've completed all your revisions for today. great consistency!
              </p>
              <Button onClick={() => navigate('/dashboard')} size="lg" variant="outline">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {revisions.map((revision: any) => (
              <Card key={revision.id} className="group hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-normal">
                        {revision.subject}
                      </Badge>
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        Due Now
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{revision.topic}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" /> Day {revision.revision_day} Streak
                      </span>
                    </div>
                  </div>

                  <div className="px-6 pb-6 sm:pb-0 sm:pr-6 sm:pl-0 flex items-center">
                    <Button
                      onClick={() => setSelectedRevision(revision)}
                      size="lg"
                      className="w-full sm:w-auto shadow-md group-hover:shadow-primary/20 group-hover:translate-x-1 transition-all"
                    >
                      Start Recall <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
