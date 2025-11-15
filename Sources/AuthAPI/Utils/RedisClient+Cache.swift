import Foundation
import Logging
import Redis

extension RedisClient {
    private static func userCacheKey(accessToken: String) -> RedisKey {
        "token:\(accessToken)"
    }

    private static func tokenCacheKey(hashedAccessToken: String) -> RedisKey {
        "token_hash:\(hashedAccessToken)"
    }

    func getCachedUser(
        accessToken: String,
        logger: Logger,
    ) async -> AuthUser? {
        do {
            // TODO: when key does not exists get returns an empty Data which fails to decode
            let key = Self.userCacheKey(accessToken: accessToken)
            return try await exists(key) > 0
                ? get(key, asJSON: AuthUser.self)
                : nil
        } catch {
            logger.error("User cache lookup in Redis failed: \(error)")
            return nil
        }
    }

    func cache(
        accessToken: String,
        hashedAccessToken: String,
        user: AuthUser,
        accessTokenExpiration: TimeInterval,
        logger: Logger,
    ) async {
        let ttl = Int(accessTokenExpiration)
        guard ttl > 0 else { return }

        do {
            // Cache user in Redis for fast lookup
            try await setex(
                Self.userCacheKey(accessToken: accessToken),
                toJSON: user,
                expirationInSeconds: ttl
            )
            // Cache raw token for cache invalidation
            try await setex(
                Self.tokenCacheKey(hashedAccessToken: hashedAccessToken),
                toJSON: accessToken,
                expirationInSeconds: ttl
            )
        } catch {
            logger.error("Auth cache to Redis failed: \(error)")
        }
    }

    func invalidate(hashedAccessToken: String, logger: Logger) async {
        do {
            guard let accessToken = try await get(
                Self.tokenCacheKey(hashedAccessToken: hashedAccessToken),
                asJSON: String.self
            ) else {
                return
            }
            _ = try await delete(Self.userCacheKey(accessToken: accessToken)).get()
            _ = try await delete(Self.tokenCacheKey(hashedAccessToken: hashedAccessToken)).get()
        } catch {
            logger.error("Auth cache invalidation from Redis failed: \(error)")
        }
    }
}
