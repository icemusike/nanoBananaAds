# Python + FastAPI Implementation

Production-ready JVZoo integration using FastAPI with async processing and Pydantic validation.

## Installation

```bash
pip install fastapi uvicorn python-dotenv pydantic email-validator sqlalchemy asyncpg python-multipart aiosmtplib
```

## Project Structure

```
jvzoo-integration/
├── main.py
├── models.py
├── database.py
├── config.py
├── ipn_handler.py
├── license_manager.py
├── email_service.py
└── .env
```

## Configuration

```python
# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # JVZoo
    JVZOO_SECRET_KEY: str
    LICENSE_SECRET: str
    
    # App
    APP_URL: str = "https://yourdomain.com"
    
    # Email (SMTP or API)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str
    SMTP_PASSWORD: str
    FROM_EMAIL: str
    
    class Config:
        env_file = ".env"

settings = Settings()
```

```bash
# .env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/jvzoo_db
JVZOO_SECRET_KEY=your_secret_key
LICENSE_SECRET=your_license_secret
APP_URL=https://yourdomain.com
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=noreply@yourdomain.com
```

## Database Models

```python
# database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

async def get_session():
    async with async_session() as session:
        yield session

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
```

```python
# models.py
from sqlalchemy import Column, String, DateTime, Float, Boolean, Integer, ForeignKey, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255))
    created_via = Column(String(50))
    jvzoo_transaction = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    licenses = relationship("License", back_populates="user")

class License(Base):
    __tablename__ = "licenses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    product_id = Column(String(100), nullable=False)
    license_key = Column(String(50), unique=True, nullable=False, index=True)
    jvzoo_transaction = Column(String(255), unique=True, nullable=False, index=True)
    jvzoo_receipt = Column(String(255))
    status = Column(String(50), nullable=False, index=True)
    purchase_date = Column(DateTime, nullable=False)
    expiry_date = Column(DateTime)
    last_validated = Column(DateTime)
    transaction_type = Column(String(50))
    refunded_at = Column(DateTime)
    chargeback_at = Column(DateTime)
    cancelled_at = Column(DateTime)
    payment_count = Column(Integer, default=1)
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="licenses")

class Transaction(Base):
    __tablename__ = "jvzoo_transactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    jvzoo_transaction_id = Column(String(255), unique=True, nullable=False, index=True)
    transaction_type = Column(String(50), nullable=False)
    product_id = Column(String(100), nullable=False)
    customer_email = Column(String(255), nullable=False, index=True)
    amount = Column(Float)
    raw_ipn_data = Column(JSON)
    processed = Column(Boolean, default=False, index=True)
    processed_at = Column(DateTime)
    error = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
```

## Pydantic Schemas

```python
# schemas.py
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List, Dict

class IPNData(BaseModel):
    ctransaction: str
    ctransaction_type: str
    ccustemail: EmailStr
    ccustname: str
    cproditem: str
    ctransamount: str
    ctransreceipt: Optional[str] = None
    ctransaffiliate: Optional[str] = None
    ctransvendor: Optional[str] = None
    cverify: str

class LicenseValidationRequest(BaseModel):
    license_key: str
    email: EmailStr

class LicenseValidationResponse(BaseModel):
    valid: bool
    error: Optional[str] = None
    license: Optional[Dict] = None

class ProductConfig(BaseModel):
    name: str
    features: List[str]
    internal_id: str
```

## License Manager

