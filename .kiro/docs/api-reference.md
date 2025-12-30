# Kiro IDE Services API Reference

## Planning Service API

### Endpoints

#### GET /api/kiro/planning/projects
Get all projects with planning data
```typescript
interface PlanningProject {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'completed';
  timeline: Timeline[];
  milestones: Milestone[];
  resources: Resource[];
}
```

#### POST /api/kiro/planning/projects
Create new project plan
```typescript
interface CreatePlanRequest {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  team: TeamMember[];
}
```

## Prototyping Service API

#### GET /api/kiro/prototypes
List all prototypes
```typescript
interface Prototype {
  id: string;
  name: string;
  version: string;
  components: Component[];
  interactions: Interaction[];
  lastModified: string;
}
```

#### POST /api/kiro/prototypes/generate
Generate prototype from design
```typescript
interface GeneratePrototypeRequest {
  designUrl: string;
  framework: 'react' | 'vue' | 'angular';
  styling: 'tailwind' | 'css' | 'styled-components';
}
```

## Documentation Service API

#### GET /api/kiro/docs/generate
Auto-generate documentation
```typescript
interface DocGenerationRequest {
  source: 'code' | 'api' | 'user-guide';
  format: 'markdown' | 'html' | 'pdf';
  includeExamples: boolean;
}
```

## Workflow Service API

#### GET /api/kiro/workflows
List all workflows
```typescript
interface Workflow {
  id: string;
  name: string;
  triggers: Trigger[];
  steps: WorkflowStep[];
  status: 'active' | 'paused' | 'disabled';
}
```

## Execution Service API

#### POST /api/kiro/execution/run
Execute code in sandbox
```typescript
interface ExecutionRequest {
  code: string;
  language: string;
  environment: ExecutionEnvironment;
  timeout: number;
}
```