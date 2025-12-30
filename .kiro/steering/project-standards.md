---
inclusion: always
---

# ConceptPulse Project Standards

## Development Standards
- Use TypeScript for all new code
- Follow React functional components with hooks
- Use Tailwind CSS for styling
- Implement proper error handling and loading states
- Follow accessibility best practices (WCAG 2.1)

## Code Organization
- Components in `src/app/components/`
- Pages in `src/app/pages/`
- Utilities in `src/lib/`
- Types in dedicated `.types.ts` files
- API calls through Supabase client

## Kiro IDE Integration Standards
- All planning documents in `.kiro/planning/`
- Prototypes in `.kiro/prototypes/`
- Documentation in `.kiro/docs/`
- Workflows in `.kiro/workflows/`
- Execution scripts in `.kiro/scripts/`

## UI/UX Guidelines
- Use shadcn/ui components as base
- Maintain consistent spacing (4px grid)
- Follow Material Design principles
- Ensure mobile-first responsive design
- Use semantic HTML elements

## API Standards
- Use Supabase for backend services
- Implement proper authentication flows
- Handle errors gracefully with user feedback
- Use TypeScript interfaces for API responses