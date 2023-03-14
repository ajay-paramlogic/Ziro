import { parse } from 'date-fns';
import format from 'date-fns/format';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';

export function getEncodedURL(url: string) {
  return window.btoa(url);
}

type NewsItem = {
  title: string;
  link: string;
  pubDate: Date;
  thumbnail: string;
  name: string;
};

const getXMLDoc = (data: string) => {
  const parser = new DOMParser();
  return parser.parseFromString(
    data.replaceAll('<![CDATA[', '').replaceAll(']]>', ''),
    'text/xml',
  );
};

const parseHTML = (
  data: string,
  dateFormat: string,
  mediaTag?: string | undefined,
) => {
  const xmlDoc = getXMLDoc(data);
  const items = xmlDoc.getElementsByTagName('item');
  let newsItems: Omit<NewsItem, 'name'>[] = [];
  for (const item of items) {
    // console.log(item, mediaTag);
    const title = item.getElementsByTagName('title')[0]?.textContent as string;
    if (!title) continue;

    const link = item.getElementsByTagName('link')[0]?.textContent as string;
    const pubDateRaw = item.getElementsByTagName('pubDate')[0]
      ?.textContent as string;
    const pubDate = parse(pubDateRaw, dateFormat, new Date());
    const thumbnail = mediaTag
      ? (item.getElementsByTagName(mediaTag)[0]?.getAttribute('url') as string)
      : '';
    newsItems = newsItems.concat({
      title,
      link,
      pubDate,
      thumbnail,
    });
  }
  return newsItems;
};

const SCRAPER_URL = 'https://smemo-remix-pwa.fly.dev/api/v1/get-page?url=';
const fetcher = (url: string) =>
  fetch(SCRAPER_URL + window.btoa(url)).then((res) => res.text());

const parser = async (
  source: {
    url: string;
    mediaTag?: string | undefined;
    dateFormat: string;
    name: string;
  },
  setNewsItems: React.Dispatch<React.SetStateAction<NewsItem[]>>,
) => {
  const data = await fetcher(source.url);
  const items = parseHTML(data, source.dateFormat, source.mediaTag);
  setNewsItems((prev) =>
    prev
      .filter((item) => item.name !== source.name)
      .concat(items.map((item) => ({ ...item, name: source.name }))),
  );
  // return async () => {
  //   const data = await fetcher(source.url);
  //   const items = parseHTML(data, source.dateFormat, source.mediaTag);
  //   setNewsItems((prev) =>
  //     prev.concat(items.map((item) => ({ ...item, name: source.name }))),
  //   );
  // };
};

const shorten = (text: string, length: number) => {
  return text.length > length ? text.substring(0, length) + '...' : text;
};

function SingleNewsItem({
  single,
  setSingle,
}: {
  single: NewsItem;
  setSingle: React.Dispatch<React.SetStateAction<NewsItem | null>>;
}) {
  const [html, set] = useState('');

  useEffect(() => {
    fetcher(single.link).then((data) => {
      const domParser = new DOMParser();
      const doc = domParser.parseFromString(data, 'text/html');
      if (single.name === 'The Hindu') {
        const content = doc.querySelector(
          '.container.article-section ',
        )?.innerHTML;
        set(content || '');
      }
    });
  }, [single.link, single.name]);

  return (
    <div>
      <Header isSingle={Boolean(single)} setSingle={setSingle} />
      <div className="p-4">
        {html && <div dangerouslySetInnerHTML={{ __html: html }}></div>}
      </div>
    </div>
  );
}

function Header({
  isSingle,
  setSingle,
}: {
  isSingle: boolean;
  setSingle: React.Dispatch<React.SetStateAction<NewsItem | null>>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex w-full flex-row items-center py-4 px-4 shadow-sm"
    >
      {isSingle && (
        <button onClick={() => setSingle(null)}>
          <img
            className="h-12 p-2"
            src="arrow-back-outline.svg"
            alt="back-btn"
          />
        </button>
      )}
      <img src="circle-icon.png" className="w-12" />
    </motion.div>
  );
}

function isValidDate(d: any) {
  return !isNaN(d) && d instanceof Date;
}

export default function News() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [single, setSingle] = useState<NewsItem | null>(null);

  const fetchSomeData = useCallback(async () => {
    const sources = [
      {
        url: 'https://marathi.abplive.com/entertainment/theatre/feed',
        mediaTag: 'media:thumbnail',
        dateFormat: 'EEE, dd MMM yyyy HH:mm:ss X',
        name: 'ABP Live',
      },
      {
        url: 'https://www.thehindu.com/opinion/editorial/feeder/default.rss',
        mediaTag: 'media:content',
        dateFormat: 'EEE, dd MMM yyyy HH:mm:ss X',
        name: 'The Hindu',
      },
      {
        url: 'https://www.thehindu.com/opinion/lead/feeder/default.rss',
        mediaTag: 'media:content',
        dateFormat: 'EEE, dd MMM yyyy HH:mm:ss X',
        name: 'The Hindu',
      },
      {
        url: 'https://www.thehindu.com/business/Economy/feeder/default.rss',
        mediaTag: 'media:content',
        dateFormat: 'EEE, dd MMM yyyy HH:mm:ss X',
        name: 'The Hindu',
      },
      {
        url: 'https://www.thehindu.com/entertainment/theatre/feeder/default.rss',
        mediaTag: 'media:content',
        dateFormat: 'EEE, dd MMM yyyy HH:mm:ss X',
        name: 'The Hindu',
      },
      // {
      //   url: 'https://www.thehindu.com/news/national/feeder/default.rss',
      //   mediaTag: 'media:content',
      //   dateFormat: 'EEE, dd MMM yyyy HH:mm:ss X',
      //   name: 'The Hindu',
      // },
    ];

    await Promise.all(sources.map((source) => parser(source, setNewsItems)));
  }, []);

  useEffect(() => {
    fetchSomeData();
  }, [fetchSomeData]);

  newsItems.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  if (single) {
    return <SingleNewsItem single={single} setSingle={setSingle} />;
  }

  return (
    <div className="h-screen w-screen">
      <Header isSingle={Boolean(single)} setSingle={setSingle} />
      <div className="">
        {newsItems.map((item) => {
          return (
            <motion.div
              initial={{ opacity: 0, translateY: -25 }}
              animate={{ opacity: 1, translateY: 0 }}
              // transition={{ duration: 0.5 }}
              key={item.link}
              // href={item.link}
              className="block"
              onClick={() => setSingle(item)}
            >
              <div className="flex flex-row items-center px-4 py-4">
                <div className="w-3/4">
                  <div className="pb-1 text-xs">{item.name}</div>
                  <div className="flex-wrap break-words pb-2 pr-1 text-base font-semibold">
                    {shorten(item.title, 89)}
                  </div>
                  <div className="text-sm" key={item.link}>
                    {isValidDate(item.pubDate) &&
                      format(item.pubDate, 'dd MMM yyyy')}
                  </div>
                </div>
                <div className="h-full w-1/4 flex-1">
                  <img
                    src={item.thumbnail}
                    className="h-full w-full rounded-sm shadow-sm"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
