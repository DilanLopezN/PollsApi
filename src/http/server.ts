import fastify from 'fastify'
import cookies from '@fastify/cookie'
import { createPolls } from './routes/create-polls'
import { getPolls } from './routes/get-polls'
import { voteOnPoll } from './routes/vote-on-poll'



const app = fastify()
const port = 3333

app.register(cookies, {
  secret: 'supersecretkey',
  hook: 'onRequest'
})

app.register(createPolls)
app.register(getPolls)
app.register(voteOnPoll)


app.listen({port: port}).then(() => console.log(`Running on port ${port}`))