import { CoverageReport } from 'monocart-coverage-reports'
import { coverageOptions } from './coverage.config'

export default async () => {
    new CoverageReport(coverageOptions).cleanCache()
}