"use client"
import { SignIn } from '@clerk/nextjs'
import {dark} from "@clerk/themes"

import { useCurrentTheme } from '@/hooks/use-current-theme'

/**
 * Client-side page that renders Clerk's SignIn UI with theme-aware appearance.
 *
 * Uses `useCurrentTheme()` to determine whether to apply the dark `baseTheme` to Clerk's SignIn.
 * The SignIn appearance also overrides `elements.cardBox` to apply border, no shadow, and rounded corners.
 * The component centers the sign-in form within a responsive container and provides top padding.
 *
 * @returns The page's JSX element containing the themed SignIn component.
 */
export default function Page() {
  const currentTheme = useCurrentTheme()
  return (
    <div className='flex flex-col max-w-3xl mx-auto w-full'>
        <section className='space-y-6 pt-[16vh] 2xl:pt-48'>
            <div className='flex flex-col items-center'>
                <SignIn appearance={{
                  baseTheme : currentTheme === 'dark' ? dark : undefined,
                  elements:{
                    cardBox:"border! shadow-none! rounded-lg!"
                  }
                }}/>
            </div>
        </section>
    </div>
  )
}