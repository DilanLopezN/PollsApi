import { FastifyInstance } from "fastify";
import z from "zod";
import { voting } from "../events/votes-pub-sub";

export async function pollResults(app: FastifyInstance) {
  app.get('/polls/:id/results', {websocket: true} ,async (connection, req) => {

    const pollResultParams = z.object({
      id: z.string().uuid()
    })

    const {id} = pollResultParams.parse(req.params)

    voting.subscribe(id, (message) => {
      connection.socket.send(JSON.stringify(message));
    })
 
  })
}