FROM node:18

COPY cli.js package.json package-lock.json config.default.json ./
COPY dist dist/

RUN npm ci --omit dev

VOLUME ["/orbitdb"]

CMD [ "node", "cli.js" ]