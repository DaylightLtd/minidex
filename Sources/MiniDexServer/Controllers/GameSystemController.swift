import Fluent
import MiniDexDB
import Vapor

struct GameSystem: Content {
    var id: UUID?
    var name: String
}

struct GameSystemPatch: Content {
    var name: String?
}

struct GameSystemController: RouteCollection {
    let crud: ApiCrudController<DBGameSystem, GameSystem, GameSystemPatch> = .init(
        toDTO: {
            .init(id: $0.id, name: $0.name)
        },
        toModel: {
            .init(id: $0.id, name: $0.name)
        }
    )


    func boot(routes: any RoutesBuilder) throws {
        let group = routes.grouped("api", "gamesystem")
        group.get(use: crud.index)
        group.post(use: crud.create)
        group.group(":id") { route in
            route.get(use: crud.get)
            route.patch(use: crud.update { dbModel, patch in
                if let name = patch.name {
                    dbModel.name = name
                }
            })
            route.delete(use: crud.delete)
        }
    }
}
