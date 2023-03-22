import { PrismaClient } from '@prisma/client';
import { inferAsyncReturnType, initTRPC } from '@trpc/server';
import {
  CreateHTTPContextOptions,
  createHTTPServer,
} from '@trpc/server/adapters/standalone';
import {
  CreateWSSContextFnOptions,
  applyWSSHandler,
} from '@trpc/server/adapters/ws';
import { observable } from '@trpc/server/observable';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { z } from 'zod';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  const $global = global as any;
  if (!$global.__db__) {
    $global.__db__ = new PrismaClient();
  }
  prisma = $global.__db__;
}

// This is how you initialize a context for the server
function createContext(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  opts: CreateHTTPContextOptions | CreateWSSContextFnOptions,
) {
  return {};
}
type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

const publicProcedure = t.procedure;
const router = t.router;

const greetingRouter = router({
  hello: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .query(({ input }) => prisma.user.findMany()),
});

const postRouter = router({
  createPost: publicProcedure
    .input(
      z.object({
        email: z.string(),
        name: z.string(),
        password: z.string(),
      }),
    )
    .mutation(({ input: { email, name, password } }) => {
      // imagine db call here
      return prisma.user.create({
        data: {
          email,
          name,
          password,
        },
      });
    }),
  randomNumber: publicProcedure.subscription(() => {
    return observable<{ randomNumber: number }>((emit) => {
      const timer = setInterval(() => {
        // emits a number every second
        emit.next({ randomNumber: Math.random() });
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    });
  }),
});

// Merge routers together
const appRouter = router({
  greeting: greetingRouter,
  post: postRouter,
});

export type AppRouter = typeof appRouter;

// http server
const { server, listen } = createHTTPServer({
  middleware: cors(),
  router: appRouter,
  createContext,
});

// const createContextWithUser = async (opts) => {
//   const token = opts.headers.authorization.split(' ')[1];
//   const user = await verifyJwt(token);
//   const ctx = createContext(opts);
//   ctx.user = user;
//   return ctx;
// };

// ws server
const wss = new WebSocketServer({ server });

wss.on('connection', async (socket, req) => {
  try {
    const id = req.url?.split('/')[1];
    console.log('person connected', id);
    // const ctx = await createContextWithUser({ headers: req.headers });
    socket.on('message', async (data) => {
      // const response = await ctx.run(data);
      // socket.send(JSON.stringify(response));
    });
  } catch (err) {
    socket.send(JSON.stringify({ error: 'Unauthorized' }));
    socket.close();
  }
});

applyWSSHandler<AppRouter>({
  wss,
  router: appRouter,
  createContext,
});

// setInterval(() => {
//   console.log('Connected clients', wss.clients.size);
// }, 1000);
listen(2022);
