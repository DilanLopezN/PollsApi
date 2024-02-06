import fastify, { FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import z from 'zod'

const app = fastify()
const port = 3333
const prisma = new PrismaClient()

app.post('/polls', async (req: FastifyRequest, res: FastifyReply) => {
    const createPollBody = z.object({
      title: z.string().min(6)
    })
    const {title} = createPollBody.parse(req.body)

    try {
       
     const poll =  await prisma.poll.create({data: {title}})

     res.status(201).send({ poll_id: poll.id })


    } catch (error) {

      console.error(error)
      
    }

})

app.listen({port: port}).then(() => console.log(`Running on port ${port}`))