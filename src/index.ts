import { app } from './server.ts'
import { env } from '../env.ts'
const { APP_STAGE, PORT } = env

app.listen(PORT, () => {
  console.log(` Server is running on port http://localhost:${PORT}`)
  console.log(`App Stage ${APP_STAGE}`)
})
