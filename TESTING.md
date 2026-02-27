# Testing Guide for StudioSync

This guide explains how to run tests locally and in CI for the StudioSync project.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Running Tests Locally](#running-tests-locally)
- [Running Tests with Docker](#running-tests-with-docker)
- [Running Tests in CI](#running-tests-in-ci)
- [Code Quality Tools](#code-quality-tools)
- [Pre-commit Hooks](#pre-commit-hooks)

## Prerequisites

### Backend Requirements

- Python 3.12+
- PostgreSQL 16+

### Frontend Requirements

- Node.js 20+
- npm

## Running Tests Locally

### Backend Tests

1. **Set up the test environment:**

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL=postgresql://test_user:test_password@localhost:5432/studiosync_test
export SECRET_KEY=test-secret-key
export DEBUG=False
```

2. **Run all tests:**

```bash
pytest
```

3. **Run tests with coverage:**

```bash
pytest --cov=apps --cov-report=html --cov-report=term-missing
```

4. **Run specific test files:**

```bash
# Run authentication tests only
pytest tests/auth/test_authentication.py

# Run a specific test class
pytest tests/auth/test_authentication.py::TestUserLogin

# Run a specific test
pytest tests/auth/test_authentication.py::TestUserLogin::test_login_with_valid_credentials
```

5. **Run tests by markers:**

```bash
# Run only unit tests
pytest -m unit

# Run only API tests
pytest -m api

# Run only authentication tests
pytest -m auth
```

### Frontend Tests

#### End-to-End (E2E) Tests with Playwright

E2E tests verify critical user flows to catch regressions before production.

**Prerequisites:**

- Docker services running (`docker compose up -d`)
- Test data seeded (`docker compose exec backend python seed_data.py`)
- Playwright browsers installed (`cd frontend && npx playwright install`)

**Run all E2E tests:**

```bash
cd frontend
npm run test:e2e
```

**Run specific test file:**

```bash
cd frontend
npx playwright test auth.spec.ts
npx playwright test bands.spec.ts
npx playwright test students.spec.ts
```

**Run in UI mode (interactive debugging):**

```bash
cd frontend
npm run test:e2e:ui
```

**Debug mode (step-by-step):**

```bash
cd frontend
npm run test:e2e:debug
```

**View test report:**

```bash
cd frontend
npm run test:e2e:report
```

**Using the helper script:**

```bash
# Automatically starts services, seeds data, and runs tests
./scripts/run-e2e-tests.sh
```

**Test Coverage:**

- ✅ Authentication (login, logout, session persistence)
- ✅ Band management (create, view, search)
- ✅ Student management (create, view, search)
- ✅ Navigation and routing
- ✅ Protected route access

See `frontend/e2e/README.md` for detailed documentation on writing and debugging E2E tests.

#### Unit Tests (Future)

```bash
cd frontend

# Install dependencies
npm install

# Run tests (when configured)
npm run test

# Run linting
npm run lint

# Build the frontend
npm run build
```

## Running Tests with Docker

### Using docker-compose.test.yml

The `docker-compose.test.yml` file provides an isolated test environment with the core services (Postgres, MinIO, Mailhog).

```bash
# Run backend tests in Docker
docker compose -f docker-compose.test.yml up backend-test

# View test results
docker compose -f docker-compose.test.yml logs backend-test

# Clean up
docker compose -f docker-compose.test.yml down -v
```

### Test Environment Features

The test environment includes:

- **PostgreSQL**: Ephemeral test database (used for data, caching, and Django Q tasks)
- **MinIO**: Local S3-compatible storage for file upload tests
- **Mailhog**: SMTP server for email testing (UI at http://localhost:8025)

## Running Tests in CI

Tests run automatically in GitHub Actions on:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### CI Workflow

The CI workflow (`.github/workflows/ci.yml`) includes:

1. **Backend Linting**
   - Black (code formatting)
   - isort (import sorting)
   - Ruff (linting)

2. **Frontend Linting**
   - ESLint
   - TypeScript type checking

3. **Backend Tests**
   - Runs migrations
   - Executes pytest with coverage
   - Uploads coverage reports

4. **Frontend Tests**
   - Runs frontend tests
   - Builds the production bundle

5. **Security Scanning**
   - Python dependency scanning with `safety`
   - npm audit for JavaScript dependencies

### Viewing CI Results

- CI results appear in the GitHub Actions tab
- Pull requests show check status
- Coverage reports are uploaded to Codecov (if configured)

## Code Quality Tools

### Linters and Formatters

#### Backend (Python)

```bash
cd backend

# Format code with Black
black .

# Sort imports with isort
isort .

# Lint with Ruff
ruff check .

# Fix auto-fixable issues
ruff check --fix .
```

#### Frontend (TypeScript/JavaScript)

```bash
cd frontend

# Run ESLint
npm run lint

# Format with Prettier (if configured)
npx prettier --write "**/*.{js,jsx,ts,tsx,json,css,md}"
```

### Configuration Files

- **Backend**: `backend/pyproject.toml` contains Black, isort, Ruff, and pytest config
- **Frontend**: `frontend/.prettierrc` for Prettier, ESLint config in `package.json`
- **Pre-commit**: `.pre-commit-config.yaml` for automated checks

## Pre-commit Hooks

Pre-commit hooks automatically run linters and formatters before each commit.

### Setup

```bash
# Install pre-commit
pip install pre-commit

# Install the git hooks
pre-commit install
```

### Usage

```bash
# Hooks run automatically on git commit

# Run manually on all files
pre-commit run --all-files

# Run specific hook
pre-commit run black --all-files

# Skip hooks for a specific commit (not recommended)
git commit --no-verify -m "Message"
```

### Hooks Included

- **Trailing whitespace removal**
- **End-of-file fixer**
- **YAML/JSON validation**
- **Large file check**
- **Merge conflict detection**
- **Private key detection**
- **Black** (Python formatting)
- **isort** (import sorting)
- **Ruff** (Python linting)
- **Prettier** (Frontend formatting)
- **detect-secrets** (Secret scanning)
- **Django system check**

## Test Data and Seeding

### Secure Seed Mode

For CI and production-like testing, use secure mode:

```bash
export SEED_SECURE_MODE=true
export SEED_ADMIN_PASSWORD=your_secure_password
export SEED_TEACHER_PASSWORD=your_secure_password
export SEED_STUDENT_PASSWORD=your_secure_password

python backend/seed_data.py
```

### Local Development Mode

For local development, the seed script uses default passwords:

```bash
# Run without SEED_SECURE_MODE
python backend/seed_data.py

# Default credentials:
# Admin: admin@test.com / admin123
# Teachers: teacher1@test.com / teacher123 (etc.)
# Students: student1@test.com / student123 (etc.)
```

## API Documentation

Once the server is running, access API documentation at:

- **Swagger UI**: http://localhost:8000/api/docs/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

## Health Checks

The application provides health check endpoints:

- **Health Check**: http://localhost:8000/health/
- **Readiness Check**: http://localhost:8000/ready/

These endpoints verify:

- Database connectivity
- Overall service health

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL environment variable
   - Verify database credentials

2. **Import errors**
   - Ensure all dependencies are installed: `pip install -r requirements.txt`
   - Check Python version (3.12+ required)

3. **Migration and Cache errors**
   - Run migrations: `python manage.py migrate`
   - Create cache table: `python manage.py createcachetable`
   - Check for pending migrations: `python manage.py showmigrations`

4. **Pre-commit hook failures**
   - Run formatters manually: `black .` and `isort .`
   - Check and fix linting issues: `ruff check --fix .`

### Debug Mode

Run tests with verbose output:

```bash
# Verbose pytest output
pytest -vv

# Show print statements
pytest -s

# Stop on first failure
pytest -x

# Run last failed tests
pytest --lf
```

## Coverage Reports

After running tests with coverage, view the HTML report:

```bash
# Generate coverage report
pytest --cov=apps --cov-report=html

# Open in browser (macOS)
open htmlcov/index.html

# Open in browser (Linux)
xdg-open htmlcov/index.html

# Open in browser (Windows)
start htmlcov/index.html
```

## Contributing

Before submitting a pull request:

1. Run all tests: `pytest`
2. Check test coverage: `pytest --cov=apps`
3. Run linters: `black .`, `isort .`, `ruff check .`
4. Install and run pre-commit hooks: `pre-commit run --all-files`
5. Ensure CI passes on your branch

## Additional Resources

- [pytest documentation](https://docs.pytest.org/)
- [Django testing documentation](https://docs.djangoproject.com/en/5.0/topics/testing/)
- [GitHub Actions documentation](https://docs.github.com/en/actions)
- [Pre-commit documentation](https://pre-commit.com/)
