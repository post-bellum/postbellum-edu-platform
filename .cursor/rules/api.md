# API & Backend Development Rules

## API Route Structure
- Place API routes in `src/app/api/[resource]/route.ts`
- Use RESTful conventions
- Implement proper HTTP status codes
- Always validate input data with Zod
- Return consistent error responses

## API Patterns

### Route Handler Structure
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  // Define your schema
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate body
    const body = await request.json();
    const data = schema.parse(body);
    
    // Perform operation
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Authentication Middleware
```typescript
// Always verify auth for protected routes
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const supabase = createServerComponentClient({ cookies });
const { data: { user }, error } = await supabase.auth.getUser();

if (!user) {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}
```

## Error Handling
- Use try-catch blocks for async operations
- Provide user-friendly error messages in Czech/Slovak
- Log errors to console in development
- Consider error tracking service for production
- Always show fallback UI for errors

## Security
- Never expose sensitive keys in client code
- Sanitize user inputs
- Use HTTPS everywhere
- Implement proper CORS policies
- Validate all API inputs with Zod
- Use environment variables for sensitive data
- Implement rate limiting for public endpoints
- Use CSRF protection for mutations

## Performance
- Implement proper caching strategies
- Use database indexes effectively
- Paginate large result sets
- Optimize query performance
- Use connection pooling

## Environment Variables
- Prefix public variables with NEXT_PUBLIC_
- Never commit .env files
- Document all required variables
- Use strong typing for env variables
- Validate env variables on startup
