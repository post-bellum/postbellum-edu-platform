# Accessibility & Element Naming Conventions

## Element Naming Patterns

### data-testid Format
Pattern: `[page/section]-[component]-[element]-[action/state]`

#### Examples by Section

**Navigation**
```html
data-testid="nav-main-menu"
data-testid="nav-user-dropdown"
data-testid="nav-lessons-link"
data-testid="nav-logout-button"
data-testid="nav-mobile-toggle"
```

**Authentication**
```html
data-testid="auth-login-form"
data-testid="auth-email-input"
data-testid="auth-password-input"
data-testid="auth-remember-checkbox"
data-testid="auth-submit-button"
data-testid="auth-error-message"
data-testid="auth-success-message"
data-testid="auth-google-button"
data-testid="auth-microsoft-button"
```

**Lessons**
```html
data-testid="lesson-list-container"
data-testid="lesson-list-empty"
data-testid="lesson-card-[id]"
data-testid="lesson-card-title"
data-testid="lesson-card-description"
data-testid="lesson-card-duration"
data-testid="lesson-card-period"
data-testid="lesson-card-favorite-button"
data-testid="lesson-filter-period"
data-testid="lesson-filter-topic"
data-testid="lesson-search-input"
data-testid="lesson-search-button"
```

**Lesson Detail**
```html
data-testid="lesson-detail-container"
data-testid="lesson-detail-title"
data-testid="lesson-detail-video"
data-testid="lesson-detail-transcript"
data-testid="lesson-detail-materials"
data-testid="lesson-download-metodicky"
data-testid="lesson-download-pracovny"
data-testid="lesson-edit-button"
data-testid="lesson-favorite-button"
data-testid="lesson-rating-stars"
data-testid="lesson-qr-code"
```

**Editor**
```html
data-testid="editor-container"
data-testid="editor-title-input"
data-testid="editor-toolbar"
data-testid="editor-toolbar-bold"
data-testid="editor-toolbar-italic"
data-testid="editor-toolbar-heading"
data-testid="editor-content-area"
data-testid="editor-save-button"
data-testid="editor-preview-button"
data-testid="editor-export-pdf"
data-testid="editor-autosave-indicator"
```

**User Profile**
```html
data-testid="profile-avatar"
data-testid="profile-name-input"
data-testid="profile-email-display"
data-testid="profile-school-input"
data-testid="profile-save-button"
data-testid="profile-materials-list"
data-testid="profile-delete-account"
```

### Component Props Pattern
```typescript
interface TestableComponentProps {
  'data-testid'?: string;
  testIdPrefix?: string; // For dynamic lists
}

// Usage example
export function LessonCard({ 
  lesson, 
  testIdPrefix = 'lesson' 
}: LessonCardProps) {
  return (
    <article data-testid={`${testIdPrefix}-card-${lesson.id}`}>
      <h3 data-testid={`${testIdPrefix}-card-title`}>
        {lesson.title}
      </h3>
      <button data-testid={`${testIdPrefix}-card-favorite-button`}>
        <FavoriteIcon data-testid={`${testIdPrefix}-card-favorite-icon`} />
      </button>
    </article>
  );
}
```

## Accessibility (a11y) Rules

### Use Semantic HTML
```tsx
// ❌ Bad
<div onClick={handleClick}>Click me</div>
<span className="heading">Title</span>

// ✅ Good
<button onClick={handleClick}>Click me</button>
<h2>Title</h2>
```

### ARIA Labels and Descriptions
```tsx
// Interactive elements must have accessible names
<button 
  aria-label="Přidat lekci do oblíbených"
  data-testid="lesson-favorite-button"
>
  <HeartIcon />
</button>

// Complex widgets need descriptions
<div 
  role="region" 
  aria-label="Editor obsahu"
  aria-describedby="editor-help"
  data-testid="editor-content-area"
>
  <p id="editor-help" className="sr-only">
    Použijte klávesové zkratky pro formátování textu
  </p>
</div>
```

