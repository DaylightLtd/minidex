import Vapor

extension Application {
    struct SlackKey: StorageKey {
        typealias Value = SlackClient
    }

    public var slack: SlackClient? {
        get { storage[SlackKey.self] }
        set { storage[SlackKey.self] = newValue }
    }
}
