import { authClient } from "../../lib/auth-client"
import { AuthType } from "types"

export const authApi = {
  login: (data: AuthType.LoginProps) =>
    authClient.signIn.email({ email: data.email, password: data.password }),

  getMe: () => authClient.getSession(),

  logout: () => authClient.signOut(),
}