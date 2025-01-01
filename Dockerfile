# Stage 1: Build the Next.js application
FROM node:18-alpine AS builder

# Set working directory for the main project
WORKDIR /app

# Copy only the main project's package.json and package-lock.json
COPY package.json package-lock.json ./

# Install main project's dependencies
RUN npm install

# Copy the main project source code
COPY . .

# Set working directory for the `tbtc` React project
WORKDIR /app/tbtc

# Copy only the `tbtc` project's package.json and package-lock.json
COPY ./tbtc/package.json ./tbtc/package-lock.json ./

# Install `tbtc` project's dependencies
RUN npm install

# Build the `tbtc` React project
RUN npm run build

# Return to the main project directory
WORKDIR /app

# Build the Next.js application
RUN npm run build

# Stage 2: Create a lightweight image to serve the built application
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/package.json /app/package-lock.json /app/
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public
COPY --from=builder /app/tbtc /app/tbtc

# Install only production dependencies for the main project
RUN npm install --legacy-peer-deps --production

# Expose port 3000 for the Next.js application
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
