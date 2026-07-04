FROM node:24-alpine

WORKDIR /app

# Run in production mode
ENV NODE_ENV=production

# Install build tools if native dependencies are needed
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]