import FluentPostgresDriver
import Vapor

enum Settings {
    enum Auth {
        static let tokenLength = 32
        static let accessTokenExpiration: TimeInterval = 60 * 60 * 24
    }

    enum DB {
        static let hostname = Environment.get("DATABASE_HOST") ?? "localhost"
        static let port = Environment.get("DATABASE_PORT").flatMap(Int.init(_:)) ?? SQLPostgresConfiguration.ianaPortNumber
        static let username = Environment.get("DATABASE_USERNAME") ?? "vapor_username"
        static let password = Environment.get("DATABASE_PASSWORD") ?? "vapor_password"
        static let database = Environment.get("DATABASE_NAME") ?? "vapor_database"
    }
}
