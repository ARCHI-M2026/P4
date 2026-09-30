  /// <reference types="node" />
import { test as base, type Locator } from '@playwright/test'
import { CoverageReport } from 'monocart-coverage-reports'
import { selector } from '../helpers/selector'
import { coverageOptions } from '../coverage.config'

// declare global {
//   interface Window {
//     __coverage__?: Record<string, unknown>;
//   }
// }

interface Fixtures {
    selector: (elem: string) => Locator;
    autoCollectCoverage: void;
}

export const test = base.extend<Fixtures>({
    selector: async ({ page }, use) => {
        await use(elem => selector(page, elem))
    },
    // Collecte automatique après chaque test
    autoCollectCoverage: [async ({ page, browserName }, use) => {
        const isChromium = browserName === 'chromium'
        if (isChromium) {
            await page.coverage.startJSCoverage({ resetOnNavigation: false })
        }

        await use()

        if (isChromium) {
            const coverage = await page.coverage.stopJSCoverage()
            await new CoverageReport(coverageOptions).add(coverage)
        }
    }, { auto: true }] // Exécution sans import obligatoire
})

export { expect } from '@playwright/test'