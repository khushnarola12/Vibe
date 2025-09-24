import {Projectview} from '@/modules/projects/server/ui/views/project-view';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import React from 'react'
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
interface Props {
    params: Promise<{ projectId: string }>
}
const Page = async ({params}: Props) => {

    const {projectId} = await params;
    const queryClient = getQueryClient()
    void queryClient.prefetchQuery(trpc.messages.getMany.queryOptions({
        projectId:projectId
    }));
    void queryClient.prefetchQuery(trpc.projects.getOne.queryOptions({
        id: projectId
    }))
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary fallback={<p>Error!</p>}>
      <Suspense fallback={<p>loading.....</p>}></Suspense>
        <Projectview projectId={projectId}/>
        </ErrorBoundary>
    </HydrationBoundary>
  )
}

export default Page