### Focus Management
```tsx
// Manage focus for dynamic content
useEffect(() => {
  if (isOpen && headingRef.current) {
    headingRef.current.focus();
  }
}, [isOpen]);

return (
  <Dialog open={isOpen}>
    <h2 ref={headingRef} tabIndex={-1}>
      Dialog Title
    </h2>
  </Dialog>
);
```

### Keyboard Navigation
```tsx
// All interactive elements must be keyboard accessible
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  onClick={handleClick}
  data-testid="custom-button"
>
  Custom Button
</div>
```

### Form Accessibility
```tsx
// Always associate labels with inputs
<div>
  <label htmlFor="email-input">
    Email <span aria-label="povinné">*</span>
  </label>
  <input 
    id="email-input"
    type="email"
    required
    aria-describedby="email-error"
    data-testid="auth-email-input"
  />
  <span id="email-error" role="alert" className="error">
    {errors.email}
  </span>
</div>
```

### Loading States
```tsx
// Announce loading states to screen readers
<div aria-live="polite" aria-busy={isLoading}>
  {isLoading ? (
    <div role="status">
      <span className="sr-only">Načítání...</span>
      <Spinner data-testid="lesson-list-spinner" />
    </div>
  ) : (
    <LessonList />
  )}
</div>
```

### Error Handling
```tsx
// Make errors perceivable
<div role="alert" data-testid="error-message">
  <h2>Něco se pokazilo</h2>
  <p>{error.message}</p>
  <button onClick={retry} data-testid="error-retry-button">
    Zkusit znovu
  </button>
</div>
```

### Color Contrast
- Maintain WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
- Don't rely on color alone to convey information
- Test with color blindness simulators

### Screen Reader Considerations
```tsx
// Visually hidden but accessible to screen readers
<span className="sr-only">
  (otevře se v novém okně)
</span>

// CSS for .sr-only
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Internationalization
```tsx
// Use proper language attributes
<html lang="cs">
  <body>
    {/* Slovak content section */}
    <section lang="sk">
      <h2>Slovenský obsah</h2>
    </section>
  </body>
</html>
```

### Testing Accessibility
```typescript
// In component tests
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should be accessible', async () => {
  const { container } = render(<LessonCard {...props} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Czech/Slovak Specific Accessibility

### Date and Time Formatting
```tsx
// Always use locale-aware formatting
<time dateTime="2024-03-15" data-testid="lesson-date">
  {new Date('2024-03-15').toLocaleDateString('cs-CZ')}
  {/* Output: 15. 3. 2024 */}
</time>
```

### Number Formatting
```tsx
// Format numbers according to locale
<span data-testid="lesson-duration">
  {duration} {duration === 1 ? 'minuta' : duration < 5 ? 'minuty' : 'minut'}
</span>
```

### Form Validation Messages
```tsx
const validationMessages = {
  required: 'Toto pole je povinné',
  email: 'Zadejte platnou e-mailovou adresu',
  minLength: (min: number) => `Minimálně ${min} znaků`,
  maxLength: (max: number) => `Maximálně ${max} znaků`
};
```

## HTML ID Usage Guidelines

### Only Use IDs For:
1. **Form label associations**
   ```html
   <label htmlFor="user-email">Email</label>
   <input id="user-email" type="email" />
   ```

2. **ARIA relationships**
   ```html
   <h2 id="section-title">Název sekce</h2>
   <section aria-labelledby="section-title">...</section>
   ```

3. **Anchor targets**
   ```html
   <section id="metodika">...</section>
   <a href="#metodika">Přejít na metodiku</a>
   ```

### ID Format
- Use kebab-case: `user-profile-section`
- Be descriptive: `lesson-materials-download`
- Ensure uniqueness across the page

## ALWAYS Remember
- Test with keyboard only
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Test with browser zoom at 200%
- Validate HTML markup
- Check color contrast ratios
- Provide text alternatives for images
- Make error messages clear and actionable
- Support browser autofill for forms
