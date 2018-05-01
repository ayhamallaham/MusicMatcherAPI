FROM node:9.10-alpine

WORKDIR /srv/api
COPY . .
RUN npm install

EXPOSE 8000

CMD ["npm", "run", "dev"]
