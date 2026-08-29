import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  Sidebar
} from 'components'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <div id='sidebar-toggle' className='px-3 pt-2.5'>
          <SidebarTrigger />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}