import Vapor

public struct Roles: OptionSet, Codable, Sendable {
    public let rawValue: UInt

    public static let admin = Roles(rawValue: 1 << 0)

    public init(rawValue: UInt) {
        self.rawValue = rawValue
    }
}

public struct AuthUser: Content, Authenticatable {
    public var id: UUID
    public var roles: Roles
    public var isActive: Bool
    public var tokenID: UUID?
}

public struct RolesConverter: Sendable {
    public var toStrings: @Sendable (Roles) -> Set<String>
    public var toRoles: @Sendable (Set<String>) -> Roles

    public init(
        toStrings: @escaping @Sendable (Roles) -> Set<String>,
        toRoles: @escaping @Sendable (Set<String>) -> Roles
    ) {
        self.toStrings = toStrings
        self.toRoles = toRoles
    }
}

extension RolesConverter {
    public static let empty = RolesConverter(
        toStrings: { _ in [] },
        toRoles: { _ in [] }
    )
}
