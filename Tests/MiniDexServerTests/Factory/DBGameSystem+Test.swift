import Foundation
import MiniDexDB

extension DBGameSystem {
    convenience init(
        name: String,
        createdByID: UUID = UUID(),
        visibility: CatalogItemVisibility = .`public`,
    ) {
        self.init(
            id: nil,
            name: name,
            publisher: nil,
            releaseYear: nil,
            website: nil,
            createdByID: createdByID,
            visibility: visibility
        )
    }
}
