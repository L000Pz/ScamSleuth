# ./AI/Dockerfile
FROM golang:1.23-alpine AS builder
#ENV GOPROXY=https://goproxy.io,direct
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

# Copy the binary with verification
COPY --from=builder /app/scamsleuth-ai /myapp/scamsleuth-ai

# copy the .env file 
COPY cmd/.env /myapp/.env


# # Add debugging tools and dependencies
# RUN apk --no-cache add \
#     ca-certificates \
#     file \
#     && rm -rf /var/cache/apk/* \
#     && chmod +x /app/scamsleuth-ai

# Verify the binary in the final image
# RUN ls -lh /app/scamsleuth-ai && file /app/scamsleuth-ai

EXPOSE 6996
CMD ["/myapp/scamsleuth-ai"]
