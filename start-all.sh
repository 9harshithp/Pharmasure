#!/usr/bin/env bash

# Pharmasure All-in-One Startup Script

echo "🚀 [1/3] Starting MySQL Docker container..."
docker start pharmasure-mysql || docker run -d --name pharmasure-mysql -e MYSQL_DATABASE=blister -e MYSQL_USER=pharmasure -e MYSQL_PASSWORD=pharmasure -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 mysql:8

echo "⏳ Waiting for MySQL to be ready..."
sleep 3

echo "☕ [2/3] Starting Spring Boot Backend (Port 8080)..."
if [ -z "$JAVA_HOME" ] && [ -d "/home/gs/.vscode/extensions/redhat.java-1.56.0-linux-x64/jre/21.0.12.1-linux-x86_64" ]; then
  export JAVA_HOME=/home/gs/.vscode/extensions/redhat.java-1.56.0-linux-x64/jre/21.0.12.1-linux-x86_64
fi
[ -n "$JAVA_HOME" ] && export PATH=$JAVA_HOME/bin:$PATH
export DB_USERNAME=pharmasure
export DB_PASSWORD=pharmasure
export MAIL_USERNAME=pharmasure@example.com
export MAIL_PASSWORD=pharmasure_dummy
export GEMINI_API_KEY=dummy_key

(cd backend && ./mvnw spring-boot:run) &
BACKEND_PID=$!
echo "Backend running with PID $BACKEND_PID"

echo "🌐 [3/3] Starting React Frontend (Port 3000)..."
(cd frontend && BROWSER=none npm start) &
FRONTEND_PID=$!
echo "Frontend running with PID $FRONTEND_PID"

echo "=================================================="
echo "✅ Pharmasure is starting up!"
echo "➡️  Frontend: http://localhost:3000"
echo "➡️  Backend:  http://localhost:8080"
echo "=================================================="
wait
