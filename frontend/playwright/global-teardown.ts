// playwright/global-teardown.ts
import { CoverageReport } from 'monocart-coverage-reports'
import { coverageOptions } from './coverage.config'

export default async () => {
    await new CoverageReport(coverageOptions).generate()
}