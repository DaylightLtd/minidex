import MiniDexDB
import NIOSSL
import Fluent
import FluentPostgresDriver
import Leaf
import Vapor

// configures your application
public func configure(_ app: Application) async throws {
    // uncomment to serve files from /Public folder
    // app.middleware.use(FileMiddleware(publicDirectory: app.directory.publicDirectory))

    app.databases.use(
        DatabaseConfigurationFactory.postgres(
            configuration: .init(
                hostname: Settings.DB.hostname,
                port: Settings.DB.port,
                username: Settings.DB.username,
                password: Settings.DB.password,
                database: Settings.DB.database,
                tls: .prefer(
                    try .init(configuration: .clientDefault)
                )
            )
        ),
        as: .psql
    )

    app.migrations.add(Migrations.all)

    app.views.use(.leaf)

    // register routes
    try routes(app)
}
