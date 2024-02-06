import fastify from 'fastify'

const app = fastify()

const port = 3333

app.listen({port: port}).then(() => console.log(`Running on port ${port}`))