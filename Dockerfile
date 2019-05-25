FROM node:8.10.0-alpine
COPY package.json /src/package.json
WORKDIR /src
RUN npm install
COPY src/app.js src/pub.js src/midi.js /src/
CMD ["node", "/src/app.js"]
