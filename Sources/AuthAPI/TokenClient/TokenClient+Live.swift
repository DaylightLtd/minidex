import AuthDB
import Fluent
import Vapor

extension TokenClient {
    public static func live(req: Request) -> TokenClient {
        .init(
            isTokenValid: { !$0.isRevoked && $0.expiresAt.timeIntervalSinceNow > 0 },
            hashToken: { token in
                token
                    .base64URLDecodedData()
                    .map(SHA256.hash(data:))
                    .map(Data.init(_:))
            },
            revoke: { token, db in
                token.isRevoked = true
                try await token.save(on: db ?? req.db)

                let tokenID = try token.requireID()
                req.logger.debug("Revoked tokenID: \(tokenID)")

                await req.redisClient.invalidate(
                    hashedAccessToken: token.value.base64URLEncodedString(),
                    logger: req.logger
                )
            },
            revokeAllActiveTokens: { userID, db in
                let allTokens = try await DBUserToken
                    .query(on: db ?? req.db)
                    .filter(\.$user.$id == userID)
                    .all()

                for token in allTokens {
                    let hashed = token.value.base64URLEncodedString()
                    await req.redisClient.invalidate(
                        hashedAccessToken: hashed,
                        logger: req.logger
                    )
                }

                try await DBUserToken
                    .query(on: db ?? req.db)
                    .filter(\.$user.$id == userID)
                    .filter(\.$isRevoked == false)
                    .set(\.$isRevoked, to: true)
                    .update()

                req.logger.debug("Revoked all active tokens for userID: \(userID)")
            }
        )
    }
}
