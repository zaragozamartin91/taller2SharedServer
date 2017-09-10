# specify the node base image with your desired version node:<version>
FROM node:6.11

WORKDIR /usr/src/app

COPY . .

RUN npm install
RUN npm run build

# replace this with your application's default port
EXPOSE 5000

CMD ["npm","start"]
