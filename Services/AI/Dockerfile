# ./AI/Dockerfile
FROM golang:1.23-alpine AS builder
ENV GOPROXY=https://goproxy.io,direct
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -v -o /app/scamsleuth-ai ./cmd/main.go
# Add a step to verify the binary was created
RUN ls -lh /app/scamsleuth-ai || (echo "Binary not found!" && exit 1)

# Runtime stage
FROM alpine:latest
WORKDIR /myapp

# Install Chromium and dependencies
RUN apk update && apk add --no-cache \
    chromium \
    chromium-chromedriver \
    ca-certificates \
    font-noto-emoji \
    freetype \
    freetype-dev \
    harfbuzz \
    ttf-freefont \
    wqy-zenhei \
    && rm -rf /var/cache/apk/*

# Create a non-root user for security
RUN addgroup -g 1000 -S chromium && \
    adduser -u 1000 -S chromium -G chromium

# Copy the binary with verification
COPY --from=builder /app/scamsleuth-ai /myapp/scamsleuth-ai
# copy the .env file 
COPY cmd/.env /myapp/.env

# Make binary executable
RUN chmod +x /myapp/scamsleuth-ai

# Change ownership to chromium user
RUN chown -R chromium:chromium /myapp

# Switch to non-root user
USER chromium

# Set environment variables for Chromium
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/bin/chromium-browser

EXPOSE 6996
CMD ["/myapp/scamsleuth-ai"]