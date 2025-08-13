#!/bin/bash

# Docker Build Script with optimizations
# This script builds and optionally pushes Docker images

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
TAG=${TAG:-latest}
PUSH=${PUSH:-false}
REGISTRY=${REGISTRY:-docker.io}
NAMESPACE=${NAMESPACE:-emelmujiro}
BUILD_CACHE=${BUILD_CACHE:-true}
PLATFORM=${PLATFORM:-linux/amd64}

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to build image with cache
build_image() {
    local service=$1
    local dockerfile=$2
    local context=$3
    local image_name="${REGISTRY}/${NAMESPACE}/${service}:${TAG}"

    print_status "Building ${service} image..."

    # Build arguments
    BUILD_ARGS=""
    if [ "$BUILD_CACHE" = "true" ]; then
        BUILD_ARGS="$BUILD_ARGS --cache-from ${REGISTRY}/${NAMESPACE}/${service}:latest"
    fi

    # Multi-platform build if buildx is available
    if docker buildx version &> /dev/null; then
        print_status "Using Docker Buildx for multi-platform build"
        docker buildx build \
            --platform ${PLATFORM} \
            --tag ${image_name} \
            --tag ${REGISTRY}/${NAMESPACE}/${service}:latest \
            --file ${dockerfile} \
            ${BUILD_ARGS} \
            --load \
            ${context}
    else
        docker build \
            --tag ${image_name} \
            --tag ${REGISTRY}/${NAMESPACE}/${service}:latest \
            --file ${dockerfile} \
            ${BUILD_ARGS} \
            ${context}
    fi

    if [ $? -eq 0 ]; then
        print_status "${service} image built successfully: ${image_name}"

        # Push if requested
        if [ "$PUSH" = "true" ]; then
            print_status "Pushing ${service} image to registry..."
            docker push ${image_name}
            docker push ${REGISTRY}/${NAMESPACE}/${service}:latest
        fi
    else
        print_error "Failed to build ${service} image"
        exit 1
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --push)
            PUSH=true
            shift
            ;;
        --tag)
            TAG="$2"
            shift 2
            ;;
        --registry)
            REGISTRY="$2"
            shift 2
            ;;
        --namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        --no-cache)
            BUILD_CACHE=false
            shift
            ;;
        --platform)
            PLATFORM="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --push          Push images to registry after building"
            echo "  --tag TAG       Docker image tag (default: latest)"
            echo "  --registry REG  Docker registry (default: docker.io)"
            echo "  --namespace NS  Docker namespace (default: emelmujiro)"
            echo "  --no-cache      Build without cache"
            echo "  --platform PLAT Platform for build (default: linux/amd64)"
            echo "  --help          Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Check if Docker is running
if ! docker info &> /dev/null; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Enable BuildKit
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

print_status "Starting Docker build process..."
print_status "Configuration:"
print_status "  Tag: ${TAG}"
print_status "  Registry: ${REGISTRY}"
print_status "  Namespace: ${NAMESPACE}"
print_status "  Push: ${PUSH}"
print_status "  Cache: ${BUILD_CACHE}"
print_status "  Platform: ${PLATFORM}"

# Pull latest images for cache if enabled
if [ "$BUILD_CACHE" = "true" ]; then
    print_status "Pulling latest images for cache..."
    docker pull ${REGISTRY}/${NAMESPACE}/frontend:latest || true
    docker pull ${REGISTRY}/${NAMESPACE}/backend:latest || true
fi

# Build frontend
build_image "frontend" "./frontend/Dockerfile" "./frontend"

# Build backend
build_image "backend" "./backend/Dockerfile" "./backend"

print_status "Docker build process completed successfully!"

# Show built images
print_status "Built images:"
docker images | grep "${NAMESPACE}" | head -5

# Optional: Run docker-compose with the new images
if [ -f "docker-compose.yml" ]; then
    print_status "You can now run the application with:"
    echo "  TAG=${TAG} docker-compose up -d"
fi
