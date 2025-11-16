import AuthDB
import Fluent
import Vapor

public struct UsernameAndPasswordAuthenticator: AsyncBasicAuthenticator {
    public init() {}

    public func authenticate(basic: BasicAuthorization, for request: Request) async throws {
        let credential = try await DBCredential
            .query(on: request.db)
            .join(DBUser.self, on: \DBCredential.$user.$id == \DBUser.$id)
            .filter(\.$type == .usernameAndPassword)
            .filter(\.$identifier == basic.username)
            .first()

        if let credential,
           let secret = credential.secret,
           try Bcrypt.verify(basic.password, created: secret)
        {
            let dbUser = try credential.joined(DBUser.self)
            let user = try AuthUser(
                id: dbUser.requireID(),
                roles: .init(rawValue: dbUser.roles),
                isActive: dbUser.isActive,
                tokenID: nil,
            )
            request.auth.login(user)
            request.logger.debug("Username/password verified for userID: \(user.id)")
        } else {
            request.logger.debug("Username/password auth failed")
        }
    }
}
