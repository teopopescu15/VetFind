#!/bin/bash
# Container Health Check Script for Haufe Hackathon Application
# This script checks the status of all required Docker containers

echo "=== Haufe Hackathon Application - Container Health Check ==="
echo ""

# Define expected containers
FRONTEND="haufe-frontend"
BACKEND="haufe-backend"
DATABASE="haufe-postgres"

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a container is running
check_container() {
    local container_name=$1
    local expected_port=$2

    echo "Checking $container_name..."

    # Check if container exists and is running
    if sudo docker ps --format "{{.Names}}" | grep -q "^${container_name}$"; then
        echo -e "${GREEN}✓${NC} $container_name is running"

        # Get container status
        status=$(sudo docker inspect --format='{{.State.Status}}' $container_name)
        echo "  Status: $status"

        # Check port binding
        if [ -n "$expected_port" ]; then
            ports=$(sudo docker port $container_name 2>/dev/null)
            if [ -n "$ports" ]; then
                echo "  Ports: $ports"
            else
                echo -e "  ${YELLOW}⚠${NC} No port bindings found"
            fi
        fi

        # Check health status if available
        health=$(sudo docker inspect --format='{{.State.Health.Status}}' $container_name 2>/dev/null)
        if [ "$health" != "<no value>" ] && [ -n "$health" ]; then
            if [ "$health" == "healthy" ]; then
                echo -e "  Health: ${GREEN}$health${NC}"
            else
                echo -e "  Health: ${YELLOW}$health${NC}"
            fi
        fi

        return 0
    else
        echo -e "${RED}✗${NC} $container_name is NOT running"

        # Check if container exists but is stopped
        if sudo docker ps -a --format "{{.Names}}" | grep -q "^${container_name}$"; then
            echo -e "  ${YELLOW}Container exists but is stopped${NC}"
            status=$(sudo docker inspect --format='{{.State.Status}}' $container_name)
            echo "  Status: $status"
        else
            echo -e "  ${RED}Container does not exist${NC}"
        fi

        return 1
    fi

    echo ""
}

# Check all containers
echo "=== Container Status ==="
echo ""

frontend_status=0
backend_status=0
database_status=0

check_container $FRONTEND "5179" || frontend_status=1
check_container $BACKEND "8000" || backend_status=1
check_container $DATABASE "5432" || database_status=1

# Summary
echo "=== Summary ==="
total_failures=$((frontend_status + backend_status + database_status))

if [ $total_failures -eq 0 ]; then
    echo -e "${GREEN}All containers are running!${NC}"
    exit 0
else
    echo -e "${RED}$total_failures container(s) have issues${NC}"
    echo ""
    echo "To start containers, run: sudo docker compose up -d"
    echo "To view logs, run: sudo docker compose logs -f"
    exit 1
fi
