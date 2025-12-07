# AuthAPI

Lightweight authentication module for MiniDex built on Vapor + Fluent. Exposes registration, login, logout, and user-management APIs plus authenticators/middleware for the rest of the server.

## Authentication Flow
- user logs in via `/v1/auth/login` using Basic Authentication and gets back an access token
- all further API calls are made using that access token via Bearer authorization

## Redis Caching

### Design
Redis reduces authentication latency from ~5-10ms (database join) to <1ms (Redis lookup + checksum validation). On cache hit, cached user data is trusted without database verification, bounded by a 5-minute cache TTL. The database remains the authoritative source for token revocation and expiration.

### Cache Keys
- `token:<access-token>` → JSON-encoded `CachedAuthUser` (wraps `AuthUser` with HMAC-SHA256 checksum for integrity validation)
- `token_hash:<hashed-token>` → original access token string (enables cache invalidation by hash)

### Cache Hit Flow
1. Check Redis for cached user data
2. Validate checksum to ensure data integrity (prevents cache tampering)
3. If checksum invalid, delete corrupted entry and fall back to database
4. If valid, use cached user data (no database verification for performance)

### Cache Miss Flow
1. Query database: `DBUserToken` ⋈ `DBUser` filtered by token hash
2. Validate token (not revoked, not expired)
3. Wrap `AuthUser` in `CachedAuthUser` with HMAC-SHA256 checksum
4. Cache result in Redis for future requests

### Cache Invalidation
- **Logout**: Revokes token in DB, best-effort invalidates Redis keys
- **Revoke Access**: Revokes all user tokens in DB, best-effort invalidates all cached tokens
- **Update User**: If roles/isActive change, **revokes all user tokens in DB** and invalidates cache

### Failure Handling
Redis failures are graceful:
- Read failures → fall back to database
- Write/invalidation failures → logged as ERROR, but system remains secure (DB revocation is sufficient)
- Checksum validation failures → delete corrupted cache entry, fall back to database, log warning

### Security Guarantees
1. **Cache integrity protection**: Cached auth data includes HMAC-SHA256 checksums to detect tampering. Invalid checksums cause automatic cache deletion and database fallback
2. **Token revocation in database**: Logout, revokeAccess, and user role/status changes revoke tokens in the database within a transaction
3. **No stale permissions**: Changing user roles/status force re-authentication (all existing tokens are revoked in database)
4. **Idempotent updates**: Setting roles/status to their current values does not revoke tokens (avoids unnecessary session disruption)

### Configuration
- **Cache TTL**: 5 minutes (configurable via `Settings.Auth.cacheExpiration`)
- **Token validity**: 24 hours in database (configurable via `Settings.Auth.accessTokenExpiration`)
- **Checksum secret**: Required environment variable `AUTH_CACHE_CHECKSUM_SECRET` (should be 32+ random bytes, base64 or hex encoded)

### Known Limitations
1. **Revoked tokens may persist in cache**: If cache invalidation fails, revoked tokens can remain valid for up to 5 minutes (cache TTL). This is acceptable given the short cache lifetime and performance benefits
2. **Role/status changes force re-login**: Users must re-authenticate after their roles or active status changes (this is intentional for security)

## Testing
`Tests/AuthAPITests` use in-memory SQLite + `InMemoryRedisDriver` to test cache hits, misses, invalidations, and failure scenarios.
