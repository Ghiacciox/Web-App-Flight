# Usa l'immagine ufficiale leggera di Node.js
FROM node:19-buster-slim

LABEL maintainer ="Andrea Giazzon"

# Espone la porta 3000 (quella di Express)
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