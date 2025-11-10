import Fluent
import Foundation

public enum CredentialType: String, Codable, Sendable {
    case usernameAndPassword
}

public final class DBCredential: Model, @unchecked Sendable {
    public static let schema = "credentials"

    @ID
    public var id: UUID?

    @Parent(key: "user_id")
    public var user: DBUser

    @Enum(key: "type")
    public var type: CredentialType

    @Field(key: "identifier")
    public var identifier: String

    @OptionalField(key: "secret")
    public var secret: String?

    @Timestamp(key: "created_at", on: .create)
    public var createdAt: Date?

    @Timestamp(key: "updated_at", on: .update)
    public var updatedAt: Date?

    public init() {}

    public init(
        id: UUID? = nil,
        userID: UUID,
        type: CredentialType,
        identifier: String,
        secret: String? = nil,
    ) {
        self.id = id
        self.$user.id = userID
        self.type = type
        self.identifier = identifier
        self.secret = secret
    }
}

extension DBCredential: CustomStringConvertible {
    public var description: String {
        identifier
    }
}
