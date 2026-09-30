import type { CoverageReportOptions } from 'monocart-coverage-reports'

export const coverageOptions: CoverageReportOptions = {
    name: 'DataShare – couverture E2E',
    outputDir: './coverage/e2e',
    reports: ['v8', 'lcovonly', 'console-summary'],
    entryFilter: entry =>
        entry.url.startsWith('http://localhost:4200/') && !entry.url.includes('node_modules'),
    sourceFilter: sourcePath =>
        sourcePath.includes('src/app/') && !sourcePath.endsWith('.spec.ts'),
}