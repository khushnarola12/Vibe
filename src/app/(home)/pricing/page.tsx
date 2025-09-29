"use client"

import Image from "next/image"
import { PricingTable } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useCurrentTheme } from "@/hooks/use-current-theme"

const Page = ()=>{

    const currentTheme = useCurrentTheme()
    return(
        <div className="flex flex-col max-w-4xl mx-auto w-full px-4">
            <section className="space-y-4 sm:space-y-6 py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-32">
            <div className="flex flex-col items-center">
                <Image src="/logo.svg" alt="logo vibe" height={50} width={50} className="hidden md:block"/>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">Pricing</h1>
            <p className="text-muted-foreground text-center text-base sm:text-lg max-w-2xl mx-auto">
                Choose the plan that fits your needs
            </p>
            <div className="w-full">
                <PricingTable
                    appearance={{
                        baseTheme:currentTheme==='dark' ? dark : undefined,
                        elements:{
                            pricingTableCard:"border! shadow-none! rounded-lg!",
                            pricingTableCardContainer:"flex flex-col sm:flex-row gap-4!",
                            pricingTableCardContent:"p-4 sm:p-6!"
                        }
                    }}/>
            </div>
            </section>
        </div>
    )
}

export default Page