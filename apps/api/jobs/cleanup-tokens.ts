// jobs/cleanup-tokens.ts
import cron from "node-cron"
import authService from "../src/modules/auth/auth.service"

export const startTokenCleanupJob = () => {
  // ทุกวันตี 3
  cron.schedule("0 3 * * *", async () => {
    try {
      const count = await authService.cleanupExpiredTokens()
      console.log(`[cleanup] ลบ refresh token ${count} รายการ`)
    } catch (error) {
      console.error("[cleanup] failed", error)
    }
  })
}