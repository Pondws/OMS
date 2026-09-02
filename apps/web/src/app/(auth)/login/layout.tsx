import { GuestProvider } from "components";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestProvider>
      {children}
    </GuestProvider>
  )
}