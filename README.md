# Welcome to Remix + Vite!

📖 See the [Remix docs](https://remix.run/docs) and the [Remix Vite docs](https://remix.run/docs/en/main/guides/vite) for details on supported features.

## Development

Run the Vite dev server:

```shellscript
npm run dev
```

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

-- `build/server`
- `build/client`

### Docker

To build and run your app in Docker:

```bash
docker build -t portfolio .
docker run -d --name portfolio -p 3000:3000 portfolio
```

Then configure your reverse proxy or DNS (e.g. Cloudflare) to point to your server's IP.
