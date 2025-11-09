# Deployment Guide

Production deployment guide for JVZoo integration across different hosting platforms.

## Pre-Deployment Checklist

- [ ] Database configured with proper indexes
- [ ] Environment variables secured
- [ ] SSL certificate installed
- [ ] IPN URL tested and verified
- [ ] Email service configured and tested
- [ ] Logging and monitoring setup
- [ ] Backup strategy implemented
- [ ] Error alerting configured
- [ ] Rate limiting enabled
- [ ] Security headers configured

## Platform-Specific Deployment

### Vercel (Next.js)

**Advantages:**
- Serverless, auto-scaling
- Built-in edge network
- Zero-config deployment
- Great for Next.js apps

**Setup:**

1. **Connect Repository**
   - Push code to GitHub
   - Import project in Vercel dashboard

2. **Configure Environment Variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   JVZOO_SECRET_KEY=your_secret
   LICENSE_SECRET=your_secret
   RESEND_API_KEY=your_api_key
   FROM_EMAIL=noreply@yourdomain.com
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Configure Domain**
   - Add custom domain in Vercel dashboard
   - Update DNS records

5. **Set JVZoo IPN URL**
   ```
   https://yourdomain.com/api/jvzoo/ipn
   ```

**Monitoring:**
- Use Vercel Analytics
- Set up Vercel Log Drains for Datadog/Logtail
- Monitor Supabase dashboard

### Railway (Node.js/Python)

**Advantages:**
- Simple deployment
- Built-in PostgreSQL
- Good for monolithic apps
- Cost-effective

**Setup:**

1. **Create New Project**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   ```

2. **Add PostgreSQL**
   ```bash
   railway add postgresql
   ```

3. **Configure Environment**
   Railway provides `DATABASE_URL` automatically. Add others:
   ```bash
   railway variables set JVZOO_SECRET_KEY=your_secret
   railway variables set LICENSE_SECRET=your_secret
   # ... add all variables
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Generate Domain**
   Railway provides a domain or connect custom domain

### AWS (Elastic Beanstalk)

**Advantages:**
- Full AWS ecosystem access
- Enterprise-grade scalability
- Fine-grained control

**Setup:**

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize Application**
   ```bash
   eb init -p python-3.11 jvzoo-integration
   ```

3. **Create Environment**
   ```bash
   eb create production
   ```

4. **Configure Environment Variables**
   ```bash
   eb setenv JVZOO_SECRET_KEY=your_secret \
             LICENSE_SECRET=your_secret \
             DATABASE_URL=your_db_url
   ```

5. **Deploy**
   ```bash
   eb deploy
   ```

6. **Setup RDS Database**
   - Create RDS PostgreSQL instance
   - Update `DATABASE_URL` environment variable

### Digital Ocean (Docker)

**Advantages:**
- Predictable pricing
- Full server control
- Good performance

**Setup:**

1. **Create Droplet**
   - Ubuntu 22.04
   - At least 2GB RAM

2. **Install Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

3. **Clone Repository**
   ```bash
   git clone your-repo
   cd your-repo
   ```

4. **Create .env File**
   ```bash
   nano .env
   # Add all environment variables
   ```

5. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

6. **Setup Nginx Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

7. **Setup SSL with Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

### Render

**Advantages:**
- Simple deployment
- Free SSL
- Auto-deploy from Git
- Good for small to medium apps

**Setup:**

1. **Create New Web Service**
   - Connect GitHub repository
   - Select branch

2. **Configure Build**
   - Build Command: `npm install` or `pip install -r requirements.txt`
   - Start Command: `npm start` or `gunicorn main:app`

3. **Add Environment Variables**
   Add all required variables in Render dashboard

4. **Add PostgreSQL Database**
   - Create new PostgreSQL database
   - Copy internal connection string to `DATABASE_URL`

5. **Deploy**
   Automatic on push to main branch

## Database Considerations

### Indexes

Ensure proper indexes for performance:

```sql
-- Critical indexes
CREATE INDEX idx_licenses_user_id ON licenses(user_id);
CREATE INDEX idx_licenses_license_key ON licenses(license_key);
CREATE INDEX idx_licenses_jvzoo_transaction ON licenses(jvzoo_transaction);
CREATE INDEX idx_licenses_status ON licenses(status);

CREATE INDEX idx_transactions_jvzoo_id ON jvzoo_transactions(jvzoo_transaction_id);
CREATE INDEX idx_transactions_processed ON jvzoo_transactions(processed);
CREATE INDEX idx_transactions_email ON jvzoo_transactions(customer_email);

CREATE INDEX idx_users_email ON users(email);
```

### Backups

**Automated Backups:**

```bash
# Daily PostgreSQL backup
0 2 * * * pg_dump -U postgres jvzoo_db > /backup/jvzoo_$(date +\%Y\%m\%d).sql

# Retention: Keep 30 days
find /backup -name "jvzoo_*.sql" -mtime +30 -delete
```

**Supabase:**
- Enable automated backups in dashboard
- Export backups periodically to S3

### Migrations

Use migration tools to manage schema changes:

**Alembic (Python):**
```bash
alembic init migrations
alembic revision -m "initial schema"
alembic upgrade head
```

**Prisma (Node.js/Next.js):**
```bash
npx prisma migrate dev
npx prisma migrate deploy
```

## SSL/TLS Configuration

### Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Cloudflare (Recommended)

**Benefits:**
- Free SSL
- DDoS protection
- CDN
- Analytics

**Setup:**
1. Add domain to Cloudflare
2. Update nameservers
3. Enable "Full (strict)" SSL mode
4. Enable "Always Use HTTPS"

## Monitoring & Logging

### Application Monitoring

**Sentry (Error Tracking):**

