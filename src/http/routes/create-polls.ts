import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import z from "zod"
import { prisma } from "../../lib/prisma"

export async function createPolls (app: FastifyInstance) {
  app.post('/polls', async (req: FastifyRequest, res: FastifyReply) => {
    const createPollBody = z.object({
      title: z.string().min(6),
      options: z.array(z.string())
    })
    const {title, options} = createPollBody.parse(req.body)

    try {
       
     const poll =  await prisma.poll.create(
      {data: {
        title,
        options: {
          createMany: {
            data: options.map((opt) => ({title: opt}))
          }
        }
      }}
      )

     res.status(201).send({ poll_id: poll.id })

    } catch (error) {

      console.error(error)
      
    }

})
}