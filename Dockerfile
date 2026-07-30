# Use a multi-stage build to combine Frontend and Backend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
# NEXT_PUBLIC_API_URL is not needed if we use relative paths /api
RUN npm run build

FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
RUN npx tsc

# Final Stage
FROM node:20-alpine
WORKDIR /app

# Install supervisor and nginx
RUN apk add --no-cache supervisor nginx

# Copy built artifacts
COPY --from=frontend-builder /app/frontend/.next/standalone ./frontend
COPY --from=frontend-builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY backend/package*.json ./backend/

# Copy Nginx config
COPY nginx.conf /etc/nginx/http.d/default.conf

# Create a supervisor config to run FE, BE and Nginx
RUN echo '[supervisord]\nnodaemon=true\nuser=root\n\n[program:backend]\ncommand=node backend/dist/server.js\ndirectory=/app\nstdout_logfile=/dev/stdout\nstdout_logfile_maxbytes=0\nstderr_logfile=/dev/stderr\nstderr_logfile_maxbytes=0\n\n[program:frontend]\ncommand=node frontend/server.js\ndirectory=/app/frontend\nstdout_logfile=/dev/stdout\nstdout_logfile_maxbytes=0\nstderr_logfile=/dev/stderr\nstderr_logfile_maxbytes=0\nenv=PORT=3000\n\n[program:nginx]\ncommand=nginx -g "daemon off;"\nstdout_logfile=/dev/stdout\nstdout_logfile_maxbytes=0\nstderr_logfile=/dev/stderr\nstderr_logfile_maxbytes=0' > /etc/supervisord.conf

# ProxyForge standard ports
EXPOSE 7860

# We use 7860 because Hugging Face expects the main web app there
ENV PORT=7860

# Run supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
