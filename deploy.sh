# Deploy production build

docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
docker network rm passless-bridge

npm install
npm run build

MDB_USR="admin"
MDB_PSW=$(openssl rand -hex 16)

docker network create passless-bridge

docker run -p 27017:27017 --name mongodb -d  \
    -e "MONGO_INITDB_ROOT_USERNAME=$(echo $MDB_USR)" \
    -e "MONGO_INITDB_ROOT_PASSWORD=$(echo $MDB_PSW)" mongo:latest

docker network connect passless-bridge mongodb

MDB_IP=$(docker inspect --format '{{ .NetworkSettings.IPAddress }}' mongodb)

docker build -t passless \
    --build-arg "MDB_IP=$(echo $MDB_IP)" \
    --build-arg "MDB_USR=$(echo $MDB_USR)" \
    --build-arg "MDB_PSW=$(echo $MDB_PSW)" .

docker run -d -p 0.0.0.0:3000:3000 --name passless-server passless

docker network connect passless-bridge passless-server
