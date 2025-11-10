import Fluent

public enum AuthDB {
    public static var migrations: [any Migration] {
        [
            Migration_0001_CreateUserAndCredential(),
            Migration_0002_CreateUserToken(),
        ]
    }
}
