# Zod Schemas

This directory contains Zod validation schemas for runtime type safety.

## Current Schemas

- **env.schema.ts** - Environment variable validation (runs at startup)
- **auth.schema.ts** - Basic auth validation (login/signup)

## Adding New Schemas

When you need to add validation for a new feature:

```typescript
// Example: Create a new schema file
// src/lib/schemas/lesson.schema.ts

import { z } from "zod";

export const createLessonSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string(),
  // Add fields as you design your database
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
```

## Usage Example

```typescript
// In a Server Action or API route
import { loginSchema } from "@/lib/schemas";

export async function login(formData: FormData) {
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  
  if (!result.success) {
    return { error: result.error.flatten() };
  }
  
  // Use result.data - it's fully typed!
  const { email, password } = result.data;
  // ... continue with auth
}
```

## Best Practices

1. Start simple - add validation as you build features
2. Don't create schemas until you know what you're validating
3. Keep schemas close to where they're used
4. Use `.safeParse()` for user input, `.parse()` for internal data
