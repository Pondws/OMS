import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  Sidebar,
  AuthGuard
} from 'components'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <Sidebar />
          <SidebarInset className="flex min-h-0 flex-col">
          <div className="shrink-0 px-3 pt-2.5">
            <SidebarTrigger />
          </div>

          <main className="min-h-0 flex-1">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}