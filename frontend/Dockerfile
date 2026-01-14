FROM node:20-slim

LABEL maintainer ="Andrea Giazzon"

# Espone la porta di Angular
EXPOSE 4200

WORKDIR /app

# Copia i file di configurazione delle dipendenze
COPY package*.json ./

# Installa Angular CLI globalmente e le dipendenze del progetto
RUN npm install -g @angular/cli
RUN npm install

# Copia tutto il resto del codice
COPY . .

CMD ["ng", "serve", "--host", "0.0.0.0", "--poll", "2000"]
