import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  Sidebar,
  GuardProvider
} from 'components'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuardProvider>
      <SidebarProvider>
        <Sidebar />
        {/* <SidebarInset>
          <div id='sidebar-toggle' className='px-3 pt-2.5'>
            <SidebarTrigger />
          </div>
          {children}
        </SidebarInset> */}

          <SidebarInset className="flex min-h-0 flex-col">
          <div className="shrink-0 px-3 pt-2.5">
            <SidebarTrigger />
          </div>

          <main className="min-h-0 flex-1">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </GuardProvider>
  )
}