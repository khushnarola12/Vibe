"use client"

import { Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@radix-ui/react-tooltip"

interface HintProps{
    children:React.ReactNode;
    text:string;
    side?:"top" | "top" | "right" | "left" | "bottom";
    align?:"start" | "center" | "end"
}

export const Hint = ({
    children,
    text,
    side='top',
    align="center"} : HintProps)=>{
        return(
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {children}
                    </TooltipTrigger>
                    <TooltipContent side={side} align={align} className="rounded-md bg-black px-2 py-1 text-sm text-white shadow-md">
                        <p>{text}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
}

