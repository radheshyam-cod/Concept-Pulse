# Kiro IDE Dashboard Prototype

## Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ Header: ConceptPulse + Kiro IDE Integration             │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────────────────────────────┐ │
│ │   Sidebar   │ │           Main Content              │ │
│ │             │ │                                     │ │
│ │ Planning    │ │  ┌─────────────┐ ┌─────────────┐    │ │
│ │ Prototyping │ │  │   Active    │ │   Recent    │    │ │
│ │ Docs        │ │  │  Projects   │ │   Files     │    │ │
│ │ Workflows   │ │  └─────────────┘ └─────────────┘    │ │
│ │ Execution   │ │                                     │ │
│ │             │ │  ┌─────────────────────────────────┐ │ │
│ └─────────────┘ │  │      Kiro Services Panel       │ │ │
│                 │  └─────────────────────────────────┘ │ │
│                 └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Service Cards Design
Each Kiro service will have a dedicated card with:
- Service icon and name
- Current status indicator
- Quick action buttons
- Recent activity summary
- Progress indicators

## Interactive Elements
- Collapsible sidebar
- Drag-and-drop project organization
- Real-time status updates
- Context-sensitive help
- Keyboard shortcuts