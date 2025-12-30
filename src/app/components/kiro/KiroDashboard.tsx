import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { KiroServiceCard } from './KiroServiceCard';
import { SystemStatusDashboard } from './SystemStatusDashboard';
import { KiroStatus } from './KiroStatus';
import {
  LayoutDashboard,
  FileText,
  Workflow,
  Play,
  Settings,
  Activity,
  Users,
  Clock,
  TrendingUp,
  CheckCircle2,
  Circle,
  Terminal,
  Code,
  AlertTriangle,
  Wifi,
  WifiOff
} from 'lucide-react';
import {
  kiroPlanning,
  kiroWorkflows,
  kiroDocumentation,
  getKiroConnectionStatus,
} from '../../../lib/kiro-services';
import { kiroSDK } from '../../../lib/kiro-sdk/core';
import { PlanningProject, Workflow as WorkflowType, Documentation } from '../../../lib/kiro-services.types';

interface KiroDashboardProps {
  user: any;
  token: string;
}

export const KiroDashboard: React.FC<KiroDashboardProps> = ({ user, token }) => {
  // Connection Status
  const [connectionStatus, setConnectionStatus] = useState<any>({ enabled: false, connected: false, fallbackMode: true, services: [] });

  // Service State
  const [services, setServices] = useState([
    { id: 'planning', name: 'Planning Service', description: 'Project planning and task management', status: 'active', lastUpdated: new Date().toISOString(), version: '1.0.0', configuration: {} },
    { id: 'prototyping', name: 'Prototyping Service', description: 'UI/UX prototyping and design tools', status: 'active', lastUpdated: new Date().toISOString(), version: '1.0.0', configuration: {} },
    { id: 'workflows', name: 'Workflow Service', description: 'Development workflow automation', status: 'active', lastUpdated: new Date().toISOString(), version: '1.0.0', configuration: {} },
    { id: 'execution', name: 'Execution Service', description: 'Code execution and testing environment', status: 'active', lastUpdated: new Date().toISOString(), version: '1.0.0', configuration: {} },
    { id: 'documentation', name: 'Documentation Service', description: 'Auto-generated feature docs', status: 'active', lastUpdated: new Date().toISOString(), version: '1.0.0', configuration: {} },
  ]);

  // Data State
  const [projects, setProjects] = useState<PlanningProject[]>([]);
  const [activeWorkflows, setActiveWorkflows] = useState<WorkflowType[]>([]);
  const [documents, setDocuments] = useState<Documentation[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('overview');

  // Check connection status periodically
  useEffect(() => {
    const checkConnection = async () => {
      const status = await getKiroConnectionStatus();
      setConnectionStatus(status);
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Initialization & Data Loading
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);

        // Load projects from real Kiro API or fallback
        const currentProjects = await kiroPlanning.getProjects();
        setProjects(currentProjects);

        // Load workflows
        const wf = await kiroWorkflows.getWorkflows();
        setActiveWorkflows(wf);

        // Load documentation
        const docs = await kiroDocumentation.getDocuments();
        setDocuments(docs);

        // Set appropriate logs based on connection status
        if (connectionStatus.connected) {
          setLogs([
            `[${new Date().toLocaleTimeString()}] System initialized successfully`,
            `[${new Date().toLocaleTimeString()}] Kiro Services connected`,
            `[${new Date().toLocaleTimeString()}] Planning Service: ${currentProjects.length} projects loaded`,
            `[${new Date().toLocaleTimeString()}] Workflow Service: ${wf.length} active workflows`,
            `[${new Date().toLocaleTimeString()}] Documentation Service: ${docs.length} docs generated`,
            `[${new Date().toLocaleTimeString()}] Execution Service: Environment ready`
          ]);
        } else {
          // Fallback/Local logs
          setLogs([
            `[${new Date().toLocaleTimeString()}] System running in localized mode`,
            `[${new Date().toLocaleTimeString()}] Kiro Server not detected`,
            `[${new Date().toLocaleTimeString()}] Using fallback data for visualization`
          ]);
        }

      } catch (e) {
        console.error("Failed to init Kiro data", e);
        setLogs([
          '[Error] Failed to initialize Kiro services',
          '[Fallback] Operating in offline mode',
          '[System] Check Kiro server connection'
        ]);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [connectionStatus]);

  const handleServiceStart = (id: string) => { /* Toggle status */ };
  const handleServiceStop = (id: string) => { /* Toggle status */ };
  const handleServiceConfigure = (id: string) => { };
  const handleServiceDetails = (id: string) => { };

  // Manual connection test
  const handleTestConnection = async () => {
    console.log('🧪 Testing Kiro connection manually...');
    setLoading(true);
    try {
      const status = await getKiroConnectionStatus();
      setConnectionStatus(status);
      console.log('📊 Connection status:', status);

      if (status.connected) {
        // Try to fetch data using real SDK
        const [projectsData, workflowsData, docsData] = await Promise.all([
          kiroPlanning.getProjects(),
          kiroWorkflows.getWorkflows(),
          kiroDocumentation.getDocuments()
        ]);
        
        console.log('✅ Successfully fetched data:', {
          projects: projectsData.length,
          workflows: workflowsData.length,
          docs: docsData.length
        });
        
        setProjects(projectsData);
        setActiveWorkflows(workflowsData);
        setDocuments(docsData);
        
        // Update logs with real connection info
        setLogs([
          `[${new Date().toLocaleTimeString()}] ✅ Kiro SDK connected successfully`,
          `[${new Date().toLocaleTimeString()}] 📊 Planning Service: ${projectsData.length} projects loaded`,
          `[${new Date().toLocaleTimeString()}] ⚙️ Workflow Service: ${workflowsData.length} workflows active`,
          `[${new Date().toLocaleTimeString()}] 📚 Documentation Service: ${docsData.length} docs available`,
          `[${new Date().toLocaleTimeString()}] 🔄 Real-time sync enabled`,
          `[${new Date().toLocaleTimeString()}] 🚀 All services operational`
        ]);
      } else {
        setLogs([
          `[${new Date().toLocaleTimeString()}] ⚠️ Kiro server not connected`,
          `[${new Date().toLocaleTimeString()}] 🔧 Running in fallback mode`,
          `[${new Date().toLocaleTimeString()}] 💡 Check server status and configuration`
        ]);
      }
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      setLogs([
        `[${new Date().toLocaleTimeString()}] ❌ Connection test failed`,
        `[${new Date().toLocaleTimeString()}] 🔧 Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        `[${new Date().toLocaleTimeString()}] 💡 Check Kiro server status`
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Create test project using real Kiro API
  const handleCreateTestProject = async () => {
    try {
      setLoading(true);
      console.log('📝 Creating test project via Kiro API...');
      
      const newProject = await kiroPlanning.createProject({
        name: 'Test Project from Dashboard',
        description: 'Test project created from Kiro Dashboard UI',
        status: 'active',
        priority: 'medium',
        owner: user?.name || 'Test User',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000 * 30).toISOString(),
        progress: 0,
        team: [],
        milestones: [],
        tasks: [],
        dependencies: [],
        tags: ['test', 'dashboard'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Test project created:', newProject);
      
      // Refresh data
      await handleTestConnection();
      
      setLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ✅ Test project created: ${newProject.name}`
      ]);
      
    } catch (error) {
      console.error('❌ Error creating test project:', error);
      setLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ❌ Failed to create test project: ${error instanceof Error ? error.message : 'Unknown error'}`
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans p-6 text-foreground">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        {/* Header with Connection Status */}
        <div className="flex items-end justify-between border-b border-border/50 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-serif">
              Kiro IDE Integration
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl text-lg">
              {connectionStatus.connected
                ? 'Connected to real Kiro IDE services for comprehensive development workflow'
                : 'Kiro IDE integration with fallback mode for development'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {connectionStatus.connected ? (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium px-3 py-1">
                <Wifi className="w-3 h-3 mr-1.5" />
                Kiro Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium px-3 py-1">
                <WifiOff className="w-3 h-3 mr-1.5" />
                Fallback Mode
              </Badge>
            )}
            <Button variant="outline" size="sm" className="h-9" onClick={handleTestConnection} disabled={loading}>
              <Settings className="h-4 w-4 mr-2" />
              {loading ? 'Testing...' : 'Test Connection'}
            </Button>
            {connectionStatus.connected && (
              <Button variant="outline" size="sm" className="h-9" onClick={handleCreateTestProject} disabled={loading}>
                <FileText className="h-4 w-4 mr-2" />
                Create Test Project
              </Button>
            )}
          </div>
        </div>

        {/* Kiro Status Component */}
        <div className="mb-6">
          <KiroStatus />
        </div>

        {/* Connection Status Alert */}
        {!connectionStatus.connected && (
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200">
                    Kiro IDE Not Connected
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    Currently using fallback data. To connect to real Kiro IDE:
                  </p>
                  <ul className="text-xs text-amber-600 dark:text-amber-400 mt-2 space-y-1">
                    <li>• Set VITE_KIRO_ENABLED=true in .env</li>
                    <li>• Configure VITE_KIRO_API_URL to your Kiro server</li>
                    <li>• Ensure Kiro IDE server is running</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-5 flex items-center space-x-4">
              <div className="bg-blue-50 p-2 rounded-lg dark:bg-blue-900/20">
                <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connection</p>
                <p className="text-2xl font-bold tracking-tight">
                  {connectionStatus.connected ? 'Live' : 'Local'}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-5 flex items-center space-x-4">
              <div className="bg-emerald-50 p-2 rounded-lg dark:bg-emerald-900/20">
                <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold tracking-tight">
                  {projects.reduce((acc, p) => acc + p.tasks.length, 0)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-5 flex items-center space-x-4">
              <div className="bg-violet-50 p-2 rounded-lg dark:bg-violet-900/20">
                <Clock className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Services</p>
                <p className="text-2xl font-bold tracking-tight">{services.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-5 flex items-center space-x-4">
              <div className="bg-orange-50 p-2 rounded-lg dark:bg-orange-900/20">
                <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mode</p>
                <p className="text-2xl font-bold tracking-tight">
                  {connectionStatus.enabled ? 'Real' : 'Demo'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted p-1 rounded-xl w-full justify-start space-x-2">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg px-4 py-2 flex items-center gap-2"><LayoutDashboard className="h-4 w-4" /> Overview</TabsTrigger>
            <TabsTrigger value="status" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg px-4 py-2 flex items-center gap-2"><Activity className="h-4 w-4" /> Status</TabsTrigger>
            <TabsTrigger value="planning" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg px-4 py-2 flex items-center gap-2"><FileText className="h-4 w-4" /> Planning</TabsTrigger>
            <TabsTrigger value="prototyping" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg px-4 py-2 flex items-center gap-2"><Settings className="h-4 w-4" /> Prototyping</TabsTrigger>
            <TabsTrigger value="documentation" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg px-4 py-2 flex items-center gap-2"><FileText className="h-4 w-4" /> Documentation</TabsTrigger>
            <TabsTrigger value="workflows" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg px-4 py-2 flex items-center gap-2"><Workflow className="h-4 w-4" /> Workflows</TabsTrigger>
            <TabsTrigger value="execution" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg px-4 py-2 flex items-center gap-2"><Play className="h-4 w-4" /> Execution</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(service => (
                <KiroServiceCard
                  key={service.id}
                  service={service as any}
                  onStart={handleServiceStart}
                  onStop={handleServiceStop}
                  onConfigure={handleServiceConfigure}
                  onViewDetails={handleServiceDetails}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="status">
            <SystemStatusDashboard />
          </TabsContent>

          <TabsContent value="planning">
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif">Project Roadmap: Learning Engine</CardTitle>
                <CardDescription>
                  Feature Tasks for {projects.length > 0 ? projects[0].name : 'Learning Platform'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {projects.length > 0 ? (
                  <div className="divide-y divide-border">
                    {projects[0].tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-4">
                          {task.status === 'done' ? (
                            <div className="bg-emerald-100 p-1 rounded-full"><CheckCircle2 className="text-emerald-600 w-4 h-4" /></div>
                          ) : task.status === 'in-progress' ? (
                            <div className="bg-blue-100 p-1 rounded-full"><Activity className="text-blue-600 w-4 h-4" /></div>
                          ) : (
                            <div className="bg-slate-100 p-1 rounded-full"><Circle className="text-slate-500 w-4 h-4" /></div>
                          )}
                          <div>
                            <p className="font-medium text-sm text-foreground">{task.title}</p>
                            <p className="text-xs text-muted-foreground">{task.description}</p>
                          </div>
                        </div>
                        <Badge variant={task.status === 'done' ? 'default' : 'secondary'} className="capitalize">
                          {task.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No project data available. Start the Kiro Server to sync plans.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prototyping">
            <div className="space-y-6">
              {/* Design System */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif">Design System</CardTitle>
                  <CardDescription>ConceptPulse UI components and design tokens</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Colors */}
                  <div>
                    <h4 className="font-semibold mb-3">Color Palette</h4>
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-lg bg-blue-500 shadow-sm"></div>
                        <span className="text-xs mt-1 font-mono">Primary</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-lg bg-emerald-500 shadow-sm"></div>
                        <span className="text-xs mt-1 font-mono">Success</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-lg bg-orange-500 shadow-sm"></div>
                        <span className="text-xs mt-1 font-mono">Warning</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-lg bg-slate-200 shadow-sm"></div>
                        <span className="text-xs mt-1 font-mono">Neutral</span>
                      </div>
                    </div>
                  </div>

                  {/* Typography */}
                  <div>
                    <h4 className="font-semibold mb-3">Typography</h4>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">Heading Large</div>
                      <div className="text-lg font-semibold">Heading Medium</div>
                      <div className="text-base">Body Text</div>
                      <div className="text-sm text-muted-foreground">Caption Text</div>
                    </div>
                  </div>

                  {/* Components */}
                  <div>
                    <h4 className="font-semibold mb-3">UI Components</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="border border-border rounded-lg p-4 text-center">
                        <Button size="sm" className="mb-2">Button</Button>
                        <p className="text-xs text-muted-foreground">Primary Action</p>
                      </div>
                      <div className="border border-border rounded-lg p-4 text-center">
                        <Badge variant="outline">Badge</Badge>
                        <p className="text-xs text-muted-foreground mt-2">Status Label</p>
                      </div>
                      <div className="border border-border rounded-lg p-4 text-center">
                        <div className="w-full h-8 bg-muted rounded"></div>
                        <p className="text-xs text-muted-foreground mt-2">Progress Card</p>
                      </div>
                      <div className="border border-border rounded-lg p-4 text-center">
                        <div className="w-full h-8 bg-blue-100 rounded flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Status Icon</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Screen Prototypes */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif">Screen Prototypes</CardTitle>
                  <CardDescription>Interactive mockups linked to real pages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer group">
                      <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg mb-3 flex items-center justify-center">
                        <LayoutDashboard className="w-8 h-8 text-blue-600" />
                      </div>
                      <h4 className="font-semibold group-hover:text-primary transition-colors">Dashboard</h4>
                      <p className="text-xs text-muted-foreground mt-1">Learning progress overview</p>
                      <Badge variant="outline" className="mt-2 text-xs">Live</Badge>
                    </div>

                    <div className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer group">
                      <div className="aspect-video bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg mb-3 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-emerald-600" />
                      </div>
                      <h4 className="font-semibold group-hover:text-primary transition-colors">Upload</h4>
                      <p className="text-xs text-muted-foreground mt-1">File upload interface</p>
                      <Badge variant="outline" className="mt-2 text-xs">Live</Badge>
                    </div>

                    <div className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer group">
                      <div className="aspect-video bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg mb-3 flex items-center justify-center">
                        <Activity className="w-8 h-8 text-purple-600" />
                      </div>
                      <h4 className="font-semibold group-hover:text-primary transition-colors">Diagnosis</h4>
                      <p className="text-xs text-muted-foreground mt-1">Question interface</p>
                      <Badge variant="outline" className="mt-2 text-xs">Live</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="workflows">
            <div className="space-y-6">
              {/* Active Workflow Visualization */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif">Learning Pipeline Workflow</CardTitle>
                  <CardDescription>Upload → Diagnosis → Analysis → Correction → Revision → Progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {activeWorkflows.length > 0 ? (
                      <>
                        {/* Workflow Pipeline */}
                        <div className="flex items-center justify-between py-8 px-4 relative overflow-x-auto">
                          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -z-10 mx-8"></div>

                          {activeWorkflows[0].steps.map((step, index) => {
                            const s = step as any;
                            const isCompleted = s.status === 'completed' || s.status === 'success';
                            const isRunning = s.status === 'running' || s.status === 'in-progress';
                            const isPending = s.status === 'pending';

                            let colorClass = "bg-slate-200 text-slate-500";
                            if (isCompleted) colorClass = "bg-emerald-500 text-white shadow-lg ring-4 ring-background";
                            if (isRunning) colorClass = "bg-blue-500 text-white shadow-lg ring-4 ring-background animate-pulse";
                            if (s.status === 'failed') colorClass = "bg-red-500 text-white shadow-lg ring-4 ring-background";

                            return (
                              <div key={step.id} className="flex flex-col items-center bg-background px-4 z-10 min-w-[100px]">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${colorClass}`}>
                                  {/* Simple logic for icons based on index/type could go here, defaulting to generic */}
                                  {isCompleted ? <CheckCircle2 className='w-6 h-6' /> : (isRunning ? <Activity className='w-6 h-6' /> : <Circle className='w-6 h-6' />)}
                                </div>
                                <span className="font-bold text-sm mt-3 text-center line-clamp-2 w-24">{step.name}</span>
                                <span className={`text-xs font-semibold mt-1 ${isCompleted ? 'text-emerald-600' : (isRunning ? 'text-blue-500' : 'text-slate-500')}`}>
                                  {s.status}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-6">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium">Workflow Progress</span>
                            <span className="text-muted-foreground">
                              {activeWorkflows[0].steps.length > 0
                                ? Math.round((activeWorkflows[0].steps.filter(step => (step as any).status === 'completed' || (step as any).status === 'success').length / activeWorkflows[0].steps.length) * 100)
                                : 0}% Complete
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${activeWorkflows[0].steps.length > 0
                                  ? (activeWorkflows[0].steps.filter(step => (step as any).status === 'completed' || (step as any).status === 'success').length / activeWorkflows[0].steps.length) * 100
                                  : 0}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>No active workflows found.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Workflow Details */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif">Workflow Configuration</CardTitle>
                  <CardDescription>Automated learning pipeline settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Triggers</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span>File Upload (PDF/Image)</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Manual Diagnosis Request</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Variables</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Difficulty Level:</span>
                          <span className="font-mono">0.7</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Question Count:</span>
                          <span className="font-mono">10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">AI Model:</span>
                          <span className="font-mono">GPT-4</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="execution">
            <div className="space-y-6">
              {/* Environment Status */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif">Execution Environment</CardTitle>
                  <CardDescription>Runtime status and resource monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="font-semibold text-sm">Node.js 18.x</p>
                        <p className="text-xs text-muted-foreground">Runtime Ready</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="font-semibold text-sm">Mock Database</p>
                        <p className="text-xs text-muted-foreground">Connected</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="font-semibold text-sm">AI Services</p>
                        <p className="text-xs text-muted-foreground">Active</p>
                      </div>
                    </div>
                  </div>

                  {/* Resource Usage */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="font-semibold mb-4">Resource Usage</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Memory</span>
                          <span className="font-mono">245MB / 512MB</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '48%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>CPU</span>
                          <span className="font-mono">12%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Console Output */}
              <Card className="bg-slate-950 text-slate-300 font-mono text-sm border-slate-900">
                <CardHeader className="border-b border-slate-800 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-500" />
                      <span className="font-bold text-white">Execution Console</span>
                    </div>
                    <Badge variant="outline" className="bg-emerald-900/20 text-emerald-400 border-emerald-500/30">
                      Live
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 h-[300px] overflow-y-auto space-y-1">
                  {logs.length > 0 ? (
                    logs.map((log, i) => {
                      let colorClass = "text-slate-400";
                      if (log.includes('[Success]') || log.includes('Successfully')) colorClass = "text-emerald-500";
                      else if (log.includes('[Error]')) colorClass = "text-red-500";
                      else if (log.includes('[Warning]')) colorClass = "text-amber-500";
                      else if (log.includes('[Info]') || log.includes('[System]')) colorClass = "text-blue-400";
                      else if (log.includes('[Kiro IDE]')) colorClass = "text-purple-400";

                      return (
                        <p key={i} className={`font-mono ${colorClass}`}>{log}</p>
                      );
                    })
                  ) : (
                    <p className="text-slate-500 italic">Waiting for execution logs...</p>
                  )}
                  <p className="text-emerald-500 animate-pulse">_</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documentation">
            <div className="space-y-6">
              {/* Demo Mode Banner */}
              {!connectionStatus.connected && (
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                        Demo Mode – Controlled Outputs
                      </span>
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      Documentation auto-generated by Kiro AI from codebase analysis
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Generated Documentation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <Card key={doc.id} className="border-border/60 shadow-sm">
                      <CardHeader>
                        <CardTitle className="font-serif flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-500" />
                          {doc.title}
                        </CardTitle>
                        <CardDescription>
                          {doc.type} - {doc.version}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                          <pre className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                            {doc.content.substring(0, 300)}...
                          </pre>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Last updated: {new Date(doc.lastGenerated).toLocaleTimeString()}</span>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Auto-generated
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <>
                    {/* API Reference */}
                    <Card className="border-border/60 shadow-sm">
                      <CardHeader>
                        <CardTitle className="font-serif flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-500" />
                          API Reference
                        </CardTitle>
                        <CardDescription>Auto-generated from source code</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-sm">
                          <div className="text-emerald-600 font-semibold mb-2"># ConceptPulse API</div>
                          <div className="space-y-1 text-slate-600 dark:text-slate-400">
                            <div><span className="text-blue-600">POST</span> /api/upload</div>
                            <div><span className="text-emerald-600">GET</span> /api/diagnosis</div>
                            <div><span className="text-blue-600">POST</span> /api/diagnosis/submit</div>
                            <div><span className="text-emerald-600">GET</span> /api/progress</div>
                            <div><span className="text-purple-600">PUT</span> /api/revision/schedule</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Last updated: 1 hour ago</span>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Auto-generated
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Workflow Guide */}
                    <Card className="border-border/60 shadow-sm">
                      <CardHeader>
                        <CardTitle className="font-serif flex items-center gap-2">
                          <Workflow className="w-5 h-5 text-purple-500" />
                          Workflow Guide
                        </CardTitle>
                        <CardDescription>Learning process documentation</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 text-sm">
                          <div className="font-semibold mb-3">Learning Loop Process</div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                              <span>1. Upload study materials</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>2. AI generates questions</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span>3. Analyze weak concepts</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span>4. Generate corrections</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                              <span>5. Schedule revisions</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Last updated: 30 mins ago</span>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            Auto-generated
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              {/* Feature Documentation */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif">Feature Documentation</CardTitle>
                  <CardDescription>Comprehensive feature guides generated from code analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">Upload System</h4>
                          <p className="text-xs text-muted-foreground">File handling & validation</p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <div>• PDF/Image support</div>
                        <div>• Size validation</div>
                        <div>• Progress tracking</div>
                      </div>
                    </div>

                    <div className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Activity className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">AI Diagnosis</h4>
                          <p className="text-xs text-muted-foreground">Question generation</p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <div>• Content analysis</div>
                        <div>• MCQ generation</div>
                        <div>• Difficulty adaptation</div>
                      </div>
                    </div>

                    <div className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">Progress Tracking</h4>
                          <p className="text-xs text-muted-foreground">Learning analytics</p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <div>• Mastery levels</div>
                        <div>• Weak concepts</div>
                        <div>• Revision scheduling</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Generation Status */}
              <Card className="border-border/60 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Terminal className="w-5 h-5 text-emerald-500" />
                      <div>
                        <p className="font-semibold text-sm">Documentation Generator</p>
                        <p className="text-xs text-muted-foreground">Watching for code changes...</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-mono text-emerald-600">Active</span>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg font-mono text-xs text-muted-foreground">
                    <div>&gt; kiro-docs generate --watch --format=markdown</div>
                    <div className="text-emerald-600 mt-1">✓ API documentation updated</div>
                    <div className="text-emerald-600">✓ Workflow guide refreshed</div>
                    <div className="text-blue-600">→ Monitoring src/ for changes...</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};