```python
# license_manager.py
import hashlib
from datetime import datetime
from config import settings

PRODUCT_MAPPING = {
    "123456": {
        "name": "AI Ranker Pro - Basic",
        "features": ["keyword_tracking", "competitor_analysis"],
        "internal_id": "ai-ranker-basic"
    },
    "123457": {
        "name": "AI Ranker Pro - Premium",
        "features": ["keyword_tracking", "competitor_analysis", "ai_insights", "api_access"],
        "internal_id": "ai-ranker-premium"
    }
}

def verify_ipn(ipn_data: dict, secret_key: str) -> bool:
    """Verify IPN authenticity using SHA-1 hash"""
    try:
        transaction = ipn_data.get('ctransaction', '')
        amount = ipn_data.get('ctransamount', '')
        product_id = ipn_data.get('cproditem', '')
        verify_hash = ipn_data.get('cverify', '')
        
        if not all([transaction, amount, product_id, verify_hash]):
            return False
        
        # Calculate expected hash
        data = f"{secret_key}|{transaction}|{amount}|{product_id}"
        calculated_hash = hashlib.sha1(data.encode()).hexdigest().upper()
        
        return calculated_hash == verify_hash.upper()
    except Exception as e:
        print(f"Verification error: {e}")
        return False

def generate_license_key(user_id: str, product_id: str, transaction_id: str) -> str:
    """Generate unique license key"""
    timestamp = str(int(datetime.utcnow().timestamp()))
    data = f"{user_id}:{product_id}:{transaction_id}:{timestamp}"
    
    hash_data = data + settings.LICENSE_SECRET
    hash_obj = hashlib.sha256(hash_data.encode())
    hex_hash = hash_obj.hexdigest()[:16].upper()
    
    # Format as XXXX-XXXX-XXXX-XXXX
    return '-'.join([hex_hash[i:i+4] for i in range(0, 16, 4)])

def get_product_config(product_id: str) -> dict:
    """Get product configuration"""
    return PRODUCT_MAPPING.get(product_id)

def is_test_transaction(ipn_data: dict) -> bool:
    """Check if transaction is a test"""
    transaction = ipn_data.get('ctransaction', '').lower()
    email = ipn_data.get('ccustemail', '').lower()
    return 'test' in transaction or 'test' in email
```

## Email Service

```python
# email_service.py
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings

async def send_email(to_email: str, subject: str, html_content: str):
    """Send email using SMTP"""
    message = MIMEMultipart('alternative')
    message['From'] = settings.FROM_EMAIL
    message['To'] = to_email
    message['Subject'] = subject
    
    html_part = MIMEText(html_content, 'html')
    message.attach(html_part)
    
    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=True
        )
        return True
    except Exception as e:
        print(f"Email send error: {e}")
        return False

async def send_welcome_email(user: dict, license: dict, product_info: dict):
    """Send welcome email with license details"""
    html_content = f"""
    <html>
    <body>
        <h1>Welcome {user['name']}!</h1>
        <p>Thank you for your purchase of {product_info['name']}.</p>
        
        <h2>Your License Details</h2>
        <p><strong>License Key:</strong> {license['license_key']}</p>
        <p><strong>Product:</strong> {product_info['name']}</p>
        
        <h2>Get Started</h2>
        <p>Login to your account: <a href="{settings.APP_URL}/login">{settings.APP_URL}/login</a></p>
        
        <p>If you have any questions, please contact our support team.</p>
    </body>
    </html>
    """
    
    await send_email(
        user['email'],
        f"Welcome to {product_info['name']}!",
        html_content
    )

async def send_refund_notification(user: dict, license: dict):
    """Send refund notification"""
    html_content = f"""
    <html>
    <body>
        <h1>Refund Confirmation</h1>
        <p>Hello {user['name']},</p>
        <p>Your refund has been processed. Your license has been deactivated.</p>
        <p>Transaction: {license['jvzoo_transaction']}</p>
    </body>
    </html>
    """
    
    await send_email(
        user['email'],
        "Refund Processed",
        html_content
    )
```

## IPN Handler

