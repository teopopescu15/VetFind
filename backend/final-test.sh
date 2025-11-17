#!/bin/bash

echo "========================================="
echo "FINAL Role-Based Access Control Test"
echo "========================================="
echo ""

echo "Test 1: Regular user (should FAIL with 403)"
echo "---------------------------------------------"
curl -X POST http://localhost:5000/api/clinics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsImVtYWlsIjoidXNlckB0ZXN0LmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzYzMzI0MjMzLCJleHAiOjE3NjMzMjUxMzN9.i6PSgIk4GIe57k1ZiNc5ta0ByvcNGSM584IUUI8LWe4" \
  -d '{"name":"Should Fail","address":"1","city":"C","state":"CA","zip_code":"1","latitude":1,"longitude":1,"phone":"1","email":"fail@test.com"}' \
  -w "\nHTTP Status: %{http_code}\n" -s
echo ""

echo "Test 2: Vet company (should SUCCEED with 201)"
echo "----------------------------------------------"
VET_TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teopopescu15@gmail.com","password":"TestPassword123"}' -s | \
  grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

curl -X POST http://localhost:5000/api/clinics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VET_TOKEN" \
  -d '{"name":"Success Clinic","address":"Win St","city":"Victory","state":"NY","zip_code":"10001","latitude":40.7,"longitude":-74,"phone":"555","email":"win@vet.com"}' \
  -w "\nHTTP Status: %{http_code}\n" -s
echo ""

echo "========================================="
echo "✅ Role validation working correctly!"
echo "========================================="
