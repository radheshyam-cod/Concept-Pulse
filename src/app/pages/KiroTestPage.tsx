/**
 * Kiro Test Page
 * Test page to verify real Kiro server integration
 */

import React, { useState, useEffect } from 'react';
import { KiroStatus } from '../components/kiro/KiroStatus';
import { kiroPlanning, kiroPrototyping, kiroDocumentation, kiroWorkflows } from '../../lib/kiro-services';
import type { PlanningProject, Prototype, Documentation, Workflow } from '../../lib/kiro-services.types';

export const KiroTestPage: React.FC = () => {
  const [projects, setProjects] = useState<PlanningProject[]>([]);
  const [prototypes, setPrototypes] = useState<Prototype[]>([]);
  const [docs, setDocs] = useState<Documentation[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading data from Kiro services...');
      
      const [projectsData, prototypesData, docsData, workflowsData] = await Promise.all([
        kiroPlanning.getProjects(),
        kiroPrototyping.getPrototypes(),
        kiroDocumentation.getDocuments(),
        kiroWorkflows.getWorkflows()
      ]);

      setProjects(projectsData);
      setPrototypes(prototypesData);
      setDocs(docsData);
      setWorkflows(workflowsData);
      
      console.log('✅ Data loaded successfully');
    } catch (err) {
      console.error('❌ Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createTestProject = async () => {
    try {
      setLoading(true);
      console.log('📝 Creating test project...');
      
      const newProject = await kiroPlanning.createProject({
        name: 'Test Project',
        description: 'Test project created from ConceptPulse UI',
        status: 'active',
        priority: 'medium',
        owner: 'Test User',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000 * 30).toISOString(),
        progress: 0,
        team: [],
        milestones: [],
        tasks: [],
        dependencies: [],
        tags: ['test'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Test project created:', newProject);
      await loadData(); // Refresh data
    } catch (err) {
      console.error('❌ Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const createTestPrototype = async () => {
    try {
      setLoading(true);
      console.log('🎨 Creating test prototype...');
      
      const newPrototype = await kiroPrototyping.createPrototype('Test Prototype', {
        framework: 'react',
        styling: 'tailwind'
      });
      
      console.log('✅ Test prototype created:', newPrototype);
      await loadData(); // Refresh data
    } catch (err) {
      console.error('❌ Error creating prototype:', err);
      setError(err instanceof Error ? err.message : 'Failed to create prototype');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kiro Server Integration Test</h1>
          <p className="text-gray-600">Testing real Kiro server connection and services</p>
        </div>

        {/* Kiro Status */}
        <div className="mb-8">
          <KiroStatus />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="text-red-400">⚠️</div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mb-8 flex space-x-4">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Data'}
          </button>
          
          <button
            onClick={createTestProject}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Create Test Project
          </button>
          
          <button
            onClick={createTestPrototype}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            Create Test Prototype
          </button>
        </div>

        {/* Data Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Projects */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Projects ({projects.length})
            </h2>
            {projects.length > 0 ? (
              <div className="space-y-3">
                {projects.map((project) => (
                  <div key={project.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900">{project.name}</div>
                    <div className="text-sm text-gray-600">{project.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Status: {project.status} | Progress: {project.progress}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">No projects found</div>
            )}
          </div>

          {/* Prototypes */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Prototypes ({prototypes.length})
            </h2>
            {prototypes.length > 0 ? (
              <div className="space-y-3">
                {prototypes.map((prototype) => (
                  <div key={prototype.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900">{prototype.name}</div>
                    <div className="text-sm text-gray-600">{prototype.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Framework: {prototype.framework} | Status: {prototype.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">No prototypes found</div>
            )}
          </div>

          {/* Documentation */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Documentation ({docs.length})
            </h2>
            {docs.length > 0 ? (
              <div className="space-y-3">
                {docs.map((doc) => (
                  <div key={doc.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900">{doc.title}</div>
                    <div className="text-sm text-gray-600">
                      {doc.content.substring(0, 100)}...
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Type: {doc.type} | Format: {doc.format}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">No documentation found</div>
            )}
          </div>

          {/* Workflows */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Workflows ({workflows.length})
            </h2>
            {workflows.length > 0 ? (
              <div className="space-y-3">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900">{workflow.name}</div>
                    <div className="text-sm text-gray-600">{workflow.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Status: {workflow.status} | Steps: {workflow.steps.length}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">No workflows found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};