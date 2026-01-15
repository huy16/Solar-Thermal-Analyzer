FROM ghcr.io/puppeteer/puppeteer:21.5.0

USER root

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies (ignoring scripts to avoid downloading chrome again)
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Create temp directory
RUN mkdir -p temp_processing && chown -R pptruser:pptruser temp_processing
RUN mkdir -p uploads && chown -R pptruser:pptruser uploads

# Configure permissions for folder output
RUN chmod -R 777 temp_processing uploads

# Switch to non-root user (puppeteer user)
USER pptruser

# Expose port
ENV PORT=3000
EXPOSE 3000

# Start command
CMD ["node", "src/server.js"]
