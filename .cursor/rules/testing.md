# Testing Guidelines

## Test Framework Setup
- **E2E Testing**: Playwright (recommended) or Cypress
- **Unit Testing**: Jest + React Testing Library
- **API Testing**: Supertest or built-in Next.js test utilities
- **Accessibility Testing**: jest-axe

## Test Organization
```
tests/
├── e2e/                   # End-to-end tests
│   ├── auth/              # Authentication flows
│   │   ├── login.spec.ts
│   │   ├── register.spec.ts
│   │   └── logout.spec.ts
│   ├── lessons/           # Lesson features
│   │   ├── browse.spec.ts
│   │   ├── detail.spec.ts
│   │   ├── kahoot.spec.ts
│   │   ├── features.spec.ts
│   │   └── documents.spec.ts
│   └── editor/           # Editor features
│   │   ├── status.spec.ts
│   │   ├── review.spec.ts
│   │   ├── download.spec.ts
│   │   ├── check.spec.ts
│   │   └── edit.spec.ts
│   └── profile/          # Profile features
│   │   └── settings.spec.ts
│   │   └── documents.spec.ts
│   └── landing/          # Landing features
│   │   └── newsletter.spec.ts
│   │   └── privacy.spec.ts
│   │   └── policy.spec.ts
```

## Element Selection Strategy

### ALWAYS use data-testid
```typescript
// ❌ Bad - fragile selectors
await page.click('.btn-primary');
await page.click('#submit');
await page.click('button:nth-child(2)');

// ✅ Good - stable test IDs
await page.click('[data-testid="auth-login-button"]');
await page.getByTestId('auth-login-button').click();
```

### data-testid Naming Convention
Format: `[page/feature]-[component]-[element]-[state/action]`

```typescript
// Authentication
data-testid="auth-login-form"
data-testid="auth-email-input"
data-testid="auth-password-input"
data-testid="auth-submit-button"
data-testid="auth-error-message"

// Lessons
data-testid="lesson-list-container"
data-testid="lesson-card-title"
data-testid="lesson-card-favorite-button"
data-testid="lesson-filter-period"
data-testid="lesson-search-input"

// Editor
data-testid="editor-title-input"
data-testid="editor-content-area"
data-testid="editor-toolbar-bold"
data-testid="editor-save-button"
data-testid="editor-success-message"
```

## E2E Test Patterns

### Page Object Model
```typescript
// tests/e2e/pages/AuthPage.ts
export class AuthPage {
  constructor(private page: Page) {}

  // Locators
  get emailInput() {
    return this.page.getByTestId('auth-email-input');
  }

  get passwordInput() {
    return this.page.getByTestId('auth-password-input');
  }

  get submitButton() {
    return this.page.getByTestId('auth-submit-button');
  }

  get errorMessage() {
    return this.page.getByTestId('auth-error-message');
  }

  // Actions
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  // Assertions
  async expectError(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }
}
```

### Test Structure
```typescript
describe('Lesson Management', () => {
  let page: Page;
  let lessonPage: LessonPage;

  beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    lessonPage = new LessonPage(page);
    
    // Login as teacher
    await authenticate(page, testTeacher);
  });

  afterEach(async () => {
    await page.close();
  });

  describe('Browsing Lessons', () => {
    it('should filter lessons by historical period', async () => {
      // Arrange
      await page.goto('/lessons');
      
      // Act
      await lessonPage.selectPeriodFilter('1938-1945');
      
      // Assert
      const lessons = await lessonPage.getLessonCards();
      expect(lessons).toHaveLength(5);
      
      for (const lesson of lessons) {
        const period = await lesson.getByTestId('lesson-card-period').textContent();
        expect(period).toContain('1938-1945');
      }
    });
  });

  describe('Favorite System', () => {
    it('should add lesson to favorites when clicked', async () => {
      // Arrange
      await page.goto('/lessons/test-lesson-1');
      
      // Act
      await page.getByTestId('lesson-favorite-button').click();
      
      // Assert
      await expect(page.getByTestId('lesson-favorite-button')).toHaveAttribute(
        'aria-pressed', 
        'true'
      );
      await expect(page.getByTestId('lesson-favorite-icon')).toHaveClass(/filled/);
      
      // Verify in favorites list
      await page.goto('/favorites');
      await expect(page.getByTestId('favorite-lesson-test-lesson-1')).toBeVisible();
    });
  });
});
```

## Component Testing Patterns

