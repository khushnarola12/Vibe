"use client"

import { useCurrentTheme } from "@/hooks/use-current-theme"
import { UserButton } from "@clerk/nextjs"
import { dark } from "@clerk/themes"

interface Props {
    showName ?:boolean
}

export const UserControl = ({showName}:Props)=>{
    const currentTheme = useCurrentTheme()
    return(
        <UserButton 
            showName={showName} 
            appearance={{
                elements:{
                    userButtonBox:"rounded-md!",
                    userButtonAvatarBox:"rounded-md! size-7 sm:size-8!",
                    userButtonTrigger:"rounded-md! h-8 sm:h-9!",
                    userButtonPopoverCard:"rounded-lg!",
                    userButtonPopoverActionButton:"text-sm!"
                },
                baseTheme:currentTheme==='dark' ? dark : undefined
            }}
        />
        
    )
}