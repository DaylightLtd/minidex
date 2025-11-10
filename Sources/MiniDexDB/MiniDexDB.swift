import Fluent

public enum MiniDexDB {
    public static var migrations: [any Migration] {
        [
            Migration_0001_CreateMini(),
            Migration_0002_CreateGameSystem(),
            Migration_0003_MiniToGameSystemRelation(),
        ]
    }
}
