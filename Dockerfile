FROM node:current-bookworm

ARG MDB_IP
ARG MDB_USR
ARG MDB_PSW

WORKDIR /app
COPY public/ public/
COPY src/ src/
COPY .next/ .next/
COPY node_modules/ node_modules/
COPY *.js *.ts *.json .

ENV NODE_ENV production
ENV MDB_IP $MDB_IP
ENV MDB_USR $MDB_USR
ENV MDB_PSW $MDB_PSW

EXPOSE 3000

CMD ["npm", "run", "start", "--", "--port", "3000"]