### Test User Behavior, Not Implementation
```typescript
// ❌ Bad: Testing implementation details
it('should call onClick handler', () => {
  const onClick = jest.fn();
  render(<Button onClick={onClick} />);
  fireEvent.click(screen.getByRole('button'));
  expect(onClick).toHaveBeenCalled();
});

// ✅ Good: Testing user-visible behavior
it('should save lesson when user clicks save button', async () => {
  const user = userEvent.setup();
  render(<LessonEditor />);
  
  // User fills the form
  await user.type(
    screen.getByTestId('editor-title-input'), 
    'Nová lekce o odboji'
  );
  
  // User saves
  await user.click(screen.getByTestId('editor-save-button'));
  
  // User sees success message
  expect(
    await screen.findByTestId('editor-success-message')
  ).toHaveTextContent('Lekce byla úspěšně uložena');
});
```

### Accessibility Testing
```typescript
describe('LessonCard Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <LessonCard lesson={mockLesson} />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should be keyboard navigable', async () => {
    const user = userEvent.setup();
    render(<LessonCard lesson={mockLesson} />);
    
    // Tab to favorite button
    await user.tab();
    
    const favoriteButton = screen.getByTestId('lesson-card-favorite-button');
    expect(favoriteButton).toHaveFocus();
    
    // Activate with keyboard
    await user.keyboard('{Enter}');
    expect(favoriteButton).toHaveAttribute('aria-pressed', 'true');
  });
});
```

## Test Data Management

### Fixtures
```typescript
// tests/fixtures/users.ts
export const testTeacher = {
  email: 'test.ucitel@skola.cz',
  password: 'Test123!',
  profile: {
    name: 'Test Učitel',
    school: 'Testovací ZŠ',
    role: 'teacher'
  }
};

// tests/fixtures/lessons.ts
export const mockLesson = {
  id: 'test-lesson-1',
  title: 'Příběh statečnosti',
  description: 'Test popis lekce',
  period: '1938-1945',
  duration: 45,
  materials: [
    {
      id: 'material-1',
      type: 'metodicky' as const,
      title: 'Metodický list'
    }
  ]
};

// tests/fixtures/factories.ts
export function createLesson(overrides: Partial<Lesson> = {}): Lesson {
  return {
    id: `lesson-${Date.now()}`,
    title: 'Test Lesson',
    description: 'Test Description',
    ...mockLesson,
    ...overrides
  };
}
```

## Best Practices

### 1. Test Independence
```typescript
// Each test must run in isolation
beforeEach(async () => {
  // Reset database state
  await resetDatabase();
  
  // Clear all cookies
  await page.context().clearCookies();
  
  // Reset localStorage
  await page.evaluate(() => localStorage.clear());
});
```

### 2. Wait for Elements Properly
```typescript
// ❌ Bad: Fixed timeouts
await page.waitForTimeout(3000);

// ✅ Good: Wait for specific conditions
await page.waitForLoadState('networkidle');
await expect(page.getByTestId('lesson-list')).toBeVisible();
await page.waitForResponse(resp => resp.url().includes('/api/lessons'));
```

### 3. Error States Testing
```typescript
it('should show error when network fails', async () => {
  // Simulate network failure
  await page.route('**/api/lessons', route => route.abort());
  
  await page.goto('/lessons');
  
  await expect(
    page.getByTestId('error-message')
  ).toContainText('Nepodařilo se načíst lekce');
  
  await expect(
    page.getByTestId('error-retry-button')
  ).toBeVisible();
});
```

### 4. Czech Language Testing
```typescript
it('should display UI in Czech language', async () => {
  await page.goto('/');
  
  // Check key UI elements are in Czech
  await expect(page.getByTestId('nav-lessons-link')).toContainText('Lekce');
  await expect(page.getByTestId('nav-login-button')).toContainText('Přihlásit se');
  
  // Check date formatting
  const dateElement = page.getByTestId('lesson-date');
  await expect(dateElement).toMatch(/\d{1,2}\.\d{1,2}\.\d{4}/); // DD.MM.YYYY
});
```

## Test Coverage Requirements

- **Minimum Coverage**: 80% overall
- **Critical Paths**: 100% coverage required for:
  - Authentication flows
  - Payment processing
  - User data mutations
  - PDF generation
- **E2E Coverage**: All major user journeys
- **Component Coverage**: All interactive components

## Performance Testing

```typescript
it('should load lesson list under 3 seconds', async () => {
  const startTime = Date.now();
  
  await page.goto('/lessons');
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('lesson-list')).toBeVisible();
  
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(3000);
});
```

## CI/CD Integration

```yaml
# Run tests in CI
- name: Run E2E tests
  run: npm run test:e2e
  
- name: Run Unit tests
  run: npm run test:unit -- --coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```
