#!/usr/bin/env tsx

/**
 * Demo Initialization Script for ConceptPulse
 * Sets up demo environment with controlled data
 */

import { DEMO_USER, DEMO_PROGRESS, getDemoWeakConcepts } from '../../src/lib/demo-data';

interface DemoState {
  user: typeof DEMO_USER;
  progress: typeof DEMO_PROGRESS;
  weakConcepts: string[];
  revisions: any[];
  tasks: any[];
}

function initializeDemoState(): DemoState {
  const weakConcepts = getDemoWeakConcepts();
  
  // Create demo revisions for weak concepts
  const revisions = weakConcepts.flatMap(concept => {
    return [1, 3, 7].map(day => {
      const date = new Date();
      date.setDate(date.getDate() + day);
      return {
        id: `demo-rev-${concept.replace(/\s+/g, '-').toLowerCase()}-${day}`,
        topic: concept,
        subject: concept.includes('Newton') || concept.includes('Kinematics') ? 'Physics' : 'Mathematics',
        revision_day: day,
        scheduled_date: date.toISOString(),
        completed: false
      };
    });
  });

  // Create Kiro task board
  const tasks = [
    {
      id: 't1',
      title: 'Upload Study Material',
      description: 'Upload notes or textbook content for analysis',
      status: 'todo',
      progress: 0,
      assignee: 'Demo Student',
      priority: 'high',
      category: 'content'
    },
    {
      id: 't2',
      title: 'Generate Diagnostic Questions',
      description: 'AI generates targeted questions based on uploaded content',
      status: 'todo',
      progress: 0,
      assignee: 'AI System',
      priority: 'high',
      category: 'assessment'
    },
    {
      id: 't3',
      title: 'Complete Diagnostic Test',
      description: 'Student completes diagnostic assessment',
      status: 'todo',
      progress: 0,
      assignee: 'Demo Student',
      priority: 'high',
      category: 'assessment'
    },
    {
      id: 't4',
      title: 'Identify Weak Concepts',
      description: 'System analyzes results and identifies areas for improvement',
      status: 'todo',
      progress: 0,
      assignee: 'AI System',
      priority: 'medium',
      category: 'analysis'
    },
    {
      id: 't5',
      title: 'Generate Corrections',
      description: 'AI creates personalized explanations for weak concepts',
      status: 'todo',
      progress: 0,
      assignee: 'AI System',
      priority: 'medium',
      category: 'learning'
    },
    {
      id: 't6',
      title: 'Schedule Revisions',
      description: 'System schedules spaced repetition sessions',
      status: 'todo',
      progress: 0,
      assignee: 'System',
      priority: 'low',
      category: 'planning'
    },
    {
      id: 't7',
      title: 'Track Progress',
      description: 'Monitor learning progress and mastery levels',
      status: 'todo',
      progress: 0,
      assignee: 'System',
      priority: 'low',
      category: 'monitoring'
    }
  ];

  return {
    user: DEMO_USER,
    progress: DEMO_PROGRESS,
    weakConcepts,
    revisions,
    tasks
  };
}

function setupLocalStorage(demoState: DemoState): void {
  // Clear existing demo data
  const keysToRemove = Object.keys(localStorage).filter(key => 
    key.startsWith('mock_') || key.startsWith('demo_') || key.startsWith('kiro_')
  );
  keysToRemove.forEach(key => localStorage.removeItem(key));

  // Set up demo user
  localStorage.setItem('mock_active_user_profile', JSON.stringify(demoState.user));
  localStorage.setItem('mock_user_admin@conceptpule.ed', JSON.stringify({
    ...demoState.user,
    password: 'admin@123'
  }));

  // Set up demo revisions
  localStorage.setItem('mock_revisions', JSON.stringify(demoState.revisions));

  // Set up Kiro planning data
  const planningProject = {
    id: 'conceptpulse-demo',
    name: 'ConceptPulse Demo',
    description: 'Intelligent learning platform demonstration',
    status: 'active',
    created_at: new Date().toISOString(),
    tasks: demoState.tasks,
    progress: {
      total: demoState.tasks.length,
      completed: 0,
      in_progress: 0
    }
  };

  localStorage.setItem('kiro_planning_projects', JSON.stringify([planningProject]));

  // Set up demo notes
  const demoNotes = [
    {
      id: 'demo-note-physics',
      subject: 'Physics',
      topic: 'Newton\'s Laws of Motion',
      file_name: 'physics_mechanics.pdf',
      created_at: new Date().toISOString(),
      file_url: 'demo://physics-notes'
    },
    {
      id: 'demo-note-math',
      subject: 'Mathematics',
      topic: 'Limits and Continuity',
      file_name: 'calculus_chapter1.pdf',
      created_at: new Date().toISOString(),
      file_url: 'demo://math-notes'
    }
  ];

  localStorage.setItem('mock_notes', JSON.stringify(demoNotes));

  console.log('✅ Demo environment initialized successfully');
  console.log(`📊 Weak concepts: ${demoState.weakConcepts.length}`);
  console.log(`📅 Scheduled revisions: ${demoState.revisions.length}`);
  console.log(`📋 Kiro tasks: ${demoState.tasks.length}`);
}

// Initialize demo if running in demo mode
if (typeof window !== 'undefined' && 
    (window.location.search.includes('demo=true') || 
     import.meta.env.VITE_DEMO_MODE === 'true')) {
  const demoState = initializeDemoState();
  setupLocalStorage(demoState);
}

export { initializeDemoState, setupLocalStorage };