```javascript
// Node.js
const Sentry = require("@sentry/node");
Sentry.init({ dsn: process.env.SENTRY_DSN });

app.use(Sentry.Handlers.errorHandler());
```

```python
# Python
import sentry_sdk
sentry_sdk.init(dsn=os.getenv("SENTRY_DSN"))
```

### Log Aggregation

**Logtail/Datadog:**

```javascript
// Node.js with Winston + Logtail
const winston = require('winston');
const { Logtail } = require('@logtail/node');
const { LogtailTransport } = require('@logtail/winston');

const logtail = new Logtail(process.env.LOGTAIL_TOKEN);

const logger = winston.createLogger({
  transports: [new LogtailTransport(logtail)]
});

logger.info('IPN received', { transaction: ipnData.ctransaction });
```

### Health Checks

**UptimeRobot (Free):**
- Monitor: `https://yourdomain.com/health`
- Check interval: 5 minutes
- Alerts: Email/SMS/Slack

**Endpoint:**
```javascript
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'connected' // Add DB check
  });
});
```

## Security

### Environment Variables

**Never commit:**
- `.env`
- `.env.local`
- Any file with secrets

**Use:**
- Platform environment variables
- AWS Secrets Manager
- HashiCorp Vault
- Doppler

### Rate Limiting

**Express:**
```javascript
const rateLimit = require('express-rate-limit');

const ipnLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
});

app.post('/ipn', ipnLimiter, handleIPN);
```

**FastAPI:**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/ipn")
@limiter.limit("100/15minutes")
async def jvzoo_ipn(request: Request):
    # handler
```

### Security Headers

```javascript
// Node.js with Helmet
const helmet = require('helmet');
app.use(helmet());
```

```python
# FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(TrustedHostMiddleware, allowed_hosts=["yourdomain.com"])
```

### HTTPS Redirect

**Nginx:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

**Express:**
```javascript
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

## Performance Optimization

### Database Connection Pooling

**PostgreSQL (Node.js):**
```javascript
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

**SQLAlchemy (Python):**
```python
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=0,
    pool_pre_ping=True
)
```

### Caching

**Redis for License Validation:**

```javascript
const redis = require('redis');
const client = redis.createClient();

async function validateLicense(key, email) {
  // Check cache first
  const cached = await client.get(`license:${key}`);
  if (cached) return JSON.parse(cached);
  
  // Query database
  const license = await db.getLicense(key);
  
  // Cache for 1 hour
  await client.setEx(`license:${key}`, 3600, JSON.stringify(license));
  
  return license;
}
```

### CDN

Use Cloudflare or AWS CloudFront for static assets and global distribution.

## Testing in Production

### Smoke Tests

```bash
#!/bin/bash
# smoke-test.sh

# Health check
curl -f https://yourdomain.com/health || exit 1

# Test IPN endpoint exists
curl -X POST https://yourdomain.com/api/jvzoo/ipn \
  -d "test=true" -o /dev/null -w "%{http_code}" | grep 200 || exit 1

echo "Smoke tests passed!"
```

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 https://yourdomain.com/api/validate-license

# Using k6
k6 run load-test.js
```

## Rollback Strategy

### Blue-Green Deployment

1. Deploy to new environment (green)
2. Test green environment
3. Switch traffic to green
4. Keep blue as backup

### Database Migrations

Always make migrations backward compatible:
- Add new columns as nullable
- Don't drop columns immediately
- Use feature flags for new code paths

## Maintenance Windows

Schedule maintenance during low-traffic periods:
- Database updates
- Schema migrations
- Major version upgrades

**Notification:**
- Email users 24-48 hours ahead
- Display banner in app
- Update status page

## Disaster Recovery

### Backup Restoration

```bash
# Restore PostgreSQL backup
pg_restore -U postgres -d jvzoo_db backup.dump

# Or from SQL dump
psql -U postgres jvzoo_db < backup.sql
```

### Failover Strategy

1. **Database:**
   - Primary-replica setup
   - Automatic failover with replication

2. **Application:**
   - Multiple instances behind load balancer
   - Health checks every 30 seconds
   - Auto-restart on failure

## Cost Optimization

### Serverless vs Server

**Serverless (Vercel/AWS Lambda):**
- Best for: Variable traffic, low traffic
- Cost: Pay per request
- Limit: Cold starts, execution time limits

**Server (Railway/Digital Ocean):**
- Best for: Consistent traffic, background jobs
- Cost: Fixed monthly
- Limit: Manual scaling

### Database

**Shared (Supabase Free):**
- Good for: Testing, small projects
- Limit: 500MB, no backups

**Dedicated:**
- Good for: Production
- Options: RDS, Supabase Pro, Digital Ocean Managed

## Troubleshooting

### IPN Not Received

1. Check JVZoo product settings
2. Verify URL is publicly accessible
3. Check server logs
4. Test with ngrok for local testing
5. Verify firewall rules

### High Database Load

1. Check missing indexes
2. Optimize slow queries
3. Add connection pooling
4. Consider read replicas

### Email Delivery Issues

1. Check SPF/DKIM records
2. Monitor bounce rate
3. Use dedicated email service (SendGrid/Resend)
4. Implement email queue

## Post-Deployment

### Monitoring Checklist

- [ ] Error rate < 0.1%
- [ ] Response time < 500ms
- [ ] Database connections healthy
- [ ] Email delivery successful
- [ ] No failed IPN processing
- [ ] Disk space > 20% free
- [ ] CPU usage < 80%
- [ ] Memory usage < 90%

### Regular Tasks

**Daily:**
- Check error logs
- Monitor IPN processing rate
- Verify email deliverability

**Weekly:**
- Review database performance
- Check backup integrity
- Update dependencies

**Monthly:**
- Security audit
- Review access logs
- Optimize database queries
- Update documentation
