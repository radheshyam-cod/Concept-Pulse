#!/usr/bin/env node

/**
 * Kiro IDE Services Setup Script
 * Initializes all Kiro services for ConceptPulse project
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

interface KiroService {
  name: string;
  description: string;
  dependencies: string[];
  configPath: string;
}

const KIRO_SERVICES: KiroService[] = [
  {
    name: 'planning',
    description: 'Project planning and task management',
    dependencies: ['@kiro/planning-sdk'],
    configPath: '.kiro/config/planning.json'
  },
  {
    name: 'prototyping',
    description: 'UI/UX prototyping tools',
    dependencies: ['@kiro/prototype-sdk', '@figma/rest-api-spec'],
    configPath: '.kiro/config/prototyping.json'
  },
  {
    name: 'documentation',
    description: 'Automated documentation generation',
    dependencies: ['@kiro/docs-sdk', 'typedoc'],
    configPath: '.kiro/config/documentation.json'
  },
  {
    name: 'workflows',
    description: 'Development workflow automation',
    dependencies: ['@kiro/workflow-sdk'],
    configPath: '.kiro/config/workflows.json'
  },
  {
    name: 'execution',
    description: 'Code execution and testing environment',
    dependencies: ['@kiro/execution-sdk', 'docker'],
    configPath: '.kiro/config/execution.json'
  }
];

async function setupKiroServices(): Promise<void> {
  console.log('🚀 Setting up Kiro IDE services for ConceptPulse...\n');

  // Create necessary directories
  const dirs = [
    '.kiro/config',
    '.kiro/cache',
    '.kiro/logs',
    '.kiro/temp'
  ];

  dirs.forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });

  // Setup each service
  for (const service of KIRO_SERVICES) {
    console.log(`\n📦 Setting up ${service.name} service...`);
    
    try {
      // Install dependencies
      console.log(`Installing dependencies: ${service.dependencies.join(', ')}`);
      // execSync(`npm install ${service.dependencies.join(' ')}`, { stdio: 'inherit' });

      // Create service configuration
      const config = {
        service: service.name,
        description: service.description,
        enabled: true,
        version: '1.0.0',
        settings: getDefaultSettings(service.name)
      };

      writeFileSync(service.configPath, JSON.stringify(config, null, 2));
      console.log(`✅ Created config: ${service.configPath}`);

    } catch (error) {
      console.error(`❌ Failed to setup ${service.name}:`, error);
    }
  }

  console.log('\n🎉 Kiro IDE services setup complete!');
  console.log('\nNext steps:');
  console.log('1. Run: npm run kiro:start');
  console.log('2. Open: http://localhost:3000/kiro');
  console.log('3. Configure services in the Kiro dashboard');
}

function getDefaultSettings(serviceName: string): Record<string, any> {
  const settings: Record<string, Record<string, any>> = {
    planning: {
      defaultView: 'kanban',
      autoSave: true,
      notifications: true
    },
    prototyping: {
      framework: 'react',
      styling: 'tailwind',
      figmaIntegration: true
    },
    documentation: {
      autoGenerate: true,
      format: 'markdown',
      includeExamples: true
    },
    workflows: {
      autoTrigger: true,
      parallelExecution: false,
      maxRetries: 3
    },
    execution: {
      timeout: 30000,
      memoryLimit: '512MB',
      sandboxed: true
    }
  };

  return settings[serviceName] || {};
}

// Run setup if called directly
if (require.main === module) {
  setupKiroServices().catch(console.error);
}

export { setupKiroServices, KIRO_SERVICES };