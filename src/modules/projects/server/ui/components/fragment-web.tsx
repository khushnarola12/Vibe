"use client"

import { Fragment } from "@/generated/prisma";
import {ExternalLinkIcon,RefreshCcwIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hints";

interface Props{
    data : Fragment
}

export function FragmentWeb({data}:Props){
    const [copied,setCopied] = useState(false)
    const [fragmentKey,setFragmentKey] = useState(0)

    const onRefresh = () =>{
        setFragmentKey((prev)=>prev+1)
    }

    const handleCopy = () =>{
        navigator.clipboard.writeText(data?.sandboxUrl)
        setCopied(true)
        setTimeout(()=>setCopied(false) ,2000)
    }
    return(
        <div className="flex flex-col w-full h-full">
            <div className="p-2 border-b bg-sidebar flex items-center gap-x-2">
                <Hint text="Click to refresh" side="bottom" align="start">
                <Button 
                size="sm" 
                variant="outline"
                onClick={onRefresh}
                >
                    <RefreshCcwIcon/>
                </Button>
                </Hint>
                 <Hint text="Click to copy" side="bottom" align="start">
                 <Button size="sm" variant="outline" onClick={handleCopy} className="flex-1 justify-start text-start font-normal"
                disabled={!data.sandboxUrl || copied}>
                    <span className="truncate">
                        {data.sandboxUrl}
                    </span>
                </Button>
                </Hint>
                <Hint text="Open in a new tab" side="bottom" align="start">
                <Button 
                    size="sm"
                    disabled={!data.sandboxUrl}
                    variant="outline"
                    onClick={()=>{
                        console.log("clicked!", data.sandboxUrl)
                        if(!data.sandboxUrl) return;
                        window.open(data?.sandboxUrl,"_blank", "noopener,noreferrer")
                    }}>
                        <ExternalLinkIcon/>
                    </Button>
                </Hint>
            </div>
            <iframe 
            key={fragmentKey}
            src={data.sandboxUrl}  
            className="h-full w-full"
            loading="lazy"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"/>
        </div>
    )
}