  /// <reference types="node" />
import { test as base, type Locator } from '@playwright/test'
import { writeFileSync, mkdirSync } from 'fs'
import { selector } from '../helpers/selector'

declare global {
  interface Window {
    __coverage__?: Record<string, unknown>;
  }
}

interface Fixtures {
    selector: (elem: string) => Locator;
    autoCollectCoverage: void;
}

export const test = base.extend<Fixtures>({
    selector: async ({ page }, use) => {
        await use(elem => selector(page, elem))
    },
    // Collecte automatique après chaque test
    autoCollectCoverage: [async ({ page }, use) => {
        await use()
        const coverage = await page.evaluate(() => window.__coverage__)
        if (coverage) {
            mkdirSync('.nyc_output', { recursive: true })
            writeFileSync(
                `.nyc_output/coverage-${Date.now()}.json`,
                JSON.stringify(coverage)
            )
        }
    }, { auto: true }] // Exécution sans import obligatoire
})

export { expect } from '@playwright/test'