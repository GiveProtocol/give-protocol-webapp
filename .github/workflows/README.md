# GitHub Actions Workflows

This directory contains automated workflows for code quality, testing, and analysis.

## Workflows

### 1. SonarCloud Analysis (`sonarcloud.yml`)
- **Triggers**: Push to main/develop, Pull requests, Manual trigger
- **Purpose**: Runs SonarCloud analysis for code quality metrics
- **Features**:
  - Runs tests with coverage
  - Generates ESLint reports
  - Submits results to SonarCloud
  - Comments on PRs with results

### 2. Code Quality & Analysis (`code-quality.yml`)
- **Triggers**: Push to main/develop/feature/fix branches, PRs, Daily schedule, Manual
- **Purpose**: Comprehensive code quality checks
- **Features**:
  - TypeScript compilation check
  - Linting with report generation
  - Test execution with coverage
  - Security scanning with Trivy
  - Artifacts upload for debugging
  - GitHub summary generation

### 3. New Code Analysis (`new-code-analysis.yml`)
- **Triggers**: Pull requests, Push to main
- **Purpose**: Focused analysis on changed code only
- **Features**:
  - Detects changed files
  - Runs tests only for modified code
  - SonarCloud analysis focused on new code
  - Efficient CI/CD for large codebases

## Required Secrets

To use these workflows, you need to configure the following secrets in your GitHub repository:

1. **SONAR_TOKEN**: Your SonarCloud authentication token
   - Get it from: https://sonarcloud.io/account/security
   - Add in: Settings → Secrets and variables → Actions

2. **GITHUB_TOKEN**: Automatically provided by GitHub Actions (no setup needed)

## Setup Instructions

1. **Enable GitHub Actions**:
   - Go to Settings → Actions → General
   - Select "Allow all actions and reusable workflows"

2. **Configure SonarCloud**:
   - Go to https://sonarcloud.io
   - Import your project if not already done
   - Get your SONAR_TOKEN from account security settings
   - Add the token to GitHub secrets

3. **First Run**:
   - The workflows will run automatically on your next push or PR
   - You can also trigger manually from Actions tab

## Manual Triggering

To manually trigger a workflow:
1. Go to Actions tab
2. Select the workflow
3. Click "Run workflow"
4. Select branch and options
5. Click "Run workflow" button

## Monitoring

- **GitHub Actions**: Check the Actions tab for workflow runs
- **SonarCloud Dashboard**: https://sonarcloud.io/project/overview?id=GiveProtocol_Duration-Give
- **Pull Request Checks**: Automated comments and status checks on PRs

## Troubleshooting

### SonarCloud not running?
1. Check if SONAR_TOKEN is set correctly
2. Verify project exists in SonarCloud
3. Check workflow logs for errors

### Tests failing in CI but passing locally?
1. Check Node.js version matches
2. Ensure all dependencies are in package.json
3. Check for environment-specific issues

### Coverage not showing?
1. Ensure tests generate lcov reports
2. Check coverage file paths match configuration
3. Verify SonarCloud project settings

## Best Practices

1. **Keep workflows fast**: Use caching and parallel jobs
2. **Fail fast**: Put quick checks first
3. **Use artifacts**: Upload logs and reports for debugging
4. **Monitor costs**: GitHub Actions has usage limits
5. **Regular updates**: Keep actions versions current