@testable import VaporRedisUtils
import Vapor
@preconcurrency import Redis
import Logging
import VaporUtils
import Testing

@Suite("RedisClientOverride", .serialized)
struct RedisClientOverrideTests {
    @Test("uses override when configured")
    func usesOverride() async throws {
        try await withApplication { app in
            let stub = RecordingRedisClient(eventLoop: app.eventLoopGroup.next())
            app.useRedisClientOverride { _ in stub }

            let req = Request(application: app, on: app.eventLoopGroup.next())
            let client = req.redisClient
            #expect(client is RecordingRedisClient)
            #expect((client as! RecordingRedisClient) === stub)
        }
    }

    @Test("falls back to request redis when no override")
    func fallsBackToDefault() async throws {
        try await withApplication { app in
            let req = Request(application: app, on: app.eventLoopGroup.next())
            let client = req.redisClient
            #expect(client is Request.Redis)
        }
    }
}

private func withApplication(_ body: @escaping (Application) async throws -> Void) async throws {
    let app = try await Application.makeTesting()
    do {
        try await body(app)
    } catch {
        try await app.asyncShutdown()
        throw error
    }
    try await app.asyncShutdown()
}

private final class RecordingRedisClient: RedisClient, @unchecked Sendable {
    let eventLoop: any EventLoop

    init(eventLoop: any EventLoop) {
        self.eventLoop = eventLoop
    }

    func logging(to logger: Logger) -> any RedisClient { self }

    func send(command: String, with arguments: [RESPValue]) -> EventLoopFuture<RESPValue> {
        eventLoop.makeSucceededFuture(.null)
    }

    func subscribe(
        to channels: [RedisChannelName],
        messageReceiver receiver: @escaping RedisSubscriptionMessageReceiver,
        onSubscribe subscribeHandler: RedisSubscriptionChangeHandler?,
        onUnsubscribe unsubscribeHandler: RedisSubscriptionChangeHandler?
    ) -> EventLoopFuture<Void> {
        eventLoop.makeSucceededFuture(())
    }

    func psubscribe(
        to patterns: [String],
        messageReceiver receiver: @escaping RedisSubscriptionMessageReceiver,
        onSubscribe subscribeHandler: RedisSubscriptionChangeHandler?,
        onUnsubscribe unsubscribeHandler: RedisSubscriptionChangeHandler?
    ) -> EventLoopFuture<Void> {
        eventLoop.makeSucceededFuture(())
    }

    func unsubscribe(from channels: [RedisChannelName]) -> EventLoopFuture<Void> {
        eventLoop.makeSucceededFuture(())
    }

    func punsubscribe(from patterns: [String]) -> EventLoopFuture<Void> {
        eventLoop.makeSucceededFuture(())
    }
}
