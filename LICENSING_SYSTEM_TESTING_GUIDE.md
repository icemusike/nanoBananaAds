# AdGenius AI - Licensing System Testing Guide

## Testing Checklist

### 1. Backend API Tests

#### Test License Creation (JVZoo IPN Simulation)
```bash
# Test Frontend License (427079)
curl -X POST http://localhost:3001/api/jvzoo/ipn \
  -d "ctransaction=TEST-FRONTEND-001" \
  -d "cproditem=427079" \
  -d "ccustemail=test-frontend@example.com" \
  -d "ccustname=Frontend Tester"

# Test Pro License (427343)
curl -X POST http://localhost:3001/api/jvzoo/ipn \
  -d "ctransaction=TEST-PRO-001" \
  -d "cproditem=427343" \
  -d "ccustemail=test-pro@example.com"

# Test Elite Bundle (427357)
curl -X POST http://localhost:3001/api/jvzoo/ipn \
  -d "ctransaction=TEST-ELITE-001" \
  -d "cproditem=427357" \
  -d "ccustemail=test-elite@example.com"
```

#### Test License Endpoints
```bash
# Get user license info
curl http://localhost:3001/api/license/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get credits info
curl http://localhost:3001/api/license/credits \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Admin Panel Tests

#### Test Manual License Assignment
1. Login to admin panel: http://localhost:3000/admin/login
2. Navigate to User Management
3. Click on a user
4. Click "Grant License" button
5. Test each license type:
   - **Frontend** ($47) - Should give 500 credits/month
   - **Pro License** ($97) - Should give unlimited credits
   - **Templates License** ($127) - Should enable templates
   - **Agency License** ($197) - Should enable agency features
   - **Reseller License** ($297) - Should enable reseller features
   - **Elite Bundle** ($397) - Should enable ALL features

#### Verify License Display
- Check that granted license appears in user's license list
- Verify license key format (XXXX-XXXX-XXXX-XXXX)
- Check status is "active"
- Verify purchase date is set

### 3. User Settings Tests

#### Test License Display
1. Login as test user: http://localhost:3000/login
2. Navigate to Settings
3. Check "Billing Profile" section
4. Verify:
   - **Plan name** displays correctly:
     - Free users: "Free"
     - Frontend only: "Frontend"
     - Pro only: "Pro License"
     - Elite Bundle: "Elite Bundle"
     - Multiple licenses: "Pro License + Templates + Agency"
   - **Credits** display correctly:
     - Free: 50/month
     - Frontend: 500/month
     - Pro/Elite: "Unlimited"
   - **Next reset date** shows correctly

#### Test Feature Access
- Pro License users: Can generate unlimited ads
- Templates users: Can access template library
- Agency users: Can see agency features
- Reseller users: Can see white-label options
- Elite Bundle: All features enabled

### 4. License Context Tests

#### Test Computed Properties
Open browser console and check `useLicense()` hook returns correct values:

```javascript
// For Pro License user
isFrontend: false
isPro: true
hasUnlimitedCredits: true
hasProFeatures: true

// For Elite Bundle user
isElite: true
hasProFeatures: true
hasTemplatesLibrary: true
hasAgencyFeatures: true
hasResellerFeatures: true
hasWhiteLabel: true

// For Frontend + Agency user
isFrontend: true
hasAgencyFeatures: true
hasUnlimitedCredits: false
```

### 5. Product ID Mapping Tests

Verify these JVZoo product IDs map correctly:

| JVZoo ID | Internal ID | Description |
|----------|-------------|-------------|
| 427079 | frontend | Base access |
| 427343 | pro_license | Unlimited generations |
| 427345 | pro_license | Pro downsell |
| 427347 | templates_license | Template library |
| 427349 | templates_license | Templates downsell |
| 427351 | agency_license | Agency features |
| 427353 | agency_license | Agency downsell |
| 427355 | reseller_license | Resell platform |
| 427359 | reseller_license | Reseller downsell |
| 427357 | elite_bundle | All features |

### 6. Credits System Tests

#### Free Tier (No License)
- Should have: 50 credits/month
- Resets: First of each month
- Limit enforced: Yes

#### Frontend License
- Should have: 500 credits/month
- Resets: First of each month
- Limit enforced: Yes

#### Pro License / Elite Bundle
- Should have: Unlimited (999,999)
- Resets: Never
- Limit enforced: No

### 7. Feature Detection Tests

#### Test Elite Bundle Priority
- User with Elite Bundle + other licenses
- Should display: "Elite Bundle" (not addons)
- All features should be enabled

#### Test Addon Stacking
- User with: Frontend + Templates + Agency
- Should display: "Frontend + Templates + Agency"
- Each feature enabled independently

### 8. Database Verification

#### Check License Records
```sql
-- View all licenses
SELECT id, licenseKey, productId, status, userId
FROM "License"
ORDER BY createdAt DESC;

-- View user with licenses
SELECT u.email, l.productId, l.status, l.licenseKey
FROM "User" u
LEFT JOIN "License" l ON u.id = l.userId
ORDER BY u.createdAt DESC;

-- Check license features
SELECT
  u.email,
  l.productId,
  l.status,
  l.maxActivations,
  l.activations
FROM "License" l
JOIN "User" u ON l.userId = u.id
WHERE l.status = 'active';
```

## Expected Behaviors

### License Activation Limits
- Frontend: 1 device
- Pro License: 3 devices
- Templates: 1 device
- Agency: 10 devices
- Reseller: 50 devices
- Elite Bundle: 10 devices

### Feature Matrix

| Feature | Frontend | Pro | Templates | Agency | Reseller | Elite |
|---------|----------|-----|-----------|--------|----------|-------|
| Base Access | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Unlimited Gens | - | ✓ | - | - | - | ✓ |
| Template Library | - | - | ✓ | - | - | ✓ |
| Agency Features | - | - | - | ✓ | - | ✓ |
| Client Management | - | - | - | ✓ | ✓ | ✓ |
| White Label | - | - | - | - | ✓ | ✓ |
| Resell Rights | - | - | - | - | ✓ | ✓ |

## Troubleshooting

### License Not Showing
1. Check user is logged in
2. Verify token is valid
3. Check `/api/license/me` endpoint response
4. Verify license status is "active"

### Credits Not Updating
1. Check `/api/license/credits` endpoint
2. Verify license tier is correct
3. Check Pro/Elite users show "unlimited"

### Admin Grant Not Working
1. Verify admin is authenticated
2. Check productId is one of: frontend, pro_license, templates_license, agency_license, reseller_license, elite_bundle
3. Verify backend receives correct data format

## Success Criteria

✅ All 10 JVZoo product IDs map correctly
✅ Admin can grant any license type
✅ User settings display correct plan name
✅ Credits system works for all tiers
✅ Feature detection works correctly
✅ Elite Bundle shows all features
✅ Multiple licenses stack properly
✅ LicenseContext provides correct computed properties
