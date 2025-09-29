"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { MessagesContainer } from "../components/messages-container";
import { Suspense, useState, useEffect } from "react";
import { Fragment } from "@/generated/prisma";
import { ProjectHeader } from "../components/project-header";
import { FragmentWeb } from "../components/fragment-web";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeIcon, CrownIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileExplorer } from "@/components/file-explorer";
import { UserControl } from "@/components/user-control";
import { useAuth } from "@clerk/nextjs";
interface Props {
  projectId: string;
}

export const Projectview = ({ projectId }: Props) => {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
  const [tabState, setTabState] = useState<"preview" | "code">("preview");
  const [isMobile, setIsMobile] = useState(false);

  const {has} = useAuth()
  const hasProAccess = has?.({plan:'pro'})

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <div className="flex-shrink-0">
          <Suspense fallback={<div className="h-12 bg-background animate-pulse" />}>
            <ProjectHeader projectId={projectId} />
          </Suspense>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 min-h-0 flex flex-col">
          {/* Messages Section */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <Suspense fallback={<div className="h-full flex items-center justify-center text-muted-foreground">Loading messages...</div>}>
              <MessagesContainer
                projectId={projectId}
                activeFragment={activeFragment}
                setActiveFragment={setActiveFragment}
              />
            </Suspense>
          </div>
          
          {/* Output Section - Only show when there's an active fragment */}
          {activeFragment && (
            <div className="border-t bg-background shadow-lg">
              <Tabs
                className="h-80 flex flex-col"
                defaultValue="preview"
                value={tabState}
                onValueChange={(value) => setTabState(value as "preview" | "code")}
              >
                {/* Tab Header */}
                <div className="flex-shrink-0 w-full flex items-center p-3 border-b bg-muted/30 gap-x-2">
                  <TabsList className="h-9 p-0 border rounded-lg bg-background">
                    <TabsTrigger value="preview" className="rounded-lg text-sm px-3">
                      <EyeIcon className="w-4 h-4 mr-2" />
                      <span>Preview</span>
                    </TabsTrigger>
                    <TabsTrigger value="code" className="rounded-lg text-sm px-3">
                      <CodeIcon className="w-4 h-4 mr-2" />
                      <span>Code</span>
                    </TabsTrigger>
                  </TabsList>
                  <div className="ml-auto flex items-center gap-x-2">
                    {!hasProAccess && ( 
                      <Button asChild size="sm" variant="default" className="text-xs h-8">
                        <Link href="/pricing">
                          <CrownIcon className="w-3 h-3 mr-1" /> 
                          <span>Upgrade</span>
                        </Link>
                      </Button>
                    )}
                    <UserControl/>
                  </div>
                </div>
                
                {/* Tab Content */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  <TabsContent value="preview" className="h-full m-0 overflow-hidden">
                    <FragmentWeb data={activeFragment} />
                  </TabsContent>
                  <TabsContent value="code" className="h-full m-0 overflow-hidden">
                    {!!activeFragment?.files && (
                      <FileExplorer files={activeFragment.files as {[path:string] :string}}/>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background">
      <ResizablePanelGroup direction="horizontal">
        {/* Left Panel - Messages */}
        <ResizablePanel
          minSize={25}
          defaultSize={40}
          className="flex flex-col min-h-0 bg-background"
        >
          <div className="flex-shrink-0">
            <Suspense fallback={<div className="h-14 bg-background animate-pulse" />}>
              <ProjectHeader projectId={projectId} />
            </Suspense>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <Suspense fallback={<div className="h-full flex items-center justify-center text-muted-foreground">Loading messages...</div>}>
              <MessagesContainer
                projectId={projectId}
                activeFragment={activeFragment}
                setActiveFragment={setActiveFragment}
              />
            </Suspense>
          </div>
        </ResizablePanel>
        
        <ResizableHandle className="hover:bg-primary transition-colors w-1 bg-border" />
        
        {/* Right Panel - Output */}
        <ResizablePanel className="bg-background" minSize={35} defaultSize={60}>
          <div className="h-full flex flex-col">
            <Tabs
              className="h-full flex flex-col"
              defaultValue="preview"
              value={tabState}
              onValueChange={(value) => setTabState(value as "preview" | "code")}
            >
              {/* Tab Header */}
              <div className="flex-shrink-0 w-full flex items-center p-4 border-b bg-muted/30 gap-x-3">
                <TabsList className="h-9 p-0 border rounded-lg bg-background">
                  <TabsTrigger value="preview" className="rounded-lg text-sm px-4">
                    <EyeIcon className="w-4 h-4 mr-2" />
                    <span>Preview</span>
                  </TabsTrigger>
                  <TabsTrigger value="code" className="rounded-lg text-sm px-4">
                    <CodeIcon className="w-4 h-4 mr-2" />
                    <span>Code</span>
                  </TabsTrigger>
                </TabsList>
                <div className="ml-auto flex items-center gap-x-3">
                  {!hasProAccess && ( 
                    <Button asChild size="sm" variant="default" className="text-sm">
                      <Link href="/pricing">
                        <CrownIcon className="w-4 h-4 mr-2" /> 
                        <span>Upgrade</span>
                      </Link>
                    </Button>
                  )}
                  <UserControl/>
                </div>
              </div>
              
              {/* Tab Content */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <TabsContent value="preview" className="h-full m-0 overflow-hidden">
                  {!!activeFragment ? (
                    <FragmentWeb data={activeFragment} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground bg-muted/20">
                      <div className="text-center">
                        <EyeIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No Preview Available</p>
                        <p className="text-sm">Select a message with output to see the preview</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="code" className="h-full m-0 overflow-hidden">
                  {!!activeFragment?.files ? (
                    <FileExplorer files={activeFragment.files as {[path:string] :string}}/>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground bg-muted/20">
                      <div className="text-center">
                        <CodeIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No Code Available</p>
                        <p className="text-sm">Select a message with code to see the files</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
