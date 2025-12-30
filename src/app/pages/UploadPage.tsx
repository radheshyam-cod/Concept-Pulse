import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { api } from '../../lib/supabase';
import { Upload, FileText, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface UploadPageProps {
  user: any;
  token: string;
  onLogout: () => void;
}

// Default subjects fallback
const ALL_SUBJECTS = [
  "Physics", "Chemistry", "Mathematics", "Biology", "English", "Computer Science", "History", "Geography", "Economics", "Other"
];

export function UploadPage({ user, token, onLogout }: UploadPageProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Filter subjects based on exam type
  const getSubjects = () => {
    const examType = user?.exam_type;
    console.log('Current Exam Type:', examType); // Debugging

    if (examType === 'JEE') {
      return ["Physics", "Chemistry", "Mathematics"];
    } else if (examType === 'NEET') {
      return ["Physics", "Chemistry", "Zoology", "Biology"];
    } else if (examType === 'Both') {
      return ["Physics", "Chemistry", "Mathematics", "Zoology", "Biology"];
    }
    return ALL_SUBJECTS;
  };

  const subjects = getSubjects();

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf' || droppedFile.type.startsWith('image/')) {
        setFile(droppedFile);
      } else {
        toast.error('Please upload a PDF or Image file');
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const removeFile = () => setFile(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !subject || !topic) {
      toast.error('Please fill all fields');
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const { error, detectedTopic } = await api.uploadNote(token, file, subject, topic);

      if (error) {
        toast.error(error);
        setIsLoading(false);
        clearInterval(interval);
      } else {
        setUploadProgress(100);
        setTimeout(() => {
          if (detectedTopic && detectedTopic !== topic) {
            toast.success(`Analysis complete! Identified topic: ${detectedTopic}`);
          } else {
            toast.success('Analysis complete!');
          }
          const finalTopic = detectedTopic || topic;
          navigate(`/diagnosis/${encodeURIComponent(finalTopic)}?subject=${encodeURIComponent(subject)}`);
        }, 500); // Small delay to show 100%
      }
    } catch (err) {
      toast.error('Failed to upload note');
      setIsLoading(false);
      clearInterval(interval);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navbar user={user} onLogout={onLogout} />

      <main className="max-w-3xl mx-auto p-6 lg:p-10 animate-slide-up">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight mb-2 font-serif">Upload Notes</h1>
          <p className="text-muted-foreground text-lg">
            Let's analyze your study material. We'll identify weak spots in under 30 seconds.
          </p>
        </div>

        <Card className="border-none shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-white/20">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="subject" className="text-base font-medium">Subject</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger id="subject" className="h-11 bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-800">
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="topic" className="text-base font-medium">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g. Newton's Laws"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                    className="h-11 bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Study Material</Label>

                {!file ? (
                  <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={`
                      border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200
                      ${isDragging
                        ? 'border-primary bg-primary/5 scale-[1.01]'
                        : 'border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }
                    `}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      accept="application/pdf,image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer block">
                      <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8" />
                      </div>
                      <p className="text-lg font-medium text-foreground">Click to upload or drag & drop</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        PDF or Images (Best for handwritten notes)
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="border rounded-xl p-4 bg-white dark:bg-slate-950 flex items-center justify-between border-slate-200 dark:border-slate-800 animate-slide-up">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                      className="text-muted-foreground hover:text-destructive"
                      disabled={isLoading}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </div>

              {isLoading && (
                <div className="space-y-2 animate-slide-up">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Analyzing content...</span>
                    <span className="text-primary">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  {uploadProgress === 100 && (
                    <p className="text-sm text-green-600 flex items-center gap-1.5 mt-2">
                      <CheckCircle2 className="w-4 h-4" /> Analysis Complete. Redirecting...
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto h-11 text-base"
                  onClick={() => navigate('/dashboard')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto h-11 text-base bg-primary hover:bg-primary/90 text-white min-w-[140px]"
                  disabled={isLoading || !file || !subject || !topic}
                >
                  {isLoading ? 'Processing...' : (
                    <span className="flex items-center gap-2">Start Analysis <ArrowRight className="w-4 h-4" /></span>
                  )}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
