# Deploy production build
# Must be run as sudo

/etc/init.d/nginx stop
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
docker network rm passless-bridge

cp passless.config /etc/nginx/sites-available/passless.config

npm install
npm run build

MDB_USR="admin"
MDB_PSW=$(openssl rand -hex 16)

docker network create passless-bridge

docker run --name mongodb -d  \
    -e "MONGO_INITDB_ROOT_USERNAME=$(echo $MDB_USR)" \
    -e "MONGO_INITDB_ROOT_PASSWORD=$(echo $MDB_PSW)" mongo:latest

docker network connect passless-bridge mongodb

MDB_IP=$(docker inspect --format '{{ .NetworkSettings.IPAddress }}' mongodb)

docker build -t passless \
    --build-arg "MDB_IP=$(echo $MDB_IP)" \
    --build-arg "MDB_USR=$(echo $MDB_USR)" \
    --build-arg "MDB_PSW=$(echo $MDB_PSW)" .

docker run -d -p 127.0.0.1:3000:3000 --name passless-server passless

docker network connect passless-bridge passless-server

/etc/init.d/nginx start
