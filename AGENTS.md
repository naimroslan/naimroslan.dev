# Project Instructions

## Code Style

- Use TypeScript for all new file or lines
- Prefer functional components in React 
- Use meaningful variable and function names
- Prefer const over let, avoid var
- Use template literals over string concatenation
- Use destructuring for object/array assignments
- Use optional chaining (?.) and nullish coalescing (??) when appropriate


## Code Review

Check for the following
- KISS
- DRY
- Magic numbers
- Minimal nesting
- Code easy to read / maintain
- Possible logic errors
- Check for accessibility if the reviewed item is a frontend component.
- Is the code performance acceptable?

### Security & best practices
- Check for potential security vulnerabilities (XSS, injection attacks)
- Validate all user inputs and external data
- Use proper error handling and logging
- Check for sensitive data exposure (API keys, passwords, tokens)
- Verify proper authentication and authorization checks

### Performance & Optimization
- Check for unnecessary re-renders in React components
- Verify proper use of useMemo, useCallback, and React.memo
- Check for memory leaks (unclosed subscriptions, timers)
- Verify proper image optimization and lazy loading
- Check for unnecessary API calls or data fetching

### Code Organization & Architecture
- Check for proper separation of concerns
- Verify consistent file and folder structure
- Check for proper imports and exports
- Verify proper use of design patterns
- Check for circular dependencies

### Browser & Device Compatibility
- Check for modern browser features without fallbacks
- Verify proper polyfills for older browsers
- Check for mobile device compatibility
- Verify proper touch event handling
- Check for proper viewport meta tags

### Data Management
- Verify proper state management patterns
- Check for proper data validation and sanitization
- Verify proper error handling for API calls
- Check for proper loading and error states
- Verify proper data caching strategies

### Code Consistency
- Check for consistent naming conventions
- Verify consistent code formatting
- Check for consistent error handling patterns
- Verify consistent logging practices
- Check for consistent comment styles

Please make the suggestion obvious.

Give me an overall assessment at the end of the review and how much context I still have left for this conversation


## Git commit

Please create git message in this format
(Ticket Number) <type>[optional scope][!]: <description>
[optional body]

Ticket Number: Can get from the branch name, if there is no ticket number, skip this section completely.
type: Describes the nature of the change (feature, fix, test, style, docs, refactor, perf, chore, ci, build and revert)
scope: optional context (parser, api)
!: indicates breaking changes
description: short summary of the change.
body: optional detailed explanation.
