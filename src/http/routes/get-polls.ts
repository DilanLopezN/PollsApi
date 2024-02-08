import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import z from "zod"
import { prisma } from "../../lib/prisma"
import { redis } from "../../lib/redis"

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

     if(!poll) {
      return res.status(400).send({message: 'poll not found'})
     }


     const result = await redis.zrange(id, 0, -1, 'WITHSCORES')

     const votes = result.reduce((obj, line, index ) => {
      if(index % 2 === 0) {
        const score = result[index + 1]

        Object.assign(obj, { [line]: Number(score)})
      }

      return obj
     }, {} as Record<string, number>)

     res.status(200).send({ poll: {
        id: poll.id,
        title: poll.title,
        options: poll.options.map((option) => {
          return {
            id: option.id,
            title: option.title,
            score: (option.id in votes) ? votes[option.id] : 0
          }
        })
     }})

    } catch (error) {

      console.error(error)
      
    }

})
}