```python
# ipn_handler.py
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models import User, License, Transaction
from license_manager import (
    verify_ipn, generate_license_key, get_product_config, is_test_transaction
)
from email_service import send_welcome_email, send_refund_notification
from config import settings

async def process_ipn(ipn_data: dict, session: AsyncSession):
    """Main IPN processing function"""
    
    # Create transaction audit record
    transaction_record = Transaction(
        jvzoo_transaction_id=ipn_data['ctransaction'],
        transaction_type=ipn_data['ctransaction_type'],
        product_id=ipn_data['cproditem'],
        customer_email=ipn_data['ccustemail'].lower(),
        amount=float(ipn_data.get('ctransamount', 0)),
        raw_ipn_data=ipn_data,
        processed=False
    )
    session.add(transaction_record)
    await session.commit()
    
    try:
        # Verify IPN
        if not verify_ipn(ipn_data, settings.JVZOO_SECRET_KEY):
            transaction_record.error = "Verification failed"
            await session.commit()
            raise ValueError("IPN verification failed")
        
        # Skip test transactions in production
        if is_test_transaction(ipn_data):
            print("Skipping test transaction")
            return
        
        # Process by transaction type
        transaction_type = ipn_data['ctransaction_type']
        
        if transaction_type == 'SALE':
            await process_sale(ipn_data, session)
        elif transaction_type == 'RFND':
            await process_refund(ipn_data, session)
        elif transaction_type == 'CGBK':
            await process_chargeback(ipn_data, session)
        elif transaction_type == 'INSTAL':
            await process_recurring_payment(ipn_data, session)
        elif transaction_type == 'CANCEL-REBILL':
            await process_cancellation(ipn_data, session)
        else:
            print(f"Unknown transaction type: {transaction_type}")
        
        # Mark as processed
        transaction_record.processed = True
        transaction_record.processed_at = datetime.utcnow()
        await session.commit()
        
    except Exception as e:
        transaction_record.error = str(e)
        await session.commit()
        raise

async def process_sale(ipn_data: dict, session: AsyncSession):
    """Process new sale"""
    product_config = get_product_config(ipn_data['cproditem'])
    if not product_config:
        raise ValueError(f"Unknown product: {ipn_data['cproditem']}")
    
    # Check for duplicate
    stmt = select(License).where(License.jvzoo_transaction == ipn_data['ctransaction'])
    result = await session.execute(stmt)
    if result.scalar_one_or_none():
        print("Duplicate transaction, skipping")
        return
    
    # Find or create user
    stmt = select(User).where(User.email == ipn_data['ccustemail'].lower())
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        user = User(
            email=ipn_data['ccustemail'].lower(),
            name=ipn_data['ccustname'],
            created_via='jvzoo',
            jvzoo_transaction=ipn_data['ctransaction']
        )
        session.add(user)
        await session.flush()
    
    # Generate license
    license_key = generate_license_key(
        str(user.id),
        ipn_data['cproditem'],
        ipn_data['ctransaction']
    )
    
    # Create license
    license = License(
        user_id=user.id,
        product_id=ipn_data['cproditem'],
        license_key=license_key,
        jvzoo_transaction=ipn_data['ctransaction'],
        jvzoo_receipt=ipn_data.get('ctransreceipt'),
        status='active',
        purchase_date=datetime.utcnow(),
        transaction_type=ipn_data['ctransaction_type'],
        metadata={
            'amount': ipn_data.get('ctransamount'),
            'affiliate': ipn_data.get('ctransaffiliate'),
            'vendor': ipn_data.get('ctransvendor')
        }
    )
    session.add(license)
    await session.commit()
    
    # Send welcome email
    await send_welcome_email(
        {'email': user.email, 'name': user.name},
        {'license_key': license_key, 'jvzoo_transaction': ipn_data['ctransaction']},
        product_config
    )
    
    print(f"Sale processed: {user.email} - {license_key}")

async def process_refund(ipn_data: dict, session: AsyncSession):
    """Process refund"""
    stmt = select(License).where(License.jvzoo_transaction == ipn_data['ctransaction'])
    result = await session.execute(stmt)
    license = result.scalar_one_or_none()
    
    if license:
        license.status = 'refunded'
        license.refunded_at = datetime.utcnow()
        await session.commit()
        
        # Load user
        await session.refresh(license, ['user'])
        await send_refund_notification(
            {'email': license.user.email, 'name': license.user.name},
            {'jvzoo_transaction': ipn_data['ctransaction']}
        )

async def process_chargeback(ipn_data: dict, session: AsyncSession):
    """Process chargeback"""
    stmt = select(License).where(License.jvzoo_transaction == ipn_data['ctransaction'])
    result = await session.execute(stmt)
    license = result.scalar_one_or_none()
    
    if license:
        license.status = 'chargeback'
        license.chargeback_at = datetime.utcnow()
        await session.commit()

async def process_recurring_payment(ipn_data: dict, session: AsyncSession):
    """Process recurring payment"""
    stmt = select(License).where(License.jvzoo_transaction == ipn_data['ctransaction'])
    result = await session.execute(stmt)
    license = result.scalar_one_or_none()
    
    if license:
        license.status = 'active'
        license.payment_count = (license.payment_count or 1) + 1
        license.last_validated = datetime.utcnow()
        await session.commit()

async def process_cancellation(ipn_data: dict, session: AsyncSession):
    """Process subscription cancellation"""
    stmt = select(License).where(License.jvzoo_transaction == ipn_data['ctransaction'])
    result = await session.execute(stmt)
    license = result.scalar_one_or_none()
    
    if license:
        license.status = 'cancelled'
        license.cancelled_at = datetime.utcnow()
        await session.commit()
```

