```
npx pwa-asset-generator icon-ziro.png --background "rgb(117 41 41)" --xhtml public/pwa-assets
```

- Static header
- Status bar color management | https://dev.to/akshaykumar6/progressive-web-apps-configure-status-bar-16fa
- SafeArea
- Update popup
- Push notifications (Later)
- PouchDB | Server Sync
- Camera, Geolocation, Filesystem
- Handling Dark Mode in PWA | https://tailwindcss.com/docs/dark-mode
- UI Building with Tailwind | https://daisyui.com/components/button/


### Links
https://huemint.com/website-magazine/
https://react-spectrum.adobe.com/react-spectrum/getting-started.html
https://pouchdb.com/download.html
https://marathi.abplive.com/entertainment/theatre/feed
https://marathi.abplive.com/news/satara/feed
https://marathi.abplive.com/news/pune/feed
https://marathi.abplive.com/latest-news/feed
https://marathi.abplive.com/rss
https://lokmat.news18.com/rss/editorial-opinion.xml
https://www.livelaw.in/top-stories
https://www.thehindu.com/rssfeeds/
https://indianexpress.com/syndication/
https://www.loksatta.com/loksatta-rss/
https://marathi.hindustantimes.com/rss/maharashtra

https://www.loksatta.com/vishesh/
https://www.loksatta.com/section/sampadkiya/
https://www.loksatta.com/section/sampadkiya/agralekh/
https://www.loksatta.com/section/sampadkiya/vyakhtivedh/


```
let nodes = document.querySelectorAll('.wp-block-newspack-blocks-ie-stories article')
nodes.forEach(node => {
    const img = node.querySelector('figure img').getAttribute('src')
    const link = node.querySelector('figure a').getAttribute('href')
    const title = node.querySelector('.entry-title').textContent
    const pubDate = node.querySelector('.entry-meta time')?.getAttribute('datetime')
    console.log({img,link,title,pubDate})
})
```


TODOS
- [ ] Upgrade the template | https://github.com/cpojer/vite-ts-react-tailwind-template
- [ ] Add JWT auth
- [ ] Dockerize and deploy with CI CD
- [ ] Chat Client
- [ ] Add PWA



auth
- login
- logout
- refresh token

Chat subscriptions
- onCommentAdded


```
eval `ssh-agent`
ssh-add ~/.ssh/ajay_rsa
cd /home/ajay/code/Ziro
git pull

touch prod.db
docker build -t trpc-ziro:1 .
docker run -p 3005:2022 --name trpc-server \
    -e DATABASE_URL="file:./dev.db" \
    -v $PWD/dev-prod.db:/app/prisma/dev.db \
    trpc-ziro
docker exec -it trpc-server bash

docker run -p 3005:2022 -d --name trpc-server \
    --restart always \
    --net reverse-proxy \
    -e DATABASE_URL="file:./dev.db" \
    -e "TZ=Asia/Dubai" \
    -e 'LETSENCRYPT_EMAIL=mail@ajaymore.in' \
    -e 'LETSENCRYPT_HOST=ziro.lawst.me' \
    -e 'VIRTUAL_HOST=ziro.lawst.me' \
    -v $PWD/prod.db:/app/prisma/dev.db \
    trpc-ziro:1
```