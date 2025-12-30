import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle2, ChevronRight, ChevronLeft, BookOpen, BrainCircuit, Target, Lightbulb, ArrowRight, PlayCircle } from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { api } from '../../lib/supabase';
import { toast } from 'sonner';

interface CorrectionPageProps {
  user: any;
  token: string;
  onLogout: () => void;
}

export function CorrectionPage({ user, token, onLogout }: CorrectionPageProps) {
  const { topic } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const decodedTopic = decodeURIComponent(topic || 'Concept');

  useEffect(() => {
    loadCorrection();
  }, [decodedTopic]);

  const loadCorrection = async () => {
    try {
      const { correction } = await api.getCorrection(token, decodedTopic);
      if (!correction) {
        toast.error('Failed to load correction');
      } else {
        setData(correction);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const steps = data ? [
    {
      id: 'intro',
      title: 'Target Fix',
      icon: Target,
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold font-serif">{data.intro.title}</h2>
          <p className="text-muted-foreground text-lg">{data.intro.description}</p>
          <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-100 dark:border-amber-900/20 text-left">
            <p className="text-amber-800 dark:text-amber-200 text-sm font-medium flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> Why this matters
            </p>
            <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">{data.intro.why}</p>
          </div>
        </div>
      )
    },
    {
      id: 'explanation',
      title: 'Explanation',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold font-serif">{data.explanation.title}</h3>
          <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">{data.explanation.text}</p>
          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
            <p className="font-mono text-sm text-slate-500 mb-2">Key Definition</p>
            <p className="font-medium text-lg italic">"{data.explanation.definition}"</p>
          </div>
        </div>
      )
    },
    {
      id: 'analogy',
      title: 'Analogy',
      icon: BrainCircuit,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold font-serif">{data.analogy.title}</h3>
          <div className="aspect-video bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30">
            <div className="text-center">
              <BrainCircuit className="w-16 h-16 text-indigo-300 mx-auto mb-2" />
              <span className="text-indigo-700 dark:text-indigo-300 font-medium">{data.analogy.visual}</span>
            </div>
          </div>
          <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">{data.analogy.text}</p>
        </div>
      )
    },
    {
      id: 'example',
      title: 'Example',
      icon: PlayCircle,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold font-serif">Let's Solve One</h3>
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 shadow-sm"><span className="text-xs font-bold text-slate-400 uppercase">Step 1</span><p className="font-medium mt-1">{data.example.step1}</p></div>
            <div className="flex justify-center"><ArrowRight className="w-5 h-5 text-slate-300 rotate-90" /></div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 shadow-sm border-l-4 border-l-primary"><span className="text-xs font-bold text-primary uppercase">Step 2</span><p className="font-medium mt-1">{data.example.step2}</p></div>
            <div className="flex justify-center"><ArrowRight className="w-5 h-5 text-slate-300 rotate-90" /></div>
            <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-100"><span className="text-xs font-bold text-green-600 uppercase">Answer</span><p className="font-bold text-lg mt-1 text-green-800 dark:text-green-300">{data.example.answer}</p></div>
          </div>
        </div>
      )
    },
    {
      id: 'finish',
      title: 'Done',
      icon: CheckCircle2,
      content: (
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-serif">You're Ready!</h2>
          <p className="text-muted-foreground">You've reviewed {decodedTopic}. Let's schedule a revision.</p>
        </div>
      )
    }
  ] : [];

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center">Failed to load.</div>;

  const currentStepData = steps[currentStep];
  const progressVal = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar user={user} onLogout={onLogout} />
      <main className="flex-1 max-w-2xl w-full mx-auto p-6 md:p-8 flex flex-col">
        {/* Progress Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{currentStepData.title}</span>
            <span>{currentStep + 1} of {steps.length}</span>
          </div>
          <Progress value={progressVal} className="h-2" />
        </div>

        {/* Card Content */}
        <Card className="flex-1 border-none shadow-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-8 duration-300 key={currentStep}">
          <CardContent className="flex-1 p-8 sm:p-10 flex flex-col justify-center">
            {currentStepData.content}
          </CardContent>

          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="text-muted-foreground"
            >
              <ChevronLeft className="w-5 h-5 mr-2" /> Back
            </Button>

            <Button onClick={() => {
              if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1);
              else navigate('/revision');
            }} className="pl-6 pr-4">
              {currentStep === steps.length - 1 ? 'Finish & Revise' : 'Next'}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
