#Select OS environment
FROM node:22-alpine

#choosing a working directory
WORKDIR /app

#copy package.json to install npm packages
COPY package*.json ./

#Running shell command
RUN npm install

#copying the remaining part
COPY . .
#Port exposure
EXPOSE 5050

#Entry point
CMD ["node", "index.js"]

#docker build -t backend-app
#dicker run -d -p 5006:5050 --name backend backend-app
#docker ps -a
#docker stop CONTAINER_ID
#docker rm CONTAINER_ID
