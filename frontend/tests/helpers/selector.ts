import type { Page, Locator } from "@playwright/test"

export const selector = (page: Page, elem: string): Locator => {
    if(/\s/.test(elem)){
        const [parent, child] = elem.split(' ')
        return page.locator(`[test-id=${parent}] ${child}`)
    }
    return page.locator(`[test-id=${elem}]`)
}