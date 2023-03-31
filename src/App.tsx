import { AppRouter } from './server/main';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWSClient, httpBatchLink, splitLink, wsLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { nanoid } from 'nanoid';
import { useEffect, useState } from 'react';

// import { registerSW } from 'virtual:pwa-register';

// const updateSW = registerSW({
//   onNeedRefresh() {
//     const result = confirm('Do you want to update?');

//     if (result) {
//       updateSW();
//     }
//   },
//   onOfflineReady() {},
// });

export const trpc = createTRPCReact<AppRouter>();

const queryClient = new QueryClient();

let wsUniqueId = localStorage.getItem('wsUniqueId');
if (!wsUniqueId) {
  wsUniqueId = nanoid();
  localStorage.setItem('wsUniqueId', wsUniqueId);
}

const isProd = import.meta.env.PROD;
const httpUrl = isProd ? 'https://ziro.lawst.me' : 'http://localhost:2022';
const wssUrl = isProd ? 'wss://ziro.lawst.me' : 'ws://localhost:2022';

const trpcClient = trpc.createClient({
  links: [
    splitLink({
      condition(op) {
        return op.type === 'subscription';
      },
      true: wsLink({
        client: createWSClient({ url: `${wssUrl}/${wsUniqueId}` }),
      }),
      false: httpBatchLink({
        url: httpUrl,
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
      // console.log('subscription data:', post);
    },
    onError(err) {
      console.error('Subscription error:', err);
      // we might have missed a message - invalidate cache
      utils.greeting.hello.invalidate();
    },
  });
  console.log(import.meta.env.PROD);

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

const PUBLIC_KEY =
  'BICjG2K7ZNYsVMPqXHLmtBLyF51jNY-5ECNqsyV3-FO-7p3SNSCscCiLZ03uxchdOMS2r7RQi2x_mAVSKSPGeiU';

const base64ToUint8Array = (base64: string) => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(b64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

function NotificationTest() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [registration, setRegistration] = useState(null);
  const mutation = trpc.post.pushNotification.useMutation({});

  console.log({ isSubscribed, subscription, registration });
  console.log(JSON.stringify(subscription));

  const getPermission = async (event) => {
    event.preventDefault();
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(PUBLIC_KEY),
    });
    // TODO: you should call your API to save subscription data on server in order to send web push notification from server
    setSubscription(sub);
    setIsSubscribed(true);
    console.log('web push subscribed!');
    console.log(sub);
  };

  const unsubscribeButtonOnClick = async (event) => {
    event.preventDefault();
    await subscription.unsubscribe();
    // TODO: you should call your API to delete or invalidate subscription data on server
    setSubscription(null);
    setIsSubscribed(false);
    console.log('web push unsubscribed!');
  };

  const sendNotificationButtonOnClick = async (event) => {
    event.preventDefault();
    if (subscription == null) {
      console.error('web push not subscribed');
      return;
    }

    mutation.mutate({ sub: subscription });
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      console.log('useEffect...');
      // run only in browser
      navigator.serviceWorker.ready.then((reg) => {
        console.log('ready...');
        reg.pushManager.getSubscription().then((sub) => {
          if (
            sub &&
            !(
              sub.expirationTime &&
              Date.now() > sub.expirationTime - 5 * 60 * 1000
            )
          ) {
            setSubscription(sub);
            setIsSubscribed(true);
          }
        });
        setRegistration(reg);
      });
    }
  }, []);

  return (
    <div className="m-auto max-w-md bg-orange-100">
      <button onClick={getPermission}>Get Permission...</button>
      <br />
      <br />
      <br />
      <button onClick={sendNotificationButtonOnClick}>Push Notification</button>
    </div>
  );
}

export default function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {/* <h1>Hello there from prompt based update...</h1> */}
        {/* <DataFetchComponent /> */}
        <NotificationTest />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
