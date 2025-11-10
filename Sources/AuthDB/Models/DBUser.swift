import Fluent
import Foundation

public final class DBUser: Model, @unchecked Sendable {
    public static let schema = "users"

    @ID
    public var id: UUID?

    @OptionalField(key: "display_name")
    public var displayName: String?

    @Timestamp(key: "created_at", on: .create)
    public var createdAt: Date?

    @Timestamp(key: "updated_at", on: .update)
    public var updatedAt: Date?

    @Children(for: \.$user)
    public var credentials: [DBCredential]

    public init() {}

    public init(
        id: UUID? = nil,
        displayName: String? = nil
    ) {
        self.id = id
        self.displayName = displayName
    }
}

extension DBUser: CustomStringConvertible {
    public var description: String {
        displayName ?? "N/A"
    }
}
