#immagine ufficiale leggera di Node.js
# 20 è stabile e supportata a lungo termine 

FROM node:20-slim 

LABEL maintainer ="Andrea Giazzon"

# Espone la porta 3000 per il server
EXPOSE 3000

# Crea la cartella di lavoro dentro il container
WORKDIR /app

# Copia i file delle dipendenze
COPY package*.json ./

# Installa le librerie
RUN npm install

# Copia tutto il codice sorgente
COPY . .

# Avvia il server
CMD ["npm", "start"]