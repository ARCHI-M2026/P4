import { expect, type Page } from '@playwright/test'
import { selector } from './selector'

export interface LoginUser {
    goodEmail: string
    badEmail: string
    goodPass: string
    badPass: string
}

export const login = async (page: Page, type: boolean, user: LoginUser): Promise<void> => {
    const email = selector(page, 'email')
    await email.clear()
    await email.fill(type ? user.goodEmail : user.badEmail)

    const password = selector(page, 'password')
    await password.clear()
    await password.fill(type ? user.goodPass : user.badPass)

    await selector(page, 'admin-login').click()

    if(type){
        await expect(selector(page, 'admin-layout')).toBeVisible()
    }
}