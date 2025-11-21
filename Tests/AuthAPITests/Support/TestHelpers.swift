@testable import AuthAPI
import AuthDB
import Crypto
import Fluent
import Testing
import Vapor
import VaporRedisUtils
import VaporTesting
import VaporTestingUtils
import VaporUtils
@preconcurrency import Redis

enum AuthAPITestHelpers {
    static func authorize(_ req: inout TestingHTTPRequest, token: String) {
        req.headers.bearerAuthorization = .init(token: token)
    }

    static func assertCacheCleared(for login: TestLoginResponse, redis: InMemoryRedisDriver) throws {
        let snapshot = redis.snapshot()
        let userKey = RedisKey("token:\(login.accessToken)")
        guard let hashedAccessToken = TokenAuthenticator.hashAccessToken(login.accessToken) else {
            throw Abort(.internalServerError, reason: "Failed to decode access token")
        }
        let hashedKey = RedisKey("token_hash:\(hashedAccessToken.base64URLEncodedString())")

        #expect(snapshot.entries[userKey] == nil)
        #expect(snapshot.entries[hashedKey] == nil)

        let userKeyDeleted = snapshot.deleteCalls.contains { $0.contains(userKey) }
        let hashedKeyDeleted = snapshot.deleteCalls.contains { $0.contains(hashedKey) }

        #expect(userKeyDeleted)
        #expect(hashedKeyDeleted)
    }
}
