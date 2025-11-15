import Vapor

public extension Application {
    static func makeTesting(_ environment: Environment = .testing) async throws -> Application {
        let app = try await Application.make(environment)
        app.logger.logLevel = .warning
        return app
    }
}
