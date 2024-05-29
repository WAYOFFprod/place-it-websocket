## Run locally 
```bash
npm run dev
```


## Build Image
```bash
docker build . -f docker/Dockerfile.prod -t place-it-websocket
```

## Run image
```bash
docker run -p 8000:3000 --name place-it-websocket place-it-websocket
```
