import "dotenv/config"
import app from './app'
import { startTokenCleanupJob } from "../jobs/cleanup-tokens"

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  startTokenCleanupJob()
})