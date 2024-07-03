FROM node:21

WORKDIR /usr/src/portal

COPY package*.json ./

RUN npm install

COPY . .
RUN chmod +x on_volume_init.sh 
RUN cat on_volume_init.sh 

EXPOSE 8102
ENTRYPOINT ["/usr/src/portal/on_volume_init.sh"]
CMD ["node", "index.mjs"]
