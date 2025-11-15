import Foundation
import Testing
import VaporUtils

@Suite("Base64URL")
struct Base64URLTests {
    @Test("encodes and decodes round trip")
    func roundTrip() throws {
        let data = "Hello, Vapor!".data(using: .utf8)!
        let encoded = data.base64URLEncodedString()
        let decoded = encoded.base64URLDecodedData()
        #expect(decoded == data)
    }

    @Test("encoding removes padding")
    func encodingRemovesPadding() throws {
        let data = Data([0xff, 0xee, 0xdd])
        let encoded = data.base64URLEncodedString()
        #expect(!encoded.contains("="))
    }

    @Test("decoding handles missing padding and url chars")
    func decodingHandlesURLSafeAlphabet() throws {
        let original = Data([0xfa, 0xfb, 0xfc, 0xfd])
        let encoded = original.base64URLEncodedString()
        let decoded = encoded.base64URLDecodedData()
        #expect(decoded == original)
    }

    @Test("decoding invalid string returns nil")
    func decodingInvalidReturnsNil() {
        let decoded = "not#base64".base64URLDecodedData()
        #expect(decoded == nil)
    }
}
