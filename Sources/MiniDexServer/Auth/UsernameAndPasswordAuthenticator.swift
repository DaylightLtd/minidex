import Fluent
import MiniDexDB
import Vapor

struct UsernameAndPasswordAuthenticator: AsyncBasicAuthenticator {
    func authenticate(basic: BasicAuthorization, for request: Request) async throws {
        let credential = try await DBCredential
            .query(on: request.db)
            .filter(\.$type == .usernameAndPassword)
            .filter(\.$identifier == basic.username)
            .with(\.$user)
            .first()

        if let credential,
           let secret = credential.secret,
           try Bcrypt.verify(basic.password, created: secret)
        {
            let user = try User(
                id: credential.user.requireID(),
                displayName: credential.user.displayName,
            )
            request.auth.login(user)
        }
    }
}
