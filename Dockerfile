FROM node:latest
WORKDIR /tooling-suite
COPY package.json ./
RUN npm install
RUN npm audit --audit-level=moderate
COPY . .

WORKDIR /tooling-suite
CMD ["./scripts/publish.sh"]