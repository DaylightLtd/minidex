import Fluent
import SQLKit

struct Migration_0002_CreateUserToken: AsyncMigration {
    func prepare(on database: any Database) async throws {
        let tokenType = try await database
            .enum("user_token_type")
            .case("access")
            .create()

        try await database
            .schema("user_tokens")
            .id()
            .field("user_id", .uuid, .required, .references("users", "id"))
            .field("type", tokenType, .required)
            .field("value", .data, .required)
            .field("expires_at", .datetime, .required)
            .field("created_at", .datetime, .required)
            .field("is_revoked", .bool, .required)
            .create()

        if let sqlDB = database as? any SQLDatabase {
            try await sqlDB
                .create(index: "idx_user_tokens_value")
                .on("user_tokens")
                .column("value")
                .unique()
                .run()

            try await sqlDB
                .create(index: "idx_user_tokens_user_id")
                .on("user_tokens")
                .column("user_id")
                .run()
        }
    }

    func revert(on database: any Database) async throws {
        if let sqlDB = database as? any SQLDatabase {
            try await sqlDB
                .drop(index: "idx_user_tokens_value")
                .run()

            try await sqlDB
                .drop(index: "idx_user_tokens_user_id")
                .run()
        }

        try await database
            .schema("user_tokens")
            .delete()

        try await database
            .enum("user_token_type")
            .delete()
    }
}
