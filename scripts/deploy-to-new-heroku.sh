#!/bin/bash

# Script สำหรับ Deploy Backend ใหม่ขึ้น Heroku ในอีก Account
# ใช้: ./scripts/deploy-to-new-heroku.sh

set -e  # หยุดการทำงานถ้าเกิด error

echo "🚀 เริ่มการ Deploy Backend ใหม่ขึ้น Heroku..."

# ตรวจสอบ Heroku CLI
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI ไม่ได้ติดตั้ง กรุณาติดตั้งก่อน"
    echo "macOS: brew tap heroku/brew && brew install heroku"
    exit 1
fi

# ตรวจสอบว่า login แล้วหรือยัง
if ! heroku auth:whoami &> /dev/null; then
    echo "🔐 กรุณา login เข้า Heroku ก่อน"
    heroku login
fi

# รับ input จาก user
read -p "📝 ใส่ชื่อ Heroku App ใหม่: " APP_NAME
read -p "🌐 ใส่ Frontend Domain (เช่น https://example.com): " FRONTEND_DOMAIN
read -p "🔑 ใส่ JWT Secret ใหม่: " JWT_SECRET

echo "📋 ข้อมูลที่ใส่:"
echo "  App Name: $APP_NAME"
echo "  Frontend Domain: $FRONTEND_DOMAIN"
echo "  JWT Secret: $JWT_SECRET"
echo ""

read -p "✅ ข้อมูลถูกต้องหรือไม่? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "❌ ยกเลิกการ deploy"
    exit 1
fi

echo "🔄 สร้าง Heroku App ใหม่..."
heroku create $APP_NAME

echo "🗄️ สร้าง Database ใหม่..."
heroku addons:create cleardb:ignite --app $APP_NAME

echo "⏳ รอสักครู่ให้ Database สร้างเสร็จ..."
sleep 10

echo "🔧 ตั้งค่า Environment Variables..."
heroku config:set NODE_ENV=production --app $APP_NAME
heroku config:set JWT_SECRET="$JWT_SECRET" --app $APP_NAME
heroku config:set CORS_ORIGIN="$FRONTEND_DOMAIN" --app $APP_NAME

echo "📊 ดู Database URL..."
DB_URL=$(heroku config:get CLEARDB_DATABASE_URL --app $APP_NAME)
echo "Database URL: $DB_URL"

echo "🔍 แยก Database URL เป็น Environment Variables..."
# แยก URL: mysql://username:password@host:port/database
DB_HOST=$(echo $DB_URL | sed 's/.*@\([^:]*\).*/\1/')
DB_USER=$(echo $DB_URL | sed 's/mysql:\/\/\([^:]*\):.*/\1/')
DB_PASSWORD=$(echo $DB_URL | sed 's/mysql:\/\/[^:]*:\([^@]*\)@.*/\1/')
DB_NAME=$(echo $DB_URL | sed 's/.*\///')

echo "  DB_HOST: $DB_HOST"
echo "  DB_USER: $DB_USER"
echo "  DB_NAME: $DB_NAME"

heroku config:set DB_HOST="$DB_HOST" --app $APP_NAME
heroku config:set DB_USER="$DB_USER" --app $APP_NAME
heroku config:set DB_PASSWORD="$DB_PASSWORD" --app $APP_NAME
heroku config:set DB_NAME="$DB_NAME" --app $APP_NAME
heroku config:set DB_PORT=3306 --app $APP_NAME

echo "📝 เพิ่ม Heroku Remote..."
heroku git:remote -a $APP_NAME

echo "🚀 Deploy Code..."
git add .
git commit -m "Deploy to new Heroku account: $APP_NAME" || true
git push heroku main || git push heroku master

echo "⏳ รอการ Deploy เสร็จ..."
sleep 15

echo "🔍 ตรวจสอบ Deployment..."
if curl -s "https://$APP_NAME.herokuapp.com/api/health" | grep -q "OK"; then
    echo "✅ Deployment สำเร็จ!"
    echo "🌐 App URL: https://$APP_NAME.herokuapp.com"
    echo "📊 Health Check: https://$APP_NAME.herokuapp.com/api/health"
else
    echo "❌ Deployment ไม่สำเร็จ ตรวจสอบ logs:"
    heroku logs --tail --app $APP_NAME
    exit 1
fi

echo ""
echo "📋 ขั้นตอนต่อไป:"
echo "1. รัน Database Setup: heroku run npm run setup-db --app $APP_NAME"
echo "2. รัน Admin Users Setup: heroku run npm run setup-admin-users --app $APP_NAME"
echo "3. ทดสอบ API: curl https://$APP_NAME.herokuapp.com/api/health"
echo "4. ดู Logs: heroku logs --tail --app $APP_NAME"
echo "5. เปิด App: heroku open --app $APP_NAME"

echo ""
echo "🎉 การ Deploy เสร็จสิ้น!"
