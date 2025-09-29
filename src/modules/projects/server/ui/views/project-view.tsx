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
      <div className="h-screen flex flex-col">
        <div className="flex-1 min-h-0">
          <Suspense fallback={<p>Loading Project....</p>}>
            <ProjectHeader projectId={projectId} />
          </Suspense>
          <Suspense fallback={<p>Loading messages...</p>}>
            <MessagesContainer
              projectId={projectId}
              activeFragment={activeFragment}
              setActiveFragment={setActiveFragment}
            />
          </Suspense>
        </div>
        {activeFragment && (
          <div className="border-t bg-background">
            <Tabs
              className="h-64"
              defaultValue="preview"
              value={tabState}
              onValueChange={(value) => setTabState(value as "preview" | "code")}
            >
              <div className="w-full flex items-center p-2 border-b gap-x-2">
                <TabsList className="h-8 p-0 border rounded-md">
                  <TabsTrigger value="preview" className="rounded-md text-xs">
                    <EyeIcon className="w-3 h-3" />
                    <span className="hidden sm:inline">Preview</span>
                  </TabsTrigger>
                  <TabsTrigger value="code" className="rounded-md text-xs">
                    <CodeIcon className="w-3 h-3" />
                    <span className="hidden sm:inline">Code</span>
                  </TabsTrigger>
                </TabsList>
                <div className="ml-auto flex items-center gap-x-2">
                  {!hasProAccess && ( 
                    <Button asChild size="sm" variant="default" className="text-xs">
                      <Link href="/pricing">
                        <CrownIcon className="w-3 h-3" /> 
                        <span className="hidden sm:inline">Upgrade</span>
                      </Link>
                    </Button>
                  )}
                  <UserControl/>
                </div>
              </div>
              <TabsContent value="preview" className="h-full">
                <FragmentWeb data={activeFragment} />
              </TabsContent>
              <TabsContent value="code" className="h-full min-h-0">
                {!!activeFragment?.files && (
                  <FileExplorer files={activeFragment.files as {[path:string] :string}}/>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          minSize={20}
          defaultSize={35}
          className="flex flex-col min-h-0"
        >
          <Suspense fallback={<p>Loading Project....</p>}>
            <ProjectHeader projectId={projectId} />
          </Suspense>
          <Suspense fallback={<p>Loading messages...</p>}>
            <MessagesContainer
              projectId={projectId}
              activeFragment={activeFragment}
              setActiveFragment={setActiveFragment}
            />
          </Suspense>
        </ResizablePanel>
        <ResizableHandle className="hover:bg-primary transition-colors" />
        <ResizablePanel className="p-4" minSize={50} defaultSize={65}>
          <Tabs
            className="h-full gap-y-4"
            defaultValue="preview"
            value={tabState}
            onValueChange={(value) => setTabState(value as "preview" | "code")}
          >
            <div className="w-full flex items-center p-2 border-b gap-x-2">
              <TabsList className="h-8 p-0 border rounded-md">
                <TabsTrigger value="preview" className="rounded-md text-sm">
                  <EyeIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Preview</span>
                </TabsTrigger>
                <TabsTrigger value="code" className="rounded-md text-sm">
                  <CodeIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Code</span>
                </TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-x-2">
                {!hasProAccess && ( 
                  <Button asChild size="sm" variant="default" className="text-sm">
                    <Link href="/pricing">
                      <CrownIcon className="w-4 h-4" /> 
                      <span className="hidden sm:inline">Upgrade</span>
                    </Link>
                  </Button>
                )}
               
                <UserControl/>
              </div>

            </div>
            <TabsContent value="preview">
              {!!activeFragment && <FragmentWeb data={activeFragment} />}
            </TabsContent>
            <TabsContent value="code" className="min-h-0">
             {!!activeFragment?.files && (
              <FileExplorer files={activeFragment.files as {[path:string] :string}}/>
             )}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
