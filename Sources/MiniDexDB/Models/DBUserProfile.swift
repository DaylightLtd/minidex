import AuthDB
import Fluent
import Foundation

public final class DBUserProfile: Model, @unchecked Sendable {
    public static let schema = "user_profiles"

    @ID
    public var id: UUID?

    @Parent(key: "user_id")
    public var user: DBUser

    @OptionalField(key: "display_name")
    public var displayName: String?

    @OptionalField(key: "avatar_url")
    public var avatarURL: String?

    @Timestamp(key: "created_at", on: .create)
    public var createdAt: Date?

    @Timestamp(key: "updated_at", on: .update)
    public var updatedAt: Date?

    public init() {}

    public init(
        id: UUID? = nil,
        userID: UUID,
        displayName: String? = nil,
        avatarURL: String? = nil,
    ) {
        self.id = id
        self.$user.id = userID
        self.displayName = displayName
        self.avatarURL = avatarURL
    }
}

extension DBUserProfile: CustomStringConvertible {
    public var description: String {
        displayName ?? id?.uuidString ?? "Unknown"
    }
}
