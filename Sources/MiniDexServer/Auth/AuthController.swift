import Fluent
import MiniDexDB
import Vapor

struct LoginUser: Content {
    var user: User
    var accessToken: String
    var expiresIn: Int
}

struct RegisterUser: Content, Validatable {
    var username: String
    var password: String
    var confirmPassword: String
    var displayName: String?

    static func validations(_ validations: inout Validations) {
        validations.add("username", as: String.self, is: .count(3...))
        validations.add("password", as: String.self, is: .count(8...))
    }
}

struct AuthController: RouteCollection {
    func boot(routes: any RoutesBuilder) throws {
        let group = routes.grouped("api", "auth")
        group.post("register", use: self.register)
        group
            .grouped(UsernameAndPasswordAuthenticator())
            .post("login", use: self.login)
    }

    @Sendable
    func login(req: Request) async throws -> LoginUser {
        let user = try req.auth.require(User.self)
        let token = DBUserToken(
            userID: user.id,
            type: .access,
            value: generateToken(length: Settings.Auth.tokenLength),
            expiresAt: Date() + Settings.Auth.accessTokenExpiration
        )
        try await token.save(on: req.db)
        return .init(
            user: user,
            accessToken: token.value,
            expiresIn: Int(token.expiresAt.timeIntervalSinceNow)
        )
    }

    @Sendable
    func register(req: Request) async throws -> HTTPStatus {
        try RegisterUser.validate(content: req)
        let input = try req.content.decode(RegisterUser.self)
        guard input.password == input.confirmPassword else {
            throw Abort(.badRequest, reason: "Passwords don't match")
        }

        if try await DBCredential
            .query(on: req.db)
            .filter(\.$type == .usernameAndPassword)
            .filter(\.$identifier == input.username)
            .first() != nil
        {
            req.logger.warning("Attempted to register with existing username '\(input.username)'")
            return .created
        }

        try await req.db.transaction { db in
            let user = DBUser(displayName: input.displayName)
            try await user.save(on: db)

            let credential = DBCredential(
                userID: try user.requireID(),
                type: .usernameAndPassword,
                identifier: input.username,
                secret: try Bcrypt.hash(input.password)
            )
            try await credential.save(on: db)
        }

        return .created
    }

    private func generateToken(length: Int) -> String {
        var bytes = [UInt8](repeating: 0, count: length)
        var rng = SystemRandomNumberGenerator()
        for i in 0..<length {
            bytes[i] = UInt8.random(in: 0...255, using: &rng)
        }
        return Data(bytes).base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }
}
