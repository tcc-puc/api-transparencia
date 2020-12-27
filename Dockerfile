FROM node:alpine
WORKDIR /usr/app


COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3031

CMD npm start