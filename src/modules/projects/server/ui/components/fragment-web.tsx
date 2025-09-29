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
        <div className="flex flex-col w-full h-full bg-background">
            {/* Toolbar */}
            <div className="flex-shrink-0 p-3 border-b bg-muted/30 flex items-center gap-x-2">
                <Hint text="Click to refresh" side="bottom" align="start">
                    <Button 
                        size="sm" 
                        variant="outline"
                        onClick={onRefresh}
                        className="h-8"
                    >
                        <RefreshCcwIcon className="w-4 h-4"/>
                    </Button>
                </Hint>
                <Hint text="Click to copy" side="bottom" align="start">
                    <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleCopy} 
                        className="flex-1 justify-start text-start font-normal h-8"
                        disabled={!data.sandboxUrl || copied}
                    >
                        <span className="truncate text-xs">
                            {data.sandboxUrl || "No URL available"}
                        </span>
                    </Button>
                </Hint>
                <Hint text="Open in a new tab" side="bottom" align="start">
                    <Button 
                        size="sm"
                        disabled={!data.sandboxUrl}
                        variant="outline"
                        className="h-8"
                        onClick={()=>{
                            if(!data.sandboxUrl) return;
                            window.open(data?.sandboxUrl,"_blank", "noopener,noreferrer")
                        }}
                    >
                        <ExternalLinkIcon className="w-4 h-4"/>
                    </Button>
                </Hint>
            </div>
            
            {/* Iframe Container */}
            <div className="flex-1 min-h-0 relative">
                {data.sandboxUrl ? (
                    <iframe 
                        key={fragmentKey}
                        src={data.sandboxUrl}  
                        className="w-full h-full border-0"
                        loading="lazy"
                        sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
                        title="Project Preview"
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            display: 'block'
                        }}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground bg-muted/20">
                        <div className="text-center">
                            <ExternalLinkIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No Preview URL</p>
                            <p className="text-sm">This fragment doesn't have a preview URL</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}