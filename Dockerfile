FROM node:24-alpine

WORKDIR /app

# Install build tools if native dependencies are needed
RUN apk add --no-cache python3 make g++

# Copy package configuration
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build frontend and backend
RUN npm run build

# Expose server port
EXPOSE 3000

# Start production server
CMD ["npm", "start"]