## Main Application

```python
# main.py
from fastapi import FastAPI, Request, Depends, BackgroundTasks, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from contextlib import asynccontextmanager
from database import get_session, init_db
from models import License, User
from ipn_handler import process_ipn
from license_manager import PRODUCT_MAPPING
from schemas import LicenseValidationRequest, LicenseValidationResponse

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown

app = FastAPI(title="JVZoo Integration API", lifespan=lifespan)

@app.post("/ipn", response_class=PlainTextResponse)
async def jvzoo_ipn(
    request: Request,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session)
):
    """JVZoo IPN endpoint"""
    # Always return 200 OK immediately
    form_data = await request.form()
    ipn_data = dict(form_data)
    
    # Process IPN in background
    background_tasks.add_task(process_ipn, ipn_data, session)
    
    return "OK"

@app.post("/api/validate-license", response_model=LicenseValidationResponse)
async def validate_license(
    data: LicenseValidationRequest,
    session: AsyncSession = Depends(get_session)
):
    """Validate license key"""
    try:
        # Query license with user
        stmt = (
            select(License, User)
            .join(User, License.user_id == User.id)
            .where(
                License.license_key == data.license_key,
                License.status == 'active'
            )
        )
        result = await session.execute(stmt)
        row = result.first()
        
        if not row:
            return LicenseValidationResponse(
                valid=False,
                error="Invalid or inactive license"
            )
        
        license, user = row
        
        # Verify email
        if user.email != data.email.lower():
            return LicenseValidationResponse(
                valid=False,
                error="Email mismatch"
            )
        
        # Check expiry
        if license.expiry_date and license.expiry_date < datetime.utcnow():
            return LicenseValidationResponse(
                valid=False,
                error="License expired"
            )
        
        # Update last validated
        license.last_validated = datetime.utcnow()
        await session.commit()
        
        # Get product config
        product_config = PRODUCT_MAPPING.get(license.product_id, {})
        
        return LicenseValidationResponse(
            valid=True,
            license={
                "product_id": license.product_id,
                "product_name": product_config.get('name'),
                "features": product_config.get('features'),
                "purchase_date": license.purchase_date.isoformat(),
                "expiry_date": license.expiry_date.isoformat() if license.expiry_date else None,
                "status": license.status,
                "user": {
                    "name": user.name,
                    "email": user.email
                }
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## Running the Application

```bash
# Development
uvicorn main:app --reload

# Production with Gunicorn
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Docker Deployment

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://postgres:password@db:5432/jvzoo
    env_file:
      - .env
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: jvzoo
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run with:
```bash
docker-compose up -d
```
