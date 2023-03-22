import { AppRouter } from './server/main';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWSClient, httpBatchLink, splitLink, wsLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { nanoid } from 'nanoid';
import { useEffect } from 'react';

export const trpc = createTRPCReact<AppRouter>();

const queryClient = new QueryClient();

let wsUniqueId = localStorage.getItem('wsUniqueId');
if (!wsUniqueId) {
  wsUniqueId = nanoid();
  localStorage.setItem('wsUniqueId', wsUniqueId);
}

const trpcClient = trpc.createClient({
  links: [
    splitLink({
      condition(op) {
        return op.type === 'subscription';
      },
      true: wsLink({
        client: createWSClient({ url: `ws://localhost:3005/${wsUniqueId}` }),
      }),
      false: httpBatchLink({
        url: 'http://localhost:3005',
        headers() {
          return {
            authorization: `Bearer dsococosoeoeosos`,
          };
        },
      }),
    }),
  ],
});

function DataFetchComponent() {
  const utils = trpc.useContext();
  const hello = trpc.greeting.hello.useQuery({ name: 'Ajay More' });
  const mutation = trpc.post.createPost.useMutation({});
  trpc.post.randomNumber.useSubscription(undefined, {
    onData(post) {
      console.log('subscription data:', post);
    },
    onError(err) {
      console.error('Subscription error:', err);
      // we might have missed a message - invalidate cache
      utils.greeting.hello.invalidate();
    },
  });
  console.log(hello.data);

  const addUser = () => {
    mutation.mutate({
      name: 'Ajay More',
      email: 'abc@1222232.com',
      password: 'dfasfas',
    });
  };

  useEffect(() => {}, []);

  return (
    <div>
      {JSON.stringify(hello, null, 2)}
      <button onClick={addUser}>Add User</button>
    </div>
  );
}

export default function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <DataFetchComponent />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
