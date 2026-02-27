# Build stage
FROM node:24-alpine AS builder

# Update packages for security and install minimal build tools
RUN apk update && apk upgrade && \
    apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
COPY package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
ENV CI=false
RUN npm run build

# Production stage
FROM nginx:alpine

# Update packages for security
RUN apk update && apk upgrade

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files from builder stage (Vite outputs to build/)
COPY --from=builder /app/build /usr/share/nginx/html

# Set proper permissions (nginx user already exists in nginx:alpine image)
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
