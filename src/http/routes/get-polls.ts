import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import z from "zod"
import { prisma } from "../../lib/prisma"

export async function getPolls (app: FastifyInstance) {
  app.get('/polls/:id', async (req: FastifyRequest, res: FastifyReply) => {
    const getPollParams = z.object({
      id: z.string().uuid(),
    })
    const {id} = getPollParams.parse(req.params)

    try {
       
     const poll =  await prisma.poll.findUnique({where: {id}, include: {options: {
      select: {
        id: true,
        title: true
      }
     }}})

     res.status(200).send({ poll})

    } catch (error) {

      console.error(error)
      
    }

})
}