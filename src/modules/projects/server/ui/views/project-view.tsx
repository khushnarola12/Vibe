import { ResizableHandle,ResizablePanel,ResizablePanelGroup } from "@/components/ui/resizable"
import { MessagesContainer } from "../components/messages-container"
import { Suspense } from "react"
interface Props{
    projectId : string, 
}

export const Projectview = ({projectId}:Props) => {

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel minSize={20} defaultSize={35} className="flex flex-col min-h-0">
          <Suspense fallback={<p>Loading messages...</p>}>
             <MessagesContainer projectId={projectId} />
             </Suspense>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel className="p-4" minSize={20} defaultSize={65}>
          TODO : Preview
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
