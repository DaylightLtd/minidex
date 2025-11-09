import Vapor

struct User: Content, Authenticatable {
    var id: UUID
    var displayName: String?
}
