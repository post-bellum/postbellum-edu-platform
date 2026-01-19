# Testing Guide

This directory contains end-to-end (E2E) tests for the Post Bellum Educational Platform using Playwright.

## Prerequisites

Before running tests, you need to install Playwright browsers:

```bash
yarn playwright install
```

This will download the necessary browser binaries (Chromium, Firefox, and WebKit) required for running tests.

## Test Scripts

The following test scripts are available in `package.json`:

### `yarn test` or `npm test`
Runs all Playwright tests in headless mode across all configured browsers (Chromium, Firefox, WebKit).

```bash
yarn test
```

### `yarn test:ui` or `npm run test:ui`
Opens the Playwright UI mode, which provides an interactive interface for running and debugging tests. This is recommended for development and debugging.

```bash
yarn test:ui
```

### `yarn test:headed` or `npm run test:headed`
Runs tests with visible browser windows (headed mode). Useful for watching the test execution in real-time.

```bash
yarn test:headed
```

### `yarn test:debug` or `npm run test:debug`
Runs tests in debug mode with Playwright Inspector. Allows you to step through tests, inspect elements, and debug issues.

```bash
yarn test:debug
```

### `yarn test:report` or `npm run test:report`
Opens the HTML test report from the last test run. Shows detailed information about test execution, screenshots, and traces.

```bash
yarn test:report
```

## Running Specific Tests

You can run specific test files or test suites:

```bash
# Run a specific test file
npx playwright test tests/e2e/auth/register.spec.ts

# Run tests for a specific browser
npx playwright test --project=chromium

# Run tests in headed mode for a specific file
npx playwright test tests/e2e/auth/register.spec.ts --project=chromium --headed
```

## Test Structure

```
tests/
├── e2e/                   # End-to-end tests
│   ├── auth/              # Authentication flows
│   │   ├── register.spec.ts
│   │   ├── login.spec.ts
│   │   └── logout.spec.ts
│   ├── lessons/           # Lesson features
│   └── profile/            # Profile features
├── fixtures/              # Page Object Model classes
│   └── registrationModal.ts
└── helpers/               # Test helper functions
```

## Test Configuration

Tests are configured in `playwright.config.ts` at the project root. Key settings:

- **Base URL**: Tests run against the staging environment by default (`https://postbellum-edu-platform-git-staging-post-bellums-projects.vercel.app`)
- **Browsers**: Chromium, Firefox, and WebKit
- **Timeout**: Individual tests have a 2-minute timeout
- **Screenshots**: Automatically captured on test failures
- **Traces**: Collected when tests are retried

## Environment Variables

Test credentials are stored in `.env.test` file (not committed to git):

```bash
TEST_EMAIL=your-test-email@example.com
TEST_PASSWORD=your-test-password
TEST_CONFIRMATION_CODE=111111
```

## Page Object Model (POM)

Tests use the Page Object Model pattern to improve maintainability:

- Page objects are located in `tests/fixtures/`
- Each page object encapsulates selectors and actions for a specific page or component
- Example: `RegistrationModal` class handles all registration modal interactions

## Best Practices

1. **Use data-testid selectors**: All elements should have `data-testid` attributes following the `component-action-element` pattern
2. **Wait for elements**: Use Playwright's built-in waiting mechanisms instead of fixed timeouts when possible
3. **Keep tests independent**: Each test should be able to run in isolation
4. **Use descriptive test names**: Test names should clearly describe what is being tested
5. **Follow Gherkin-style comments**: Use Given/When/Then style comments to document test steps

## Debugging Tests

### Using Playwright Inspector

```bash
yarn test:debug
```

This opens Playwright Inspector where you can:
- Step through tests line by line
- Inspect page state at any point
- View network requests and console logs
- Take screenshots at any point

### Using UI Mode

```bash
yarn test:ui
```

UI mode provides:
- Visual timeline of test execution
- Ability to run individual tests
- Watch mode for automatic re-running
- Time travel debugging

### Viewing Test Reports

After running tests, view the HTML report:

```bash
yarn test:report
```

The report includes:
- Test execution timeline
- Screenshots of failures
- Console logs and network requests
- Video recordings (if enabled)

## CI/CD Integration

Tests are configured to run in CI environments with:
- Automatic retries on failure (2 retries in CI)
- Single worker mode for stability
- HTML report generation

## Troubleshooting

### Browsers not found
If you see an error about missing browsers, run:
```bash
yarn playwright install
```

### Tests timing out
- Check if the staging environment is accessible
- Verify network connectivity
- Increase timeout in `playwright.config.ts` if needed

### Element not found errors
- Verify the element has the correct `data-testid` attribute
- Check if the element is visible (not hidden by CSS or other elements)
- Ensure proper waiting for dynamic content

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
