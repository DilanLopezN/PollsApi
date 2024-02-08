import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import z from "zod"
import { prisma } from "../../lib/prisma"
import {randomUUID} from 'node:crypto'
import { redis } from "../../lib/redis"
import { voting } from "../events/votes-pub-sub"

export async function voteOnPoll (app: FastifyInstance) {
  app.post('/polls/:id/votes', async (req: FastifyRequest, res: FastifyReply) => {
    const voteOnPollBody = z.object({
      pollOptionId: z.string().uuid(),
    })
    const voteOnPollParams = z.object({
      id: z.string().uuid(),
    })
    const {id} = voteOnPollParams.parse(req.params)
    const {pollOptionId} = voteOnPollBody.parse(req.body)

    try {
       
      let sessionId = req.cookies.sessionId

      if(sessionId) {
        const userHasVoted = await prisma.vote.findUnique({
          where: {
            pollId_sessionId: {
              pollId: id,
              sessionId
            }
          }
        })

        if(userHasVoted && userHasVoted.pollOptionId != pollOptionId) {
          await prisma.vote.delete({
            where: {id: userHasVoted.id}
          })

         const votes = await redis.zincrby(id, -1, userHasVoted.pollOptionId)

          voting.publish(id, {
            pollOptionId: userHasVoted.pollOptionId,
            votes: Number(votes)
          })

        } else if(userHasVoted) {
          return res.status(400).send({message: 'Already voted on poll'})
        }
        
      }

      if(!sessionId) {
        sessionId =  randomUUID()
        res.setCookie('sessionId',sessionId, {
          path: '/',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          signed: true,
          httpOnly: true
        })

        await prisma.vote.create({
          data: {
            sessionId, 
            pollId: id,
            pollOptionId
          }
        })
      }


      const votes = await redis.zincrby(id, 1, pollOptionId)

     
      voting.publish(id, {
        pollOptionId,
        votes: Number(votes)
      })

      res.status(201)

    } catch (error) {

      console.error(error)
      
    }

})
}