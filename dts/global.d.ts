import { Color, ColorScheme, Size, VirtualNode, KeyboardType, Edge, Point, KeywordPoint, Visibility, ReadableStream } from "scripting"

declare global {
  type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never
  }

  type XOR<T, U> =
    | (T & Without<U, T>)
    | (U & Without<T, U>)

  /**
   * The console object provides access to the debugging console pop-up view.
   */
  const console: {
    /**
     * Outputs a message to the console pop-up view.
     */
    log(...args: any[]): void
    /**
     * Outputs a message to the console pop-up view at the "warn" log level.
     */
    warn(...args: any[]): void
    /**
     * Outputs a message to the console pop-up view at the "error" log level.
     */
    error(...args: any[]): void
    /**
     * Clears the console if possible.
     */
    clear(): void
    /**
     * Present a console pop-up view.
     * This method allows you to view the printed console messages. When your script does not have any UI to display, but you want to view the script running log, please call this method. Promise will resolve after the pop-up view is dismissed.
     */
    present(): Promise<void>
  }

  /**
   * Start a timer, the callback function will be executed after the specified time interval. Returns a number timer id.
   */
  const setTimeout: (callback: () => void, timeout?: number) => number
  /**
   * Stop a timer by a given timer id.
   */
  const clearTimeout: (timerId: number) => void

  /**
   * Provides the information abouts the device, also some methods to use the capabilities of the device.
   *
   */
  namespace Device {
    /**
     * Model of the device, e.g. "iPhone".
     */
    const model: string
    /**
     * The current version of the operating system.
     */
    const systemVersion: string
    /**
     * The name of the operating system running on the device.
     */
    const systemName: string
    const isiPad: boolean
    const isiPhone: boolean
    const screen: {
      width: number
      height: number
      scale: number
    }
    const batteryState: "full" | "charging" | "unplugged" | "unknown"
    const batteryLevel: number
    const isLandscape: boolean
    const isPortrait: boolean
    const isFlat: boolean
    const colorScheme: ColorScheme
    /**
     * A boolean value that indicates whether the process is an iPhone or iPad app running on a Mac.
     */
    const isiOSAppOnMac: boolean
    /**
     * The current locale used by the system, such as `"en_US"`.
     */
    const systemLocale: string
    /**
     * User preferred languages, such as `["en-US", "zh-Hans-CN"]`.
     */
    const preferredLanguages: string[]
    /**
     * User preferred locales, such as `["en-US", "zh-Hans-CN"]`.
     * @deprecated Use `Device.preferredLanguages` instead.
     */
    const systemLocales: string[]
    /**
     * The current locale language tag, such as `"en-US"`
     */
    const systemLanguageTag: string
    /**
     * The current locale language code, such as `"en"`
     */
    const systemLanguageCode: string
    /**
     * The current locale country code, such as `"US"`
     */
    const systemCountryCode: string | undefined
    /**
     * The current locale script code, such as `"Hans"` of `"zh_CN_Hans"`
     */
    const systemScriptCode: string | undefined

    /**
     * Retrieve the current wakelock status.
     */
    const isWakeLockEnabled: Promise<boolean>

    /**
     * Enable or disable the wakelock. This method is only available in Scripting app.
     * @param enabled Whether to enable or disable the wake lock.
     */
    function setWakeLockEnabled(enabled: boolean): void

    /**
     * Network interface information
     */
    type NetworkInterface = {
      address: string
      netmask: string | null
      family: 'IPv4' | 'IPv6'
      mac: string | null
      isInternal: boolean
      cidr: string | null
    }

    /**
     * Get the network interfaces of the device.
     * @returns A dictionary of network interfaces, where the key is the interface name and the value is an array of network interface objects.
     */
    function networkInterfaces(): Record<string, NetworkInterface[]>
  }

  /**
   * This enum represents the compression algorithms that can be used to compress data.
   * It is used in the `Data` class to specify the compression algorithm to use when compressing data.
   * The values are:
   * - `lzfse`: LZFSE compression algorithm, which is a fast and efficient compression algorithm.
   * - `lz4`: LZ4 compression algorithm, which is a fast and efficient compression algorithm.
   * - `lzma`: LZMA compression algorithm, which is a high compression ratio algorithm.
   * - `zlib`: Zlib compression algorithm, which is a widely used compression algorithm.
   */
  enum CompressionAlgorithm {
    lzfse = 0,
    lz4 = 1,
    lzma = 2,
    zlib = 3
  }

  type Encoding = "utf-8" |
    "utf8" |
    "utf-16" |
    "utf16" |
    "ascii" |
    "utf32" |
    "utf-32" |
    "iso2022JP" |
    "isoLatin1" |
    "japaneseEUC" |
    "macOSRoman" |
    "nextstep" |
    "nonLossyASCII" |
    "shiftJIS" |
    "symbol" |
    "unicode" |
    "utf16BigEndian" |
    "utf16LittleEndian" |
    "utf32BigEndian" |
    "utf32LittleEndian" |
    "windowsCP1250" |
    "windowsCP1251" |
    "windowsCP1252" |
    "windowsCP1253" |
    "windowsCP1254" |
    "gbk" |
    "gb18030"

  /**
   * This class represents the binary data, it provides some methods to convert the data to different formats.
   * It is used to represent the data in a more convenient way, such as converting to base64 or hex string, or reading from a file.
   */
  class Data {
    /**
     * The length of the data in bytes.
     */
    readonly size: number
    /**
     * Sets a region of the data buffer to 0.
     * @param startIndex The start index of the region to reset.
     * @param endIndex The end index of the region to reset.
     * @throws an error if the startIndex or endIndex is out of bounds.
     */
    resetBytes(startIndex: number, endIndex: number): void
    /**
     * Creates a new data buffer by removing the specified number of bytes from the beginning of the original buffer.
     * @param amount The number of bytes to strip from the input data buffer. The value must be less than the original data buffer's length.
     * @returns Returns a new data buffer created by removing the given number of bytes from the front of the original buffer.
     */
    advanced(amount: number): Data
    /**
     * Replace a range of bytes in the data with the bytes from another data object.
     * @param startIndex The start index of the range to replace.
     * @param endIndex The end index of the range to replace.
     * @param data The data to replace the range with.
     * @throws an error if the startIndex or endIndex is out of bounds.
     */
    replaceSubrange(startIndex: number, endIndex: number, data: Data): void
    /**
     * Use this method to compress in-memory data when you want to reduce memory usage and can afford the time to compress and decompress it. If your data object is already in a compressed format, such as media formats like JPEG images or AAC audio, additional compression may provide minimal or no reduction in memory usage.
     * @param algorithm An algorithm used to compress the data.
     * @returns Returns a new data object by compressing the data object’s bytes. 
     * @throws an error if the data is empty or cannot be compressed.
     */
    compressed(algorithm: CompressionAlgorithm): Data
    /**
     * Use this method to inflate in-memory data when you need uncompressed bytes. Specify the same algorithm used to compress the data to successfully decompress it.
     * @param algorithm An algorithm used to decompress the data.
     * @returns Returns a new data object by decompressing the data object’s bytes.
     * @throws an error if the data is empty or cannot be decompressed.
     */
    decompressed(algorithm: CompressionAlgorithm): Data
    /**
     * Get a sub-data from the data.
     * @param start The start index of the sub-data, defaults to 0.
     * @param end The end index of the sub-data, defaults to the end of the data.
     * @returns Returns a new Data instance containing the bytes from start to end, or a new Data instance if no parameters are provided.
     */
    slice(start?: number, end?: number): Data
    /**
     * Append another Data instance to this data.
     * @param other The Data instance to append.
     */
    append(other: Data): void
    /**
     * Get a byte array of the data.
     * @returns Returns a `Uint8Array` containing the bytes of the data, or `null` if the data is empty or cannot be converted to bytes.
     * @deprecated Use `toUint8Array()` instead.
     */
    getBytes(): Uint8Array | null

    /**
     * Get a byte array of the data.
     * @returns Returns a `Uint8Array` containing the bytes of the data, or `null` if the data is empty or cannot be converted to bytes.
     */
    toUint8Array(): Uint8Array | null
    /**
     * Get an ArrayBuffer of the data.
     * @returns Returns an `ArrayBuffer` containing the bytes of the data, or `null` if the data is empty or cannot be converted to bytes.
     */
    toArrayBuffer(): ArrayBuffer
    /**
     * Get a base64 encoded string of the data.
     */
    toBase64String(): string
    /**
     * Get a hex encoded string of the data.
     */
    toHexString(): string
    /**
     * Get a string representation of the data.
     * @param encoding The encoding of the string, defaults to `utf-8`.
     * @returns Returns a string representation of the data, or `null` if the data is empty or cannot be converted to a string.
     */
    toRawString(encoding?: Encoding): string | null
    /**
     * Get a decoded string representation of the data.
     * @param encoding The encoding of the string, defaults to `utf-8`.
     * @returns Returns a decoded string representation of the data, it will replace any bad characters with the Unicode replacement character.
     */
    toDecodedString(encoding?: "utf8" | "ascii"): string
    /**
     * Get an array of integers representing the bytes of the data.
     * @returns Returns an array of integers representing the bytes of the data.
     */
    toIntArray(): number[]
    /**
     * Create a new Data instance from an array of integers.
     * @param array The array of integers to convert to data.
     * @returns Returns a new Data instance containing the bytes of the integer array.
     */
    static fromIntArray(array: number[]): Data
    /**
     * Create a new Data instance from a string.
     * @param string The string to convert to data.
     * @param encoding The encoding of the string, defaults to `utf-8`.
     * @returns Returns a new Data instance containing the bytes of the string, or `null` if the string is empty or cannot be converted to bytes.
     * @deprecated Use `Data.fromRawString` instead.
     */
    static fromString(string: string, encoding?: Encoding): Data | null
    /**
     * Create a new Data instance from a raw string.
     * @param string The string to convert to data.
     * @param encoding The encoding of the string, defaults to `utf-8`.
     * @returns Returns a new Data instance containing the bytes of the string, or `null` if the string is empty or cannot be converted to bytes.
     */
    static fromRawString(string: string, encoding?: Encoding): Data | null
    /**
     * Create a new Data instance from a file path.
     * @param filePath The path to the file to read.
     * @returns Returns a new Data instance containing the bytes of the file, or `null` if the file does not exist or cannot be read.
     */
    static fromFile(filePath: string): Data | null
    /**
     * Create a new Data instance from an ArrayBuffer.
     * @param arrayBuffer The ArrayBuffer to convert to Data.
     * @returns Returns a new Data instance containing the bytes of the ArrayBuffer, or `null` if the ArrayBuffer is empty or cannot be converted to bytes.
     */
    static fromArrayBuffer(arrayBuffer: ArrayBuffer): Data | null
    /**
     * Create a new Data instance from a Uint8Array.
     * @param byteArray The Uint8Array to convert to Data.
     * @returns Returns a new Data instance containing the bytes of the Uint8Array, or `null` if the Uint8Array is empty or cannot be converted to bytes.
     */
    static fromUint8Array(byteArray: Uint8Array): Data | null
    /**
     * Create a new Data instance from a base64 encoded string.
     * @param base64Encoded The base64 encoded string to convert to Data.
     * @returns Returns a new Data instance containing the bytes of the base64 encoded string, or `null` if the string is empty or cannot be converted to bytes.
     */
    static fromBase64String(base64Encoded: string): Data | null
    /**
     * Create a new Data instance from a hex encoded string.
     * @param hexEncoded The hex encoded string to convert to Data.
     * @returns Returns a new Data instance containing the bytes of the hex encoded string, or `null` if the string is empty or cannot be converted to bytes.
     */
    static fromHexString(hexEncoded: string): Data | null
    /**
     * Create a new Data instance from an image.
     * @param image The image to convert to Data.
     * @param compressionQuality The compression quality of the image, defaults to 1.0 (highest quality). This parameter is only used for JPEG images.
     * @returns Returns a new Data instance containing the bytes of the image, or `null` if the image is empty or cannot be converted to bytes.
     */
    static fromJPEG(image: UIImage, compressionQuality?: number): Data | null
    /**
     * Create a new Data instance from a PNG image.
     * @param image The image to convert to Data.
     * @returns Returns a new Data instance containing the bytes of the PNG image, or `null` if the image is empty or cannot be converted to bytes.
     */
    static fromPNG(image: UIImage): Data | null
    /**
     * Combine multiple Data instances into a single Data instance.
     * @param dataList A list of Data instances to combine into a single Data instance.
     * @return Returns a new Data instance containing the combined bytes of all Data instances in the list, or `null` if the list is empty or all Data instances are empty.
     */
    static combine(dataList: Data[]): Data
  }

  /**
   * A module for encrypting data using various algorithms.
   */
  namespace Crypto {
    /**
     * Generates a symmetric key for encryption.
     * @param size The size of the symmetric key in bits. Defaults to 256 bits.
     * @returns A Data object containing the generated symmetric key.
     */
    function generateSymmetricKey(size?: number): Data

    /**
     * Encrypts the given data using the MD5 algorithm.
     * @param data The data to encrypt.
     * @returns A Data object containing the encrypted data.
     * @example
     * ```ts
     * const data = Data.fromString("Hello, world!")
     * const result = Crypto.md5(data).toHexString()
     * ```
     */
    function md5(data: Data): Data

    /**
     * Encrypts the given data using the SHA-1 algorithm.
     * @param data The data to encrypt.
     * @returns A Data object containing the encrypted data.
     * @example
     * ```ts
     * const data = Data.fromString("Hello, world!")
     * const result = Crypto.sha1(data).toHexString()
     * ```
     */
    function sha1(data: Data): Data

    /**
     * Encrypts the given data using the SHA-256 algorithm.
     * @param data The data to encrypt.
     * @returns A Data object containing the encrypted data.
     * @example
     * ```ts
     * const data = Data.fromString("Hello, world!")
     * const result = Crypto.sha256(data).toHexString()
     * ```
     */
    function sha256(data: Data): Data

    /**
     * Encrypts the given data using the SHA-384 algorithm.
     * @param data The data to encrypt.
     * @returns A Data object containing the encrypted data.
     * @example
     * ```ts
     * const data = Data.fromString("Hello, world!")
     * const result = Crypto.sha384(data).toHexString()
     * ```
     */
    function sha384(data: Data): Data

    /**
     * Encrypts the given data using the SHA-512 algorithm.
     * @param data The data to encrypt.
     * @returns A Data object containing the encrypted data.
     */
    function sha512(data: Data): Data

    /**
     * Encrypts the given data using the HMAC-MD5 algorithm with the specified key.
     * @param data The data to encrypt.
     * @param key The key to use for encryption.
     * @return A Data object containing the encrypted data.
     * @example
     * ```ts
     * const data = Data.fromString("Hello, world!")
     * const key = Crypto.generateSymmetricKey(256)
     * const result = Crypto.hmacMD5(data, key).toHexString()
     * ```
     */
    function hmacMD5(data: Data, key: Data): Data

    /**
     * Encrypts the given data using the HMAC-SHA1 algorithm with the specified key.
     * @param data The data to encrypt.
     * @param key The key to use for encryption.
     * @return A Data object containing the encrypted data.
     */
    function hmacSHA1(data: Data, key: Data): Data

    /**
     * Encrypts the given data using the HMAC-SHA224 algorithm with the specified key.
     * @param data The data to encrypt.
     * @param key The key to use for encryption.
     * @return A Data object containing the encrypted data.
     */
    function hmacSHA224(data: Data, key: Data): Data

    /**
     * Encrypts the given data using the HMAC-SHA256 algorithm with the specified key.
     * @param data The data to encrypt.
     * @param key The key to use for encryption.
     * @return A Data object containing the encrypted data.
     */
    function hmacSHA256(data: Data, key: Data): Data

    /**
     * Encrypts the given data using the HMAC-SHA384 algorithm with the specified key.
     * @param data The data to encrypt.
     * @param key The key to use for encryption.
     * @return A Data object containing the encrypted data.
     */
    function hmacSHA384(data: Data, key: Data): Data

    /**
     * Encrypts the given data using the HMAC-SHA512 algorithm with the specified key.
     * @param data The data to encrypt.
     * @param key The key to use for encryption.
     * @return A Data object containing the encrypted data.
     */
    function hmacSHA512(data: Data, key: Data): Data

    /**
     * Encrypts the given data using the AES-GCM algorithm with the specified key.
     * @param data The data to encrypt.
     * @param key The key to use for encryption.
     * @param options Optional parameters for encryption, such as initialization vector (iv) and additional authenticated data (aad).
     * @returns A Data object containing the encrypted data, or null if encryption fails.
     */
    function encryptAESGCM(data: Data, key: Data, options?: {
      iv?: Data
      aad?: Data
    }): Data | null

    /**
     * Decrypts the given data using the AES-GCM algorithm with the specified key.
     * @param data The data to decrypt.
     * @param key The key to use for decryption.
     * @param aad Optional additional authenticated data (aad) used during encryption.
     * @returns A Data object containing the decrypted data, or null if decryption fails.
     */
    function decryptAESGCM(data: Data, key: Data, aad?: Data): Data | null
  }

  /**
   * A module for generating UUID string.
   */
  namespace UUID {
    /**
     * Generate a UUID string.
     */
    function string(): string
  }

  /**
   * A class for creating UIImageSymbolConfiguration instances.
   * These instances can be used to configure the appearance of a symbol image.
   */
  class UIImageSymbolConfiguration {
    static preferringMonochrome(): UIImageSymbolConfiguration
    static preferringMulticolor(): UIImageSymbolConfiguration
    static scale(value: "default" | "large" | "medium" | "small" | "unspecified"): UIImageSymbolConfiguration
    static weight(value: "ultraLight" | "thin" | "light" | "regular" | "medium" | "semibold" | "bold" | "heavy" | "black"): UIImageSymbolConfiguration
    static pointSize(value: number): UIImageSymbolConfiguration
    static paletteColors(value: Color[]): UIImageSymbolConfiguration
    static hierarchicalColor(value: Color): UIImageSymbolConfiguration
    static variableValueMode(value: "automatic" | "color" | "draw"): UIImageSymbolConfiguration
    static colorRenderingMode(value: "automatic" | "flat" | "gradient"): UIImageSymbolConfiguration
    static locale(identifier: string): UIImageSymbolConfiguration
  }

  /**
   * UIImage instance for displaying or saving an Image.
   */
  class UIImage {
    /**
     * The width of the image.
     */
    readonly width: number
    /**
     * The height of the image.
     */
    readonly height: number
    /**
     * The scale of the image.
     */
    readonly scale: number
    /**
     * The orientation of the image.
     */
    readonly imageOrientation: "up" | "down" | "left" | "right" | "upMirrored" | "downMirrored" | "leftMirrored" | "rightMirrored" | "unknown"
    /**
     * Whether the image is a SFSymbol image.
     */
    readonly isSymbolImage: boolean
    /**
     * The rendering mode of the image.
     */
    readonly renderingMode: "automatic" | "alwaysOriginal" | "alwaysTemplate" | "unknown"
    /**
     * The resizing mode of the image.
     */
    readonly resizingMode: "tile" | "stretch" | "unknown"
    /**
     * The cap insets of the image.
     */
    readonly capInsets: {
      top: number
      left: number
      bottom: number
      right: number
    }
    /**
     * Whether the image is flipped for right-to-left layout direction.
     */
    readonly flipsForRightToLeftLayoutDirection: boolean

    /**
     * Creates a thumbnail of the image with the specified size.
     * @param size The size of the thumbnail.
     * @param size.width The width of the thumbnail.
     * @param size.height The height of the thumbnail.
     * @returns A new UIImage instance representing the thumbnail, or null if the thumbnail cannot be created.
     */
    preparingThumbnail(size: Size): UIImage | null

    /**
     * Returns a new version of the image with the specified baseline offset. This is useful for aligning text to the bottom of an image.
     * @param fromBottom The baseline offset from the bottom of the image.
     * @returns A new UIImage instance with the specified baseline offset.
     */
    withBaselineOffset(fromBottom: number): UIImage

    /**
     * Flips the orientation of the image horizontally.
     * @returns A new UIImage instance with horizontally flipped orientation.
     */
    withHorizontallyFlippedOrientation(): UIImage

    /**
     * Returns a new version of the image with a tint color that uses the specified rendering mode.
     * @param color The tint color to apply to the image.
     * @param renderingMode The rendering mode to use when applying the tint color. The default value is "automatic".
     */
    withTintColor(color: Color, renderingMode?: "automatic" | "alwaysOriginal" | "alwaysTemplate"): UIImage | null

    /**
     * Returns a new version of the image with the specified rendering mode.
     */
    withRenderingMode(renderingMode: "automatic" | "alwaysOriginal" | "alwaysTemplate"): UIImage | null

    /**
     * Returns a new version of the image with the specified cap insets and resizing mode.
     * @param capInsets The cap insets to apply to the image.
     * @param resizingMode The resizing mode to use when applying the cap insets. The default value is "tile".
     */
    resizableImage(capInsets: {
      top: number
      left: number
      bottom: number
      right: number
    }, resizingMode?: "tile" | "stretch"): UIImage | null

    /**
     * Returns a new version of the image rendered in a circle with the specified radius and fitEntireImage flag.
     * @param radius The radius of the circle in points. If this parameter is not specified, the circle will use the shortest dimension of the image when fitEntireImage is false, or the longest dimension of the image when fitEntireImage is true.
     * @param fitEntireImage Whether to fit the entire image inside the circle. The default value is true.
     */
    renderedInCircle(radius?: number | null, fitEntireImage?: boolean): UIImage

    /**
     * Returns a new version of the image rendered in a rectangle with the specified size, source point, and source size.
     * @param size The size of the rectangle in points.
     * @param source The source point and source size of the image.
     * @param source.position The source point of the image.
     * @param source.size The source size of the image.
     * @returns A new version of the image rendered in a rectangle with the specified size, source point, and source size, or null if the rendering fails.
     */
    renderedIn(
      size: {
        width: number
        height: number
      },
      source?: {
        position?: {
          x: number
          y: number
        } | null
        size?: {
          width: number
          height: number
        } | null
      }
    ): UIImage | null

    /**
     * Returns a new version of the image with the specified symbol configuration.
     * @param config The symbol configuration to apply to the image. If this parameter is an array, all configurations in the array will be applied to the image.
     */
    applySymbolConfiguration(config: UIImageSymbolConfiguration | UIImageSymbolConfiguration[]): UIImage | null

    /**
     * Converts the image to JPEG data.
     * @param compressionQuality The compression quality of the JPEG image. The value should be between 0 and 1. The default value is 1.
     * @returns The JPEG data, or null if the conversion fails.
     */
    toJPEGData(compressionQuality?: number): Data | null
    /**
     * Converts the image to PNG data.
     * @returns The PNG data, or null if the conversion fails.
     */
    toPNGData(): Data | null
    /**
     * Converts the image to a JPEG base64 string.
     * @param compressionQuality The compression quality of the JPEG image. The value should be between 0 and 1. The default value is 1.
     * @returns The JPEG base64 string, or null if the conversion fails.
     */
    toJPEGBase64String(compressionQuality?: number): string | null
    /**
     * Converts the image to a PNG base64 string.
     * @returns The PNG base64 string, or null if the conversion fails.
     */
    toPNGBase64String(): string | null
    /**
     * Create a new UIImage instance from a Data instance.
     * @param data The Data instance to convert to UIImage.
     * @param scale The scale factor to apply to the image. The default value is 1.
     * @returns A new UIImage instance, or null if the Data instance cannot be converted to an image.
     */
    static fromData(data: Data, scale?: number): UIImage | null
    /**
     * Create a new UIImage instance from a file path.
     * @param filePath The file path to the image file.
     * @returns A new UIImage instance, or null if the file does not exist or cannot be read.
     */
    static fromFile(filePath: string): UIImage | null
    /**
     * Create a new UIImage instance from a base64 string.
     * @param base64String The base64 string to convert to UIImage.
     * @returns A new UIImage instance, or null if the base64 string is empty or cannot be converted to an image.
     */
    static fromBase64String(base64String: string): UIImage | null
    /**
     * Create a new UIImage instance from an SFSymbol.
     * @param name The name of the SFSymbol.
     * @returns A new UIImage instance, or null if the SFSymbol is not found.
     */
    static fromSFSymbol(name: string): UIImage | null
    /**
     * Create a new UIImage instance from a network URL.
     * @param url The URL to fetch the image from.
     * @returns A new UIImage instance, or null if the URL is invalid or cannot be fetched.
     * @throws An error if the URL is invalid or cannot be fetched.
     */
    static fromURL(url: string): Promise<UIImage | null>
  }

  /**
   * Read and set the clipboard
   *
   * If you want to quickly paste text from other apps, you can go to
   * **Settings > Scripting > Paste from Other Apps > Allow**
   * 
   * @deprecated
   * Use `Pasteboard` instead
   */
  namespace Clipboard {
    /**
     * Copy text to clipboard.
     * @param text Text content
     * @deprecated
     * Use `Pasteboard.setString` instead
     */
    function copyText(text: string): Promise<void>
    /**
     * Get text form clipboard.
     * @returns Text content string or null
     * @deprecated
     * Use `Pasteboard.getString` instead
     */
    function getText(): Promise<string | null>
  }

  /**
   * Read and set the Pasteboard
   *
   * If you want to quickly paste text from other apps, you can go to
   * **Settings > Scripting > Paste from Other Apps > Allow**
   */
  namespace Pasteboard {

    /**
     * A pasteboard item is a map of UTType to string, UIImage, or Data.
     * You should use the correct UTType for each value.
     */
    type Item = Record<UTType, string | UIImage | Data>

    /**
     * The callback function that is called when the pasteboard changes, the argument is an array of the added representation types
     */
    var onChanged: ((addedKeys: string[]) => void) | null | undefined
    /**
     * The callback function that is called when the pasteboard changes, the argument is an array of the removed representation types
     */
    var onRemoved: ((removedKeys: string[]) => void) | null | undefined

    /**
     * The number of times the pasteboard’s contents change.
     */
    const changeCount: Promise<number>

    /**
     * Check if the pasteboard contains text.
     */
    const hasStrings: Promise<boolean>
    /**
     * Check if the pasteboard contains images.
     */
    const hasImages: Promise<boolean>
    /**
     * Check if the pasteboard contains URLs.
     */
    const hasURLs: Promise<boolean>
    /**
     * Get the number of items in the pasteboard.
     */
    const numberOfItems: Promise<number>
    /**
     * The string value of the first pasteboard item.
     */
    function getString(): Promise<string | null>
    /**
     * Set the string value of the first pasteboard item.
     */
    function setString(string: string | null): Promise<void>
    /**
     * An array of strings in all pasteboard items.
     */
    function getStrings(): Promise<string[] | null>
    /**
     * Set the string values of all pasteboard items.
     */
    function setStrings(strings: string[] | null): Promise<void>
    /**
     * The URL string of the first pasteboard item.
     */
    function getURL(): Promise<string | null>
    /**
     * Set the URL string of the first pasteboard item.
     */
    function setURL(url: string | null): Promise<void>
    /**
     * An array of URL strings in all pasteboard items.
     */
    function getURLs(): Promise<string[] | null>
    /**
     * Set the URL strings of all pasteboard items.
     */
    function setURLs(urls: string[] | null): Promise<void>
    /**
     * The image of the first pasteboard item.
     */
    function getImage(): Promise<UIImage | null>
    /**
     * Set the image of the first pasteboard item.
     */
    function setImage(image: UIImage | null): Promise<void>
    /**
     * An array of images in all pasteboard items.
     */
    function getImages(): Promise<UIImage[] | null>
    /**
     * Set the images of all pasteboard items.
     */
    function setImages(images: UIImage[] | null): Promise<void>
    /**
     * Appends pasteboard items to the current contents of the pasteboard.
     */
    function addItems(items: Item[]): Promise<void>
    /**
     * Adds an array of items to a pasteboard, and sets privacy options for all the items on the pasteboard.
     * @param items An array of pasteboard items
     * @param options Optional privacy options
     * @param options.localOnly If true, the pasteboard items should not be available to other devices through the Handoff feature.
     * @param options.expirationDate A Date value that specifies the time and date that you want the system to remove the pasteboard items from the pasteboard.
     */
    function setItems(items: Item[], options?: {
      localOnly?: boolean
      expirationDate?: Date
    }): Promise<void>
    /**
     * Get all pasteboard items.
     */
    function getItems(): Promise<Item[] | null>
  }

  /**
   * Present a website either in-app or leaving the app and opening the system default browser.
   */
  namespace Safari {
    /**
     * Open a website in the system default browser.
     * @param url URL of website to present.
     */
    function openURL(url: string): Promise<boolean>
    /**
     * Present a website in-app using Safari browser.
     * @param url URL of website to present.
     * @param fullscreen Whether to present the website in fullscreen. Defaults to true.
     */
    function present(url: string, fullscreen?: boolean): Promise<void>
  }

  type LocalAuthBiometryType = "faceID" | 'touchID' | 'opticID' | 'none' | 'unknown'

  /**
   * This interface provides authentication with biometrics such as fingerprint or facial recognition.
   */
  namespace LocalAuth {
    /**
     * Check whether authentication can proceed for any policies.
     */
    const isAvailable: boolean
    /**
     * Check whether authentication can proceed for any biometry policies.
     */
    const isBiometricsAvailable: boolean
    /**
     * The type of biometric authentication supported by the device.
     */
    const biometryType: LocalAuthBiometryType
    /**
     * Authenticates the user with biometrics available on the device.
     * Returns true if the user successfully authenticated, false otherwise.
     *
     * @param reason The message to show to user while prompting them for authentication. This is typically along the lines of: `'Authenticate to access MyScript.'`. This must not be empty.
     * @param useBiometrics If specify true, will authenticate a user with biometry, otherwise authenticate a user in iOS with either biometrics or a passcode, in watchOS with a passcode, or in macOS with Touch ID, Apple Watch, or the user’s password. Defaults to true.
     */
    function authenticate(reason: string, useBiometrics?: boolean): Promise<boolean>
  }

  /**
   * Create previews of texts, images or files to use inside your script.
   */
  namespace QuickLook {
    /**
     * Displays a preview of a text string. `fullscreen` defaults to false. The promise will be resolved after the preview is dismissed.
     */
    function previewText(text: string, fullscreen?: boolean): Promise<void>
    /**
     * Displays a preview of an image. `fullscreen` defaults to false. The promise will be resolved after the preview is dismissed.
     */
    function previewImage(image: UIImage, fullscreen?: boolean): Promise<void>
    /**
     * Displays a preview of one or more files located at the given file URL strings. `fullscreen` defaults to false. The promise will be resolved after the preview is dismissed.
     */
    function previewURLs(urls: string[], fullscreen?: boolean): Promise<void>
  }

  /**
   * This interface provides some shortcut methods for displaying dialog boxes.
   */
  namespace Dialog {
    /**
     * Display an Alert UI.
     */
    function alert(message: string): Promise<void>
    function alert(options: {
      /** The message of the alert. */
      message: string
      /** The title of the alert. */
      title?: string
      /** Set the button label you want. */
      buttonLabel?: string
    }): Promise<void>
    /**
     * Display an Confirm modal, return a promise that will resolve a boolean value that indicate whether the user confirm or not.
     */
    function confirm(message: string): Promise<boolean>
    function confirm(options: {
      /**
       * The message of the confirm.
       */
      message: string
      /**
       * The title of the confirm.
       */
      title?: string
      /**
       * The label of the cancel button.
       */
      cancelLabel?: string
      /**
       * The label of the confirm button.
       */
      confirmLabel?: string
    }): Promise<boolean>
    /**
     * Display a Prompt UI. Returns string result or null.
     */
    function prompt(message: string): Promise<string | null>
    function prompt(options: {
      /** You need to provide a title to describe the purpose */
      title: string
      /** A supporting information */
      message?: string
      /** The default value for the `TextField` */
      defaultValue?: string
      /** Whether to use obscure text */
      obscureText?: boolean
      /** Whether the value of the `TextField` is selected */
      selectAll?: boolean
      /** The placeholder text for the `TextField` */
      placeholder?: string
      /** The cancel button label */
      cancelLabel?: string
      /** The confirm button label */
      confirmLabel?: string
      /** You can specify the type of keyboard to invoke */
      keyboardType?: KeyboardType
    }): Promise<string | null>
    /**
     * Display an action sheet with multiple content options. When the user clicks an item, the index of the item will be returned. If the user clicks Cancel, null will be returned.
     * @param options
     * @param options.title You can set a top title.
     * @param options.message You can set a tip message.
     * @param options.cancelButton You can control whether to show the cancel button, defaults to `true`.
     * @param options.actions The actions of the UI.
     * @returns When the user clicks an item, the index of the item will be returned. If the user clicks Cancel, null will be returned.
     *
     * @example
     * ```ts
     * const index = await Dialog.actionSheet({
     *   title: 'Do you want to delete this image?',
     *   actions: [{
     *     label: 'Delete',
     *     destructive: true,
     *   }]
     * })
     *
     * if (index == null) {
     *   // User canceled.
     * } else if (index === 0) {
     *   // User tap the `delete` action.
     * }
     * ```
     */
    function actionSheet(options: {
      title: string
      message?: string
      cancelButton?: boolean
      actions: {
        /**
         * The label of the sheet action.
         */
        label: string
        /**
         * Set whether it is a destructive action, which will be visually different from a normal action.
         */
        destructive?: boolean
      }[]
    }): Promise<number | null>
  }

  /**
   * The interface to store data in Keychain.
   */
  namespace Keychain {
    /**
     * Encrypts and saves the `key` with the given `value`.
     *
     * If the key was already in the storage, its associated value is changed.
     */
    function set(key: string, value: string, options?: {
      /**
       * A key with a value that indicates when the keychain item is accessible. Defaults to 'unlocked'.
       */
      accessibility?: KeychainAccessibility
      /**
       * A key with a boolean value that indicates whether the item synchronizes through iCloud. Defaults to false.
       */
      synchronizable?: boolean
    }): boolean

    function setBool(key: string, value: boolean, options?: {
      /**
       * A key with a value that indicates when the keychain item is accessible. Defaults to 'unlocked'.
       */
      accessibility?: KeychainAccessibility
      /**
       * A key with a boolean value that indicates whether the item synchronizes through iCloud. Defaults to false.
       */
      synchronizable?: boolean
    }): boolean
    function setData(key: string, value: Data, options?: {
      /**
       * A key with a value that indicates when the keychain item is accessible. Defaults to 'unlocked'.
       */
      accessibility?: KeychainAccessibility
      /**
       * A key with a boolean value that indicates whether the item synchronizes through iCloud. Defaults to false.
       */
      synchronizable?: boolean
    }): boolean
    /**
     * Decrypts and returns the value for the given `key` or `null` if `key` is not in the storage.
     */
    function get(key: string, options?: {
      /**
       * A key with a boolean value that indicates whether the item synchronizes through iCloud. Defaults to false.
       */
      synchronizable?: boolean
    }): string | null
    function getBool(key: string, options?: {
      /**
       * A key with a boolean value that indicates whether the item synchronizes through iCloud. Defaults to false.
       */
      synchronizable?: boolean
    }): boolean | null
    function getData(key: string, options?: {
      /**
       * A key with a boolean value that indicates whether the item synchronizes through iCloud. Defaults to false.
       */
      synchronizable?: boolean
    }): Data | null
    /**
     * Deletes associated value for the given `key`.
     *
     * If the given `key` does not exist, nothing will happen.
     */
    function remove(key: string, options?: {
      /**
       * A key with a boolean value that indicates whether the item synchronizes through iCloud. Defaults to false.
       */
      synchronizable?: boolean
    }): boolean
    /**
     * Returns true if the storage contains the given `key`.
     */
    function contains(key: string, options?: {
      /**
       * A key with a boolean value that indicates whether the item synchronizes through iCloud. Defaults to false.
       */
      synchronizable?: boolean
    }): boolean
    function keys(options?: {
      /**
       * A key with a boolean value that indicates whether the item synchronizes through iCloud. Defaults to false.
       */
      synchronizable?: boolean
    }): string[]
    function clear(options?: {
      /**
       * A key with a boolean value that indicates whether the item synchronizes through iCloud. Defaults to false.
       */
      synchronizable?: boolean
    }): boolean
  }

  type KeychainOptions = {
    /**
     * A key with a value that indicates when the keychain item is accessible.
     */
    accessibility?: KeychainAccessibility
    /**
     * A key with a boolean value that indicates whether the item synchronizes through iCloud.
     */
    synchronizable?: boolean
  }
  /**
  *  - `passcode`: The data in the keychain can only be accessed when the device is unlocked. Only available if a passcode is set on the device. Items with this attribute do not migrate to a new device.
  *  - `unlocked`: The data in the keychain item can be accessed only while the device is unlocked by the user.
  *  - `unlocked_this_device`: The data in the keychain item can be accessed only while the device is unlocked by the user. Items with this attribute do not migrate to a new device.
  *  - `first_unlock`: The data in the keychain item cannot be accessed after a restart until the device has been unlocked once by the user.
  *  - `first_unlock_this_device`: The data in the keychain item cannot be accessed after a restart until the device has been unlocked once by the user. Items with this attribute do not migrate to a new device.
  */
  type KeychainAccessibility = 'passcode' | 'unlocked' | 'unlocked_this_device' | 'first_unlock' | 'first_unlock_this_device'

  /**
   * Haptic feedback provides a tactile response, such as a tap, that draws attention and reinforces both actions and events.
   */
  namespace HapticFeedback {
    /**
     * Invoke a brief vibration.
     */
    function vibrate(): void
    /**
     * A collision between small, light user interface elements.
     */
    function lightImpact(): void
    /**
     * A collision between moderately sized user interface elements.
     */
    function mediumImpact(): void
    /**
     * A collision between large, heavy user interface elements.
     */
    function heavyImpact(): void
    /**
     * A collision between user interface elements that are soft, exhibiting a large amount of compression or elasticity.
     */
    function softImpact(): void
    /**
     * A collision between user interface elements that are rigid, exhibiting a small amount of compression or elasticity.
     */
    function rigidImpact(): void
    /**
     * Triggers selection feedback. This method tells the generator that the user has changed a selection. In response, the generator may play the appropriate haptics. Don’t use this feedback when the user makes or confirms a selection; use it only when the selection changes.
     */
    function selection(): void
    /**
     * A notification feedback type that indicates a task has completed successfully.
     */
    function notificationSuccess(): void
    /**
     * A notification feedback type that indicates a task has failed.
     */
    function notificationError(): void
    /**
     * A notification feedback type that indicates a task has produced a warning.
     */
    function notificationWarning(): void
  }

  /**
   * The accuracy of a geographical coordinate.
   */
  type LocationAccuracy = "best" | "tenMeters" | "hundredMeters" | "kilometer" | "threeKilometers"
  type LocationInfo = {
    /**
     * The latitude in degrees.
     */
    latitude: number
    /**
     * The longitude in degrees.
     */
    longitude: number
    /**
     * Timestamp in milliseconds
     */
    timestamp: number
  }
  /**
   * A user-friendly description of a geographic coordinate, often containing the name of the place, its address, and other relevant information.
   */
  type LocationPlacemark = {
    location?: LocationInfo
    region?: string
    timeZone?: string
    name?: string
    /**
     * The street address associated with the placemark.
     */
    thoroughfare?: string
    /**
     * Additional street-level information for the placemark.
     */
    subThoroughfare?: string
    /**
     * The city associated with the placemark.
     */
    locality?: string
    /**
     * Additional city-level information for the placemark.
     */
    subLocality?: string
    /**
     * The state or province associated with the placemark.
     */
    administrativeArea?: string
    /**
     * Additional administrative area information for the placemark.
     */
    subAdministrativeArea?: string
    /**
     * The postal code associated with the placemark.
     */
    postalCode?: string
    /**
     * The abbreviated country or region name.
     */
    isoCountryCode?: string
    /**
     * The name of the country or region associated with the placemark.
     */
    country?: string
    /**
     * The name of the inland water body associated with the placemark.
     */
    inlandWater?: string
    /**
     * The name of the ocean associated with the placemark.
     */
    ocean?: string
    /**
     * The relevant areas of interest associated with the placemark.
     */
    areasOfInterest?: string[]
  }

  /**
   * Getting the current location of your device.
   */
  namespace Location {

    /**
     * A Boolean value that indicates whether a widget is eligible to receive location updates.
     */
    const isAuthorizedForWidgetUpdates: Promise<boolean>

    /**
     * Set the accuracy of the location data that your app wants to receive.
     */
    function setAccuracy(accuracy: LocationAccuracy): Promise<void>
    /**
     * Requests the current location.
     * 
     * By default, if a cached location is available, it will be returned immediately.
     * If no cached location exists, a new location request will be made.
     * 
     * @param options.forceRequest If `true`, ignores any cached location and always requests a new location before returning. Default is `false`.
     * 
     * @returns A promise that resolves to the current location object.
     */
    function requestCurrent(options?: { forceRequest?: boolean }): Promise<LocationInfo | null>
    /**
     * Pick a location from the iOS built-in map.
     */
    function pickFromMap(): Promise<LocationInfo | null>
    /**
     * Submits a reverse-geocoding request for the specified location and locale.
     */
    function reverseGeocode(options: {
      /**
       * The latitude in degrees.
       */
      latitude: number
      /**
       * The longitude in degrees.
       */
      longitude: number
      /**
       * The locale to use when returning the address information. You might specify a value for this parameter when you want the address returned in a locale that differs from the user’s current language settings. Specify null to use the user’s default locale information.
       */
      locale?: string
    }): Promise<LocationPlacemark[] | null>
  }

  /**
   * The result of calling the POSIX `stat()` function on a file system object.
   */
  type FileStat = {
    creationDate: number
    /**
     * The time of the last change to the data of the file system object.
     */
    modificationDate: number
    /**
     * The type of the underlying file system object.
     *  - `"file"`
     *  - `"directory"`
     *  - `"link"`
     *  - `"unixDomainSock"`
     *  - `"pipe"`
     *  - `"notFound"`,
     */
    type: string
    size: number
  }
  /**
   * A convenient interface to the contents of the file system, and the primary means of interacting with it.
   */
  namespace FileManager {
    /**
     * Directory where scripts are stored.
     */
    const scriptsDirectory: string
    /**
     * Wether the iCloud is enabled.
     * If you are not logged into iCloud, or have not authorized the Scripting app to use iCloud features,
     * this method will return false.
     */
    const isiCloudEnabled: boolean
    /**
     * Returns the path to iCloud's `Documents` directory, if iCloud is disabled,
     * this method would throw an error, you should use `isiCloudEnabled` to check it.
     */
    const iCloudDocumentsDirectory: string
    /**
     * Returns a boolean value indicating whether the file is targeted for storage in iCloud.
     * @param filePath The path of the file
     */
    function isFileStoredIniCloud(filePath: string): boolean
    /**
     * Returns a boolean value indicating whether the file is downloaded from iCloud.
     * @param filePath  The path of the file
     */
    function isiCloudFileDownloaded(filePath: string): boolean
    /**
     * Download a iCloud file.
     * @param filePath The path of the file
     * @returns Returns a boolean value indicating whether the file was downloaded successful.
     */
    function downloadFileFromiCloud(filePath: string): Promise<boolean>
    /**
     * Returns the path to shared `App Group Documents` directory.
     * Files stored in this directory will not appear in the Files app,
     * but the script running in Widget can access these files.
     */
    const appGroupDocumentsDirectory: string
    /**
     * Returns the path to `Documents` directory, documents stored in ths directory can be
     * accessed using Files app, the script running in Widget cannot access these files.
     */
    const documentsDirectory: string
    /**
     * Returns the path to the temporary directory.
     */
    const temporaryDirectory: string
    /**
     * Returns the mime type of the file.
     * @param path The path of the file
     */
    function mimeType(path: string): string
    /**
     * Returns destination of a symbolic link.
     * @param path The path of the symbolic link
     */
    function destinationOfSymbolicLink(path: string): string
    /**
     * Generates a shareable URL for an iCloud file, allowing users to download the file. You need to use `try-catch` to handle the situation where this method call fails.
     * @param path The file path of the item in the cloud that you want to share. The path must be prefixed with the base path `FileManager.iCloudDocumentsDirectory` that corresponds to the item’s location. The file must be a flat file, not a bundle. The file at the specified path must already be uploaded to iCloud when you call this method.
     * @param expiration The expiration timestamp, you may ignore this parameter if you are not interested in the expiration date.
     */
    function getShareUrlOfiCloudFile(path: string, expiration?: number): string
    /**
     * Creates a directory at the specified path string.
     * @param path The path of the directory.
     * @param recursive If `true`, this method creates any nonexistent parent directories as part of creating the directory in path. If `false`, this method fails if any of the intermediate parent directories does not exist.
     */
    function createDirectory(path: string, recursive?: boolean): Promise<void>
    function createDirectorySync(path: string, recursive?: boolean): void
    /**
     * Creates a symbolic link at the specified path that points to an item at the given path.
     * @param path The file path at which to create the new symbolic link. The last path component of the path issued as the name of the link.
     * @param target The file path that contains the item to be pointed to by the link. In other words, this is the destination of the link.
     */
    function createLink(path: string, target: string): Promise<void>
    function createLinkSync(path: string, target: string): void
    /**
     * Copies the item at the specified path to a new location synchronously.
     * @param path The path to the file or directory you want to move.
     * @param newPath The path at which to place the copy of `path`. This path must include the name of the file or directory in its new location.
     */
    function copyFile(path: string, newPath: string): Promise<void>
    function copyFileSync(path: string, newPath: string): void
    /**
     * Performs a shallow search of the specified directory and returns the paths of any contained items.
     * Optionally recurses into sub-directories.
     * @param path The path to the directory whose contents you want to enumerate.
     * @param recursive Whether recurses into sub-directories.
     * @returns The result is a list of string for the directories, files, and links.
     */
    function readDirectory(path: string, recursive?: boolean): Promise<string[]>
    function readDirectorySync(path: string, recursive?: boolean): string[]
    /**
     * Returns a boolean value that indicates whether a file or directory exists at a specified path.
     * @param path The path of the file or directory
     */
    function exists(path: string): Promise<boolean>
    function existsSync(path: string): boolean
    /**
     * Add a bookmark for a file or folder. This is useful when you obtain a security-scoped file or folder path, such as a file obtained from the user via the `Photos` or `onDropContent` APIs.
     * @param path The path of the file or folder
     * @param name The name of the bookmark, you can specify a name for the bookmark, or it will be generated automatically
     * @returns The name of the bookmark or `null` if the bookmark is not created.
     */
    function addFileBookmark(path: string, name?: string): string | null
    /**
     * Remove a bookmark for a file or folder. This is useful when you have access to a security-scoped file or folder, and no longer need to access it.
     * @param name The name of the bookmark
     * @returns Returns a boolean value indicates that whether the operation is successful
     */
    function removeFileBookmark(name: string): boolean
    /**
     * Get path to a bookmarked file or folder.
     * @param name Name of a bookmark.
     */
    function bookmarkExists(name: string): boolean
    /**
     * Get all file bookmarks. File bookmarks are used to bookmark a file or a folder and read or write to it late in your script.
     * They can be created from File Bookmarks tool, they also were automatic created by Intent for Shortcuts app or Share Sheet.
     */
    function getAllFileBookmarks(): Array<{
      /**
       * Name of the bookmark.
       */
      name: string
      /**
       * The path of the bookmarked file or folder.
       */
      path: string
    }>
    /**
     * Try to get the path of a bookmarked file or folder by a given name, if the bookmark of the name is not exists, returns `null`.
     * @param name Name of a bookmark.
     */
    function bookmarkedPath(name: string): string | null
    /**
     * Whether path refers to a file.
     */
    function isFile(path: string): Promise<boolean>
    function isFileSync(path: string): boolean
    /**
     * Whether path refers to a directory.
     */
    function isDirectory(path: string): Promise<boolean>
    function isDirectorySync(path: string): boolean
    function isLink(path: string): Promise<boolean>
    function isLinkSync(path: string): boolean

    function isBinaryFileSync(path: string): boolean
    function isBinaryFile(path: string): Promise<boolean>
    /**
     * Reads the entire file contents as a string using the given `Encoding`.
     * @param path The path of the file
     * @param encoding
     * @returns String contents.
     */
    function readAsString(path: string, encoding?: Encoding): Promise<string>
    function readAsStringSync(path: string, encoding?: Encoding): string
    /**
     * Reads the entire file contents as a Uint8Array.
     * @param path The path of the file
     */
    function readAsBytes(path: string): Promise<Uint8Array>
    function readAsBytesSync(path: string): Uint8Array
    /**
     * Reads the entire file contents as a Data object.
     * @param path The path of the file
     */
    function readAsData(path: string): Promise<Data>
    function readAsDataSync(path: string): Data
    /**
     * Writes a string to a file.
     * @param path The path of the file
     * @param contents String contents.
     * @param encoding
     */
    function writeAsString(path: string, contents: string, encoding?: Encoding): Promise<void>
    function writeAsStringSync(path: string, contents: string, encoding?: Encoding): void
    /**
     *  Writes a Uint8Array data to a file.
     * @param path The path of the file
     * @param data A `Uint8Array` object.
     */
    function writeAsBytes(path: string, data: Uint8Array): Promise<void>
    function writeAsBytesSync(path: string, data: Uint8Array): void
    /**
     *  Writes the data to a file.
     * @param path The path of the file
     * @param data A `Data` object.
     */
    function writeAsData(path: string, data: Data): Promise<void>
    function writeAsDataSync(path: string, data: Data): void

    /**
     * Append the given text to a file at the specified file path, creating the file and its directory if they do not already exist. 
     * @param path The file path where the text should be appended.
     * @param text The text content to append.
     * @param encoding The string encoding used to convert `text` into `Data`. Defaults to `.utf8`.
     * @returns A promise that resolve after the operation is successful.
     */
    function appendText(path: string, text: string, encoding?: Encoding): Promise<void>
    function appendTextSync(path: string, text: string, encoding?: Encoding): void

    /**
     * Append the given data to a file at the specified file path, creating the file and its directory if they do not already exist. 
     * @param path The file path where the data should be appended.
     * @param data The data to append.
     * @returns A promise that resolve after the operation is successful.
     */
    function appendData(path: string, data: Data): Promise<void>
    function appendDataSync(path: string, data: Data): void

    /**
     * If `path` is a symbolic link then it is resolved and results for the resulting file are returned.
     * @param path
     * @returns FileStat object
     */
    function stat(path: string): Promise<FileStat>
    function statSync(path: string): FileStat
    /**
     * Moves the file or directory at the specified path to a new location synchronously.
     * @param path The path to the file or directory you want to move.
     * @param newPath The new path for the item in `path`. This path must include the name of the file or directory in its new location.
     */
    function rename(path: string, newPath: string): Promise<void>
    function renameSync(path: string, newPath: string): void
    /**
     * Removes the file or directory at the specified path.
     * @param path A path string indicating the file or directory to remove. If the path specifies a directory, the contents of that directory are recursively removed.
     */
    function remove(path: string): Promise<void>
    function removeSync(path: string): void
    /**
     * Zips the file or directory contents at the specified `srcPath` to the `destPath`.
     * `shouldKeepParent` indicates that the directory name of a source item should be used as root element
     * within the archive. Defaults to `true`.
     *
     * @example
     * ```ts
     * const docsDir = FileManager.documentsDirectory
     *
     * // zip a single file
     * await FileManager.zip(
     *   docsDir + '/test.txt',
     *   docsDir + '/test.zip',
     * )
     *
     * // zip a directory
     * await FileManager.zip(
     *   docsDir + '/MyScript',
     *   docsDir + '/MyScript.zip'
     * )
     * ```
     */
    function zip(srcPath: string, destPath: string, shouldKeepParent?: boolean): Promise<void>
    function zipSync(srcPath: string, destPath: string, shouldKeepParent?: boolean): void
    /**
     * Unzips the contents at the specified `srcPath` to the `destPath`.
     *
     * @example
     * ```ts
     * await FileManager.unzip(
     *   Path.join(FileManager.temporaryDirectory, 'MyScript.zip'),
     *   await FileManager.documentsDirectory
     * )
     * ```
     */
    function unzip(srcPath: string, destPath: string): Promise<void>
    function unzipSync(srcPath: string, destPath: string): void
  }


  /**
   * Share activity item. Supports a text or an image.
   */
  type ActivityItem = string | UIImage

  /**
   * You can share data from your script using this interface.
   */
  namespace ShareSheet {
    /**
     * Present a ShareSheet UI.
     * @param items The array of data on which to perform the activity. You can share text, url, or UIImage.
     * @returns Returns a promise, it is fulfilled with a boolean value indicates that whether the share is completed when the sheet is dismissed.
     */
    function present(items: ActivityItem[]): Promise<boolean>
  }

  /**
   * Parse the QR code image file, or open the scan code page to scan.
   */
  namespace QRCode {
    /**
     * Parse QRCode file.
     * @example
     * ```ts
     * const filePath = (await FileManager.documentsDirectory()) + '/qrcode.png'
     * const result = await QRCode.parse(filePath)
     * if (result != null) {
     *   // handle QRCode result
     * }
     * ```
     */
    function parse(filePath: string): Promise<string | null>
    /**
     * Open the QRCode scan page and scan.
     * @example
     * const result = await QRCode.scan()
     * if (result != null) {
     *   // handle result
     * }
     */
    function scan(): Promise<string | null>
  }

  class LivePhoto {
    /**
     * The size of the live photo
     */
    readonly size: Size

    /**
     * Get the resources of the live photo.
     * @returns A promise that resolves to an array of objects containing the data, assetLocalIdentifier, contentType, originalFilename, pixelHeight, and pixelWidth of the live photo.
     */
    getAssetResources(): Promise<{
      data: Data
      assetLocalIdentifier: string
      contentType: UTType
      originalFilename: string
      pixelHeight: number
      pixelWidth: number
    }[]>

    /**
     * Asynchronously loads a Live Photo from the specified resource files.
     * @param options The options for the live photo
     * @param options.imagePath The path to the image file.
     * @param options.videoPath The path to the video file.
     * @param options.targetSize The target size of Live Photo to be returned. Pass null to obtain the requested Live Photo at its original size.
     * @param options.placeholderImage The placeholder image to use while the live photo loads.
     * @param options.contentMode The content mode of the placeholder image.
     * @param options.onResult A callback to be called when image loading is complete, providing the
     * requested Live Photo or information about the status of the request. This callback will be called multiple times.
     * The block takes the following parameters:
     *   - `result`: The requested Live Photo object.
     *   - `info`: A map providing information about the status of the request.
     *     - `error`: An error message, if the request failed.
     *     - `degraded`: A Boolean value indicating whether the live photo is degraded.
     *     - `cancelled`: A Boolean value indicating whether the request was cancelled.
     * @returns Returns a promise that resolves a cancellable function, you can call this function to cancel the loading.
     */
    static from(options: {
      imagePath: string
      videoPath: string
      targetSize?: Size | null
      placeholderImage: UIImage | null
      contentMode?: "aspectFit" | "aspectFill"
      onResult: (result: LivePhoto | null, info: {
        error: string | null
        degraded: boolean | null
        cancelled: boolean | null
      }) => void
    }): Promise<() => void>
  }

  /**
   * The interface that represents a filter that can be applied to the `Photos.pick` method.
   */
  class PHPickerFilter {
    private constructor()

    static bursts(): PHPickerFilter
    static cinematicVideos(): PHPickerFilter
    static depthEffectPhotos(): PHPickerFilter
    static livePhotos(): PHPickerFilter
    static images(): PHPickerFilter
    static panoramas(): PHPickerFilter
    static screenRecordings(): PHPickerFilter
    static screenshots(): PHPickerFilter
    static videos(): PHPickerFilter
    static slomoVideos(): PHPickerFilter
    static timelapseVideos(): PHPickerFilter
    static all(filters: PHPickerFilter[]): PHPickerFilter
    static any(filters: PHPickerFilter[]): PHPickerFilter
    static not(filter: PHPickerFilter): PHPickerFilter
  }

  class PHPickerResult {
    private constructor()

    /**
     * The item provider of the result
     */
    readonly itemProvider: ItemProvider

    /**
     * Reads the result as a live photo, if this result can be read as a live photo, returns a promise that resolves to the live photo, otherwise returns null, or rejects with an error.
     */
    livePhoto(): Promise<LivePhoto | null>

    /**
     * Reads the result as a UIImage, if this result can be read as a UIImage, returns a promise that resolves to the UIImage, otherwise returns null, or rejects with an error.
     */
    uiImage(): Promise<UIImage | null>

    /**
     * Reads the result as an image, if this result can be read as an image, the image will be copy to the app group's sandbox, returns a promise that resolves to the image path, otherwise returns null, or rejects with an error. You should delete the image file when you no longer need it.
     */
    imagePath(): Promise<string | null>

    /**
     * Reads the result as a video, if this result can be read as a video, the video will be copy to the app group's sandbox, returns a promise that resolves to the video path, otherwise returns null, or rejects with an error. You should delete the video file when you no longer need it.
     */
    videoPath(): Promise<string | null>
  }

  /**
   * The interface that manages access and changes to the user’s photo library.
   */
  namespace Photos {

    /**
     * The information about the captured media.
     */
    type CaptureInfo = {
      /**
       * The cropping rectangle that was applied to the original image.
       */
      cropRect: {
        x: number
        y: number
        width: number
        height: number
      } | null
      /**
       * The original image of the captured photo.
       */
      originalImage: UIImage | null
      /**
       * The edited image of the captured photo.
       */
      editedImage: UIImage | null
      /**
       * The image path of the captured photo.
       */
      imagePath: string | null
      /**
       * The metadata of the captured photo.
       */
      mediaMetadata: Record<string, any> | null
      /**
       * The video path of the captured video.
       */
      mediaPath: string | null
      /**
       * The media type of the captured media.
       */
      mediaType: string | null
    }

    /**
     * Get the available media types from the Photos app.
     */
    function availableMediaTypes(): string[] | null

    /**
     * Capture a photo or video.
     * @param options The options for capture
     * @param options.mode The capture mode, either "photo" or "video".
     * @param options.mediaTypes The media types to capture, such as ["public.image", "public.movie"].
     * @param options.allowsEditing A Boolean value indicating whether the captured media can be edited.
     * @param options.cameraDevice The camera device to use, either "rear" or "front". Defaults to "rear".
     * @param options.cameraFlashMode The flash mode to use, either "auto", "on", or "off". Defaults to "auto".
     * @param options.videoMaximumDuration The maximum duration of the video capture, in seconds. Defaults to 600. This value is ignored if the mode is "photo".
     * @param options.videoQuality The quality of the video capture, either "low", "medium", "high", "640x480", "iFrame960x540", or "iFrame1280x720". Defaults to "medium".
     * @returns A promise that resolves to a CaptureInfo object, or null if the capture is canceled.
     */
    function capture(options: {
      mode: "photo" | "video"
      mediaTypes: UTType[]
      allowsEditing?: boolean
      cameraDevice?: "rear" | "front"
      cameraFlashMode?: "auto" | "on" | "off"
      videoMaximumDuration?: DurationInSeconds
      videoQuality?: "low" | "medium" | "high" | "640x480" | "iFrame960x540" | "iFrame1280x720"
    }): Promise<CaptureInfo | null>

    /**
     * Present a photo picker dialog and pick limited number of photos.
     * @param options The options for pick
     * @param options.mode This property offers two ways that photos lay out in the picker:
     *   - A linear mode (compact), in which photos form a line in a smaller area in the picker
     *   - A two-dimensional mode (default), in which photos form a grid in a larger area in the picker
     * @param options.filter The filter for the picker
     * @param options.limit The limited number of photos, defaults to 1.
     */
    function pick(options?: {
      mode?: "default" | "compact"
      filter?: PHPickerFilter
      limit?: number
    }): Promise<PHPickerResult[]>

    /**
     * Get the latest specified number of photos from the Photos app.
     * @param count The number of photos you want.
     */
    function getLatestPhotos(count: number): Promise<UIImage[] | null>
    /**
     * Present a photo picker dialog and pick limited number of photos.
     * @param count The limited number of photos.
     */
    function pickPhotos(count: number): Promise<UIImage[]>
    /**
     * Take a photo, returns a Promise provides a UIImage  when fulfilled.
     */
    function takePhoto(): Promise<UIImage | null>
    /**
     * Save an image by path to the Photos app.
     * @param path The path of the image
     * @param options The option for saving image
     * @param options.fileName The optional image name
     * @returns Returns a promise that resolves a boolean value indicates that whether the operation is successful
     */
    function savePhoto(path: string, options?: {
      /**
       * The optional photo name.
       */
      fileName?: string
      /**
       * Whether to move the file to the Photos app, or just copy it.
       */
      shouldMoveFile?: boolean
    }): Promise<boolean>
    /**
     * Save an image data to the Photos app.
     * @param image The image data
     * @param options The option for saving image
     * @param options.fileName The optional image name
     * @returns Returns a promise that resolves a boolean value indicates that whether the operation is successful
     */
    function savePhoto(image: Data, options?: {
      /**
       * The optional photo name.
       */
      fileName?: string
    }): Promise<boolean>
    /**
     * Save a video data to the Photos app.
     * @param path The path of the video file
     * @param options The option for saving video
     * @returns Returns a promise that resolves a boolean value indicates that whether the operation is successful
     */
    function saveVideo(path: string, options?: {
      /**
       * The optional video name.
       */
      fileName?: string
      /**
       * Whether to move the file to the Photos app, or just copy it.
       */
      shouldMoveFile?: boolean
    }): Promise<boolean>
    /**
     * Save a video data to the Photos app.
     * @param video The video data
     * @param options The option for saving video
     * @returns Returns a promise that resolves a boolean value indicates that whether the operation is successful
     */
    function saveVideo(video: Data, options?: {
      /**
       * The optional photo name.
       */
      fileName?: string
    }): Promise<boolean>
    /**
     * Save a live photo to the Photos app
     * @param imagePath The path of the image
     * @param videoPath The path of the video
     * @param shouldMoveFile If true, the file will be moved to the Photos app, otherwise it will be copied. Defaults to false.
     * @returns Returns a promise that resolves when the operation is complete, or rejects with an error if the operation fails.
     */
    function saveLivePhoto(imagePath: string, videoPath: string, shouldMoveFile?: boolean): Promise<void>
  }

  /**
   * The current state of a drop.
   */
  class DropInfo {
    private constructor()

    /**
     * The location of the drag in the coordinate space of the drop view.
     */
    readonly location: Point
    /**
     * Indicates whether at least one item conforms to at least one of the specified uniform type identifiers.
     * @param types The uniform type identifiers to query for.
     */
    hasItemsConforming(types: UTType[]): boolean
    /**
     * Finds item providers that conform to at least one of the specified uniform type identifiers. This function is only valid during the `onDrop.performDrop` action.
     * @param types The uniform type identifiers to query for.
     * @returns The item providers that conforms to contentTypes.
     */
    itemProviders(types: UTType[]): ItemProvider[]
  }

  /**
   * The ItemProvider class is used to provide data for a file or file system item.
   */
  class ItemProvider {

    /**
     * The types that the item provider can provide.
     */
    readonly registeredTypes: UTType[]

    /**
     * The types that the item provider can provide in place.
     */
    readonly registeredInPlaceTypes: UTType[]

    /**
     * Returns a Boolean value indicating whether an item provider contains a data representation conforming to a specified universal type identifier.
     */
    hasItemConforming(type: UTType): boolean
    /**
     * Returns a Boolean value indicating whether an item provider contains a data representation conforming to a specified universal type identifier.
     */
    hasRepresentationConforming(type: UTType): boolean
    /**
     * Returns a Boolean value indicating whether an item provider contains a data representation conforming to a specified universal type identifier and to specified open-in-place behavior.
     */
    hasInPlaceRepresentationConforming(type: UTType): boolean

    /**
     * Checks whether the item provider can load a UIImage object.
     */
    canLoadUIImage(): boolean
    /**
     * Checks whether the item provider can load a LivePhoto object.
     */
    canLoadLivePhoto(): boolean

    /**
     * Loads a UIImage object from the item provider.
     */
    loadUIImage(): Promise<UIImage | null>
    /**
     * Loads a PHLivePhoto object from the item provider.
     */
    loadLivePhoto(): Promise<LivePhoto | null>
    /**
     * Loads a URL string from the item provider.
     */
    loadURL(): Promise<string | null>
    /**
     * Loads a text string from the item provider.
     */
    loadText(): Promise<string | null>
    /**
     * Asynchronously copies the provided, typed data into a generic data object.
     * @param type The type of data to load
     * @returns Returns a promise that resolves to the data or null.
     */
    loadData(type: UTType): Promise<Data | null>
    /**
     * Loads a file path from the item provider. If the item provide can load data as the specified type, this file will be copied to the app group's temporary directory and the file path will be returned, otherwise null will be returned.
     * @param type The type of data to load
     * @returns Returns a promise that resolves to the file path or null.
     */
    loadFilePath(type: UTType): Promise<string | null>

    /**
     * Creates an item provider from a UIImage object.
     */
    static fromUIImage(image: UIImage): ItemProvider
    /**
     * Creates an item provider from a text string.
     */
    static fromText(text: string): ItemProvider
    /**
     * Creates an item provider from a URL string, or null if the URL string is invalid.
     */
    static fromURL(url: string): ItemProvider | null
    /**
     * Creates an item provider from a file path.
     */
    static fromFilePath(path: string): ItemProvider
  }

  type PickFilesOption = {
    /**
     * The initial directory that the document picker displays.
     */
    initialDirectory?: string
    /**
     * An array of uniform type identifiers for the document picker to display.
     * For more information, see [Uniform Type Identifiers.](https://developer.apple.com/documentation/uniformtypeidentifiers/uttype-swift.struct)
     */
    types?: UTType[]
    /**
     * Defaults to true.
     */
    shouldShowFileExtensions?: boolean
    /**
     * Defaults to false.
     */
    allowsMultipleSelection?: boolean
  }

  type ExportFilesOptions = {
    /**
     * The initial directory that the document picker displays.
     */
    initialDirectory?: string

    /**
     * The files for exporting.
     */
    files: {
      /**
       * File data.
       */
      data: Data
      /**
       * File name.
       */
      name: string
    }[]
  }


  /**
   * Type definition for iOS UTType identifiers
   * Reference: https://developer.apple.com/documentation/uniformtypeidentifiers/system_declared_uniform_type_identifiers
   */
  type UTType =
    // 3D content
    | "public.3d-content"
    | "com.pixar.universal-scene-description"
    | "com.pixar.universal-scene-description-mobile"

    // Apple 3D content
    | "com.apple.reality"
    | "com.apple.scenekit.scene"
    | "com.apple.arobject"

    // Apple file system objects
    | "public.directory"
    | "public.symlink"
    | "public.mount-point"
    | "com.apple.alias-file"
    | "public.folder"
    | "public.volume"
    | "public.disk-image"

    // Apple image formats
    | "public.heic"
    | "public.heif"
    | "com.apple.live-photo"

    // Apple system types
    | "com.apple.framework"
    | "com.apple.application-bundle"
    | "com.apple.application-and-system-extension"
    | "com.apple.metadata-importer"
    | "com.apple.quicklook-generator"
    | "com.apple.xpc-service"
    | "com.apple.systempreference.prefpane"

    // Application files
    | "com.adobe.pdf"
    | "com.apple.rtfd"
    | "com.apple.flat-rtfd"
    | "org.idpf.epub-container"

    // Audio
    | "public.mp3"
    | "public.aiff-audio"
    | "com.microsoft.waveform-audio"
    | "public.midi-audio"
    | "public.playlist"
    | "public.m3u-playlist"

    // Audio and video
    | "com.apple.quicktime-movie"
    | "public.mpeg"
    | "public.mpeg-2-video"
    | "public.mpeg-2-transport-stream"
    | "public.mpeg-4"
    | "public.mpeg-4-audio"
    | "com.apple.protected-mpeg-4-video"
    | "com.apple.protected-mpeg-4-audio"
    | "public.avi"

    // Compiled programming language sources
    | "public.assembly-source"
    | "public.c-header"
    | "public.c-source"
    | "public.c-plus-plus-header"
    | "public.c-plus-plus-source"
    | "public.objective-c-plus-plus-source"
    | "public.objective-c-source"
    | "public.swift-source"

    // Compressed archives
    | "public.archive"
    | "public.zip-archive"
    | "org.gnu.gnu-zip-archive"
    | "public.bzip2-archive"
    | "com.apple.archive"

    // Cryptographic files
    | "com.rsa.pkcs-12"
    | "public.x509-certificate"

    // Data interchange formats
    | "public.delimited-values-text"
    | "public.comma-separated-values-text"
    | "public.tab-separated-values-text"
    | "public.utf8-tab-separated-values-text"
    | "public.rtf"
    | "public.xml"
    | "public.yaml"
    | "public.json"
    | "public.vcard"

    // Executables
    | "public.executable"
    | "public.unix-executable"
    | "public.windows-executable"

    // Icon images
    | "com.microsoft.ico"
    | "com.apple.icns"

    // Images
    | "public.png"
    | "com.compuserve.gif"
    | "public.jpeg"
    | "org.webmproject.webp"
    | "public.tiff"
    | "com.microsoft.bmp"
    | "public.svg-image"
    | "public.camera-raw-image"

    // Internet-specific
    | "public.html"
    | "com.apple.webarchive"
    | "com.apple.internet-location"
    | "com.microsoft.internet-shortcut"

    // Property lists
    | "com.apple.property-list"
    | "com.apple.xml-property-list"
    | "com.apple.binary-property-list"

    // Shazam
    | "com.apple.shazamsignature"
    | "com.apple.shazamcatalog"

    // Scripted programming language sources
    | "public.script"
    | "com.apple.applescript.text"
    | "com.netscape.javascript-source"
    | "com.apple.applescript.script"
    | "com.apple.applescript.script-bundle"
    | "public.make-source"
    | "public.shell-script"
    | "public.python-script"
    | "public.ruby-script"
    | "public.perl-script"
    | "public.php-script"

    // Text files
    | "public.text"
    | "public.plain-text"
    | "public.utf8-plain-text"
    | "public.utf16-plain-text"
    | "public.utf16-external-plain-text"

    // URLs
    | "public.url"
    | "public.file-url"
    | "com.apple.bookmark"

    // Apple system base types
    | "public.item"
    | "public.content"
    | "public.composite-content"
    | "public.data"
    | "com.apple.resolvable"
    | "com.apple.package"
    | "com.apple.bundle"
    | "com.apple.plugin"
    | "com.apple.application"
    | "public.source-code"
    | "public.bookmark"
    | "public.log"

    // Application base types
    | "public.spreadsheet"
    | "public.presentation"
    | "public.database"
    | "public.message"
    | "public.contact"
    | "public.calendar-event"
    | "public.to-do-item"
    | "public.email-message"
    | "public.font"

    // Image, audio, and video base types
    | "public.image"
    | "public.audio"
    | "public.audiovisual-content"
    | "public.movie"
    | "public.video"

    // Tag classes
    | "public.filename-extension"
    | "public.mime-type"



  /**
   * Pick files from Files app.
   */
  namespace DocumentPicker {
    /**
     * Pick files from documents.
     * @example
     * ```ts
     * async function run() {
     *   const imageFilePath = await DocumentPicker.pickFiles()
     *   if (imageFilePath != null) {
     *     // ...
     *   }
     * }
     * run()
     * ```
     */
    function pickFiles(options?: PickFilesOption): Promise<string[]>
    /**
     * Pick a directory.
     * @param initialDirectory The initial directory that the document picker displays.
     * @example
     * ```ts
     * const selectedDirectory = await DocumentPicker.pickDirectory()
     * if (selectedDirectory == null) {
     *   // user canceled the picker
     * }
     * ```
     */
    function pickDirectory(initialDirectory?: string): Promise<string | null>
    /**
     * Exports files.
     * @example
     * ```ts
     * async function run() {
     *   const textContent = "Hello Scripting!"
     *   const result = await DocumentPicker.exportFiles({
     *     files: [
     *       {
     *         data: Data.fromString(textContent)!,
     *         name: 'greeting.txt',
     *       }
     *     ]
     *   })
     *
     *   if (result.length > 0) {
     *     console.log('Exported files: ', result)
     *   }
     * }
     * run()
     * ```
     */
    function exportFiles(options: ExportFilesOptions): Promise<string[]>
    /**
     * When you no longer need access to the files or directories those pick by `DocumentPicker` and automatic make the resource available to your script, such as one returned by resolving a security-scoped bookmark, call this method to relinquish access.
     */
    function stopAcessingSecurityScopedResources(): void
  }

  /**
   * This namespace contains methods for picking fonts.
   */
  namespace FontPicker {

    /**
     * Pick a font.
     * @example
     * ```ts
     * const fontPostscriptName = await FontPicker.pickFont()
     * if (fontPostscriptName == null) {
     *   // user canceled the picker
     * }
     * ```
     */
    function pickFont(): Promise<string | null>
  }

  /**
   * Providing a persistent store for simple data. All data is deafult stored in current script's private domain, and you can set `shared` option to true to store data in shared domain, so the other scripts can access it.
   *
   * Data is persisted to disk asynchronously.
   *
   * The follow data types are supported:
   *  - `string`
   *  - `number`
   *  - `boolean`
   *  - `JSON`
   *  - `Data` (use `setData` or `getData` methods)
   */
  namespace Storage {
    /**
     * Saves a `value` to persistent storage in the background.
     * @param key The key for the value to be stored.
     * @param value The value to store, it can be `string`, `number`, `boolean` or `JSON`.
     * @param options The options for the storage, if `shared` is true, the data will be stored in shared domain.
     * @returns A boolean indicates whether the operation was successful.
     */
    function set<T>(key: string, value: T, options?: { shared: boolean }): boolean
    /**
     * Reads a value from persistent storage, if the value of the key is not exists, returns `null`.
     * @param key The key for the value to be retrieved.
     * @param options The options for the storage, if `shared` is true, the data will be retrieved from shared domain.
     * @returns The value associated with the key, or `null` if the key does not exist.
     */
    function get<T>(key: string, options?: { shared: boolean }): T | null
    /**
     * Saves a `Data` to persistent storage in the background.
     * @param key The key for the value to be stored.
     * @param data The `Data` to store.
     * @param options The options for the storage, if `shared` is true, the data will be stored in shared domain.
     */
    function setData(key: string, data: Data, options?: { shared: boolean }): void
    /**
     * Reads a `Data` from persistent storage, if the value of the key is not exists, returns `null`.
     * @param key The key for the value to be retrieved.
     * @param options The options for the storage, if `shared` is true, the data will be retrieved from shared domain.
     * @returns The `Data` associated with the key, or `null` if the key does not exist.
     */
    function getData(key: string, options?: { shared: boolean }): Data | null
    /**
     * Removes an entry from persistent storage.
     * @param key The key for the value to be removed.
     * @param options The options for the storage, if `shared` is true, the data will be removed from shared domain.
     */
    function remove(key: string, options?: { shared: boolean }): void
    /**
     * Returns true if the persistent storage contains the given `key`.
     * @param key The key to check for existence.
     * @param options The options for the storage, if `shared` is true, the data will be checked from shared domain.
     * @returns A boolean value indicating whether the persistent storage contains the given key.
     */
    function contains(key: string, options?: { shared: boolean }): boolean
    /**
     * Removes all entries from the persistent storage.
     */
    function clear(): void
    /**
     * Returns an array of all keys in the persistent storage.
     */
    function keys(): string[]
  }

  /**
   * An object that displays interactive web content, such as for an in-app browser.
   */
  class WebViewController {
    /**
     * When the web view performs a request to load a resource, the function can determine whether or not to allow the request. 
     */
    shouldAllowRequest?: (request: {
      /**
       * The URL of the request.
       */
      url: string
      /**
       * The HTTP request method.
       */
      method: string
      /**
       * The data sent as the message body of a request, such as for an HTTP POST request.
       */
      body?: Data | null
      /**
       * A dictionary containing all of the HTTP header fields for a request.
       */
      headers: Record<string, string>
      /**
       * The timeout interval of the request.
       */
      timeoutInterval: number
      /**
       * The type of action that triggered the navigation.
       */
      navigationType: "linkActivated" | "reload" | "backForward" | "formResubmitted" | "formSubmitted" | "other"
    }) => Promise<boolean>
    /**
     * Load a webpage by a file path, returns a Promise with boolean value indicates that whether the load request is completed.
     * @param path The path of a file that contains web content.
     * @param allowingReadAccessTo The path of a file or directory containing web content that you grant the system permission to read. This path must not be empty. To prevent WebKit from reading any other content, specify the same value as the `path` parameter. To read additional files related to the content file, specify a directory. Default value is the same as the `path` parameter.
     * @returns A Promise with boolean value indicates that whether the load request is completed.
     */
    loadFile(path: string, allowingReadAccessTo?: string): Promise<boolean>
    /**
     * Load a webpage by a URL string, returns a Promise with boolean value indicates that whether the load request is completed.
     * @param url URL string.
     */
    loadURL(url: string): Promise<boolean>
    /**
     * Loads the contents of the specified HTML string and navigates to it. Returns a Promise with boolean value indicates that whether the load request is completed.
     * @param html HTML string.
     * @param baseURL A URL that you use to resolve relative URLs within the document.
     */
    loadHTML(html: string, baseURL?: string): Promise<boolean>
    /**
     * Load a content by the data, you must provide the mimeType, encoding string and baseURL parameters. Returns a Promise with boolean value indicates that whether the load request is completed.
     * @param data The data to use as the contents of the webpage.
     * @param mimeType The MIME type of the information in the data parameter. This parameter must not contain an empty string.
     * @param encoding The data's character encoding name.
     * @param baseURL A URL that you use to resolve relative URLs within the document.
     */
    loadData(data: Data, mimeType: string, encoding: string, baseURL: string): Promise<boolean>
    /**
     * Wait for the WebView load completed, returns a Promise that resolves a boolean value indicates that whether it is successful.
     */
    waitForLoad(): Promise<boolean>
    /**
     * Get current HTML content of the webpage, you must call this method after the website is loaded completed.
     */
    getHTML(): Promise<string | null>
    /**
     * Evaluates the specified JavaScript string.
     * @param javascript JavaScript string.
     * @returns A Promise that resolves with the result of the JavaScript evaluation. If the JavaScript code returns a value, it will be returned as the resolved value of the Promise.
     * @example
     * ```ts
     * const webView = new WebViewController()
     * await webView.loadURL("https://example.com")
     * const title = await webView.evaluateJavaScript("return document.title") // Must use `return` to get the value.
     * console.log(title) // "Example Domain"
     * webView.dispose()
     * ```
     */
    evaluateJavaScript<T = any>(javascript: string): Promise<T>
    /**
     * Installs a message handler that returns a reply to your JavaScript code.
     * @param name The name of the message handler. This parameter must be unique within the user content controller and must not be an empty string.
     * @param handler The message handler, you can return a value for replying the WebView.
     * @returns A Promise that resolves when the message handler is added successfully.
     * @example
     * ```ts
     * let webView = new WebViewController()
     * webView.addScriptMessageHandler("sayHi", (greeting: string) => {
     *   console.log("Receive a message", greeting)
     * 
     *   return "Hello!"
     * })
     * 
     * // ... load the WebView
     * 
     * let result = await webView.evaluateJavaScript("window.webkit.messageHandlers.sayHi.postMessage('Hi!')")
     * console.log(result) // "Hello!"
     * ```
     */
    addScriptMessageHandler<P = any, R = any>(name: string, handler: (params?: P) => R): Promise<void>
    /**
     * Present the WebView, returns a Promise that is resolved after the WebView is dismissed. If this WebViewController is used for the WebView view, this operation will be failure. And if this controller is presented, it can no longer use for WebView view.
     * @param fullscreen Whether present the WebView in fullscreen. Defaults to false.
     * @param navigationTitle Set the navigation title.
     */
    present(options?: {
      fullscreen?: boolean
      navigationTitle?: string
    }): Promise<void>
    /**
     * Get the custom user agent string of the WebView, returns the custom user agent string or `null` if it is not set.
     */
    getCustomUserAgent(): string | null
    /**
     * Set the custom user agent string of the WebView, returns a Promise that resolves with a boolean value indicates whether the operation is successful.
     * @param userAgent The custom user agent string, or `null` to reset to the default user agent.
     * @returns A Promise that resolves with a boolean value indicates whether the operation is successful.
     * @example
     * ```ts
     * const webView = new WebViewController()
     * await webView.setCustomUserAgent("MyCustomUserAgent/1.0")
     * const userAgent = await webView.getCustomUserAgent()
     * console.log(userAgent) // "MyCustomUserAgent/1.0"
     * ```
     */
    setCustomUserAgent(userAgent: string | null): boolean
    /**
     * Check whether there is a valid back item in the back-forward list.
     */
    canGoBack(): boolean
    /**
     * Check whether there is a valid forward item in the back-forward list.
     */
    canGoForward(): boolean
    /**
     * Navigates to the back item in the back-forward list. Returns a boolean value indicates whether go back successfully.
     */
    goBack(): boolean
    /**
     * Navigates to the forward item in the back-forward list. Returns a boolean value indicates whether go forward successfully.
     */
    goForward(): boolean
    /**
     * Reloads the current webpage.
     */
    reload(): void
    /**
     * Dismiss the WebView, if the WebView is not presented, do nothing. You can presented the WebView again before it was disposed.
     */
    dismiss(): void
    /**
     * Dispose the WebView controller. If the WebView is presented, it will be dismissed. You must call this method manually to avoid memory leaks.
     */
    dispose(): void
  }

  /**
   * The frequency for recurrence rules.
   */
  type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "yearly"

  /**
   * The day of the week.
   */
  type RecurrenceWeekday =
    | "sunday"
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"


  /**
   * The type that represents the day of the week.
   */
  type RecurrenceDayOfWeek = RecurrenceWeekday | {
    weekday: RecurrenceWeekday
    weekNumber: number
  }

  /**
   * A class that defines the end of a recurrence rule.
   */
  class RecurrenceEnd {
    /**
     *  The date when the recurrence ends. If the recurrence ends by count, this value is `null`.
     */
    readonly endDate: Date | null
    /**
     *  The maximum number of occurrences for the recurrence rule. If the recurrence ends by date, this value is `0`.
     */
    readonly occurrenceCount: number
    /**
     * Initializes and returns a count-based recurrence end with a given maximum occurrence count.
     */
    static fromCount(count: number): RecurrenceEnd
    /**
     * Initializes and returns a date-based recurrence end with a given end date.
     */
    static fromDate(date: Date): RecurrenceEnd
  }

  /**
   * A class that describes the pattern for a recurring event.
   */
  class RecurrenceRule {
    /**
     * The identifier for the recurrence rule’s calendar.
     */
    readonly identifier: string
    /**
     * Indicates when the recurrence rule ends.
     */
    readonly recurrenceEnd?: RecurrenceEnd
    /**
     * The frequency of the recurrence rule.
     */
    readonly frequency: RecurrenceFrequency
    /**
     * Specifies how often the recurrence rule repeats over the unit of time indicated by its frequency.
     */
    readonly interval: number
    /**
     * Indicates which day of the week the recurrence rule treats as the first day of the week.
     */
    readonly firstDayOfTheWeek: number

    /**
     * The days of the week associated with the recurrence rule, as an array of `RecurrenceDayOfWeek` objects.
     */
    readonly daysOfTheWeek?: RecurrenceDayOfWeek[]

    /**
     * The days of the month associated with the recurrence rule, as an array of numbers.
     */
    readonly daysOfTheMonth?: number[]

    /**
     * The days of the year associated with the recurrence rule, as an array of numbers.
     */
    readonly daysOfTheYear?: number[]

    /**
     * The weeks of the year associated with the recurrence rule, as an array of numbers.
     */
    readonly weeksOfTheYear?: number[]

    /**
     * The months of the year associated with the recurrence rule, as an array of numbers.
     */
    readonly monthsOfTheYear?: number[]

    /**
     * An array of ordinal numbers that filters which recurrences to include in the recurrence rule’s frequency.
     */
    readonly setPositions?: number[]

    /**
     * Create a RecurrenceRule instance from sepcified options.
     */
    static create(options: {
      /**
       * The frequency of the recurrence rule. Can be daily, weekly, monthly, or yearly.
       */
      frequency: RecurrenceFrequency
      /**
       * The interval between instances of this recurrence. For example, a weekly recurrence rule with an interval of 2 occurs every other week. Must be greater than 0.
       */
      interval: number
      /**
       * The days of the week that the event occurs, as an array of `RecurrenceDayOfWeek` objects.
       */
      daysOfTheWeek?: RecurrenceDayOfWeek[]
      /**
       * The days of the month that the event occurs, as an array of numbers. Values can be from 1 to 31 and from -1 to -31. This parameter is only valid for recurrence rules of type `monthly`.
       */
      daysOfTheMonth?: number[]
      /**
       * The months of the year that the event occurs, as an array of numbers. Values can be from 1 to 12. This parameter is only valid for recurrence rules of type `yearly`.
       */
      monthsOfTheYear?: number[]
      /**
       * The weeks of the year that the event occurs, as an array of numbers. Values can be from 1 to 53 and from -1 to -53. This parameter is only valid for recurrence rules of type `yearly`.
       */
      weeksOfTheYear?: number[]
      /**
       * The days of the year that the event occurs, as an array of numbers. Values can be from 1 to 366 and from -1 to -366. This parameter is only valid for recurrence rules of type `yearly`.
       */
      daysOfTheYear?: number[]
      /**
       * An array of ordinal numbers that filters which recurrences to include in the recurrence rule’s frequency. 
       * 
       * For example, a yearly recurrence rule that has a `daysOfTheWeek` value that specifies Monday through Friday, and a setPositions array containing 2 and -1, occurs only on the second weekday and last weekday of every year. Values can be from 1 to 366 and from -1 to -366.
       * 
       * Negative values indicate counting backwards from the end of the recurrence rule’s frequency (week, month, or year).
       */
      setPositions?: number[]
      /**
       * The end of the recurrence rule.
       */
      end?: RecurrenceEnd
    }): RecurrenceRule | null
  }

  /**
   * Possible calendar types.
   */
  type CalendarType =
    | "birthday"
    | "calDAV"
    | "exchange"
    | "local"
    | "subscription"

  /**
   * The type of calendar source object.
   */
  type CalendarSourceType =
    | "birthdays"
    | "calDAV"
    | "exchange"
    | "local"
    | "mobileMe"
    | "subscribed"

  /**
   * A type indicating the event availability settings that the calendar can support.
   */
  type CalendarEventAvailability =
    | "busy"
    | "free"
    | "tentative"
    | "unavailable"

  type CalendarEntityType =
    | "event"
    | "reminder"

  class CalendarSource {
    /**
     * The source type representing the account to which this calendar belongs.
     */
    readonly type: CalendarSourceType
    /**
     * The source identifier.
     */
    readonly identifier: string
    /**
     * The source title.
     */
    readonly title: string
    /**
     * Get the calendars that belong to this source.
     * @param entityType The entity type that this source may support.
     * @returns A promise that resolves to an array of calendars that belong to this source.
     */
    getCalendars(entityType: CalendarEntityType): Promise<Calendar[]>
  }
  /**
   * The `Calendar` API allows you to interact with iOS calendars, enabling operations like retrieving default calendars, creating custom calendars, and managing calendar settings and events.
   */
  class Calendar {
    /**
     * A unique identifier for the calendar.
     */
    readonly identifier: string
    /**
     * The calendar’s title.
     */
    title: string
    /**
     * The calendar’s color.
     */
    color: Color
    /**
     * The calendar’s type.
     */
    readonly type: CalendarType

    /**
     * The calendar’s source.
     */
    readonly source: CalendarSource
    /**
     * The entity types this calendar can contain, `event` or `reminder`.
     */
    readonly allowedEntityTypes: CalendarEntityType
    /**
     * Whether this calendar is for events.
     */
    readonly isForEvents: boolean
    /**
     * Whether this calendar is for reminders.
     */
    readonly isForReminders: boolean
    /**
     * A Boolean value that indicates whether you can add, edit, and delete items in the calendar.
     */
    readonly allowsContentModifications: boolean
    /**
     * A Boolean value indicating whether the calendar is a subscribed calendar.
     */
    readonly isSubscribed: boolean
    /**
     * The event availability settings supported by this calendar.
     */
    readonly supportedEventAvailabilities: CalendarEventAvailability
    /**
     * Remove the calendar.
     */
    remove(): Promise<void>
    /**
     * Save the calendar.
     */
    save(): Promise<void>
    /**
     * Get calendar accounts.
     */
    static getSources(): CalendarSource[]
    /**
     * Get the calendar that events are added to by default, as specified by user settings.
     */
    static defaultForEvents(): Promise<Calendar | null>
    /**
     * Identifies the default calendar for adding reminders to, as specified by user settings.
     */
    static defaultForReminders(): Promise<Calendar | null>
    /**
     * Identifies the calendars that support events.
     */
    static forEvents(): Promise<Calendar[]>
    /**
     * Identifies the calendars that support reminders.
     */
    static forReminders(): Promise<Calendar[]>
    /**
     * Create a Calendar by specified options.
     * `sourceIdentifier` and `sourceType` are optional, if you don't provide them, the calendar will be created in the default source.
     * @param options The options for creating a calendar.
     * @param options.title The calendar’s title.
     * @param options.entityType The entity type that this calendar may support.
     * @param options.sourceIdentifier The source identifier representing the account to which this calendar belongs.
     * @param options.sourceType The source type representing the account to which this calendar belongs.
     * @param options.color The calendar’s color.
     * @returns A promise that resolves to the created calendar.
     */
    static create(options: {
      title: string
      entityType: CalendarEntityType
      sourceIdentifier?: string
      sourceType?: CalendarSourceType
      color?: Color
    }): Promise<Calendar>
    /**
     * Present a calendar chooser view.
     * @param allowMultipleSelection Defaults to false.
     */
    static presentChooser(allowMultipleSelection?: boolean): Promise<Calendar[]>
  }

  /**
   * The `Reminder` API allows you to create, edit, and manage reminders in a calendar. This includes setting titles, due dates, priorities, and recurrence rules.
   */
  class Reminder {
    /**
     * A unique identifier for the reminder.
     */
    readonly identifier: string
    /**
     * The calendar for the reminder.
     */
    calendar: Calendar
    /**
     * The title of the reminder.
     */
    title: string
    /**
     * The notes of the reminder.
     */
    notes: string | null
    /**
     * A Boolean value determining whether or not the reminder is marked completed.
     * Setting this property to true will set `completionDate` to the current date; setting this property to false will set `completionDate` to null.
     * 
     * Special Considerations: 
     * If the reminder was completed using a different client, you may encounter the case where this property is true, but `completionDate` is null.
     */
    isCompleted: boolean
    /**
     * The reminder's priority.
     */
    priority: number
    /**
     * The date on which the reminder was completed. Setting this property to a date will set `isCompleted` to true; setting this property to null will set completed to false.
     */
    completionDate: Date | null
    /**
     * The date components for the reminder's due date.
     */
    dueDateComponents: DateComponents | null
    /**
     * The date by which the reminder should be completed.
     * @deprecated
     * Use `dueDateComponents` instead, you can use `dueDateComponents?.date` to get the date value.
     */
    dueDate: Date | null
    /**
     * Whether the `dueDate` includes a time.
     * 
     * When this is true, assignments to the dueDate property will include a time, when this is false, the time component of the date will be ignored. Defaults to true.
     * @deprecated
     * Use `dueDateComponents` instead, you can use `dueDateComponents?.hour != null && dueDateComponents?.minute != null` to get the value.
     */
    dueDateIncludesTime: boolean
    /**
     * The recurrence rules for the reminder.
     */
    recurrenceRules: RecurrenceRule[] | null
    alarms: EventAlarm[] | null
    /**
     * The attendees associated with the event, as an array of `EventParticipant` objects.
     */
    readonly attendees: EventParticipant[] | null

    readonly hasAlarm: boolean
    readonly hasNotes: boolean
    /**
     * Returns whether this object or any of the objects it contains has uncommitted changes.
     */
    readonly hasChanges: boolean
    readonly hasAttendees: boolean
    /**
     * A Boolean value that indicates whether the reminder has recurrence rules.
     */
    readonly hasRecurrenceRules: boolean
    addAlarm(alarm: EventAlarm): void

    removAlarm(alarm: EventAlarm): void

    /**
     * Adds a recurrence rule to the recurrence rule array.
     */
    addRecurrenceRule(rule: RecurrenceRule): void
    /**
     * Removes a recurrence rule from the recurrence rule array.
     */
    removeRecurrenceRule(rule: RecurrenceRule): void
    /**
     * Removes the reminder from the calendar.
     */
    remove(): Promise<void>
    /**
     * Saves changes to a reminder.
     */
    save(): Promise<void>
    /**
     * Get all reminders. 
     */
    static getAll(calenders?: Calendar[]): Promise<Reminder[]>
    /**
     * Get all incompelte reminders. If you provide `startDate` and `endDate`, it will return reminders within the specified range, but it will not expand the recurrence rules, so it will only return reminders that are not completed and have a due date within the specified range.
     */
    static getIncompletes(options?: {
      /**
       * The start date of the range of reminders fetched, or null for all incomplete reminders before endDate.
       */
      startDate?: Date
      /**
       * The end date of the range of reminders fetched, or null for all incomplete reminders after startDate.
       */
      endDate?: Date
      /**
       * An array of calendars to search.
       */
      calendars?: Calendar[]
    }): Promise<Reminder[]>
    /**
     * Get all completed reminders.
     */
    static getCompleteds(options?: {
      /**
       * The start date of the range of reminders fetched, or null for all completed reminders before endDate.
       */
      startDate?: Date
      /**
       * The end date of the range of reminders fetched, or null for all completed reminders after startDate.
       */
      endDate?: Date
      /**
       * An array of calendars to search.
       */
      calendars?: Calendar[]
    }): Promise<Reminder[]>
  }

  /**
   * A object that represents person, group, or room invited to a calendar event.
   */
  type EventParticipant = {
    /**
     * A Boolean value indicating whether this participant represents the owner of this account.
     */
    isCurrentUser: boolean
    /**
     * The participant’s name.
     */
    name?: string
    /**
     * The participant’s role in the event.
     */
    role: ParticipantRole
    /**
     * The participant’s type.
     */
    type: ParticipantType
    /**
     * The participant’s attendance status.
     */
    status: ParticipantStatus
  }

  /**
   * The participant’s role for an event.
   */
  type ParticipantRole =
    | "chair"
    | "nonParticipant"
    | "optional"
    | "required"
    | "unknown"

  /**
   * The type of participant.
   */
  type ParticipantType =
    | "group"
    | "person"
    | "resource"
    | "room"
    | "unknown"

  /**
   * The participant’s attendance status for an event.
   */
  type ParticipantStatus =
    | "unknown"
    | "pending"
    | "accepted"
    | "declined"
    | "tentative"
    | "delegated"
    | "completed"
    | "inProcess"

  /**
   * The action taken by the user after editing an event.
   */
  type EventEditViewAction = "deleted" | "saved" | "canceled"

  enum AlarmProximity {
    none = 0,
    enter = 1,
    leave = 2
  }

  enum EventAvailability {
    notSupported = -1,
    busy = 0,
    free = 1,
    tentative = 2,
    unavailable = 3,
  }

  /**
   * An object that specifies a geofence to activate the alarm of a calendar item.
   */
  type EventStructuredLocation = {
    /**
     * The title of the location.
     */
    title: string | null
    geoLocation: LocationInfo | null
    /**
     * A minimum distance from the core location that would trigger the alarm or reminder.
     */
    radius: number
  }

  class EventAlarm {
    /**
     * Creates and returns an alarm with an absolute date.
     */
    static fromAbsoluteDate(date: Date): EventAlarm
    /**
     * Creates and returns an alarm with a relative offset.
     * @param offset The offset from the start of an event, at which the alarm fires. 
     */
    static fromRelativeOffset(offset: DurationInSeconds): EventAlarm

    /**
     * If you set this property for a relative offset alarm, it loses the relative offset and becomes an absolute alarm.
     */
    absoluteDate: Date | null
    /**
     * The offset from the start of an event, at which the alarm fires.
     * If you set this value for an absolute alarm, it loses its absolute date and becomes a relative offset alarm.
     */
    relativeOffset: number
    /**
     * This property is used in conjunction with `proximity` to perform geofence-based triggering of reminders.
     */
    structuredLocation: EventStructuredLocation | null
    /**
     * A value indicating how a location-based alarm is triggered.
     * Alarms can be set to trigger when entering or exiting a location specified by structuredLocation. By default, alarms are not affected by location.
     */
    proximity: AlarmProximity
  }

  /**
   * The `CalendarEvent` API enables you to create and manage events in iOS calendars, with properties like title, location, dates, attendees, and recurrence.
   */
  class CalendarEvent {
    /**
     * A unique identifier for the event.
     */
    readonly identifier: string
    readonly creationDate: Date | null
    readonly lastModifiedDate: Date | null
    /**
     * The calendar for the event. This property cannot be set to null.
     * If you want to remove the event from the calendar, use the `remove` method.
     */
    calendar: Calendar | null
    /**
     * The title for the event.
     */
    title: string
    /**
     * The notes for the event.
     */
    notes: string | null
    /**
     * The URL string for the event.
     */
    url: string | null
    /**
     * A Boolean value that indicates whether the event is an all-day event.
     */
    isAllDay: boolean
    /**
     * The original occurrence date of an event if it is part of a recurring series.
     */
    readonly occurrenceDate: Date
    /**
     * The start date of the event.
     */
    startDate: Date
    /**
     * The end date for the event.
     */
    endDate: Date
    /**
     * The location associated with the calendar item.
     */
    location: string | null
    /**
     * The time zone for the 
     */
    timeZone: string | null
    /**
     * This setting is used by CalDAV and Exchange servers to indicate how the event should be treated for scheduling purposes.
If the event’s calendar does not support availability settings, this property’s value is EventAvailability.notSupported.
     */
    availability: EventAvailability
    /**
     * A Boolean value that indicates whether an event is a detached instance of a repeating event.
     */
    readonly isDetached: boolean
    readonly hasAlarm: boolean
    readonly hasNotes: boolean
    /**
     * Returns whether this object or any of the objects it contains has uncommitted changes.
     */
    readonly hasChanges: boolean
    readonly hasAttendees: boolean
    /**
     * The attendees associated with the event, as an array of `EventParticipant` objects.
     */
    readonly attendees: EventParticipant[] | null
    readonly organizer: EventParticipant | null
    /**
     * The alarms associated with the calendar item, as an array of EventAlarm objects.
     */
    alarms: EventAlarm[] | null
    /**
     * The recurrence rules for the event.
     */
    recurrenceRules: RecurrenceRule[] | null
    /**
     * The event’s location with a potential geocoordinate.
     */
    structuredLocation: EventStructuredLocation | null
    /**
     * A Boolean value that indicates whether the event has recurrence rules.
     */
    readonly hasRecurrenceRules: boolean

    new(): CalendarEvent

    addAlarm(alarm: EventAlarm): void

    removAlarm(alarm: EventAlarm): void
    /**
     * Adds a recurrence rule to the recurrence rule array.
     */
    addRecurrenceRule(rule: RecurrenceRule): void
    /**
     * Removes a recurrence rule from the recurrence rule array.
     */
    removeRecurrenceRule(rule: RecurrenceRule): void
    /**
     * Removes an event or recurring events from the calendar.
     */
    remove(): Promise<void>
    /**
     * Saves an event or recurring events to the calendar.
     */
    save(): Promise<void>
    /**
     * Present a edit view for editing the calendar event. Returns a promise provides the edit view action when fulfilled.
     */
    presentEditView(): Promise<EventEditViewAction>
    /**
     * To identify events that occur within a given date range and calendars.
     * @param startDate The start date of the range of events fetched.
     * @param endDate The end date of the range of events fetched.
     * @param calendars An array of calendars to search, or null to search all calendars.
     */
    static getAll(startDate: Date, endDate: Date, calendars?: Calendar[]): Promise<CalendarEvent[]>
    /**
     * Present a view for creating new calendar event. Returns a promise provides the saved calendar event when fulfilled.
     */
    static presentCreateView(): Promise<CalendarEvent | null>
  }

  /**
   * The WebSocket object provides the API for creating and managing a WebSocket connection to a server, as well as for sending and receiving data on the connection.
   */
  class WebSocket {
    /**
     * The WebSocket() constructor returns a new WebSocket object and immediately attempts to establish a connection to the specified WebSocket URL.
     */
    new(url: string): WebSocket
    readonly url: string
    onopen?: () => void
    onerror?: (error: Error) => void
    onmessage?: (message: string | Data) => void
    onclose?: (reason?: string) => void
    /**
     * Enqueues the specified data to be transmitted to the server over the WebSocket connection.
     */
    send(message: string | Data): void
    /**
     * Closes the WebSocket connection or connection attempt, if any. If the connection is already CLOSED, this method does nothing.
     * @param code An integer [WebSocket connection close code](https://www.rfc-editor.org/rfc/rfc6455.html#section-7.4.1) value indicating a reason for closure.
     * @param reason A string providing a custom [WebSocket connection close reason](https://www.rfc-editor.org/rfc/rfc6455.html#section-7.1.6) (a concise human-readable prose explanation for the closure). The value must be no longer than 123 bytes (encoded in UTF-8).
     */
    close(code?: 1000 | 1001 | 1002 | 1003, reason?: string): void
    addEventListener(event: "open", listener: () => void): void
    addEventListener(event: "error", listener: (error: Error) => void): void
    addEventListener(event: "message", listener: (message: string | Data) => void): void
    addEventListener(event: "close", listener: (reason?: string) => void): void
    removeEventListener(event: "open", listener: () => void): void
    removeEventListener(event: "error", listener: (error: Error) => void): void
    removeEventListener(event: "message", listener: (message: string | Data) => void): void
    removeEventListener(event: "close", listener: (reason?: string) => void): void
  }

  type DurationInSeconds = number

  /**
   * The shared audio session instance.
   * An audio session acts as an intermediary between your app and the operating system — and, in turn, the underlying audio hardware.
   */
  namespace SharedAudioSession {

    type AudioSessionSetActiveOptions = "notifyOthersOnDeactivation"

    /**
     * The systemwide output volume set by the user.
     */
    const outputVolume: number

    /**
     * Get session category.
     * An audio session category defines a set of audio behaviors for your app. The default category assigned to an audio session is soloAmbient.
     */
    const category: Promise<AudioSessionCategory>
    /**
     * The set of options associated with the current audio session category.
     * You use category options to tailor the behavior of the active audio session category. See `AudioSessionCategoryOptions` for the supported values.
     */
    const categoryOptions: Promise<AudioSessionCategoryOptions[]>
    /**
     * The current audio session’s mode.
     * The audio session mode, together with the audio session category, indicates to the system how you intend to use audio in your app. You can use a mode to configure the audio system for specific use cases such as video recording, voice or video chat, or audio analysis.
     * `AudioSessionMode` discusses the values available for this property. The default value is `default`.
     */
    const mode: Promise<AudioSessionMode>
    /**
     * The preferred sample rate, in hertz.
     */
    const preferredSampleRate: Promise<number>
    /**
     * This property returns true if any other audio is playing, including audio from an app using the ambient category. Most apps should instead use the `secondaryAudioShouldBeSilencedHint` property, because it’s more restrictive when considering whether primary audio from another app is playing.
     */
    const isOtherAudioPlaying: Promise<boolean>
    /**
     * A Boolean value that indicates whether another app, with a nonmixable audio session, is playing audio.
     * Use this property as a hint to silence audio that’s secondary to the functionality of the app. For example, in a game that uses the ambient category, you can use this property to mute the soundtrack while leaving sound effects unmuted.
     */
    const secondaryAudioShouldBeSilencedHint: Promise<boolean>
    /**
     * A Boolean value that indicates a preference for not interrupting the session with system alerts.
     */
    const prefersNoInterruptionsFromSystemAlerts: Promise<boolean>
    /**
     * Not every device supports every audio session category. For instance, the record category isn’t available on a device that doesn’t support audio input.
     * Query this property to determine if the category you’d like to use is available on the current device.
     */
    const availableCategories: Promise<AudioSessionCategory[]>
    /**
     * Not every device supports every audio session mode. For example, the videoRecording mode isn’t available on a device that doesn’t support video recording.
     * Query this property to determine if the mode you’d like to use is available on the current device.
     */
    const availableModes: Promise<AudioSessionMode[]>
    /**
     * A boolean value that indicates whether system sounds and haptics play while recording from audio input.
     */
    const allowHapticsAndSystemSoundsDuringRecording: Promise<boolean>
    /**
     * Activates or deactivates the shared audio session.
     * @param active A Boolean value that indicates whether to activate or deactivate the audio session.
     * @param options An array of additional options for handling audio.
     *  - `notifyOthersOnDeactivation`: An option that indicates whether to notify other audio sessions when the audio session is deactivated.
     * @returns A promise that resolves when the audio session is activated or deactivated.
     */
    function setActive(active: boolean, options?: AudioSessionSetActiveOptions[]): Promise<void>
    /**
     * Sets the audio session’s category with the specified options.
     * @param category The category to apply to the audio session.
     * @param options A mask of additional options for handling audio.
     */
    function setCategory(category: AudioSessionCategory, options: AudioSessionCategoryOptions[]): Promise<void>
    /**
     * Sets the audio session’s mode.
     */
    function setMode(mode: AudioSessionMode): Promise<void>
    /**
     * Sets the preferred sample rate for audio input and output.
     * @param sampleRate The hardware sample rate to use. The available range is device dependent and is typically from 8000 through 48000 hertz.
     */
    function setPreferredSampleRate(sampleRate: number): Promise<void>
    /**
     * The listener is called when an audio interruption occurs.
     */
    function addInterruptionListener(listener: AudioSessionInterruptionListener): void
    function removeInterruptionListener(listener: AudioSessionInterruptionListener): void
    /**
     * Sets a boolean value that indicates whether system sounds and haptics play while recording from audio input.
     */
    function setAllowHapticsAndSystemSoundsDuringRecording(value: boolean): Promise<void>
    /**
     * Sets the preference for not interrupting the audio session with system alerts.
     */
    function setPrefersNoInterruptionsFromSystemAlerts(valiue: boolean): Promise<void>

    type AudioSessionOutputVolumeListener = (newValue: number, oldValue: number) => void

    /**
     * Adds a listener that is called when the output volume changes.
     * @param listener The listener is called when the output volume changes.
     */
    function addOutputVolumeListener(listener: AudioSessionOutputVolumeListener): void
    /**
     * Removes a listener that is called when the output volume changes.
     * @param listener The listener is called when the output volume changes.
     */
    function removeOutputVolumeListener(listener: AudioSessionOutputVolumeListener): void
  }
  /**
  * The type of an audio interruption.
  *  - `began`: A type that indicates that the operating system began interrupting the audio session.
  *  - `ended`: A type that indicates that the operating system ended interrupting the audio session.
  */
  type AudioSessionInterruptionType = 'began' | 'ended' | 'unknown'
  type AudioSessionInterruptionListener = (type: AudioSessionInterruptionType) => void
  /**
  * Audio session mode identifiers.
  *  - `default`: The default audio session mode.
  *  - `gameChat`: A mode that the GameKit framework sets on behalf of an application that uses GameKit’s voice chat service.
  *  - `measurement`: A mode that indicates that your app is performing measurement of audio input or output.
  *  - `moviePlayback`: A mode that indicates that your app is playing back movie content.
  *  - `spokenAudio`: A mode used for continuous spoken audio to pause the audio when another app plays a short audio prompt.
  *  - `videoChat`: A mode that indicates that your app is engaging in online video conferencing.
  *  - `videoRecording`: A mode that indicates that your app is recording a movie.
  *  - `voiceChat`: A mode that indicates that your app is performing two-way voice communication, such as using Voice over Internet Protocol (VoIP).
  *  - `voicePrompt`: A mode that indicates that your app plays audio using text-to-speech.
  */
  type AudioSessionMode = 'default' | 'gameChat' | 'measurement' | 'moviePlayback' | 'spokenAudio' | 'videoChat' | 'videoRecording' | 'voiceChat' | 'voicePrompt'
  /**
  * Constants that specify optional audio behaviors.
  *  - `maxWithOthers`: An option that indicates whether audio from this session mixes with audio from active sessions in other audio apps.
  *  - `duckOthers`: An option that reduces the volume of other audio sessions while audio from this session plays.
  *  - `interruptSpokenAudioAndMixWithOthers`: An option that determines whether to pause spoken audio content from other sessions when your app plays its audio.
  *  - `allowBluetoothHFP`: An option that determines whether Bluetooth hands-free devices appear as available input routes.
  *  - `allowBluetoothA2DP`: An option that determines whether you can stream audio from this session to Bluetooth devices that support the Advanced Audio Distribution Profile (A2DP).
  *  - `allowAirplay`: An option that determines whether you can stream audio from this session to AirPlay devices.
  *  - `defaultToSpeaker`: An option that determines whether audio from the session defaults to the built-in speaker instead of the receiver.
  *  - `overrideMutedMicrophoneInterruption`: An option that indicates whether the system interrupts the audio session when it mutes the built-in microphone.
  */
  type AudioSessionCategoryOptions = 'mixWithOthers' | 'duckOthers' | 'interruptSpokenAudioAndMixWithOthers' | 'allowBluetoothHFP' | 'allowBluetoothA2DP' | 'allowAirPlay' | 'defaultToSpeaker' | 'overrideMutedMicrophoneInterruption'
  /**
  * Audio session category identifiers.
  *  - `ambient`: The category for an app in which sound playback is nonprimary — that is, your app also works with the sound turned off.
  *  - `multiRoute`: The category for routing distinct streams of audio data to different output devices at the same time.
  *  - `playAndRecord`: The category for recording (input) and playback (output) of audio, such as for a Voice over Internet Protocol (VoIP) app.
  *  - `playback`: The category for playing recorded music or other sounds that are central to the successful use of your app.
  *  - `record`: The category for recording audio while also silencing playback audio.
  *  - `soloAmbient`: The default audio session category.
  */
  type AudioSessionCategory = 'ambient' | 'multiRoute' | 'playAndRecord' | 'playback' | 'record' | 'soloAmbient'

  /**
   * Specifies when to pause or stop speech.
   */
  type SpeechBoundary = 'immediate' | 'word'
  /**
   * A distinct voice for use in speech synthesis.
   * See also:
   * * https://developer.apple.com/documentation/avfaudio/avspeechsynthesisvoice
   */
  type SpeechSynthesisVoice = {
    /**
     * The unique identifier of a voice.
     */
    identifier: string
    /**
     * The name of a voice.
     */
    name: string
    /**
     * A BCP 47 code that contains the voice’s language and locale.
     */
    language: string
    /**
     * The speech quality of a voice.
     */
    quality: 'default' | 'premium' | 'enhanced'
    /**
     * The gender for a voice.
     */
    gender: 'male' | 'female' | 'unspecified'
  }
  type SpeechProgressDetails = {
    text: string
    start: number
    end: number
    word: string
  }
  type SpeechSynthesisOptions = {
    /**
     * A boolean value indicates whether the text is a markdown string.
     */
    isMarkdown?: boolean
    /**
     * Set this property to a value within the range of 0.5 for lower pitch to 2.0 for higher pitch. The default value is 1.0.
     * This property will override the `Speech.pitch`.
     */
    pitch?: number
    /**
     * The rate the speech synthesizer uses when speaking the utterance.
     */
    rate?: number
    /**
     * Set this property to a value within the range of 0.0 for silent to 1.0 for loudest volume. The default value is 1.0.
     * This property will override the `Speech.volume`.
     */
    volume?: number
    /**
     * The amount of time the speech synthesizer pauses before speaking the utterance.
     * This property will override the `Speech.preUtteranceDelay`.
     */
    preUtteranceDelay?: number
    /**
     * The amount of time the speech synthesizer pauses after speaking an utterance before handling the next utterance in the queue.
     * This property will override the `Speech.postUtteranceDelay`.
     */
    postUtteranceDelay?: number
    /**
     * Set a voice by identifier.
     * This property will override the value set by calling `Speech.setVoiceByIdentifier` or `Speech.setVoiceByLanguage`.
     */
    voiceIdentifier?: string
    /**
     * Set a voice by language code.
     * This property will override the value set by calling `Speech.setVoiceByIdentifier` or `Speech.setVoiceByLanguage`.
     */
    voiceLanguage?: string
  }
  /**
   * Text To Speech.
   */
  namespace Speech {
    /**
     * The default pitch value.
     * Set this property to a value within the range of 0.5 for lower pitch to 2.0 for higher pitch. The default value is 1.0.
     */
    var pitch: number
    /**
     * The rate the speech synthesizer uses when speaking the utterance.
     * The speech rate is a decimal representation within the range of `Speech.minSpeechRate` and `Speech.maxSpeechRate`. Lower values correspond to slower speech, and higher values correspond to faster speech. The default value is `Speech.defaultSpeechRate`.
     */
    var rate: number
    /**
     * The minimum rate the speech synthesizer uses when speaking an utterance.
     */
    const minSpeechRate: number
    /**
     * The maximum rate the speech synthesizer uses when speaking an utterance.
     */
    const maxSpeechRate: number
    /**
     * The default rate the speech synthesizer uses when speaking an utterance.
     */
    const defaultSpeechRate: number
    /**
     * The default volume value.
     * Set this property to a value within the range of 0.0 for silent to 1.0 for loudest volume. The default value is 1.0.
     */
    var volume: number
    /**
     * The amount of time the speech synthesizer pauses before speaking the utterance.
     * When multiple utterances exist in the queue, the speech synthesizer pauses a minimum amount of time equal to the sum of the current utterance’s postUtteranceDelay and the next utterance’s preUtteranceDelay.
     */
    var preUtteranceDelay: number
    /**
     * The amount of time the speech synthesizer pauses after speaking an utterance before handling the next utterance in the queue.
     * When multiple utterances exist in the queue, the speech synthesizer pauses a minimum amount of time equal to the sum of the current utterance’s postUtteranceDelay and the next utterance’s preUtteranceDelay.
     */
    var postUtteranceDelay: number
    /**
     * Retrieves all available voices on the device.
     */
    const speechVoices: Promise<SpeechSynthesisVoice[]>
    /**
     * A string that contains the BCP 47 language and locale code for the user’s current locale.
     */
    const currentLanguageCode: Promise<string>

    /**
     * A Boolean value that specifies whether the app manages the audio session.
     * If you set this value to false, the system creates a separate audio session to automatically manage speech, interruptions, and mixing and ducking the speech with other audio sources.
     */
    var usesApplicationAudioSession: boolean
    /**
     * Speak a text, it will add the utterance to the speech synthesizer’s queue.
     */
    function speak(text: string, options?: SpeechSynthesisOptions): Promise<void>
    /**
     * Synthesize text to the file stored in local documents directory.
     * @param text Text to synthesize
     * @param filePath The path of file to be stored.
     * @example
     * ```ts
     * await Speech.synthesizeToFile(
     *   "Hello **World**",
     *   Path.join(FileManager.documentDirectory), "tts.caf"),
     *   {
     *     isMarkdown: true,
     *   }
     * )
     * ```
     */
    function synthesizeToFile(text: string, filePath: string, options?: SpeechSynthesisOptions): Promise<void>
    /**
     * Pauses speech at the boundary you specify.
     * @param at A string that describes whether to pause speech immediately or only after the synthesizer finishes speaking the current word. Defaults to 'immediate'.
     */
    function pause(at?: SpeechBoundary): Promise<boolean>
    /**
     * Resumes speech from its paused point.
     */
    function resume(): Promise<boolean>
    /**
     * Stops speech at the boundary you specify.
     * @param at A string that describes whether to stop speech immediately or only after the synthesizer finishes speaking the current word. Defaults to 'immediate'.
     */
    function stop(at?: SpeechBoundary): Promise<boolean>
    /**
     * A Boolean value that indicates whether the speech synthesizer is speaking or is in a paused state and has utterances to speak.
     */
    const isSpeaking: Promise<boolean>
    /**
     * A Boolean value that indicates whether a speech synthesizer is in a paused state.
     * If true, the speech synthesizer is in a paused state after beginning to speak an utterance; otherwise, false.
     */
    const isPaused: Promise<boolean>
    /**
     * Set speech voice by identifier.
     */
    function setVoiceByIdentifier(identifier: string): Promise<boolean>
    /**
     * Set speech voice by language.
     */
    function setVoiceByLanguage(language: string): Promise<boolean>
    function addListener(event: 'start', listener: () => void): void
    function addListener(event: 'pause', listener: () => void): void
    function addListener(event: 'continue', listener: () => void): void
    function addListener(event: 'finish', listener: () => void): void
    function addListener(event: 'cancel', listener: () => void): void
    function addListener(event: 'progress', listener: (details: SpeechProgressDetails) => void): void
    function removeListener(event: 'start', listener: () => void): void
    function removeListener(event: 'pause', listener: () => void): void
    function removeListener(event: 'continue', listener: () => void): void
    function removeListener(event: 'finish', listener: () => void): void
    function removeListener(event: 'cancel', listener: () => void): void
    function removeListener(event: 'progress', listener: (details: SpeechProgressDetails) => void): void
  }

  /**
   * The interface for managing the speech recognizer process.
   */
  namespace SpeechRecognition {
    /**
     * Returns the list of locales that are supported by the speech recognizer.
     */
    const supportedLocales: string[]
    /**
     * Returns a boolean that indicates whether the recognizer is running.
     */
    const isRecognizing: boolean
    /**
     * Start a speech audio buffer recognition request. Return a boolean value that indicates whether the operation was successfully.
     */
    function start(options: {
      /**
       * The locale string representing the language you want to use for speech recognition. For a list of languages supported by the speech recognizer, see `supportedLocales`.
       */
      locale?: string
      /**
       * A boolean value that indicates whether you want intermediate results returned for each utterance.
       */
      partialResults?: boolean
      /**
       * A boolean value that indicates whether to add punctuation to speech recognition results.
       */
      addsPunctuation?: boolean
      /**
       * A boolean value that determines whether a request must keep its audio data on the device.
       */
      requestOnDeviceRecognition?: boolean
      /**
       * A value that indicates the type of speech recognition being performed. Defaults to `unspecified`.
       */
      taskHint?: RecognitionTaskHint
      /**
       * A boolean that indicates whether use the default settings for `SharedAudioSession`. Defaults to true.
       */
      useDefaultAudioSessionSettings?: boolean
      /**
       * The function to call when partial or final results are available, or when an error occurs. If the `partialResults` property is true, this function may be called multiple times to deliver the partial and final results.
       *
       * @param result A `SpeechRecognitionResult` containing the partial or final transcriptions of the audio content.
       */
      onResult: (result: SpeechRecognitionResult) => void
      /**
       * An optional listener that is notified when the sound level of the input changes. Use this to update the UI in response to more or less input.
       */
      onSoundLevelChanged?: (soundLevel: number) => void
    }): Promise<boolean>
    /**
     * Start a request to recognize speech in a recorded audio file.
     */
    function recognizeFile(options: {
      filePath: string
      /**
       * The locale string representing the language you want to use for speech recognition. For a list of languages supported by the speech recognizer, see `supportedLocales`.
       */
      locale?: string
      /**
       * A boolean value that indicates whether you want intermediate results returned for each utterance.
       */
      partialResults?: boolean
      /**
       * A boolean value that indicates whether to add punctuation to speech recognition results.
       */
      addsPunctuation?: boolean
      /**
       * A boolean value that determines whether a request must keep its audio data on the device.
       */
      requestOnDeviceRecognition?: boolean
      /**
       * A value that indicates the type of speech recognition being performed. Defaults to `unspecified`.
       */
      taskHint?: RecognitionTaskHint
      /**
       * The function to call when partial or final results are available, or when an error occurs. If the `partialResults` property is true, this function may be called multiple times to deliver the partial and final results.
       *
       * @param result A `SpeechRecognitionResult` containing the partial or final transcriptions of the audio content.
       */
      onResult: (result: SpeechRecognitionResult) => void
    }): Promise<boolean>
    /**
     * Stop speech recognition request. Return a boolean value that indicates whether the operation was successfully.
     */
    function stop(): Promise<void>
  }
  /**
  * The type of task for which you are using speech recognition.
  *  - `confirmation`: Use this hint type when you are using speech recognition to handle confirmation commands, such as "yes," "no," or "maybe."
  *  - `dictation`: Use this hint type when you are using speech recognition for a task that's similar to the keyboard's built-in dictation function.
  *  - `search`: Use this hint type when you are using speech recognition to identify search terms.
  *  - `unspecified`: Use this hint type when the intended use for captured speech does not match the other task types.
  */
  type RecognitionTaskHint = 'confirmation' | 'dictation' | 'search' | 'unspecified'
  type SpeechRecognitionResult = {
    /**
     * A boolean value that indicates whether speech recognition is complete and whether the transcriptions are final.
     */
    isFinal: boolean
    /**
     * The entire transcription of utterances, formatted into a single, user-displayable string,  with the highest confidence level.
     */
    text: string
  }

  type MediaItem = {
    /**
     * The title or name of the media item.
     */
    title: string
    /**
     * The performing artists for a media item — which may vary from the primary artist for the album that a media item belongs to.
     */
    artist?: string
    /**
     * The artwork image for the media item.
     */
    artwork?: UIImage
    /**
     * The track number of the media item, for a media item that is part of an album.
     */
    albumTrackNumber?: number
    /**
     * The number of tracks for the album that contains the media item.
     */
    albumTrackCount?: number
    /**
     * The key for the persistent identifier for the media item.
     */
    persistentID?: number
    /**
     * The media type of the media item.
     */
    mediaType?: 'music' | 'podcast' | 'audioBook' | 'anyAudio' | 'movie' | 'tvShow' | 'audioITunesU' | 'videoPodcast' | 'musicVideo' | 'videoITunesU' | 'homeVideo' | 'anyVideo' | 'any'
    /**
     * The music or film genre of the media item.
     */
    genre?: string
    /**
     * The disc number of the media item, for a media item that is part of a multidisc album.
     */
    discNumber?: number
    /**
     * The number of discs for the album that contains the media item.
     */
    discCount?: number
    /**
     * The musical composer for the media item.
     */
    composer?: string
    /**
     * The playback duration of the media item.
     */
    playbackDuration?: DurationInSeconds
    /**
     * The title of an album.
     */
    albumTitle?: string
  }

  /**
   * The commands that respond to remote control events sent by external accessories and system controls.
   *  - `play`: The command for starting playback of the current item.
   *  - `pause`: The command for pausing playback of the current item.
   *  - `stop`: The command for stopping playback of the current item.
   *  - `togglePausePlay`: The command for toggling between playing and pausing the current item.
   *  - `nextTrack`: The command for selecting the next track.
   *  - `previousTrack: The command for selecting the previous track.
   *  - `changeRepeatMode`: The command for changing the repeat mode.
   *  - `changeShuffleMode`: The command for changing the shuffle mode.
   *  - `changePlaybackRate`: The command for changing the playback rate of the current media item.
   *  - `seekBackward`: The command for seeking backward through a single media item.
   *  - `seekForward`: The command for seeking forward through a single media item.
   *  - `skipBackward`: The command for playing a previous point in a media item.
   *  - `skipForward`: The command for playing a future point in a media item.
   *  - `changePlaybackPosition`: The command for changing the playback position in a media item.
   *  - `rating`: The command for rating a media item.
   *  - `like`: The command for indicating that a user likes what is currently playing.
   *  - `dislike`: The command for indicating that a user dislikes what is currently playing.
   *  - `bookmark`: The command for indicating that a user wants to remember a media item.
   *  - `enableLanguageOption`: The command for enabling a language option.
   *  - `disableLanguageOption`: The command for disabling a language option
   */
  type MediaPlayerRemoteCommand =
    | 'pause' | 'play' | 'stop' | 'togglePausePlay'
    | 'nextTrack' | 'previousTrack' | 'changeRepeatMode' | 'changeShuffleMode'
    | 'changePlaybackRate' | 'seekBackward' | 'seekForward' | 'skipBackward' | 'skipForward' | 'changePlaybackPosition'
    | 'rating' | 'like' | 'dislike'
    | 'bookmark'
    | 'enableLanguageOption' | 'disableLanguageOption'

  /**
   * The type of media currently playing.
   */
  enum MediaType {
    audio,
    video,
    none
  }

  type NowPlayingInfo = {
    /**
     * The title or name of the media item.
     */
    title: string
    /**
     * The performing artists for a media item — which may vary from the primary artist for the album that a media item belongs to.
     */
    artist?: string
    /**
     * The artwork image for the media item.
     */
    artwork?: UIImage
    /**
     * The title of an album.
     */
    albumTitle?: string
    /**
     * Defaults to `audio`.
     */
    mediaType?: MediaType
    /**
     * Defaults to 0.
     */
    playbackRate?: number
    /**
     * Defaults to 0.
     */
    elapsedPlaybackTime?: DurationInSeconds
    /**
     * Defaults to 0.
     */
    playbackDuration?: DurationInSeconds
  }

  type MediaPlayerRemoteCommandEvent = {
    /**
     * The time the event occurred.
     */
    timestamp: number
  }

  type MediaPlayerSkipIntervalCommandEvent = MediaPlayerRemoteCommandEvent & {
    /**
     * The chosen interval for this skip command event.
     */
    interval: number
  }

  /**
   * The type of seek command event.
   */
  enum MediaPlayerSeekCommandEventType {
    beginSeeking,
    endSeeking
  }

  type MediaPlayerSeekCommandEvent = MediaPlayerRemoteCommandEvent & {
    /**
     * The type of seek command event, which specifies whether an external player began or ended seeking.
     */
    type: MediaPlayerSeekCommandEventType
  }

  /**
   * An event requesting a change in the rating.
   */
  type MediaPlayerRatingCommandEvent = MediaPlayerRemoteCommandEvent & {
    /**
     * The rating for the command event.
     */
    rating: number
  }

  /**
   * An event requesting a change in the playback rate.
   */
  type MediaPlayerChangePlaybackRateCommandEvent = MediaPlayerRatingCommandEvent & {
    /**
     * The chosen playback rate for the command event.
     */
    playbackRate: number
  }

  /**
   * An event requesting a change in the feedback setting.
   */
  type MediaPlayerFeedbackCommandEvent = MediaPlayerRemoteCommandEvent & {
    /**
     * A Boolean value that indicates whether an app should perform a negative command appropriate to the target.
     */
    isNegative: boolean
  }

  /**
   * An event requesting a change in the playback position.
   */
  type MediaPlayerChangePlaybackPositionCommandEvent = MediaPlayerRemoteCommandEvent & {
    /**
     * The playback position used when setting the current time of the player.
     */
    positionTime: number
  }

  enum MediaPlayerShuffleType {
    off,
    /**
     * Nothing is shuffled during playback.
     */
    items,
    /**
     * Individual items are shuffled during playback.
     */
    collections = 2
  }

  enum MediaPlayerRepeatType {
    off,
    /**
     * Nothing is repeated during playback.
     */
    one,
    /**
     * Repeat a single item indefinitely.
     */
    all,
  }

  type MediaPlayerChangeShuffleModeCommandEvent = MediaPlayerRemoteCommandEvent & {
    /**
     * The desired shuffle type to use when fulfilling the request.
     */
    shuffleType: MediaPlayerShuffleType
    /**
     * Whether or not the selection should be preserved between playback sessions
     */
    preservesShuffleMode: boolean
  }

  type MediaPlayerChangeRepeatModeCommandEvent = MediaPlayerRemoteCommandEvent & {
    /**
     * The desired repeat type to use when fulfilling the request.
     */
    repeatType: MediaPlayerRepeatType
    /**
     * Whether or not the selection should be preserved between playback sessions
     */
    preservesRepeatMode: boolean
  }

  enum MediaPlayerNowPlayingInfoLanguageOptionType {
    audible,
    legible,
  }

  type MediaPlayerNowPlayingInfoLanguageOption = {
    /**
     * The unique identifier for the language option.
     */
    identifier?: string
    /**
     * A boolean value that determines whether to use the best audible language option based on the system preferences.
     */
    isAutomaticLegibleLanguageOption: boolean
    /**
     * A boolean value that determines whether to use the best legible language option based on the system preferences.
     */
    isAutomaticAudibleLanguageOption: boolean
    /**
     * The type of language option.
     */
    languageOptionType: MediaPlayerNowPlayingInfoLanguageOptionType
    /**
     * The abbreviated language code for the language option.
     */
    languageTag?: string
    /**
     * The characteristics that describe the content of the language option.
     */
    languageOptionCharacteristics?: string[]
    /**
     * The display name for a language option.
     */
    displayName?: string
  }

  enum MediaPlayerChangeLanguageOptionSetting {
    none,
    /**
     * No Language Option Change
     */
    nowPlayingItemOnly,
    /**
     * The Language Option change applies only the the now playing item
     */
    permanent,
  }

  type MediaPlayerChangeLanguageOptionCommandEvent = MediaPlayerRemoteCommandEvent & {
    /**
     * The requested language option to change.
     */
    languageOption: MediaPlayerNowPlayingInfoLanguageOption
    /**
     * The extent of the language setting change.
     */
    setting: MediaPlayerChangeLanguageOptionSetting
  }

  enum MediaPlayerPlaybackState {
    unknown,
    /**
     * The app is currently playing a media item.
     */
    playing,
    /**
     * 
     */
    paused,
    /**
     * The app has stopped playing.
     */
    stopped,
    /**
     * The app has been interrupted during playback.
     */
    interrupted,
  }

  /**
   * This interface is used to interact with NowPlayingCenter, display NowPlayingInfo and register commands and related handlers.
   */
  namespace MediaPlayer {
    /**
     * The current Now Playing information for the default Now Playing info center.
     * To clear the now playing info center dictionary, set it to null.
     */
    var nowPlayingInfo: NowPlayingInfo | null
    /**
     * The current playback state of the Scripting app.
     */
    var playbackState: MediaPlayerPlaybackState
    /**
     * Providing an array of commands, indicates that the designated elements are enabled so users can interact with them.
     * Other commands not included will be shown as non-interactive in the UI, and your script will not receive these events.
     */
    function setAvailableCommands(commands: MediaPlayerRemoteCommand[]): void
    /**
     * Register the command handler, the callback function will be called when a command event was sent to your script.
     */
    var commandHandler: ((command: "pause" | "play" | "stop" | "togglePausePlay" | "nextTrack" | "previousTrack", event: MediaPlayerRemoteCommandEvent) => void)
      | ((command: "like" | "dislike" | "bookmark", event: MediaPlayerFeedbackCommandEvent) => void)
      | ((command: "seekBackward" | "seekForward", event: MediaPlayerSeekCommandEvent) => void)
      | ((command: "skipBackward" | "skipForward", event: MediaPlayerSkipIntervalCommandEvent) => void)
      | ((command: "rating", event: MediaPlayerRatingCommandEvent) => void)
      | ((command: "changeRepeatMode", event: MediaPlayerChangeRepeatModeCommandEvent) => void)
      | ((command: "changeShuffleMode", event: MediaPlayerChangeShuffleModeCommandEvent) => void)
      | ((command: "enableLanguageOption" | "disableLanguageOption", event: MediaPlayerChangeLanguageOptionCommandEvent) => void)
      | undefined
      | null
  }

  enum TimeControlStatus {
    paused,
    waitingToPlayAtSpecifiedRate,
    playing,
  }

  /**
   * Represents a single metadata item.
   */
  class AVMetadataItem {
    /**
     * The key of the metadata item.
     */
    key: string
    /**
     * The common key of the metadata item.
     * This value contains the key that most closely corresponds to the key property, but that belongs to the common key space. You can use this key to locate metadata items irrespective of the underlying media format.
     */
    commonKey?: string
    /**
     * The identifier of the metadata item.
     */
    identifier?: string
    /**
     * The extended language tag of the metadata item.
     */
    extendedLanguageTag?: string
    /**
     * The locale of the metadata item.
     */
    locale?: string
    /**
     * The timestamp of the metadata item in seconds.
     */
    time?: number
    /**
     * The duration of the metadata item in seconds.
     */
    duration?: number
    /**
     * The start date of the metadata item. The value is null if the metadata item doesn’t provide a start date.
     */
    startDate?: Date
    /**
     * The data type of the metadata item.
     */
    dataType?: string
    /**
     * Extra attributes, when they’re present, are specific to metadata container formats and keys in their associated key-spaces. For example, a metadata item can represent the “attached picture” frame defined by the ID3 tag specification with keyspace id3 and key id3MetadataKeyAttachedPicture, a value that carries the image data, and extra attributes that include a description of the picture as carried in the 'APIC' frame of the ID3 tag.
     */
    extraAttributes: Promise<Record<string, any> | null>
    /**
     * The value of the metadata item as a `Data` type.
     */
    dataValue: Promise<Data | null>
    /**
     * The value of the metadata item as a `string` type.
     */
    stringValue: Promise<string | null>
    /**
     * The value of the metadata item as a `number` type.
     */
    numberValue: Promise<number | null>
    /**
     * The value of the metadata item as a `Date` type.
     */
    dateValue: Promise<Date | null>
  }

  /**
   * Rounding methods to use when performing time calculations.
   *  - `quickTime`: Rounds using the QuickTime method.
   *  - `roundAwayFromZero`: Rounds away from zero.
   *  - `roundTowardZero`: Rounds toward zero.
   *  - `roundHalfAwayFromZero`: Rounds half away from zero.
   *  - `roundTowardNegativeInfinity`: Rounds toward negative infinity.
   *  - `roundTowardPositiveInfinity`: Rounds toward positive infinity.
   *  - `default`: The default rounding method. This value is equal to `roundHalfAwayFromZero`.
   */
  type MediaTimeRoundingMethod = 'quickTime' | 'roundAwayFromZero' | 'roundTowardZero' | 'roundHalfAwayFromZero' | 'roundTowardNegativeInfinity' | 'roundTowardPositiveInfinity' | 'default'

  /**
   * Represents a media time.
   */
  class MediaTime {
    private constructor()

    readonly secondes: number
    readonly isValid: boolean
    readonly isPositiveInfinity: boolean
    readonly isNegativeInfinity: boolean
    readonly isIndefinite: boolean
    readonly isNumeric: boolean
    readonly hasBeenRounded: boolean

    convertScale(newTimescale: number, method: MediaTimeRoundingMethod): MediaTime
    getSeconds(): number
    minus(other: MediaItem): MediaItem
    plus(other: MediaItem): MediaItem
    lt(other: MediaItem): boolean
    gt(other: MediaItem): boolean
    lte(other: MediaItem): boolean
    gte(other: MediaItem): boolean
    eq(other: MediaItem): boolean
    neq(other: MediaItem): boolean

    /**
     * Makes a media time.
     * @param options The options to make the media time.
     * 
     * Makes with `value` and `timescale`:
     * @param options.value The value of the media time.
     * @param options.timescale The timescale of the media time.
     * 
     * Makes with `seconds` and `preferredTimescale`:
     * @param options.seconds The seconds of the media time.
     * @param options.preferredTimescale The preferred timescale of the media time.
     * 
     * @returns The media time. If the media time is invalid, then `MediaTime.invalid()` is returned.
     */
    static make(options: {
      value: number
      timescale: number
    } | {
      seconds: number
      preferredTimescale: number
    }): MediaTime
    static zero(): MediaTime
    static invalid(): MediaTime
    static indefinite(): MediaTime
    static positiveInfinity(): MediaTime
    static negativeInfinity(): MediaTime
  }

  namespace MediaComposer {
    /**
     * Represents a time range.
     */
    type TimeRange = {
      /**
       * The start time of the time range.
       */
      start: MediaTime
      /**
       * The duration of the time range.
       */
      duration: MediaTime
    }

    /**
     * Represents a fade configuration.
     */
    type FadeConfig = {
      /**
       * The number of seconds to fade in the clip. Defaults to 0.
       */
      fadeInSeconds?: number
      /**
       * The number of seconds to fade out the clip. Defaults to 0.
       */
      fadeOutSeconds?: number
    }

    type DuckingConfig = {
      /**
       * Whether ducking is enabled. Defaults to true.
       */
      enabled?: boolean
      /**
       * External audio volume during voice/dialogue. (0...1). Defaults to 0.25.
       */
      duckedVolume?: number
      /**
       * Seconds to ramp down before a voice segment starts. Defaults to 0.15.
       */
      attackSeconds?: number
      /**
       * Seconds to ramp up after a voice segment ends. Defaults to 0.25.
       */
      releaseSeconds?: number
    }

    /**
     * Represents an export preset.
     */
    type ExportPreset = "640x480" | "960x540" | "1280x720" | "1920x1080" | "3840x2160" | "AppleM4A" | "LowQuality" | "MediumQuality" | "HighestQuality" | "HEVC1920x1080" | "HEVC3840x2160" | "HEVC4320x2160"
      | "HEVC7680x4320" | "MVHEVC960x960" | "MVHEVC1440x1440" | "MVHEVC4320x4320" | "MVHEVC7680x7680"
      | "HEVCHighestQuality" | "AppleProRes422LPCM" | "AppleProRes4444LPCM" | "HEVC1920x1080WithAlpha"
      | "HEVC3840x2160WithAlpha" | "HEVCHighestQualityWithAlpha"

    type VideoClip = {
      /**
       * The video file path.
       */
      videoPath: string
      /**
       * The time range to use from the source video. Defaults to the entire video.
       */
      sourceTimeRange?: TimeRange | null
      /**
       * Whether to keep the original audio from the source video. Defaults to false.
       */
      keepOriginalAudio?: boolean
      /**
       * The fade configuration.
       */
      fade?: FadeConfig | null
    }

    type ImageClip = {
      /**
       * The image file path.
       */
      imagePath: string
      /**
       * The duration of the clip.
       */
      duration: MediaTime
      /**
       * The content mode to handle the image.
       */
      contentMode?: "fit" | "crop"
      /**
       * The background color of the clip.
       */
      backgroundColor?: Color
      /**
       * The fade configuration.
       */
      fade?: FadeConfig | null
    }

    /**
     * Represents a video or image clip.
     */
    type VideoItem = XOR<VideoClip, ImageClip>

    type AudioClip = {
      /**
       * The audio file path.
       */
      path: string
      /**
       * The time range to use from the source audio. Defaults to the entire audio.
       */
      sourceTimeRange?: TimeRange | null
      /**
       * Place this clip at a specific time on the final timeline. If null, clips are appended sequentially after the previous external audio clip.
       */
      at?: MediaTime
      /**
       * Per-clip gain (0...1). Defaults to 1.
       */
      volume?: number
      /**
       * The fade configuration.
       */
      fade?: FadeConfig | null
      /**
       * Whether to loop the audio clip to match the duration of the video. Defaults to false.
       */
      loopToFitVideoDuration?: boolean
    }

    /**
     * Represents a video scale mode.
     *  - `fit`: The video is resized to fit the `renderSize` using the default resizing mode.
     *  - `crop`: The video is resized to fit the `renderSize` using the `crop` resizing mode.
     */
    type VideoScaleMode = 'fit' | 'crop'

    /**
     * Represents a color space policy.
     *  - `keepSource`: Keep the color space of the source video.
     *  - `forceSDR`: Force the color space to SDR.
     */
    type colorSpacePolicy = 'keepSource' | 'forceSDR'

    type ExportFileType = "mp4" | "mov" | "qta" | "m4v" | "m4a" | "mobile3GPP" | "mobile3GPP2"

    type ExportOptions = {
      /**
       * The size to render the video at. Defaults to 1080x1920.
       */
      renderSize?: Size
      /**
       * The frame rate to use when rendering the video. Defaults to 30.
       */
      frameRate?: number
      /**
       * The color space policy to use when rendering the video. Defaults to `forceSDR`.
       */
      scaleMode?: VideoScaleMode
      /**
       * Global fade for video clips. Per-clip fade overrides it when provided.
       */
      globalVideoFade?: FadeConfig | null
      /**
       * External audio default gain (applied as base before per-clip volume). (0...1). Defaults to 1.
       */
      externalAudioBaseVolume?: number
      /**
       * Duck external audio when video original audio exists.
       */
      ducking?: DuckingConfig
      /**
       * The export preset to use. Defaults to `HighestQuality`.
       */
      presetName?: ExportPreset
      /**
       * The output file type to use. Defaults to `mp4`.
       */
      outputFileType?: ExportFileType
    }

    /**
     * Composes a video and audio timeline and exports it to a file.
     * @param options The options for the export.
     * @param options.exportPath The path to export the video to.
     * @param options.timeline The timeline to export.
     * @param options.timeline.videoItems The video items to include in the timeline, either video clips or image clips.
     * @param options.timeline.audioClips The audio clips to include in the timeline.
     * @param options.exportOptions The export options to use.
     * @param options.overwrite Whether to overwrite the output file if it already exists. Defaults to true.
     * @returns A promise that resolves to an object containing the output path and duration, or rejects with an error.
     */
    function composeAndExport(options: {
      exportPath: string
      timeline: {
        videoItems: VideoItem[]
        audioClips: AudioClip[]
      }
      exportOptions?: ExportOptions
      overwrite?: boolean
    }): Promise<{
      exportPath: string
      duration: MediaTime
    }>
  }

  /**
   * Use for playing audio or video.
   */
  class AVPlayer {
    /**
     * Controls the volume of the AVPlayer.
     * Value ranges from `0.0` (muted) to `1.0` (full volume).
     */
    volume: number
    /**
     * The total duration of the media in seconds.
     * Value will be `0` until the media is fully loaded and ready to play.
     */
    duration: DurationInSeconds
    /**
     * The current playback time of the media in seconds.
     * Can be used to get or set the current position of the playback.
     */
    currentTime: DurationInSeconds
    /**
     * Controls the playback rate of the media.
     * Value `1.0` is normal speed, values less than `1.0` slow down playback, and values greater than `1.0` speed up playback.
     */
    rate: number
    /**
     * A value that indicates whether playback is in progress, paused indefinitely, or waiting for network conditions to improve.
     */
    readonly timeControlStatus: TimeControlStatus
    /**
     * Controls how many times the media will loop.
     * Set to `0` for no looping, a positive value for a specific number of loops, or a negative value for infinite looping.
     */
    numberOfLoops: number
    /**
     * Sets the media source for playback.
     * @param filePathOrURL he file path or URL to the media resource. This can be either a local file path or a remote URL.
     * @returns `true` if the media source is set successfully, otherwise `false`.
     */
    setSource(filePathOrURL: string): boolean
    /**
     * Plays the current media.
     * @returns `true` if the media starts playing successfully, otherwise `false`.
     */
    play(): boolean
    /**
     * Pauses the current media playback.
     */
    pause(): void
    /**
     * Stops the current media playback and resets to the beginning.
     */
    stop(): void
    /**
     * Releases all resources and removes any observers.
     * Should be called when the player is no longer needed.
     */
    dispose(): void
    /**
     * Callback that is called when the media is ready to play.
     */
    onReadyToPlay?: () => void
    /**
     * Callback that is called when the timeControlStatus changed.
     */
    onTimeControlStatusChanged?: (status: TimeControlStatus) => void
    /**
     * Callback that is called when the media playback has ended.
     */
    onEnded?: () => void
    /**
     * Callback that is called when an error occurs during playback.
     * The callback receives an error message as an argument.
     */
    onError?: (message: string) => void

    /**
     * Loads the metadata for the current media.
     * @returns A promise that resolves to an array of `AVMetadataItem` objects, or `null` if the metadata is not available or you haven't set the media source.
     */
    loadMetadata(): Promise<AVMetadataItem[] | null>

    /**
     * Loads the common metadata for the current media. The common `AVMetadataItem` will provide the `commonKey` property.
     * @returns A promise that resolves to an array of `AVMetadataItem` objects, or `null` if the metadata is not available or you haven't set the media source.
     */
    loadCommonMetadata(): Promise<AVMetadataItem[] | null>
  }

  type AudioFormat =
    | "LinearPCM"
    | "MPEG4AAC"
    | "AppleLossless"
    | "AppleIMA4"
    | "iLBC"
    | "ULaw"

  enum AVAudioQuality {
    min = 0,
    low = 32,
    medium = 64,
    high = 96,
    max = 127
  }

  /**
   * A class that records audio data to a file.
   * 
   *  Use an audio recorder to:
   *  - Record audio from the system’s active input device
   *  - Record for a specified duration or until the user stops recording
   *  - Pause and resume a recording
   */
  class AudioRecorder {
    /**
     * Creates an audio recorder with settings, it will fail and throw an error if you don't have permission.
     * @param filePath The file system location to record to.
     * @param settins The audio settings to use for the recording.
     */
    static create(filePath: string, settins?: {
      /**
       * An value that represents the format of the audio data.
       */
      format?: AudioFormat
      /**
       * A floating point value that represents the sample rate, in hertz. 8000 to 192000.
       */
      sampleRate?: number
      /**
       * An integer value that represents the number of channels. 1 to 64.
       */
      numberOfChannels?: number
      encoderAudioQuality?: AVAudioQuality
    }): Promise<AudioRecorder>

    /**
     * A boolean indicating whether the recorder is recording.
     */
    readonly isRecording: boolean

    /**
     * The time, in seconds, since the beginning of the recording.
     */
    readonly currentTime: DurationInSeconds

    /**
     * The current time of the host audio device, in seconds.
     */
    readonly deviceCurrentTime: DurationInSeconds

    /**
     * Records audio starting at a specific time for the indicated duration if given.
     * 
     * @example
     * ```ts
     * function startSynchronizedRecording() {
     *     // Create a time offset relative to the current device time.
     *     let timeOffset = recorderOne.deviceCurrentTime + 0.01
     *     
     *     // Synchronize the recording time of both recorders.
     *     recorderOne.record({ atTime: timeOffset })
     *     recorderTwo.record({ atTime: timeOffset })
     * }
     * ```
     */
    record(options?: {
      /**
       * The time at which to start recording, relative to deviceCurrentTime.
       */
      atTime?: DurationInSeconds
      /**
       * The duration of time to record, in seconds.
       */
      duration?: DurationInSeconds
    }): boolean

    /**
     * Pauses an audio recording.
     */
    pause(): void

    /**
     * Stops recording and closes the audio file.
     */
    stop(): void

    /**
     * Deletes a recorded audio file.
     */
    deleteRecording(): boolean

    /**
     * Should be called when the recorder is no longer needed.
     */
    dispose(): void

    /**
     * Callback that is called when recording finish.
     */
    onFinish?: (success: boolean) => void
    /**
     * Callback that is called when ecorder encode error occured.
     */
    onError?: (message: string) => void
  }

  /**
   * A type that represents a camera position.
   */
  type CameraPosition = "front" | "back"

  /**
   * A type that represents a camera type.
   */
  type CameraType = "wide" | "ultraWide" | "telephoto" | "trueDepth" | "dual" | "dualWide" | "triple"

  type VideoRecorderState = "idle" | "preparing" | "ready" | "recording" | "paused" | "finishing" | "finished" | "failed"

  type VideoCaptureSessionPreset = "high" | "medium" | "low" | "cif352x288" | "vga640x480" | "iFrame960x540" | "iFrame1280x720" | "hd1280x720" | "hd1920x1080" | "hd4K3840x2160"

  type VideoCodec = "hevc" | "h264" | "jpeg" | "JPEGXL" | "proRes4444" | "appleProRes4444XQ" | "proRes422" | "proRes422HQ" | "proRes422LT" | "proRes422Proxy" | "proResRAW" | "proResRAWHQ" | "hevcWithAlpha"

  type VideoOrientation = "portrait" | "landscapeLeft" | "landscapeRight"

  class VideoRecorder {
    /**
     * Creates a video recorder with settings.
     * @param settings The video settings to use for the recording.
     * @param settings.camera The camera to use for the recording. Defaults to { position: "back" }. If you don't provide the preferredTypes, it will use the default types by camera position.
     * @param settings.frameRate The frame rate to use for the recording. Supports 24, 30, 60, 120. Defaults to 30.
     * @param settings.audioEnabled A boolean value that indicates whether audio is enabled for the recording. Defaults to true.
     * @param settings.sessionPreset The session preset to use for the recording. Defaults to "high".
     * @param settings.videoCodec The video codec to use for the recording. Defaults to "hevc".
     * @param settings.videoBitRate The average bit rate—as bits per second—used in compressing video.
     * @param settings.orientation The orientation to use for the recording. Defaults to "portrait".
     * @param settings.mirrorFrontCamera A boolean value that indicates whether the front camera is mirrored. Defaults to true.
     */
    constructor(settings?: {
      camera?: {
        position: CameraPosition
        preferredTypes?: CameraType[]
      }
      frameRate?: number
      audioEnabled?: boolean
      sessionPreset?: VideoCaptureSessionPreset
      videoCodec?: VideoCodec
      videoBitRate?: number
      orientation?: VideoOrientation
      mirrorFrontCamera?: boolean
    })

    /**
     * The minimum zoom factor for the video recorder.
     */
    readonly minZoomFactor: number
    /**
     * The maximum zoom factor for the video recorder.
     */
    readonly maxZoomFactor: number
    /**
     * The current zoom factor for the video recorder.
     */
    readonly currentZoomFactor: number
    /**
     * A video zoom factor multiplier to use when displaying zoom information in a user interface.
     * @available iOS 18.0+
     */
    readonly displayZoomFactor: number
    /**
     * A video zoom factor multiplier to use when displaying zoom information in a user interface.
     * @available iOS 18.0+
     */
    readonly displayZoomFactorMultiplier: number
    /**
     * A boolean value that indicates whether the current device of the video recorder has a torch.
     */
    readonly hasTorch: boolean
    /**
     * The current torch mode for the video recorder.
     */
    readonly torchMode: 'auto' | 'on' | 'off'

    /**
     * The current state of the video recorder.
     */
    state: VideoRecorderState

    /**
     * The callback that is called when the state of the video recorder changes.
     * @param state The new state of the video recorder.
     * @param details Additional details about the state change. When the state is "failed", this parameter contains the error message, and when the state is "finished", this parameter contains the path to the video file.
     */
    onStateChanged?:
      | ((state: VideoRecorderState, details?: string) => void)
      | null

    /**
     * Prepares the video recorder for recording.
     * @returns A promise that resolves when the video recorder is ready for recording, or rejects with an error.
     */
    prepare(): Promise<void>

    /**
     * Starts a video recording, saving it to the specified path.
     * @param toPath The path to save the video recording to.
     * @throws An error if the video recording could not be started.
     */
    startRecording(toPath: string): void

    /**
     * Pauses a video recording.
     * @throws An error if the video recording could not be paused.
     */
    pauseRecording(): void

    /**
     * Resumes a video recording.
     * @throws An error if the video recording could not be resumed.
     */
    resumeRecording(): void

    /**
     * Stops a video recording.
     * @returns A promise that resolves when the video recording is stopped, or rejects with an error.
     */
    stopRecording(): Promise<void>

    /**
     * Resets the video recorder, resetting the state. You should call this method when the video recorder is stopped and you want to start a new recording.
     * @returns A promise that resolves when the video recorder is reset, or rejects with an error.
     */
    reset(): Promise<void>

    /**
     * Sets the torch mode for the video recorder.
     * @param mode The torch mode to set.
     */
    setTorchMode(mode: 'auto' | 'off' | 'on'): void

    /**
     * Sets the focus point.
     * @param focusPoint The focus point to set.
     */
    setFocusPoint(focusPoint: { x: number; y: number }): void

    /**
     * Sets the exposure point.
     * @param focusPoint The exposure point to set.
     */
    setExposurePoint(focusPoint: { x: number; y: number }): void

    /**
     * Resets the focus point.
     */
    resetFocus(): void

    /**
     * Resets the exposure point.
     */
    resetExposure(): void

    /**
     * Sets the zoom factor for the video recorder.
     * @param factor The zoom factor to set.
     */
    setZoomFactor(factor: number): void

    /**
     * Sets the zoom factor for the video recorder using a ramp.
     * @param toFactor The new magnification factor.
     * @param rate The rate at which to transition to the new magnification factor, specified in powers of two per second.
     */
    rampZoomFactor(toFactor: number, rate: number): void

    /**
     * Resets the zoom factor for the video recorder.
     */
    resetZoom(): void

    /**
     * Disposes the video recorder. You should call this method when the video recorder is no longer needed. After this method is called, the video recorder will be destroyed and cannot be used again.
     */
    dispose(): Promise<void>
  }

  type SocketIOStatus =
    | "connected"
    | "connecting"
    | "disconnected"
    | "notConnected"
    | "unknown"

  type SocketManagerConfig = {
    /**
     * If given, the WebSocket transport will attempt to use compression.
     */
    compress?: boolean
    /**
     * A dictionary of GET parameters that will be included in the connect url.
     */
    connectParams?: Record<string, any>
    /**
     * An array of cookies that will be sent during the initial connection.
     */
    cookies?: {
      name: string
      value: string
      originURL?: string
      version?: string
      domain?: string
      path?: string
      secure?: string
      expires?: string
      comment?: string
      commentURL?: string
      discard?: string
      maximumAge?: string
      port?: string
      sameSitePolicy?: "lax" | "strict"
    }[]
    /**
     * Any extra HTTP headers that should be sent during the initial connection.
     */
    extraHeaders?: Record<string, string>
    /**
     * If passed true, will cause the client to always create a new engine. Useful for debugging, or when you want to be sure no state from previous engines is being carried over.
     */
    forceNew?: boolean
    /**
     * If passed true, the only transport that will be used will be HTTP long-polling.
     */
    forcePolling?: boolean
    /**
     * If passed true, the only transport that will be used will be WebSockets.
     */
    forceWebsockets?: boolean
    /**
     * If passed true, the WebSocket stream will be configured with the enableSOCKSProxy true.
     */
    enableSOCKSProxy?: boolean
    /**
     * A custom path to socket.io. Only use this if the socket.io server is configured to look for this path.
     */
    path?: string
    /**
     * If passed false, the client will not reconnect when it loses connection. Useful if you want full control over when reconnects happen.
     */
    reconnects?: boolean
    /**
     * The number of times to try and reconnect before giving up. Pass -1 to never give up.
     */
    reconnectAttempts?: number
    /**
     * The minimum number of seconds to wait before reconnect attempts.
     */
    reconnectWait?: number
    /**
     * The maximum number of seconds to wait before reconnect attempts.
     */
    reconnectWaitMax?: number
    /**
     * The randomization factor for calculating reconnect jitter.
     */
    randomizationFactor?: number
    /**
     * Set true if your server is using secure transports.
     */
    secure?: boolean
  }

  /**
   * A SocketManager is responsible for multiplexing multiple namespaces through a single SocketEngineSpec.
   * 
   * Example:
   * ```ts
   * let manager = SocketManager("http://localhost:8080/")
   * let defaultNamespaceSocket = manager.defaultSocket
   * let roomASocket = manager.socket("/roomA")
   * 
   * // defaultNamespaceSocket and roomASocket both share a single connection to the server
   * ```
   * Sockets created through the manager are retained by the manager. So at the very least, a single strong reference to the manager must be maintained to keep sockets alive.
   * To disconnect a socket and remove it from the manager, either call `SocketIOClient.disconnect()` on the socket.
   */
  class SocketManager {
    constructor(url: string, config?: SocketManagerConfig)

    /**
     * The URL of the socket.io server.
     */
    readonly socketURL: string

    /**
     * The status of this manager.
     */
    readonly status: SocketIOStatus

    readonly config: SocketManagerConfig

    readonly forceNew: boolean

    readonly reconnects: boolean

    readonly reconnectWait: number

    readonly reconnectWaitMax: number

    readonly randomizationFactor: number

    /**
     * The socket associated with the default namespace (”/”).
     */
    readonly defaultSocket: SocketIOClient

    /**
     * Returns a SocketIOClient for the given namespace. This socket shares a transport with the manager.
     */
    socket(namespace: string): SocketIOClient

    /**
     * Sets manager specific configs.
     */
    setConfigs(config: SocketManagerConfig): void

    /**
     * Disconnects the manager and all associated sockets.
     */
    disconnect(): void

    /**
     * Tries to reconnect to the server.
     */
    reconnect(): void
  }

  /**
   * Represents a socket.io-client.
   * 
   * Clients are created through a SocketManager, which owns the SocketEngineSpec that controls the connection to the server.
   * 
   * For example:
   * 
   * ```ts
   * // Create a socket for the "/roomA" namespace
   * let socket = manager.socket("/roomA")
   * 
   * // Add some handlers and connect
   * ```
   */
  class SocketIOClient {
    /**
     * The id of this socket.io connect.
     */
    readonly id: string | null
    /**
     * The status of this client.
     */
    readonly status: SocketIOStatus

    connect(): void

    disconnect(): void

    emit(event: string, data: any): void

    on(
      event: "connect" | "disconnect" | "error" | "ping" | "pong" | "reconnect" | "reconnectAttempt" | "statusChange" | "websocketUpgrade",
      callback: (data: any[], ack: (value?: any) => void) => void
    ): void
    on(event: string, callback: (data: any[], ack: (value?: any) => void) => void): void
  }

  /**
   * Represents an SSH authentication method.
   * This class provides static methods to create various types of SSH authentication methods, such as password-based and private key-based authentication.
   */
  class SSHAuthenticationMethod {
    /**
     * Creates a password based authentication method.
     * @param username The username to authenticate with.
     * @param password The password to authenticate with.
     */
    static passwordBased(username: string, password: string): SSHAuthenticationMethod
    /**
     * Creates a private key based authentication method.
     * @param username The username to authenticate with.
     * @param sshRsa The RSA private key in OpenSSH format.
     * @param decryptionKey An optional decryption key for the private key, if it is encrypted.
     * @returns An SSHAuthenticationMethod instance
     */
    static ras(username: string, sshRsa: Data, decryptionKey?: Data): SSHAuthenticationMethod | null
    static ed25519(username: string, sshEd25519: Data, decryptionKey?: Data): SSHAuthenticationMethod | null
    static p256(username: string, pemRepresentation: string): SSHAuthenticationMethod | null
    static p384(username: string, pemRepresentation: string): SSHAuthenticationMethod | null
    static p521(username: string, pemRepresentation: string): SSHAuthenticationMethod | null
  }

  /**
   * Represents a TTY Stdin Writer.
   * This class provides methods to write data to the TTY stdin and change the terminal size.
   */
  class TTYStdinWriter {

    /**
     * Writes data to the TTY stdin.
     * @param data The data to write to the TTY stdin.
     * @returns A promise that resolves when the data has been written.
     */
    write(data: string): Promise<void>

    /**
     * Changes the size of the TTY terminal.
     * @param options An object containing the new size of the terminal.
     * @param options.cols The number of columns in the terminal.
     * @param options.rows The number of rows in the terminal.
     * @param options.pixelWidth The pixel width of the terminal.
     * @param options.pixelHeight The pixel height of the terminal.
     * @returns A promise that resolves when the terminal size has been changed.
     */
    changeSize(options: {
      cols: number
      rows: number
      pixelWidth: number
      pixelHeight: number
    }): Promise<void>
  }

  /**
   * Represents an SFTP file.
   */
  class SFTPFile {
    /**
     * True if the file is still open, false otherwise.
     */
    readonly isActive: boolean

    /**
     * Reads the attributes of the file.
     * @returns A promise that resolves to an object containing the attributes of the file. Throws an error if the operation fails.
     */
    readAttributes(): Promise<{
      size?: number
      userId?: number
      groupId?: number
      accessTime?: Date
      modificationTime?: Date
      permissions?: number
    }>

    /**
     * Reads data from the file.
     * @param options An object containing options for reading the file.
     * @param options.from The offset to start reading from. Defaults to 0.
     * @param options.length The number of bytes to read. Defaults to the end of the file.
     * @returns A promise that resolves to the data read from the file. Throws an error if the operation fails.
     */
    read(options?: {
      from?: number
      length?: number
    }): Promise<Data>

    /**
     * Reads all data from the file.
     * @returns A promise that resolves to the data read from the file. Throws an error if the operation fails.
     */
    readAll(): Promise<Data>
    /**
     * Writes data to the file.
     * @param data The data to write to the file.
     * @param at The offset to start writing at.
     * @returns A promise that resolves when the data has been written. Throws an error if the operation fails.
     */
    write(data: Data, at?: number): Promise<void>
    /**
     * Closes the file.
     */
    close(): Promise<void>
  }

  /**
   * Represents a set of flags that can be used when opening an SFTP file.
   */
  type SFTPOpenFileFlags = "write" | "append" | "create" | "truncate" | "read" | "forceCreate"

  /**
   * Represents an SFTP client that allows you to interact with an SFTP server.
   * This class provides methods to perform various file operations such as reading directories, creating directories, reading and writing files, and more.
   */
  class SFTPClient {
    /**
     * True if the SFTP connection is still open, false otherwise.
     */
    readonly isActive: boolean

    /**
     * Closes the SFTP connection.
     */
    close(): Promise<void>

    /**
     * Reads the contents of a directory at the specified path.
     * @param atPath The path to the directory to read.
     * @returns A promise that resolves to an array of directory entries.
     */
    readDirectory(atPath: string): Promise<{
      filename: string
      longname: string
      attributes: {
        size?: number
        userId?: number
        groupId?: number
        accessTime?: Date
        modificationTime?: Date
        permissions?: number
      }
    }[]>

    /**
     * Creates a directory at the specified path.
     * @param atPath The path where the directory should be created.
     * @returns A promise that resolves when the directory is successfully created, or rejects with an error if the directory creation fails.
     */
    createDirectory(atPath: string): Promise<void>

    /**
     * Removes a directory at the specified path.
     * @param atPath The path of the directory to remove.
     * @returns A promise that resolves when the directory is successfully removed, or rejects with an error if the directory removal fails.
     */
    removeDirectory(atPath: string): Promise<void>

    /**
     * Renames a file or directory from oldPath to newPath.
     * @param oldPath The current path of the file or directory to rename.
     * @param newPath The new path for the file or directory.
     * @returns A promise that resolves when the rename operation is successful, or rejects with an error if the rename fails.
     */
    rename(oldPath: string, newPath: string): Promise<void>

    /**
     * Gets the attributes of a file or directory at the specified path.
     * @param atPath The path to the file or directory whose attributes are to be retrieved.
     * @returns A promise that resolves to an object containing the attributes of the file or directory, such as size, userId, groupId, accessTime, modificationTime, and permissions. Or rejects with an error if the attributes cannot be retrieved.
     */
    getAttributes(atPath: string): Promise<{
      size?: number
      userId?: number
      groupId?: number
      accessTime?: Date
      modificationTime?: Date
      permissions?: number
    }>

    /**
     * Opens a file at the specified path with the specified flags.
     * @param filePath The path to the file to open.
     * @param flags The flags to use when opening the file.
     * @returns A promise that resolves to an SFTPFile object representing the opened file. Or rejects with an error if the file cannot be opened.
     */
    openFile(filePath: string, flags: SFTPOpenFileFlags | SFTPOpenFileFlags[]): Promise<SFTPFile>

    /**
     * Removes a file at the specified path.
     * @param atPath The path of the file to remove.
     * @returns A promise that resolves when the file is successfully removed, or rejects with an error if the file removal fails.
     */
    remove(atPath: string): Promise<void>

    /**
     * Removes a file at the specified path.
     * @param atPath The path of the file to remove.
     * @returns A promise that resolves when the file is successfully removed, or rejects with an error if the file removal fails.
     */
    getRealPath(atPath: string): Promise<string>
  }

  /**
   * Represents an SSH client that allows you to connect to an SSH server and execute commands.
   * This class provides methods for connecting to the server, executing commands, and managing the SSH session.
   */
  class SSHClient {
    /**
     * Connects to an SSH server using the provided options.
     * @param options The options for connecting to the SSH server.
     * @param options.host The hostname or IP address of the SSH server.
     * @param options.port The port number of the SSH server. Defaults to 22.
     * @param options.authenticationMethod The SSHAuthenticationMethod to use for authentication.
     * @param options.trustedHostKeys An optional array of trusted host keys. If provided, the client will verify the server's host key against this list.
     * @param options.reconnect An optional string that specifies the reconnection behavior. Can be "never", "always", or "once". Defaults to "never".
     * @returns A promise that resolves to an SSHClient instance if the connection is successful, or rejects with an error if the connection fails.
     */
    static connect(options: {
      host: string
      port?: number
      authenticationMethod: SSHAuthenticationMethod
      trustedHostKeys?: string[]
      reconnect?: "never" | "always" | "once"
    }): Promise<SSHClient>

    /**
     * The disconnect callback function that is called when the SSH connection is disconnected.
     */
    onDisconnect: (() => void) | null

    /**
     * Executes a command on the SSH server.
     * @param command The command to execute on the SSH server.
     * @param options An optional object containing additional options for the command execution.
     * @param options.maxResponseSize The maximum size of the response to return. Defaults to no limit.
     * @param options.includeStderr A boolean value that indicates whether to include the standard error output in the response. Defaults to false.
     * @param options.inShell A boolean value that indicates whether to execute the command in a shell. Defaults to false.
     * @returns A promise that resolves to the command output as a string if the command execution is successful, or rejects with an error if the command execution fails.
     * @throws Error if the command execution fails or if the SSH connection is not established.
     */
    executeCommand(command: string, options?: {
      maxResponseSize?: number
      includeStderr?: boolean
      inShell?: boolean
    }): Promise<string>

    /**
     * Executes a command on the SSH server and streams the output.
     * @param command The command to execute on the SSH server.
     * @param onOutput A callback function that is called for each line of output from the command. The function receives the output data and a boolean indicating whether it is standard error output. The function should return `true` to continue receiving output or `false` to stop receiving output.
     * @param options An optional object containing additional options for the command execution.
     * @returns A promise that resolves when the command execution is complete, or rejects with an error if the command execution fails.
     */
    executeCommandStream(command: string, onOutput: (data: Data, isStderr: boolean) => boolean, options?: {
      inShell?: boolean
    }): Promise<void>

    /**
     * Opens a pseudo-terminal (PTY) session on the SSH server.
     * @param options An object containing options for the PTY session.
     * @param options.wantReply A boolean value that indicates whether to wait for a reply from the server. Defaults to true.
     * @param options.term The terminal type to use for the PTY session. Defaults to "xterm".
     * @param options.terminalCharacterWidth The character width of the terminal. Defaults to 80.
     * @param options.terminalRowHeight The row height of the terminal. Defaults to 24.
     * @param options.terminalPixelWidth The pixel width of the terminal. Defaults to 0.
     * @param options.terminalPixelHeight The pixel height of the terminal. Defaults to 0.
     * @param options.onOutput A callback function that is called for each line of output from the PTY session. The function receives the output data and a boolean indicating whether it is standard error output. The function should return `true` to continue receiving output or `false` to stop receiving output.
     * @param options.onError An optional callback function that is called when an error occurs in the PTY session. The function receives the error message as a string.
     * @returns A promise that resolves to a TTYStdinWriter instance if the PTY session is successfully opened, or rejects with an error if the PTY session fails to open.
     */
    withPTY(optoins: {
      wantReply?: boolean
      term?: string
      terminalCharacterWidth?: number
      terminalRowHeight?: number
      terminalPixelWidth?: number
      terminalPixelHeight?: number
      onOutput: (data: Data, isStderr: boolean) => boolean
      onError?: (error: string) => void
    }): Promise<TTYStdinWriter>

    /**
     * Creates a TTY session and executes the provided closure with input/output streams.
     * @param options An object containing options for the TTY session.
     * @param options.onOutput A callback function that is called for each line of output from the TTY session. The function receives the output data and a boolean indicating whether it is standard error output. The function should return `true` to continue receiving output or `false` to stop receiving output.
     * @param options.onError An optional callback function that is called when an error occurs in the TTY session. The function receives the error message as a string.
     * @returns A promise that resolves to a TTYStdinWriter instance if the TTY session is successfully created, or rejects with an error if the TTY session fails to open.
     */
    withTTY(options: {
      onOutput: (data: Data, isStderr: boolean) => boolean
      onError?: (error: string) => void
    }): Promise<TTYStdinWriter>

    /**
     * Opens an SFTP session on the SSH server.
     * @returns A promise that resolves to an SFTPClient instance if the SFTP session is successfully opened, or rejects with an error if the SFTP session fails to open.
     */
    openSFTP(): Promise<SFTPClient>

    /**
     * Jumps to a remote host using the provided SSH authentication method.
     * @param options An object containing options for the SSH jump connection.
     * @param options.host The hostname or IP address of the remote host to jump to.
     * @param options.port The port number of the remote host. Defaults to 22.
     * @param options.authenticationMethod The SSHAuthenticationMethod to use for authentication.
     * @param options.trustedHostKeys An optional array of trusted host keys. If provided, the client will verify the server's host key against this list.
     * @returns A promise that resolves to an SSHClient instance if the jump connection is successful, or rejects with an error if the jump connection fails.
     */
    jump(options: {
      host: string
      port?: number
      authenticationMethod: SSHAuthenticationMethod
      trustedHostKeys?: string[]
    }): Promise<SSHClient>

    /**
     * Closes the SSH connection.
     * This method should be called when the SSH client is no longer needed to release resources.
     * @returns A promise that resolves when the SSH connection is successfully closed.
     */
    close(): Promise<void>
  }

  /**
   * This interface represents an OAuth2 credential object that contains the necessary tokens and metadata for OAuth2 authentication.
   * It is used to store the OAuth tokens and other related information after a successful authorization.
   */
  type OAuthCredential = {
    /**
     * The OAuth2 access token used to authenticate requests to the OAuth2 provider.
     * This token is typically used to access protected resources on behalf of the user.
     */
    oauthToken: string
    /**
     * The OAuth2 token secret used to sign requests to the OAuth2 provider.
     * This secret is used to verify the authenticity of the request and ensure that it has not been tampered with.
     */
    oauthTokenSecret: string
    /**
     * The OAuth2 refresh token used to obtain a new access token when the current one expires.
     * This token is used to refresh the access token without requiring the user to reauthorize the application.
     * It is typically used when the access token has a short lifespan and needs to be renewed periodically.
     */
    oauthRefreshToken: string
    /**
     * The expiration time of the OAuth2 access token, represented as a Unix timestamp in milliseconds.
     * This value indicates when the access token will expire and no longer be valid for making requests to the OAuth2 provider.
     */
    oauthTokenExpiresAt: number | null
    /**
     * The OAuth2 authorization code verifier used in the PKCE (Proof Key for Code Exchange) flow.
     */
    oauthVerifier: string
    version: string
    /**
     * The signature method used for signing requests to the OAuth2 provider.
     */
    signatureMethod: string
  }

  class OAuth2 {
    /**
     * Creates an OAuth2 instance with the given options.
     * @param options The options for the OAuth2 instance.
     * @param options.consumerKey The consumer key for the OAuth2 instance.
     * @param options.consumerSecret The consumer secret for the OAuth2 instance.
     * @param options.authorizeUrl The URL to redirect the user to for authorization.
     * @param options.accessTokenUrl The URL to request the access token from. Optional, if not provided, the access token will be requested from the authorize URL.
     * @param options.responseType The response type to use when requesting the access token. Defaults to "code".
     * @param options.contentType The content type to use when requesting the access token. Defaults to "application/x-www-form-urlencoded".
     * @throws Error if the options are invalid or if the OAuth2 instance cannot be created.
     */
    constructor(options: {
      consumerKey: string
      consumerSecret: string
      authorizeUrl: string
      accessTokenUrl?: string
      responseType: string
      contentType?: string
    })

    /**
     * If your oauth provider need to use basic authentification set value to true, defaults to false.
     */
    accessTokenBasicAuthentification: boolean

    /**
     * Set to true to deactivate state check. Be careful of CSRF.
     */
    allowMissingStateCheck: boolean

    /**
     * Encode callback url, some services require it to be encoded.
     */
    encodeCallbackURL: boolean

    /**
     * Encode callback url inside the query, this is second encoding phase when the entire query string gets assembled. In rare cases, like with Imgur, the url needs to be encoded only once and this value needs to be set to `false`.
     */
    encodeCallbackURLQuery: boolean

    /**
     * This method initiates the OAuth2 authorization flow.
     * It redirects the user to the OAuth2 provider's authorization page, where they can grant access to the application.
     * After the user grants access, they will be redirected back to the specified callback URL with an authorization code.
     * You script can then use this code to request an access token.
     * @param options The options for the authorization request.
     * @param options.callbackURL The URL to redirect the user to after authorization. Optional, if not provided, the default callback URL will be used (defaults to "scripting://oauth_callback/current_script_encoded_name"). You can use `Script.createOAuthCallbackURL(uniqueName)` to create your unique callback URL.
     * @param options.scope The scope of the authorization request. This is a space-separated list of permissions that the application is requesting.
     * @param options.state A unique string that is used to prevent CSRF attacks. This should be a random string that is generated by the application.
     * @param options.parameters Additional parameters to include in the authorization request. This can be used to pass additional information to the OAuth2 provider.
     * @param options.headers Additional headers to include in the authorization request. This can be used to pass additional information to the OAuth2 provider.
     * @param options.codeVerifier The code verifier for PKCE (Proof Key for Code Exchange) flow. This is a random string that is used to verify the authorization code.
     * @param options.codeChallenge The code challenge for PKCE flow. This is a hashed version of the code verifier that is sent to the OAuth2 provider.
     * @param options.codeChallengeMethod The method used to hash the code verifier. This can be "plain" or "S256". If not provided, the default is "S256".
     * @returns A promise that resolves to an `OAuthCredential` object containing the OAuth tokens and other information.
     * @throws Error if the authorization request fails.
     */
    authorize(options: {
      callbackURL?: string
      scope: string
      state: string
      parameters?: Record<string, any>
      headers?: Record<string, string>
    } & ({
      codeVerifier: string
      codeChallenge: string
      codeChallengeMethod: string
    } | {
      codeVerifier?: never
      codeChallenge?: never
      codeChallengeMethod?: never
    })): Promise<OAuthCredential>

    /**
     * This method is used to renew the access token using a refresh token.
     * It sends a request to the OAuth2 provider's token endpoint to exchange the refresh token for a new access token.
     * The new access token can then be used to access protected resources on behalf of the user.
     * @param options The options for the token renewal request.
     * @param options.refreshToken The refresh token to use for renewing the access token.
     * @param options.parameters Additional parameters to include in the token renewal request. This can be used to pass additional information to the OAuth2 provider.
     * @param options.headers Additional headers to include in the token renewal request. This can be used to pass additional information to the OAuth2 provider.
     * @returns A promise that resolves to an `OAuthCredential` object containing the new OAuth tokens and other information.
     * @throws Error if the token renewal request fails.
     */
    renewAccessToken(options: {
      refreshToken: string
      parameters?: Record<string, any>
      headers?: Record<string, string>
    }): Promise<OAuthCredential>
  }

  type EditorControllerOptions = {
    /**
     * The initial content of the editor.
     */
    content?: string
    /**
     * The extension is used to indicate the file type of the content.
     */
    ext?: "tsx" | "ts" | "js" | "jsx" | "txt" | "md" | "css" | "html" | "json"
    /**
     * The read only state of the editor. Defaults to false.
     */
    readOnly?: boolean
  }

  /**
   * This interface allows you to create an editor controller, access and set editor content, listen for content changes, and display an editor or render it through an `Editor` view.
   */
  class EditorController {
    constructor(options?: EditorControllerOptions)
    /**
     * The extension is used to indicate the file type of the content.
     */
    readonly ext: string
    /**
     * The current content of the editor.
     */
    content: string
    /**
     * The content changed callback handler.
     * 
     * It is important to note that when editing in the editor, the onContentChanged callback is not called immediately, but about 100 milliseconds later.
     */
    onContentChanged?: (content: string) => void
    /**
     * Call this method to present the editor, returns a promise that fulfilled when the editor is dismissed.
     * You can call this method again when the editor is dismissed and you havn't call the `dispose` method.
     * @param options You can provide this value to override the value of `Script.name`. When the editor code is running, the default value of `Script.name` is `"Temporary Script"`.
     * @param options.navigationTitle The title of the editor navigation bar.
     * @param options.scriptName This value will override the value of `Script.name` when the editor code is running.
     * @param options.fullscreen A boolean value that indicates whether the editor should be presented in fullscreen mode. Defaults to false.
     * @return A promise that resolves when the editor is dismissed.
     */
    present(options?: {
      navigationTitle?: string
      scriptName?: string
      fullscreen?: boolean
    }): Promise<void>
    /**
     * Dismissing the editor. The editor has not been disposed, so you can call the `present` method again to show the editor.
     */
    dismiss(): Promise<void>
    /**
     * Release resources. When you no longer need this instance, you must call this method to avoid memory leaks.
     */
    dispose(): void
  }

  /**
   * This interface provides tools to interact with the software keyboard. You can check the visibility of the keyboard, hide it, and listen for changes in its visibility.
   */
  namespace Keyboard {
    /**
     * A read-only property that indicates whether the keyboard is currently visible.
     */
    const visible: boolean

    /**
     * Hides the keyboard if it is currently visible.
     */
    function hide(): void

    /**
     * Adds a listener function that is called whenever the keyboard's visibility changes.
     */
    function addVisibilityListener(listener: (visible: boolean) => void): void

    /**
     * Removes a previously added visibility listener.
     */
    function removeVisibilityListener(listener: (visible: boolean) => void): void
  }

  type UnitType = {
    value: number
    symbol: string
    formatted: string
  }

  /**
   * Temperature is a comparative measure of thermal energy. The SI unit for temperature is the kelvin (K), which is defined in terms of the triple point of water. Temperature is also commonly measured by degrees of various scales, including Celsius (°C) and Fahrenheit (°F).
   */
  type UnitTemperature = UnitType

  /**
   * Speed is the magnitude of velocity, or the rate of change of position. Speed can be expressed by SI derived units in terms of meters per second (m/s), and is also commonly expressed in terms of kilometers per hour (km/h) and miles per hour (mph).
   */
  type UnitSpeed = UnitType

  /**
   * Length is the dimensional extent of matter. The SI unit for length is the meter (m), which is defined in terms of the distance traveled by light in a vacuum.
   */
  type UnitLength = UnitType

  /**
   * Angle is a quantity of rotation. The SI unit for angle is the radian (rad), which is dimensionless and defined to be the angle subtended by an arc that is equal in length to the radius of a circle. Angle is also commonly expressed in terms of degrees (°) and revolutions (rev).
   */
  type UnitAngle = UnitType

  /**
   * Pressure is the normal force over a surface. The SI unit for pressure is the pascal (Pa), which is derived as one newton of force over one square meter (1 Pa = 1 N / 1 m2).
   */
  type UnitPressure = UnitType

  /**
   * Contains wind data of speed, direction, and gust.
   */
  type WeatherWind = {
    compassDirection: string
    direction: UnitAngle
  }

  type WeatherCondition =
    /**Blizzard. */
    | "blizzard"

    /** Blowing dust or sandstorm. **/
    | "blowingDust"

    /** Blowing or drifting snow. **/
    | "blowingSnow"

    /** Breezy, light wind. **/
    | "breezy"

    /** Clear. **/
    | "clear"

    /** Cloudy, overcast conditions. **/
    | "cloudy"

    /** Drizzle or light rain. **/
    | "drizzle"

    /** Flurries or light snow. **/
    | "flurries"

    /** Fog. **/
    | "foggy"

    /** Freezing drizzle or light rain. **/
    | "freezingDrizzle"

    /** Freezing rain. **/
    | "freezingRain"

    /** Frigid conditions, low temperatures, or ice crystals. **/
    | "frigid"

    /** Hail. **/
    | "hail"

    /** Haze. **/
    | "haze"

    /** Heavy rain. **/
    | "heavyRain"

    /** Heavy snow. **/
    | "heavySnow"

    /** High temperatures. **/
    | "hot"

    /** Hurricane. **/
    | "hurricane"

    /** Thunderstorms covering less than 1/8 of the forecast area. **/
    | "isolatedThunderstorms"

    /** Mostly clear. **/
    | "mostlyClear"

    /** Mostly cloudy. **/
    | "mostlyCloudy"

    /** Partly cloudy. **/
    | "partlyCloudy"

    /** Rain. **/
    | "rain"

    /** Numerous thunderstorms spread across up to 50% of the forecast area. **/
    | "scatteredThunderstorms"

    /** Sleet. **/
    | "sleet"

    /** Smoky. **/
    | "smoky"

    /** Snow. **/
    | "snow"

    /** Notably strong thunderstorms. **/
    | "strongStorms"

    /** Snow flurries with visible sun. **/
    | "sunFlurries"

    /** Rain with visible sun. **/
    | "sunShowers"

    /** Thunderstorms. **/
    | "thunderstorms"

    /** Tropical storm. **/
    | "tropicalStorm"

    /** Windy. **/
    | "windy"

    /** Wintry mix. **/
    | "wintryMix"

  type WeatherPressureTrend =
    /** The pressure is rising. */
    | "rising"

    /** The pressure is falling. */
    | "falling"

    /** The pressure is not changing. */
    | "steady"

  type WeatherUVIndex = {
    value: number
    category: WeatherExposureCategory
  }

  /**
   *  Risk of harm from unprotected sun exposure.
   */
  type WeatherExposureCategory =
    /// The UV index is low.
    ///
    /// The valid values of this property are 0, 1, and 2.
    | "low"

    /// The UV index is moderate.
    ///
    /// The valid values of this property are 3, 4, and 5.
    | "moderate"

    /// The UV index is high.
    ///
    /// The valid values of this property are 6 and 7.
    | "high"

    /// The UV index is very high.
    ///
    /// The valid values of this property are 8, 9, and 10.
    | "veryHigh"

    /// The UV index is extreme.
    ///
    /// The valid values of this property are 11 and higher.
    | "extreme"

  /**
   * An object that provides additional weather information.
   */
  type WeatherMetadata = {
    /**
     * The time of the weather data request.
     */
    date: number
    /**
     * The time the weather data expires.
     */
    expirationDate: number
    /**
     * The location of the request.
     */
    location: LocationInfo
  }

  /**
   * An object that describes the current conditions observed at a location.
   */
  type CurrentWeather = {
    /**
     * The current temperature.
     */
    temperature: UnitTemperature
    /**
     * The feels-like temperature when factoring wind and humidity.
     */
    apparentTemperature: UnitTemperature
    /**
     * The temperature at which relative humidity is 100%.
     */
    dewPoint: UnitTemperature
    /**
     * The percentage of the sky covered with clouds.
     */
    cloudCover: number
    /**
     * The amount of water vapor in the air.
     */
    humidity: number
    /**
     * The sea level air pressure in millibars.
     */
    pressure: UnitPressure
    /**
     * The direction of change of the sea level air pressure.
     */
    pressureTrend: WeatherPressureTrend
    /**
     * The wind speed, direction, and gust.
     */
    wind: WeatherWind
    /**
     * An enumeration value indicating the condition at the time.
     */
    condition: WeatherCondition
    /**
     * The date timestamp of the current weather.
     */
    date: number
    /**
     * A Boolean value indicating whether there is daylight.
     */
    isDaylight: boolean
    /**
     * The level of ultraviolet radiation.
     */
    uvIndex: WeatherUVIndex
    /**
     * The distance at which terrain is visible.
     */
    visibility: UnitLength
    /**
     * Descriptive information about the current weather data.
     */
    metadata: WeatherMetadata
    /**
     * The SF Symbol icon that represents the current weather condition and whether it’s daylight at the current date.
     */
    symbolName: string
    /**
     * 
     * (iOS 18.0+ only) The percentage of the sky covered with low-altitude, middle altitude and high-altitude clouds during the period.
     */
    cloudCoverByAltitude?: CloudCoverByAltitude
    /**
     * The current precipitation intensity in kilometers per hour.
     */
    precipitationIntensity: UnitSpeed
  }

  type WeatherPrecipitation =
    /// No precipitation.
    | "none"

    /// A form of precipitation consisting of solid ice.
    | "hail"

    /// Wintry Mix.
    | "mixed"

    /// Rain.
    | "rain"

    /// A form of precipitation consisting of ice pellets.
    | "sleet"

    /// Snow.
    | "snow"

  type WeatherMoonPhase =
    /// The disk is unlit where the moon is not visible.
    | "new"

    /// The disk is partially lit as the moon is waxing.
    | "waxingCrescent"

    /// The disk is half lit.
    | "firstQuarter"

    /// The disk is half lit as the moon is waxing.
    | "waxingGibbous"

    /// The disk is fully lit where the moon is visible.
    | "full"

    /// The disk is half lit as the moon is waning.
    | "waningGibbous"

    /// The disk is half lit.
    | "lastQuarter"

    /// The disk is partially lit as the moon is waning.
    | "waningCrescent"


  type WeatherMoonEvents = {
    moonrise?: number
    moonset?: number
    phase: WeatherMoonPhase
  }

  type WeatherSunEvents = {
    astronomicalDawn?: number
    astronomicalDusk?: number
    civilDawn?: number
    civilDusk?: number
    nauticalDawn?: number
    nauticalDusk?: number
    solarMidnight?: number
    solarNoon?: number
    sunrise?: number
    sunset?: number
  }

  type SnowfallAmount = {
    amount: UnitLength
    amountLiquidEquivalent: UnitLength
    maximum: UnitLength
    maximumLiquidEquivalent: UnitLength
    minimum: UnitLength
    minimumLiquidEquivalent: UnitLength
  }

  /**
   * An object that provides a breakdown of amounts of all forms of precipitation that is expected to occur over a period of time.
   */
  type PrecipitationAmountByType = {
    hail: UnitLength
    mixed: UnitLength
    precipitation: UnitLength
    rainfall: UnitLength
    sleet: UnitLength
    snowfallAmount: SnowfallAmount
  }

  /**
   * Contains the percentage of sky covered by low, medium and high altitude cloud.
   */
  type CloudCoverByAltitude = {
    high: number
    medium: number
    low: number
  }

  type DayPartForecast = {
    cloudCover: number
    condition: WeatherCondition
    cloudCoverByAltitude: CloudCoverByAltitude
    highWindSpeed: UnitSpeed
    highTemperature: UnitTemperature
    lowTemperature: UnitTemperature
    maximumHumidity: number
    maximumVisibility: UnitLength
    minimumHumidity: number
    minimumVisibility: UnitLength
    precipitation: WeatherPrecipitation
    precipitationAmountByType: PrecipitationAmountByType
    precipitationChance: number
    wind: WeatherWind
  }

  type DayWeather = {
    /**
     * The daytime high temperature.
     */
    highTemperature: UnitTemperature
    /**
     * The overnight low temperature.
     */
    lowTemperature: UnitTemperature
    /**
     * The description of precipitation for this day.
     */
    precipitation: WeatherPrecipitation
    /**
     * The probability of precipitation during the day.
     */
    precipitationChance: number
    /**
     * The lunar events for the day.
     */
    moon: WeatherMoonEvents
    /**
     * The solar events for the day.
     */
    sun: WeatherSunEvents
    /**
     * The wind speed, direction, and gust.
     */
    wind: WeatherWind
    /**
     * A description of the weather condition on this day.
     */
    condition: WeatherCondition
    /**
     * The start time of the day weather.
     */
    date: number
    /**
     * The expected intensity of ultraviolet radiation from the sun.
     */
    uvIndex: WeatherUVIndex
    /**
     * The SF Symbol icon that represents the day weather condition.
     */
    symbolName: string

    /**
     * (iOS 18.0+only) The weather forecast from 7AM - 7PM on this day.
     */
    daytimeForecast?: DayPartForecast
    /**
     * (iOS 18.0+only) The time at which the high temperature occurs on this day.
     */
    highTemperatureTime?: number
    /**
     * (iOS 18.0+only) The maximum sustained wind speed.
     */
    highWindSpeed?: UnitSpeed
    /**
     * (iOS 18.0+only) The maximum amount of water vapor in the air for the day.
     */
    maximumHumidity?: number
    /**
     * (iOS 18.0+only) The maximum distance at which terrain is visible for the day.
     */
    maximumVisibility?: number
    /**
     * (iOS 18.0+only) The minimum amount of water vapor in the air for the day.
     */
    minimumHumidity?: number
    /**
     * (iOS 18.0+only) The minimum distance at which terrain is visible for the day.
     */
    minimumVisibility?: number
    /**
     * (iOS 18.0+only) The time at which the low temperature occurs on this day.
     */
    lowTemperatureTime?: number
    /**
     * (iOS 18.0+only) A breakdown of amounts of all forms of precipitation forecasted for the day.
     */
    precipitationAmountByType?: PrecipitationAmountByType
    /**
     * (iOS 18.0+only) The weather forecast for 7PM on this day until 7AM the following day.
     */
    overnightForecast?: DayPartForecast
    /**
     * (iOS 18.0+only) The forecast from now until midnight local time.
     */
    restOfDayForecast?: DayPartForecast
  }

  type HourWeather = {
    /**
     * The apparent, or “feels like” temperature during the hour.
     */
    apparentTemperature: UnitTemperature
    /**
     * The humidity for the hour.
     */
    humidity: number
    /**
     * The temperature during the hour.
     */
    temperature: UnitTemperature
    /**
     * The amount of moisture in the air.
     */
    dewPoint: UnitTemperature
    /**
     * The atmospheric pressure at sea level at a given location.
     */
    pressure: UnitPressure
    /**
     * The kind and amount of atmospheric pressure change over time.
     */
    pressureTrend: WeatherPressureTrend
    /**
     * The percentage of the sky covered with clouds.
     */
    cloudCover: number
    /**
     * A description of the weather condition for this hour.
     */
    condition: WeatherCondition
    /**
     * The presence or absence of daylight at the requested location and hour.
     */
    isDaylight: boolean
    /**
     * The distance at which an object can be clearly seen.
     */
    visibility: UnitLength
    /**
     * The expected intensity of ultraviolet radiation from the sun.
     */
    uvIndex: WeatherUVIndex
    /**
     * Wind data describing the wind speed, direction, and gust.
     */
    wind: WeatherWind
    /**
     * The start time of the hour weather.
     */
    date: number
    /**
     * Description of precipitation for this hour.
     */
    precipitation: WeatherPrecipitation
    /**
     * The probability of precipitation during the hour.
     */
    precipitationChance: number
    /**
     * The SF Symbol icon that represents the hour weather condition and whether it’s daylight on the hour.
     */
    symbolName: string
    /**
     * The amount of precipitation for the hour.
     */
    precipitationAmount: UnitLength
    /**
     * (iOS 18.0+only) The percentage of the sky covered with low altitude, middle altitude and high altitude clouds during the period.
     */
    cloudCoverByAltitude?: CloudCoverByAltitude
    /**
     * (iOS 18.0+only) The amount of snowfall for the hour.
     */
    snowfallAmount?: UnitLength
  }

  type WeatherDailyForecast = {
    metadata: WeatherMetadata
    forecast: DayWeather[]
  }

  type WeatherHourlyForecast = {
    metadata: WeatherMetadata
    forecast: HourWeather[]
  }

  /**
   * Provides an interface for obtaining weather data.
   */
  namespace Weather {
    /**
     * Query current weather by speficeid location.
     */
    function requestCurrent(location: LocationInfo): Promise<CurrentWeather>
    /**
     * Query the daily forecast by specified location. This returns 10 contiguous days, beginning with the current day.
     * @param location The location to query.
     * @param options The options for the query.
     * @param options.startDate The start date for the forecast.
     * @param options.endDate The end date for the forecast.
     * @returns A promise that resolves to the daily forecast.
     */
    function requestDailyForecast(location: LocationInfo, options?: {
      startDate: Date
      endDate: Date
    }): Promise<WeatherDailyForecast>
    /**
     * Query the hourly forecast by specified location. This returns 25 contiguous hours, beginning with the current hour.
     * @param location The location to query.
     * @param options The options for the query.
     * @param options.startDate The start date for the forecast.
     * @param options.endDate The end date for the forecast.
     * @returns A promise that resolves to the hourly forecast.
     */
    function requestHourlyForecast(location: LocationInfo, options?: {
      startDate: Date
      endDate: Date
    }): Promise<WeatherHourlyForecast>
  }

  type JSONSchemaArray = {
    type: "array"
    items: JSONSchemaType
    required?: boolean
    description: string
  }

  type JSONSchemaObject = {
    type: "object"
    properties: Record<string, JSONSchemaType>
    required?: boolean
    description: string
  }

  type JSONSchemaPrimitive = {
    type: "string" | "number" | "boolean"
    required?: boolean
    description: string
  }

  type JSONSchemaType = JSONSchemaPrimitive | JSONSchemaArray | JSONSchemaObject

  namespace Assistant {

    /**
     * The provider for the Assistant API.
     */
    type Provider = "openai" | "gemini" | "anthropic" | "deepseek" | "openrouter" | {
      custom: string
    }

    /**
     * A chunk of text output from the assistant.
     */
    type StreamTextChunk = {
      type: 'text'
      content: string
    }

    /**
     * A chunk of reasoning output from the assistant.
     */
    type StreamReasoningChunk = {
      type: 'reasoning'
      content: string
    }

    /**
     * A chunk of usage output from the assistant.
     */
    type StreamUsageChunk = {
      type: 'usage'
      content: {
        /**
         * The total cost of the request.
         */
        totalCost: number | null
        /**
         * The number of tokens that were read from cache.
         */
        cacheReadTokens: number | null
        /**
         * The number of tokens that were written to cache.
         */
        cacheWriteTokens: number | null
        /**
         * The number of input tokens.
         */
        inputTokens: number
        /**
         * The number of output tokens.
         */
        outputTokens: number
      }
    }

    type StreamChunk = StreamTextChunk | StreamReasoningChunk | StreamUsageChunk

    /**
     * The text content of a message.
     */
    type MessageTextContent = string | {
      type: 'text'
      content: string
    }

    /**
     * The image content of a message.
     */
    type MessageImageContent = {
      type: 'image'
      /**
       * Base64 encoded image data string. Must include the `data:image/xxx;base64,` prefix.
       */
      content: string
    }

    /**
     * The document content of a message.
     */
    type MessageDocumentContent = {
      type: 'document'
      content: {
        /**
         * The MIME type of the document data.
         */
        mediaType: string
        /**
         * Base64 encoded document data string.
         */
        data: string
      }
    }

    /**
     * The content of a message.
     */
    type MessageContent = MessageTextContent | MessageImageContent | MessageDocumentContent

    type MessageItem = {
      role: "user" | "assistant"
      content: MessageContent | MessageContent[]
    }

    /**
     * Indicates whether the user has access to the assistant.
     */
    const isAvailable: boolean


    /**
     * Indicates whether the assistant chat page is currently presented.
     */
    const isPresented: boolean

    /**
     * Indicates whether there is an active conversation with the assistant.
     */
    const hasActiveConversation: boolean

    /**
     * Requests streamed output from the assistant, returning a ReadableStream of chunks. You can pass in a system prompt, a list of messages, and specify the AI provider and model to use.
     * @param options The options for the request.
     * @param options.systemPrompt The system prompt to use for the request.
     * @param options.messages The messages to use for the request.
     * @param options.provider Specifies the AI provider to use. You can use a custom provider with the given name.
     * @example
     * const stream = await Assistant.requestStreaming({
     *   systemPrompt: "You are a helpful assistant.",
     *   messages: [
     *     {
     *       role: "user",
     *       content: "Tell me a joke."
     *     }
     *   ],
     *   provider: "openai"
     * })
     * for await (const chunk of stream) {
     *   console.log(chunk)
     * }
     */
    function requestStreaming(options: {
      systemPrompt?: string | null
      messages: MessageItem | MessageItem[]
      provider?: Provider
      modelId?: string
    }): Promise<ReadableStream<StreamChunk>>
    /**
     * Requests structured JSON output from the assistant.
     * @param prompt The input prompt for the assistant.
     * @param schema The expected output JSON schema.
     * @param options The options for the request.
     * @param options.provider Specifies the AI provider to use. You can use a custom provider with the given name.
     * @param options.modelId You must ensure the specified ID matches a model supported by that provider (e.g., `"gpt-4-turbo"` for OpenAI, or `"gemini-2.5-pro"` for Gemini). If not specified, the app will use the default model configured for the provider.
     * @returns A promise that resolves to the structured data.
     */
    function requestStructuredData<R>(
      prompt: string,
      schema: JSONSchemaArray | JSONSchemaObject,
      options?: {
        provider: Provider
        modelId?: string
      }
    ): Promise<R>
    /**
     * Requests structured JSON output from the assistant.
     * @param prompt The input prompt for the assistant.
     * @param images The input images for the assistant, array of image data URIs, format: `data:image/png;base64,{base64}`. Do not pass too many images, or the request will fail.
     * @param schema The expected output JSON schema.
     * @param options The options for the request.
     * @param options.provider Specifies the AI provider to use. You can use a custom provider with the given name.
     * @param options.modelId You must ensure the specified ID matches a model supported by that provider (e.g., `"gpt-4-turbo"` for OpenAI, or `"gemini-1.5-pro"` for Gemini). If not specified, the app will use the default model configured for the provider.
     * @returns A promise that resolves to the structured data.
     */
    function requestStructuredData<R>(
      prompt: string,
      images: string[],
      schema: JSONSchemaArray | JSONSchemaObject,
      options?: {
        provider: "openai" | "gemini" | "anthropic" | "deepseek" | "openrouter" | {
          custom: string
        }
        modelId?: string
      }
    ): Promise<R>

    /**
     * Starts a conversation with the assistant. You can pass in a message and an optional list of images to send to the assistant. You should call `present` to present the assistant chat page.
     * If the conversation is already running, this method will throw an error. You should call `stopConversation` to stop the conversation before starting a new one.
     * @param options The options for the conversation.
     * @param options.message The message to send to the assistant.
     * @param options.images The images to send to the assistant.
     * @param options.autoStart Whether to start the conversation automatically. Defaults to false.
     * @param options.systemPrompt The system prompt to use for the conversation. The default system prompt is the Scripting Assistant system prompt, the Assistant Tools are available in this prompt. If you want to use a different system prompt, you can pass it in here, and the Assistant Tools are not available anymore.
     * @param options.modelId The model ID to use for the conversation.
     * @param options.provider The provider to use for the conversation. User can change the provider in the assistant chat page.
     * @returns A promise that resolves when the conversation is created, or throws an error if the operation fails.
     */
    function startConversation(options: {
      message: string
      images?: UIImage[]
      autoStart?: boolean
      systemPrompt?: string
      modelId?: string
      provider?: Provider
    }): Promise<void>

    /**
     * Stops the conversation with the assistant. This will dismiss the assistant chat page.
     * @returns A promise that resolves when the conversation is stopped, or throws an error if the operation fails.
     */
    function stopConversation(): Promise<void>

    /**
     * Presents the assistant chat page. You can call this method after `startConversation` to present the assistant chat page, or represent the conversation after `dismiss` is called.
     * @returns A promise that resolves when the assistant chat page is dismissed, or throws an error if the operation fails.
     */
    function present(): Promise<void>

    /**
     * Dismisses the assistant chat page. If `stopConversation` is called, this method will be called automatically.
     * @returns A promise that resolves when the assistant chat page is dismissed, or throws an error if the operation fails.
     */
    function dismiss(): Promise<void>
  }

  /**
   * Represents a file operation within the script editor.
   */
  type ScriptEditorFileOperation = {
    /**
     * The line number at which the operation should begin.
     */
    startLine: number
    /**
     * The content involved in the operation (e.g. text to insert or replace).
     */
    content: string
  }

  /**
   * Represents a lint error in a script.
   */
  type ScriptLintError = {
    /**
     * The line number where the error occurred.
     */
    line: number
    /**
     * A message describing the linting issue.
     */
    message: string
  }

  /**
   * Interface for interacting with the script editor.
   */
  interface ScriptEditorProvider {
    /**
     * The name of the current script project.
     */
    readonly scriptName: string
    /**
     * Checks if a file exists at the given relative path.
     * @param relativePath - The relative path to the file.
     * @returns True if the file exists, otherwise false.
     */
    exists(relativePath: string): boolean
    /**
     * Returns all folder paths within the current script project.
     */
    getAllFolders(): string[]
    /**
     * Returns all file paths within the current script project.
     */
    getAllFiles(): string[]
    /**
     * Retrieves the content of the specified file.
     * @param relativePath - The relative path to the file.
     * @returns A promise that resolves with the file content, or null if not found.
     */
    getFileContent(relativePath: string): Promise<string | null>
    /**
     * Updates the content of the specified file.
     * @param relativePath - The relative path to the file.
     * @param content - The new content for the file.
     * @returns A promise that resolves with a boolean indicating success.
     */
    updateFileContent(relativePath: string, content: string): Promise<boolean>
    /**
     * Writes content to the specified file. If the file does not exist, it will be created automatically.
     * @param relativePath - The relative path to the file.
     * @param content - The content to write.
     * @returns A promise that resolves with a boolean indicating success.
     */
    writeToFile(relativePath: string, content: string): Promise<boolean>
    /**
     * Inserts content into the specified file based on the provided operations.
     * @param relativePath - The relative path to the file.
     * @param operations - An array of operations describing where and what content to insert.
     * @returns A promise that resolves with a boolean indicating success.
     */
    insertContent(relativePath: string, operations: ScriptEditorFileOperation[]): Promise<boolean>
    /**
     * Replaces content in the specified file based on the provided operations.
     * @param relativePath - The relative path to the file.
     * @param operations - An array of operations describing where and what content to replace.
     * @returns A promise that resolves with a boolean indicating success.
     */
    replaceInFile(relativePath: string, operations: ScriptEditorFileOperation[]): Promise<boolean>
    /**
     * Opens a diff editor for the specified file, comparing its current content with the provided content.
     * @param relativePath - The relative path to the file.
     * @param content - The content to compare against.
     */
    openDiffEditor(relativePath: string, content: string): void
    /**
     * Retrieves the current lint errors from the script editor.
     * @returns An object mapping file paths to arrays of lint errors.
     */
    getLintErrors(): Record<string, ScriptLintError[]>
  }

  /**
   * Function that generates an approval request prompt for the user.
   */
  type AssistantToolApprovalRequestFn<P> = (
    /**
     * The tool's input parameters.
     */
    params: P,
    /**
     * When the tool is exclusively available for the script editor, a ScriptEditorProvider instance is provided
     * to allow communication with the editor.
     */
    scriptEditorProvider?: ScriptEditorProvider
  ) => Promise<{
    /**
     * Optional title for the approval dialog (defaults to the tool's `displayName` if not provided).
     */
    title?: string
    /**
     * The message displayed to the user when requesting approval.
     */
    message: string
    /**
     * Optional preview button that allows the user to view the tool's expected output prior to approval.
     */
    previewButton?: {
      /**
       * The label for the preview button.
       */
      label: string
      /**
       * The function executed when the preview button is clicked.
       */
      action: () => void
    }
    /**
     * The label for the primary approval button. If omitted, this button will not be displayed.
     */
    primaryButtonLabel?: string
    /**
     * The label for the secondary approval button. If omitted, this button will not be displayed.
     */
    secondaryButtonLabel?: string
  }>

  /**
   * Test function for generating an approval request prompt.
   */
  type AssistantToolApprovalRequestTestFn<P> = (params: P) => void

  /**
   * Represents the user's action in response to an approval request.
   */
  type UserActionForApprovalRequest = {
    /**
     * Indicates whether the primary button was clicked.
     * If no primary button is provided, this value should always be false.
     */
    primaryConfirmed: boolean
    /**
     * Indicates whether the secondary button was clicked.
     * If no secondary button is provided, this value should always be false.
     */
    secondaryConfirmed: boolean
  }

  /**
   * Function to execute the tool after receiving user approval.
   */
  type AssistantToolExecuteWithApprovalFn<P> = (
    /**
     * The tool's input parameters.
     */
    params: P,
    /**
     * The user's action (i.e., which approval button was clicked).
     */
    userAction: UserActionForApprovalRequest,
    /**
     * When the tool is exclusively available for the script editor, a ScriptEditorProvider instance is provided
     * to allow communication with the editor.
     */
    scriptEditorProvider?: ScriptEditorProvider
  ) => Promise<{
    /**
     * Indicates whether the tool execution was successful.
     */
    success: boolean
    /**
     * The response message to be returned to the assistant.
     */
    message: string
  }>

  /**
   * Test function for executing the tool with approval.
   */
  type AssistantToolExecuteWithApprovalTestFn<P> = (
    /**
     * The tool's input parameters.
     */
    params: P,
    /**
     * The user's action (i.e., which approval button was clicked).
     */
    userAction: UserActionForApprovalRequest
  ) => void

  /**
   * Function to execute the tool.
   */
  type AssistantToolExecuteFn<P> = (
    /**
     * The tool's input parameters.
     */
    params: P,
    /**
     * When the tool is exclusively available for the script editor, a ScriptEditorProvider instance is provided
     * to allow communication with the editor.
     */
    scriptEditorProvider?: ScriptEditorProvider
  ) => Promise<{
    /**
     * Indicates whether the tool execution was successful.
     */
    success: boolean
    /**
     * The response message to be returned to the assistant.
     */
    message: string
  }>

  /**
   * Test function for executing the tool.
   */
  type AssistantToolExecuteTestFn<P> = (params: P) => void

  namespace AssistantTool {
    /**
     * Registers the function that generates an approval request prompt for the user.
     * @param requestFn - The function that creates the approval request.
     * @returns A test function for the approval request.
     */
    function registerApprovalRequest<P>(
      requestFn: AssistantToolApprovalRequestFn<P>
    ): AssistantToolApprovalRequestTestFn<P>
    /**
     * Registers the function that executes the tool after user approval.
     * @param executeFn - The function that executes the tool with approval.
     * @returns A test function for the execution with approval.
     */
    function registerExecuteToolWithApproval<P>(
      executeFn: AssistantToolExecuteWithApprovalFn<P>
    ): AssistantToolExecuteWithApprovalTestFn<P>
    /**
     * Registers the function that executes the tool.
     * @param executeFn - The function that executes the tool.
     * @returns A test function for the execution.
     */
    function registerExecuteTool<P>(
      executeFn: AssistantToolExecuteFn<P>
    ): AssistantToolExecuteTestFn<P>
    /**
     * Reports a message when the tool is executing.
     * @param message - The message to report.
     */
    function report(message: string): void
  }

  /**
   * This interface allows you present a mail compose view.
   * @deprecated
   * Use MailUI instead.
   */
  namespace Mail {
    const isAvailable: boolean

    /**
     * Presents a mail compose view with the specified options.
     * @param options Presents a mail compose view with the specified options.
     * @param options.toRecipients An array specifying the email addresses of recipients.
     * @param options.ccRecipients An array specifying the email addresses of recipients to include in the CC (carbon copy) list.
     * @param options.bccRecipients An array specifying the email addresses of recipients to include in the BCC (blind carbon copy) list.
     * @param options.preferredSendingEmailAddress A string specifying the preferred email address used to send this message.
     * @param options.subject A string containing the subject of the email message.
     * @param options.body A string containing the body contents of the email message.
     * @param options.attachments Adds the specified attachments to the email message.
     * @param options.attachments.data The data to attach to the email.
     * @param options.attachments.mimeType The MIME type of the attachment. See [MIME types](http://www.iana.org/assignments/media-types/media-types.xhtml) for more information.
     * @param options.attachments.fileName The filename of the attachment.
     * @returns A promise that resolves with the result of the mail compose view, which can be "cancelled", "sent", "failed", or "saved".
     * @throws If the Mail API is not available or if the options are invalid.
     */
    function present(options: {
      toRecipients: string[]
      ccRecipients?: string[]
      bccRecipients?: string[]
      preferredSendingEmailAddress?: string
      subject?: string
      body?: string
      attachments?: {
        data: Data
        mimeType: string
        fileName: string
      }[]
    }): Promise<"cancelled" | "sent" | "failed" | "saved">
  }

  /**
   * This interface allows you present a mail compose view.
   */
  namespace MailUI {
    const isAvailable: boolean

    /**
     * Presents a mail compose view with the specified options.
     * @param options Presents a mail compose view with the specified options.
     * @param options.toRecipients An array specifying the email addresses of recipients.
     * @param options.ccRecipients An array specifying the email addresses of recipients to include in the CC (carbon copy) list.
     * @param options.bccRecipients An array specifying the email addresses of recipients to include in the BCC (blind carbon copy) list.
     * @param options.preferredSendingEmailAddress A string specifying the preferred email address used to send this message.
     * @param options.subject A string containing the subject of the email message.
     * @param options.body A string containing the body contents of the email message.
     * @param options.attachments Adds the specified attachments to the email message.
     * @param options.attachments.data The data to attach to the email.
     * @param options.attachments.mimeType The MIME type of the attachment. See [MIME types](http://www.iana.org/assignments/media-types/media-types.xhtml) for more information.
     * @param options.attachments.fileName The filename of the attachment.
     * @returns A promise that resolves with the result of the mail compose view, which can be "cancelled", "sent", "failed", or "saved".
     * @throws If the Mail API is not available or if the options are invalid.
     */
    function present(options: {
      toRecipients: string[]
      ccRecipients?: string[]
      bccRecipients?: string[]
      preferredSendingEmailAddress?: string
      subject?: string
      body?: string
      attachments?: {
        data: Data
        mimeType: string
        fileName: string
      }[]
    }): Promise<"cancelled" | "sent" | "failed" | "saved">
  }

  /**
   * This interface allows you to present a message compose view.
   */
  namespace MessageUI {
    /**
     * Returns true if the user has set up the device for sending text only messages.
     */
    const isAvailable: boolean
    /**
     * Returns true if the user has set up the device for including subjects in messages.
     */
    const canSendSubject: boolean
    /**
     * Returns true if the user has set up the device for including attachments in messages
     */
    const canSendAttachments: boolean

    /**
     * Presents a message compose view with the specified options.
     * @param options Presents a message compose view with the specified options.
     * @param options.recipients An array specifying the phone numbers of recipients.
     * @param options.body A string containing the body contents of the message.
     * @param options.subject A string containing the subject of the message. If `MessageUI.canSendSubject` is false, this option will be ignored.
     * @param options.attachments Adds the specified attachments to the message. If `MessageUI.canSendAttachments` is false, this option will be ignored.
     * @param options.attachments.data The data to attach to the message.
     * @param options.attachments.mimeType The MIME type of the attachment. See [MIME types](http://www.iana.org/assignments/media-types/media-types.xhtml) for more information.
     * @param options.attachments.fileName The filename of the attachment.
     * @returns A promise that resolves with the result of the message compose view, which can be "cancelled", "sent", or "failed".
     * @throws If the MessageUI API is not available or if the options are invalid.
     */
    function present(options: {
      recipients: string[]
      body: string
      subject?: string
      attachments?: {
        data: Data
        type: UTType
        fileName: string
      }[]
    }): Promise<"cancelled" | "sent" | "failed">
  }

  /**
   * Represents the birthday details of a contact.
   */
  interface ContactBirthday {
    /** The year of the birthday. */
    year?: number
    /** The month of the birthday. */
    month?: number
    /** The day of the birthday. */
    day?: number
  }

  /**
   * Represents a labeled value for contact properties such as phone, email, or URL.
   */
  interface ContactLabeledValue {
    /** The label for the value (e.g., "home", "work"). */
    label: string
    /** The value associated with the label (e.g., a phone number or email address). */
    value: string
  }

  /**
   * Represents a labeled date for contact properties such as anniversaries or other dates.
   */
  interface ContactLabeledDate {
    /**
     * The label for the date (e.g., "anniversary", "birthday").
     */
    label: string
    /**
     * The date value.
     */
    value: {
      year: number
      month: number
      day: number
    }
  }

  /**
   * Represents the postal address details of a contact.
   */
  interface ContactPostalAddress {
    /** The label for the postal address. */
    label: string
    /** The street information of the address. */
    street: string
    /** The city of the address. */
    city: string
    /** The state or province of the address. */
    state: string
    /** The postal code of the address. */
    postalCode: string
    /** The country of the address. */
    country: string
    /** The ISO country code of the address. */
    isoCountryCode: string
  }

  /**
   * Represents the social profile information of a contact.
   */
  interface ContactSocialProfile {
    /** The label for the social profile (e.g., "Facebook", "Twitter"). */
    label: string
    /** The service type for the social profile. */
    service: string
    /** The username for the social profile. */
    username: string
    /** The unique identifier of the social profile. */
    userIdentifier: string
    /** The URL associated with the social profile. */
    urlString: string
  }

  /**
   * Represents the instant messaging information of a contact.
   */
  interface ContactInstantMessageAddress {
    /** The label for the instant messaging address. */
    label: string
    /** The username used in instant messaging. */
    username: string
    /** The service type for instant messaging (e.g., "Skype"). */
    service: string
  }

  /**
   * Represents all available information for a contact.
   */
  interface ContactInfo {
    /** The unique identifier of the contact. */
    identifier: string
    /** The given (first) name of the contact. */
    givenName: string
    /** The family (last) name of the contact. */
    familyName: string
    /** The middle name of the contact (optional). */
    middleName?: string
    /** The name prefix (e.g., "Mr.", "Ms.") of the contact (optional). */
    namePrefix?: string
    /** The name suffix (e.g., "Jr.", "Sr.") of the contact (optional). */
    nameSuffix?: string
    /** The nickname of the contact (optional). */
    nickname?: string
    /** The image data of the contact. It is recommended that you fetch this property only when you need to access its value, such as when you need to display the contact’s profile picture. */
    imageData?: Data
    /** The phonetic given name of the contact (optional). */
    phoneticGivenName?: string
    /** The phonetic middle name of the contact (optional). */
    phoneticMiddleName?: string
    /** The phonetic family name of the contact (optional). */
    phoneticFamilyName?: string
    /** The organization name associated with the contact (optional). */
    organizationName?: string
    /** The department name within the organization (optional). */
    departmentName?: string
    /** The job title of the contact (optional). */
    jobTitle?: string
    /** The birthday details of the contact (optional). */
    birthday?: ContactBirthday
    /** An array of labeled dates associated with the contact (e.g., anniversaries, other dates). */
    dates: ContactLabeledDate[]
    // /** Additional notes about the contact (optional). */
    // note?: string
    /** An array of labeled phone numbers. */
    phoneNumbers: ContactLabeledValue[]
    /** An array of labeled email addresses. */
    emailAddresses: ContactLabeledValue[]
    /** An array of postal addresses. */
    postalAddresses: ContactPostalAddress[]
    /** An array of labeled URL addresses. */
    urlAddresses: ContactLabeledValue[]
    /** An array of social profile details. */
    socialProfiles: ContactSocialProfile[]
    /** An array of instant messaging addresses. */
    instantMessageAddresses: ContactInstantMessageAddress[]
  }

  /**
   * Represents the type of contact container.
   */
  enum ContactContainerType {
    unassigned,
    local,
    exchange,
    cardDAV,
  }

  /**
   * Represents a contact container.
   */
  interface ContactContainer {
    identifier: string
    name: string
    type: ContactContainerType
  }

  /**
   * Represents a contact group.
   */
  interface ContactGroup {
    identifier: string
    name: string
  }

  /**
   * Provides an interface for interacting with the contacts database.
   */
  namespace Contact {
    /**
     * Creates a new contact.
     * @param info - An object containing the contact details. Must include at least a givenName or familyName.
     * @param containerIdentifier - (Optional) The identifier of the container to which the contact should be added.
     * @returns A promise will resolve the created contact as a ContactInfo object, or throw an error if creation fails.
     */
    function createContact(
      info: {
        /** The given (first) name of the contact. */
        givenName: string
        /** The family (last) name of the contact. */
        familyName: string
        /** The middle name of the contact (optional). */
        middleName?: string
        /** The name prefix (e.g., "Mr.", "Ms.") of the contact (optional). */
        namePrefix?: string
        /** The name suffix (e.g., "Jr.", "Sr.") of the contact (optional). */
        nameSuffix?: string
        /** The nickname of the contact (optional). */
        nickname?: string
        /** The image data of the contact. */
        imageData?: Data
        /** The phonetic given name of the contact (optional). */
        phoneticGivenName?: string
        /** The phonetic middle name of the contact (optional). */
        phoneticMiddleName?: string
        /** The phonetic family name of the contact (optional). */
        phoneticFamilyName?: string
        /** The organization name associated with the contact (optional). */
        organizationName?: string
        /** The department name within the organization (optional). */
        departmentName?: string
        /** The job title of the contact (optional). */
        jobTitle?: string
        /** The birthday details of the contact (optional). */
        birthday?: ContactBirthday
        /** An array of labeled dates associated with the contact (e.g., anniversaries, other dates). */
        dates?: ContactLabeledDate[]
        // /** Additional notes about the contact (optional). */
        // note?: string
        /** An array of labeled phone numbers (optional). */
        phoneNumbers?: ContactLabeledValue[]
        /** An array of labeled email addresses (optional). */
        emailAddresses?: ContactLabeledValue[]
        /** An array of postal addresses (optional). */
        postalAddresses?: ContactPostalAddress[]
        /** An array of labeled URL addresses (optional). */
        urlAddresses?: ContactLabeledValue[]
        /** An array of social profile details (optional). */
        socialProfiles?: ContactSocialProfile[]
        /** An array of instant messaging addresses (optional). */
        instantMessageAddresses?: ContactInstantMessageAddress[]
      },
      containerIdentifier?: string
    ): Promise<ContactInfo>

    /**
     * Updates an existing contact.
     * @param info - An object containing updated contact details. Must include the contact's unique identifier.
     * @returns Return a promise will resolve the updated ContactInfo object if the update is successful, otherwise throw an error.
     */
    function updateContact(info: {
      /** The unique identifier of the contact. */
      identifier: string
      givenName?: string
      familyName?: string
      middleName?: string
      namePrefix?: string
      nameSuffix?: string
      nickname?: string
      imageData?: Data
      phoneticGivenName?: string
      phoneticMiddleName?: string
      phoneticFamilyName?: string
      organizationName?: string
      departmentName?: string
      jobTitle?: string
      birthday?: ContactBirthday
      dates?: ContactLabeledDate[]
      phoneNumbers?: ContactLabeledValue[]
      emailAddresses?: ContactLabeledValue[]
      postalAddresses?: ContactPostalAddress[]
      urlAddresses?: ContactLabeledValue[]
      socialProfiles?: ContactSocialProfile[]
      instantMessageAddresses?: ContactInstantMessageAddress[]
    }): Promise<ContactInfo>

    /**
     * Fetches a contact by its identifier.
     * @param identifier - The unique identifier of the contact.
     * @param options - (Optional) An object containing fetch options.
     * @returns A promiss will resolve a ContactInfo object representing the contact, or throw an error.
     */
    function fetchContact(identifier: string, options?: {
      /**
       * It is recommended that you fetch this property only when you need to access its value, such as when you need to display the contact’s profile picture.
       */
      fetchImageData?: boolean
    }): Promise<ContactInfo>

    /**
     * Fetches all contacts.
     * @param options - (Optional) An object containing fetch options.
     * @returns An array of ContactInfo objects.
     */
    function fetchAllContacts(options?: {
      /**
       * It is recommended that you fetch this property only when you need to access its value, such as when you need to display the contact’s profile picture.
       */
      fetchImageData?: boolean
    }): Promise<ContactInfo[]>

    /**
     * Fetches all contacts in a specified container.
     * @param containerIdentifier - The unique identifier of the container.
     * @param options - (Optional) An object containing fetch options.
     * @returns An array of ContactInfo objects.
     */
    function fetchContactsInContainer(containerIdentifier: string, options?: {
      /**
       * It is recommended that you fetch this property only when you need to access its value, such as when you need to display the contact’s profile picture.
       */
      fetchImageData?: boolean
    }): Promise<ContactInfo[]>

    /**
     * Fetches all contacts in a specified group.
     * @param groupIdentifier - The unique identifier of the group.
     * @param options - (Optional) An object containing fetch options.
     * @returns An array of ContactInfo objects.
     */
    function fetchContactsInGroup(groupIdentifier: string, options?: {
      /**
       * It is recommended that you fetch this property only when you need to access its value, such as when you need to display the contact’s profile picture.
       */
      fetchImageData?: boolean
    }): Promise<ContactInfo[]>

    /**
     * Deletes a contact by its identifier.
     * @param identifier - The unique identifier of the contact.
     * @returns A promise resolve nothing if deletion is successful, or throw an error.
     */
    function deleteContact(identifier: string): Promise<void>

    /**
     * Fetches all contact containers.
     * @returns A promise will resolve an array of container objects containing properties such as identifier, name, and type.
     */
    function fetchContainers(): Promise<ContactContainer[]>

    /**
     * Fetches groups.
     * @param containerIdentifiers - (Optional) An array of container identifiers to limit the search.
     * @returns A promise will resolve an array of group objects containing properties like identifier, name.
     */
    function fetchGroups(containerIdentifiers?: string[]): Promise<ContactGroup[]>

    /**
     * Creates a new group.
     * @param info - An object containing the group details. Must include both name and containerIdentifier.
     * @param containerIdentifier - (Optional) The identifier of the container to which the group should be added.
     * @returns A promise will resolve the created group as a ContactGroup object, or throw an error if creation fails.
     */
    function createGroup(groupName: string, containerIdentifier?: string): Promise<ContactGroup>

    /**
     * Deletes a group by its identifier.
     * @param identifier - The unique identifier of the group.
     * @returns A promise will resolve nothing if deletion is successful, or throw an error.
     */
    function deleteGroup(identifier: string): Promise<void>

    /**
     * Adds a contact to a specified group.
     * @param contactIdentifier - The unique identifier of the contact.
     * @param toGroup - The unique identifier of the group.
     * @returns A promise will resolve nothing if the contact is added successfully, or throw an error.
     */
    function addContactToGroup(contactIdentifier: string, toGroup: string): Promise<void>

    /**
     * Removes a contact from a specified group.
     * @param contactIdentifier - The unique identifier of the contact.
     * @param fromGroup - The unique identifier of the group.
     * @returns A promise will resolve nothing if the contact is removed successfully, or throw an error.
     */
    function removeContactFromGroup(contactIdentifier: string, fromGroup: string): Promise<void>

    /**
     * The default container identifier, typically the identifier of the first container in the contacts database.
     */
    const defaultContainerIdentifier: Promise<string>
  }

  /**
   * A block of recognized text.
   */
  type RecognizedText = {
    /**
     * The recognized text.
     */
    content: string
    /**
     * The confidence level is a normalized value between 0.0 and 1.0, where 1.0 represents the highest confidence.
     */
    confidence: number
    /**
     * The bounding box of the recognized text.
     */
    boundingBox: {
      x: number
      y: number
      width: number
      height: number
    }
  }

  /**
   * Options for text recognition.
   */
  type RecognizeTextOptions = {
    /**
     * A value that determines whether the request prioritizes accuracy or speed in text recognition.
     * The default value is "accurate".
     * - "accurate": Prioritizes accuracy over speed.
     * - "fast": Prioritizes speed over accuracy.
     */
    recognitionLevel?: "accurate" | "fast"
    /**
     * An array of languages to detect, in priority order.
     * 
     * The order of the languages in the array defines the order in which languages are used during language processing and text recognition.
     * 
     * Specify the languages as ISO language codes.
     */
    recognitionLanguages?: string[]
    /**
     * A Boolean value that indicates whether the request applies language correction during the recognition process.
     */
    usesLanguageCorrection?: boolean
    /**
     * The minimum height, relative to the image height, of the text to recognize.
     * 
     * Specify a floating-point number relative to the image height. For example, to limit recognition to text that’s half of the image height, use 0.5. Increasing the size reduces memory consumption and expedites recognition with the tradeoff of ignoring text smaller than the minimum height. The default value is 1/32, or 0.03125.
     */
    minimumTextHeight?: number
    /**
     * An array of strings to supplement the recognized languages at the word-recognition stage.
     * 
     * Custom words take precedence over the standard lexicon. The request ignores this value if `usesLanguageCorrection` is false.
     */
    customWords?: string[]
  }

  /**
   * This module provides an interface for text recognition tasks.
   * It allows you to detect and recognize text in images or camera input.
   */
  namespace Vision {

    /**
     * Recognizes text in the provided image.
     * @param image The image to be processed for text recognition.
     * @param options An optional object containing various options for text recognition.
     * @returns A promise that resolves with the recognized text and its bounding box.
     */
    function recognizeText(
      image: UIImage,
      options?: RecognizeTextOptions
    ): Promise<{
      /**
       * The recognized text.
       */
      text: string
      /**
       * This is an array of recognized text blocks, each containing the recognized text, confidence level, and bounding box.
       */
      candidates: RecognizedText[]
    }>

    /**
     * Recognizes text in the camera input.
     * @param options An optional object containing various options for text recognition.
     * @returns A promise that resolves with an array of recognized texts. If the user cancels the operation, the promise rejects with an error.
     */
    function scanDocument(options?: RecognizeTextOptions): Promise<string[]>
  }

  /**
   * This class provides an interface for working with PDF page.
   */
  class PDFPage {
    /**
     * Creates a PDF page from the given image.
     * @param image The image to be converted to a PDF page.
     */
    static fromImage(image: UIImage): PDFPage | null

    /**
     * The PDF document that contains this page.
     */
    readonly document: PDFDocument | null
    /**
     * The label of the page.
     */
    readonly label: string | null
    /**
     * The number of characters in the page.
     */
    readonly numberOfCharacters: number
    /**
     * The string representation of the page.
     * This is the text content of the page.
     * It may be null if the page is not text-based, for example, if it is an image.
     */
    get string(): Promise<string | null>
    /**
     * The data representation of the page.
     */
    get data(): Promise<Data | null>
  }

  /**
   * This class provides an interface for working with PDF documents.
   * It allows you to read, modify, and save PDF documents.
   */
  class PDFDocument {
    /**
     * Creates a PDF document from the given data.
     * @param data The data to be converted to a PDF document.
     * @return A PDFDocument instance, or `null` if the data is not a valid PDF document.
     */
    static fromData(data: Data): PDFDocument | null
    /**
     * Creates a PDF document from the given file path.
     * @param filePath The file path to the PDF document.
     * @return A PDFDocument instance, or `null` if the file path is not valid or the document cannot be opened.
     */
    static fromFilePath(filePath: string): PDFDocument | null

    /**
     * The page count of the PDF document.
     */
    readonly pageCount: number
    /**
     * The data representation of the PDF document.
     */
    get data(): Promise<Data | null>
    /**
     * The file path of the PDF document.
     */
    readonly filePath: string | null
    /**
     * The string representation of the PDF document.
     */
    get string(): Promise<string | null>
    /**
     * The lock status of the PDF document.
     */
    readonly isLocked: boolean
    /**
     * The encryption status of the PDF document.
     * This indicates whether the document is encrypted or not.
     */
    readonly isEncrypted: boolean

    /**
     * The attributes of the PDF document.
     * This includes metadata such as author, creation date, and title.
     * The attributes are optional and may be null if not set.
     * You can use this to retrieve or set the document's metadata.
     * @example
     * ```ts
     * const pdfDocument = PDFDocument.fromFilePath("path/to/document.pdf")
     * const attributes = pdfDocument.documentAttributes
     * console.log(attributes.author) // Output: "John Doe"
     * console.log(attributes.creationDate.toLocalString()) // Output: "2023-10-01T12:00:00Z"
     * console.log(attributes.title) // Output: "My PDF Document"
     * ```
     */
    documentAttributes?: {
      author?: string | null
      creationDate?: Date | null
      creator?: string | null
      keywords?: any | null
      modificationDate?: Date | null
      producer?: string | null
      subject?: string | null
      title?: string | null
    } | null

    /**
     * Retrieves the page at the specified index.
     * @param index The index of the page to retrieve.
     * @return The PDFPage instance at the specified index, or null if the index is out of bounds.
     * @example
     * ```ts
     * const pdfDocument = PDFDocument.fromFilePath("path/to/document.pdf")
     * const page = pdfDocument.pageAt(0)
     * if (page) {
     *   console.log(page.string) // Output: "This is the content of the first page."
     * } else {
     *   console.log("Page not found.")
     * }
     * ```
     */
    pageAt(index: number): PDFPage | null
    /**
     * Get the index of the specified page in the document.
     * @param page The PDFPage instance to be searched for in the document.
     * @return The index of the page in the document, or -1 if the page is not found.
     * @example
     * ```ts
     * const pdfDocument = PDFDocument.fromFilePath("path/to/document.pdf")
     * const page = pdfDocument.pageAt(0)
     * const index = pdfDocument.indexOf(page)
     * console.log(`Page index: ${index}`) // Output: "Page index: 0"
     * ```
     */
    indexOf(page: PDFPage): number
    /**
     * Removes the page at the specified index from the document.
     * @param index The index of the page to remove.
     * @example
     * ```ts
     * const pdfDocument = PDFDocument.fromFilePath("path/to/document.pdf")
     * pdfDocument.removePageAt(0) // Removes the first page
     * ```
     */
    removePageAt(index: number): void
    /**
     * Inserts a new page at the specified index in the document.
     * @param page The PDFPage instance to be inserted.
     * @param atIndex The index at which to insert the page.
     * @example
     * ```ts
     * const pdfDocument = PDFDocument.fromFilePath("path/to/document.pdf")
     * const newPage = PDFPage.fromImage(image)
     * pdfDocument.insertPageAt(newPage, 1) // Inserts the new page at index 1
     * ```
     */
    insertPageAt(page: PDFPage, atIndex: number): void
    /**
     * Exchanges the pages at the specified indices in the document.
     * @param atIndex The index of the first page to exchange.
     * @param withPageIndex The index of the second page to exchange.
     * @example
     * ```ts
     * const pdfDocument = PDFDocument.fromFilePath("path/to/document.pdf")
     * pdfDocument.exchangePage(0, 1) // Exchanges the first and second pages
     * ```
     */
    exchangePage(atIndex: number, withPageIndex: number): void
    /**
     * Writes the PDF document to the specified file path.
     * @param toFilePath - The file path where the PDF document will be saved.
     * @param options - (Optional) An object containing encryption options.
     * @param options.ownerPassword - The password for the owner of the document.
     * @param options.userPassword - The password for the user of the document.
     * @param options.burnInAnnotations - A boolean indicating whether to burn in annotations.
     * @param options.saveTextFromOCR - A boolean indicating whether to save text from OCR.
     * @param options.saveImagesAsJPEG - A boolean indicating whether to save images as JPEG.
     * @returns A boolean indicating whether the write operation was successful.
     * @example
     * ```ts
     * const pdfDocument = PDFDocument.fromFilePath("path/to/document.pdf")
     * 
     * // Save the PDF document with encryption.
     * const success = pdfDocument.writeSync("path/to/newDocument.pdf", {
     *   ownerPassword: "ownerPassword",
     *   userPassword: "userPassword"
     * })
     * if (success) {
     *   console.log("PDF document saved successfully.")
     * } else {
     *   console.log("Failed to save PDF document.")
     * }
     * ```
     */
    writeSync(toFilePath: string, options?: {
      ownerPassword?: string
      userPassword?: string
      burnInAnnotations?: boolean
      saveTextFromOCR?: boolean
      saveImagesAsJPEG?: boolean
    }): boolean
    /**
     * Writes the PDF document to the specified file path asynchronously.
     */
    write(toFilePath: string, options?: {
      ownerPassword?: string
      userPassword?: string
      burnInAnnotations?: boolean
      saveTextFromOCR?: boolean
      saveImagesAsJPEG?: boolean
    }): Promise<boolean>
    /**
     * Encrypts the PDF document with the specified password.
     * @see {@link https://developer.apple.com/documentation/pdfkit/pdfdocument/unlock(withpassword:)}
     * @param password The password to unlock the document.
     * @returns A boolean indicating whether the encryption was successful.
     */
    unlock(password: string): boolean
  }

  enum DateFormatterStyle {
    none = 0,
    short = 1,
    medium = 2,
    long = 3,
    full = 4,
  }

  enum DateFormatterBehavior {
    default = 0,
    behavior10_4 = 1040,
  }

  type CalendarIdentifier = "current" | "autoupdatingCurrent" | "gregorian" | "buddhist" | "chinese" | "hebrew" | "islamic" | "japanese" | "persian" | "republicOfChina" | "indian" | "coptic" | "ethiopianAmeteMihret" | "ethiopianAmeteAlem" | "islamicCivil" | "islamicTabular" | "islamicUmmAlQura" | "iso8601" | "persianCivil"

  type TimeZoneIdentifier = "current" | "autoupdatingCurrent" | "gmt" | string

  class DateFormatter {
    new(): DateFormatter

    static localizedString(date: Date, options: {
      dateStyle: DateFormatterStyle
      timeStyle: DateFormatterStyle
    }): string

    static dateFormat(template: string, locale?: string): string | null

    string(date: Date): string
    date(string: string): Date | null
    setLocalizedDateFormatFromTemplate(template: string): void

    calendar: CalendarIdentifier
    timeZone: TimeZoneIdentifier
    locale: string
    dateFormat: string
    dateStyle: DateFormatterStyle
    timeStyle: DateFormatterStyle
    generatesCalendarDates: boolean
    formatterBehavior: DateFormatterBehavior
    isLenient: boolean
    twoDigitStartDate: Date | null
    defaultDate: Date | null
    eraSymbols: string[]
    monthSymbols: string[]
    shortMonthSymbols: string[]
    weekdaySymbols: string[]
    shortWeekdaySymbols: string[]
    longEraSymbols: string[]
    veryShortMonthSymbols: string[]
    standaloneMonthSymbols: string[]
    shortStandaloneMonthSymbols: string[]
    veryShortStandaloneMonthSymbols: string[]
    quarterSymbols: string[]
    shortQuarterSymbols: string[]
    standaloneQuarterSymbols: string[]
    shortStandaloneQuarterSymbols: string[]
    veryShortWeekdaySymbols: string[]
    standaloneWeekdaySymbols: string[]
    shortStandaloneWeekdaySymbols: string[]
    veryShortStandaloneWeekdaySymbols: string[]
    amSymbol: string
    pmSymbol: string
    gregorianStartDate: Date | null
    doesRelativeDateFormatting: boolean
  }

  /**
   * This class provides an interface for working with date components.
   * It allows you to create and manipulate date components such as year, month, day, hour, minute, second, and nanosecond.
   * You can also check if the date components represent a valid date in the current calendar.
   * The date components can be used to create a Date object, which represents a specific point in time.
   */
  class DateComponents {
    constructor(options?: {
      calendar?: CalendarIdentifier | null
      timeZone?: TimeZoneIdentifier | null
      era?: number | null
      year?: number | null
      yearForWeekOfYear?: number | null
      quarter?: number | null
      month?: number | null
      weekOfMonth?: number | null
      weekOfYear?: number | null
      weekday?: number | null
      weekdayOrdinal?: number | null
      day?: number | null
      hour?: number | null
      minute?: number | null
      second?: number | null
      nanosecond?: number | null
    })
    /**
     * The date calculated from the current components using the current calendar.
     */
    readonly date?: Date | null
    /**
     * Indicates whether the current combination of properties represents a date which exists in the current calendar.
     */
    readonly isValidDate: boolean
    /**
     * The calendar used to interpret the date components.
     * Note: API which uses DateComponents may have different behavior if this value is nil. For example, assuming the current calendar or ignoring certain values.
     */
    calendar?: "current" | "autoupdatingCurrent" | "gregorian" | "buddhist" | "chinese" | "hebrew" | "islamic" | "japanese" | "persian" | "republicOfChina" | "indian" | "coptic" | "ethiopianAmeteMihret" | "ethiopianAmeteAlem" | "islamicCivil" | "islamicTabular" | "islamicUmmAlQura" | "iso8601" | "persianCivil" | null
    /**
     * The time zone used to interpret the date components.
     * An example identifier is "America/Los_Angeles".
     * 
     * Note: This value is interpreted in the context of the calendar in which it is used.
     */
    timeZone?: "current" | "autoupdatingCurrent" | "gmt" | string | null
    /**
     * An era or count of eras.
     */
    era?: number | null
    /**
     * A year or count of years.
     */
    year?: number | null
    /**
     * The year corresponding to a week-counting week.
     */
    yearForWeekOfYear?: number | null
    /**
     * A quarter or count of quarters.
     */
    quarter?: number | null
    /**
     * A month or count of months.
     */
    month?: number | null
    /**
     * Set to true if these components represent a leap month.
     */
    isLeapMonth?: boolean
    /**
     * A week of the month or a count of weeks of the month.
     */
    weekOfMonth?: number | null
    /**
     * A week of the year or a count of weeks of the year.
     */
    weekOfYear?: number | null
    /**
     * A weekday or count of weekdays. Sunday is 1, Monday is 2, and so on.
     */
    weekday?: number | null
    /**
     * A weekday ordinal or count of weekdays in a month.
     * This is the ordinal position of the weekday in the month, where 1 is the first occurrence of the weekday in the month.
     * For example, if the first Monday of the month is the 2nd day,
     * then `weekdayOrdinal` would be 1 for that Monday.
     * If the second Monday of the month is the 9th day,
     * then `weekdayOrdinal` would be 2 for that Monday.
     * If the month has no occurrence of the specified weekday, this value will be null.
     * @example
     * ```ts
     * const components = new DateComponents()
     * components.weekday = 2 // Tuesday
     * components.weekdayOrdinal = 1 // First occurrence of Tuesday in the month
     * ```
     */
    weekdayOrdinal?: number | null
    /**
     * A day of the month or a count of days of the month.
     */
    day?: number | null
    /**
     * An hour or count of hours.
     */
    hour?: number | null
    /**
     * A minute or count of minutes.
     */
    minute?: number | null
    /**
     * A second or count of seconds.
     */
    second?: number | null
    /**
     * A nanosecond or count of nanoseconds.
     */
    nanosecond?: number | null
    /**
     * The day of the year, which is the ordinal date in the year.
     */
    dayOfYear?: number | null

    /**
     * Creates a DateComponents object from the given date.
     * This method extracts the date components such as year, month, day, hour, minute, second, and nanosecond from the provided date.
     * @param date  The date to create the date components from.
     * @returns A DateComponents object representing the date components of the given date.
     */
    static fromDate(date: Date): DateComponents

    /**
     * Creates a DateComponents instance representing the hourly trigger for scheduling purposes. Sets: `minute`.
     * @param date  The date to create the date components from.
     * @returns A DateComponents object representing the hourly trigger.
     */
    static forHourly(date: Date): DateComponents

    /**
     * Creates a DateComponents instance representing the daily trigger. Sets: `hour`, `minute`.
     * @param date The date to create the date components from.
     * @returns A DateComponents object representing the daily date components of the given date.
     */
    static forDaily(date: Date): DateComponents

    /**
     * Creates a DateComponents instance for weekly triggers, useful for weekly recurring events. Sets: `weekday`, `hour`, `minute`.
     * @param date The date to create the date components from.
     * @returns A DateComponents object representing the weekly date components of the given date.
     */
    static forWeekly(date: Date): DateComponents

    /**
     * Creates a DateComponents instance representing a monthly trigger. Sets: `day`, `hour`, `minute`.
     *  @param date The date to create the date components from.
     *  @returns A DateComponents object representing the monthly date components of the given date.
     */
    static forMonthly(date: Date): DateComponents
  }

  /**
   * This class provides an interface for calendar notification triggers.
   * It allows you to create triggers that fire at specific dates and times, with options for repeating the notification.
   */
  class CalendarNotificationTrigger {
    constructor(options: {
      dateMatching: DateComponents
      repeats: boolean
    })
    /**
     * The date components that the trigger matches.
     * This includes properties such as year, month, day, hour, minute, second, and nanosecond.
     * The trigger fires when the current date matches these components.
     * If you want the trigger to fire at a specific time, you can set the hour, minute, second, and nanosecond properties.
     * If you want the trigger to fire at a specific date, you can set the year, month, and day properties.
     * If you want the trigger to fire at a specific time and date, you can set all of these properties.
     * If you want the trigger to fire at the current date and time, you can leave all of these properties unset.
     */
    readonly dateComponents: DateComponents
    /**
     * A boolean value that indicates whether the notification should repeat at the specified date.
     */
    readonly repeats: boolean
    /**
     * Calculates the next trigger date based on the current date and the specified date components.
     * @returns The next trigger date as a Date object, or null if the date components are not set or invalid.
     * If the date components are set to the current date and time, the next trigger date will be the current date and time.
     * If the date components are set to a future date, the next trigger date will be that future date.
     * If the date components are set to a past date, the next trigger date will be null.
     * @example
     * ```ts
     * const dateComponents = new DateComponents()
     * dateComponents.year = 2023
     * dateComponents.month = 10
     * dateComponents.day = 1
     * const trigger = new CalendarNotificationTrigger({
     *   dateMatching: dateComponents,
     *   repeats: false
     * })
     * const nextDate = trigger.nextTriggerDate()
     * console.log(nextDate) // Output: The next trigger date as a Date object, or null if the date components are not set or invalid.
     * ```
     */
    nextTriggerDate(): Date | null
  }

  /**
   * This type defines a circular region with a center point and a radius.
   */
  type LocationCircularRegion = {
    /**
     * A unique identifier for the region.
     */
    identifier: string
    /**
     * The center of the region that defines the location where the notification will be triggered.
     */
    center: {
      /**
       * The latitude of the location that triggers the notification.
       */
      latitude: number
      /**
       * The longitude of the location that triggers the notification.
       */
      longitude: number
    }
    /**
     * The radius in meters that defines the area around the location that triggers the notification.
     * The notification will be triggered when the user enters this area.
     */
    radius: number
    /**
     * A boolean value that indicates whether the region is a circular region.
     * If set to true, the region is a circular region defined by the center and radius.
     * If set to false, the region is a polygonal region defined by the coordinates of the polygon.
     * The default value is true.
     */
    notifyOnEntry: boolean
    /**
     * A boolean value that indicates whether the notification should be triggered when the user exits the specified location.
     * If set to true, the notification will be triggered when the user exits the specified location.
     * If set to false, the notification will not be triggered when the user exits the specified location.
     * The default value is true.
     */
    notifyOnExit: boolean
  }

  /**
   * This class provides an interface for location-based notification triggers.
   */
  class LocationNotificationTrigger {
    /**
     * Creates a location notification trigger.
     * @param options - An object containing the region and repeat options.
     * @param options.region - The region that defines the location where the notification will be triggered.
     * @param options.repeats - A boolean value that indicates whether the notification should repeat when the user enters the specified location.
     * If set to true, the notification will be triggered every time the user enters the specified location.
     * If set to false, the notification will be triggered only once when the user enters the specified location.
     * The default value is false.
     * @example
     * ```ts
     * const region = {
     *   identifier: "myRegion",
     *   center: {
     *     latitude: 37.7749,
     *     longitude: -122.4194
     *   },
     *   radius: 100, // 100 meters
     *   notifyOnEntry: true,
     *   notifyOnExit: false
     * }
     * const trigger = new LocationNotificationTrigger({
     *   region: region,
     *   repeats: false
     */
    constructor(options: {
      region: LocationCircularRegion
      repeats: boolean
    })
    /**
     * The region that defines the location where the notification will be triggered.
     */
    readonly region: LocationCircularRegion
    /**
     * A boolean value that indicates whether the notification should repeat when the user enters the specified location.
     */
    readonly repeats: boolean
  }

  /**
   * This class provides an interface for time interval-based notification triggers.
   * It allows you to create triggers that fire after a specified time interval, with options for repeating the notification.
   * The time interval is specified in seconds, and you can choose whether the notification should repeat at that interval.
   * The trigger can be used to schedule notifications that fire after a certain duration, such as reminders or alerts.
   */
  class TimeIntervalNotificationTrigger {
    /**
     * Creates a time interval notification trigger.
     * @param options - An object containing the time interval and repeat options.
     * @param options.timeInterval - The time interval in seconds after which the notification will be triggered.
     * This is the duration after which the notification will be delivered.
     * For example, if you set this to 3600, the notification will be triggered
     * one hour after the trigger is set.
     * @param options.repeats - A boolean value that indicates whether the notification should repeat at the specified time interval.
     * If set to true, the notification will be triggered repeatedly at the specified time interval.
     * If set to false, the notification will be triggered only once after the specified time interval.
     * The default value is false.
     * @example
     * ```ts
     * const trigger = new TimeIntervalNotificationTrigger({
     *   timeInterval: 3600, // 1 hour
     *   repeats: false // Do not repeat
     * })
     * ```
     */
    constructor(options: {
      timeInterval: number
      repeats: boolean
    })
    /**
     * The time interval in seconds after which the notification will be triggered.
     * This is the duration after which the notification will be delivered.
     * For example, if you set this to 3600, the notification will be triggered
     * one hour after the trigger is set.
     */
    readonly timeInterval: number
    /**
     * A boolean value that indicates whether the notification should repeat at the specified time interval.
     * If set to true, the notification will be triggered repeatedly at the specified time interval.
     * If set to false, the notification will be triggered only once after the specified time interval.
     * The default value is false.
     */
    readonly repeats: boolean
    /**
     * Calculates the next trigger date based on the current time and the specified time interval.
     * @returns The next trigger date as a Date object, or null if the time interval is not set or invalid.
     * If the time interval is set to 0, the next trigger date will be the current date and time.
     * If the time interval is negative, the next trigger date will be null.
     * If the time interval is positive, the next trigger date will be the current date and time plus the specified time interval.
     * @example
     * ```ts
     * const trigger = new TimeIntervalNotificationTrigger()
     * trigger.timeInterval = 3600 // 1 hour
     * const nextDate = trigger.nextTriggerDate()
     * console.log(nextDate) // Output: The current date and time plus 1 hour
     * ```
     */
    nextTriggerDate(): Date | null
  }

  /**
   * This type defines the identifiers for various health-related quantity types.
   * These identifiers are used to specify the type of health data being accessed or recorded.
   * Each identifier corresponds to a specific health metric, such as body mass index, heart rate, step count, and more.
   * @see {@link https://developer.apple.com/documentation/healthkit/hkquantitytypeidentifier}
   */
  type HealthQuantityType =
    "appleSleepingWristTemperature" |
    "bodyFatPercentage" |
    "bodyMass" |
    "bodyMassIndex" |
    "electrodermalActivity" |
    "height" |
    "leanBodyMass" |
    "waistCircumference" |
    "activeEnergyBurned" |
    "appleExerciseTime" |
    "appleMoveTime" |
    "appleStandTime" |
    "basalEnergyBurned" |
    "crossCountrySkiingSpeed" |
    "cyclingCadence" |
    "cyclingFunctionalThresholdPower" |
    "cyclingPower" |
    "cyclingSpeed" |
    "distanceCrossCountrySkiing" |
    "distanceCycling" |
    "distanceDownhillSnowSports" |
    "distancePaddleSports" |
    "distanceRowing" |
    "distanceSkatingSports" |
    "distanceSwimming" |
    "distanceWalkingRunning" |
    "distanceWheelchair" |
    "estimatedWorkoutEffortScore" |
    "flightsClimbed" |
    "nikeFuel" |
    "paddleSportsSpeed" |
    "physicalEffort" |
    "pushCount" |
    "rowingSpeed" |
    "runningPower" |
    "runningSpeed" |
    "stepCount" |
    "swimmingStrokeCount" |
    "underwaterDepth" |
    "workoutEffortScore" |
    "environmentalAudioExposure" |
    "environmentalSoundReduction" |
    "headphoneAudioExposure" |
    "atrialFibrillationBurden" |
    "heartRate" |
    "heartRateRecoveryOneMinute" |
    "heartRateVariabilitySDNN" |
    "peripheralPerfusionIndex" |
    "restingHeartRate" |
    "vo2Max" |
    "walkingHeartRateAverage" |
    "appleWalkingSteadiness" |
    "runningGroundContactTime" |
    "runningStrideLength" |
    "runningVerticalOscillation" |
    "sixMinuteWalkTestDistance" |
    "stairAscentSpeed" |
    "stairDescentSpeed" |
    "walkingAsymmetryPercentage" |
    "walkingDoubleSupportPercentage" |
    "walkingSpeed" |
    "walkingStepLength" |
    "dietaryBiotin" |
    "dietaryCaffeine" |
    "dietaryCalcium" |
    "dietaryCarbohydrates" |
    "dietaryChloride" |
    "dietaryCholesterol" |
    "dietaryChromium" |
    "dietaryCopper" |
    "dietaryEnergyConsumed" |
    "dietaryFatMonounsaturated" |
    "dietaryFatPolyunsaturated" |
    "dietaryFatSaturated" |
    "dietaryFatTotal" |
    "dietaryFiber" |
    "dietaryFolate" |
    "dietaryIodine" |
    "dietaryIron" |
    "dietaryMagnesium" |
    "dietaryManganese" |
    "dietaryMolybdenum" |
    "dietaryNiacin" |
    "dietaryPantothenicAcid" |
    "dietaryPhosphorus" |
    "dietaryPotassium" |
    "dietaryProtein" |
    "dietaryRiboflavin" |
    "dietarySelenium" |
    "dietarySodium" |
    "dietarySugar" |
    "dietaryThiamin" |
    "dietaryVitaminA" |
    "dietaryVitaminB12" |
    "dietaryVitaminB6" |
    "dietaryVitaminC" |
    "dietaryVitaminD" |
    "dietaryVitaminE" |
    "dietaryVitaminK" |
    "dietaryWater" |
    "dietaryZinc" |
    "bloodAlcoholContent" |
    "bloodPressureDiastolic" |
    "bloodPressureSystolic" |
    "insulinDelivery" |
    "numberOfAlcoholicBeverages" |
    "numberOfTimesFallen" |
    "timeInDaylight" |
    "uvExposure" |
    "waterTemperature" |
    "basalBodyTemperature" |
    "appleSleepingBreathingDisturbances" |
    "forcedExpiratoryVolume1" |
    "forcedVitalCapacity" |
    "inhalerUsage" |
    "oxygenSaturation" |
    "peakExpiratoryFlowRate" |
    "respiratoryRate" |
    "bloodGlucose" |
    "bodyTemperature"

  /**
   * This type defines the identifiers for various health-related categories.
   * @see {@link https://developer.apple.com/documentation/healthkit/hkcategorytypeidentifier}
   */
  type HealthCategoryType =
    "appleStandHour" |
    "environmentalAudioExposureEvent" |
    "headphoneAudioExposureEvent" |
    "highHeartRateEvent" |
    "irregularHeartRhythmEvent" |
    "lowCardioFitnessEvent" |
    "lowHeartRateEvent" |
    "mindfulSession" |
    "appleWalkingSteadinessEvent" |
    "handwashingEvent" |
    "toothbrushingEvent" |
    "bleedingAfterPregnancy" |
    "bleedingDuringPregnancy" |
    "cervicalMucusQuality" |
    "contraceptive" |
    "infrequentMenstrualCycles" |
    "intermenstrualBleeding" |
    "irregularMenstrualCycles" |
    "lactation" |
    "menstrualFlow" |
    "ovulationTestResult" |
    "persistentIntermenstrualBleeding" |
    "pregnancy" |
    "pregnancyTestResult" |
    "progesteroneTestResult" |
    "prolongedMenstrualPeriods" |
    "sexualActivity" |
    "sleepApneaEvent" |
    "sleepAnalysis" |
    "abdominalCramps" |
    "acne" |
    "appetiteChanges" |
    "bladderIncontinence" |
    "bloating" |
    "breastPain" |
    "chestTightnessOrPain" |
    "chills" |
    "constipation" |
    "coughing" |
    "diarrhea" |
    "dizziness" |
    "drySkin" |
    "fainting" |
    "fatigue" |
    "fever" |
    "generalizedBodyAche" |
    "hairLoss" |
    "headache" |
    "heartburn" |
    "hotFlashes" |
    "lossOfSmell" |
    "lossOfTaste" |
    "lowerBackPain" |
    "memoryLapse" |
    "moodChanges" |
    "nausea" |
    "nightSweats" |
    "pelvicPain" |
    "rapidPoundingOrFlutteringHeartbeat" |
    "runnyNose" |
    "shortnessOfBreath" |
    "sinusCongestion" |
    "skippedHeartbeat" |
    "sleepChanges" |
    "soreThroat" |
    "vaginalDryness" |
    "vomiting" |
    "wheezing"

  /**
   * This type defines the identifiers for various health-related correlation types.
   * Correlations are used to link related health data, such as linking food intake with blood pressure readings.
   * @see {@link https://developer.apple.com/documentation/healthkit/hkcorrelationtypeidentifier}
   */
  type HealthCorrelationType = "food" | "bloodPressure"

  type HealthDateInterval = {
    start: Date
    end: Date
    /**
     * Duration in seconds.
     */
    duration: number
  }

  enum HealthMetricPrefix {
    none = 0,
    femto = 13,
    pico = 1,
    nano = 2,
    micro = 3,
    milli = 4,
    centi = 5,
    deci = 6,
    deca = 7,
    hecto = 8,
    kilo = 9,
    mega = 10,
    giga = 11,
    tera = 12,
  }

  /**
   * This class provides an interface for health devices.
   * It allows you to access information about health devices, such as their unique identifier, manufacturer, model, hardware version, firmware version, software version, and user-facing name.
   */
  class HealthDevice {
    /**
     * A unique identifier for the health device.
     * This identifier is used to distinguish the device from other health devices.
     */
    readonly udiDeviceIdentifier: string | null
    /**
     * The name of the health device.
     * This is a human-readable name that identifies the device.
     */
    readonly manufacturer: string | null
    /**
     * The model of the health device.
     */
    readonly model: string | null
    /**
     * The hardware version of the health device.
     */
    readonly hardwareVersion: string | null
    /**
     * The firmware version of the health device.
     */
    readonly firmwareVersion: string | null
    /**
     * The software version of the health device.
     */
    readonly softwareVersion: string | null
    /**
     * The user-facing name for the device.
     */
    readonly name: string | null
    /**
     * Returns a device object that represents the current device.
     */
    static local(): HealthDevice
  }

  /**
   * This class provides an interface for health sources.
   * It allows you to access information about health sources, such as the bundle identifier and name of the app that provides the health data.
   */
  class HealthSource {
    /**
     * The bundle identifier of the health source.
     */
    readonly bundleIdentifier: string
    /**
     * The name of the health source.
     */
    readonly name: string
    /**
     * Returns a source object for the current app.
     */
    static forCurrentApp(): HealthSource
  }

  class HealthSourceRevision {
    /**
     * The health source that this revision belongs to.
     * This is an instance of the HealthSource class, which provides information about the app that provides the health data.
     * The health source can be an app that records health data, such as a fitness tracker or a health monitoring app.
     * @see {@link https://developer.apple.com/documentation/healthkit/hksource}
     */
    readonly source: HealthSource
    /**
     * The version of the health source.
     * This is a string representation of the version, such as "1.0.0".
     */
    readonly version: string | null
    /**
     * The product type of the health source.
     */
    readonly productType: string | null
    /**
     * An object that identifies the operating system used to save a sample.
     */
    readonly operatingSystemVersion: {
      majorVersion: number
      minorVersion: number
      patchVersion: number
    }
  }

  /**
   * This class provides an interface for health units.
   * It allows you to create and manipulate various health-related units of measurement, such as grams, liters, meters, and more.
   * You can create units with specific prefixes, perform unit arithmetic (multiplication, division, exponentiation), and check for null units.
   * @see {@link https://developer.apple.com/documentation/healthkit/hkunit}
   */
  class HealthUnit {

    /**
     * The raw value of the health unit, which is a string representation of the unit.
     * This string can include metric prefixes and is used to identify the unit in a human-readable format.
     * For example, "kg" for kilograms, "m" for meters, "L" for liters, etc.
     */
    readonly unitString: string
    /**
     * A boolean value that indicates whether the health unit is null.
     */
    readonly isNull: boolean
    /**
     * Creates a complex unit by multiplying the receiving unit with another unit.
     * @param other The other HealthUnit to compare with.
     * @return A new HealthUnit instance representing the result of the multiplication.
     */
    multiplied(other: HealthUnit): HealthUnit
    /**
     * Creates a complex unit by dividing the receiving unit by another unit.
     * @param other The other HealthUnit to compare with.
     * @return A new HealthUnit instance representing the result of the division.
     */
    divided(other: HealthUnit): HealthUnit
    /**
     * Raises the receiving unit to a specified power.
     * @param power The power to which the receiving unit is raised.
     * @return A new HealthUnit instance representing the result of the exponentiation.
     */
    raisedToPower(power: HealthMetricPrefix): HealthUnit
    /**
     * Creates a reciprocal unit by inverting the receiving unit.
     * The reciprocal of a unit is the inverse of that unit, which is useful for converting between different types of units.
     * For example, the reciprocal of "meters" is "1/meters", which can be used to represent "per meter".
     * @returns A new HealthUnit instance representing the reciprocal of the receiving unit.
     */
    reciprocal(): HealthUnit

    /**
     * Creates a HealthUnit instance from a string representation of the health unit.
     * This method parses the string and returns a HealthUnit instance that corresponds to the specified unit.
     * @returns A HealthUnit instance representing the specified unit.
     */
    static fromString(unitString: string): HealthUnit

    // Simple SI units and their prefixed variants
    static gram(): HealthUnit
    static gramUnit(prefix: HealthMetricPrefix): HealthUnit
    static ounce(): HealthUnit
    static pound(): HealthUnit
    static stone(): HealthUnit
    static moleUnit(molarMass: number): HealthUnit
    static moleUnitWithMetricPrefix(prefix: HealthMetricPrefix, molarMass: number): HealthUnit

    // Imperial length
    static meter(): HealthUnit
    static meterUnit(prefix: HealthMetricPrefix): HealthUnit
    static inch(): HealthUnit
    static foot(): HealthUnit
    static yard(): HealthUnit
    static mile(): HealthUnit

    // Volume
    static liter(): HealthUnit
    static literUnit(prefix: HealthMetricPrefix): HealthUnit
    static fluidOunceUS(): HealthUnit
    static fluidOunceImperial(): HealthUnit
    static cupUS(): HealthUnit
    static cupImperial(): HealthUnit
    static pintUS(): HealthUnit
    static pintImperial(): HealthUnit

    // Pressure
    static pascal(): HealthUnit
    static pascalUnit(prefix: HealthMetricPrefix): HealthUnit
    static millimeterOfMercury(): HealthUnit
    static inchesOfMercury(): HealthUnit
    static centimeterOfWater(): HealthUnit
    static atmosphere(): HealthUnit

    // Common time units
    static second(): HealthUnit
    static secondUnit(prefix: HealthMetricPrefix): HealthUnit
    static minute(): HealthUnit
    static hour(): HealthUnit
    static day(): HealthUnit

    // Energy
    static largeCalorie(): HealthUnit
    static smallCalorie(): HealthUnit
    static kilocalorie(): HealthUnit
    static joule(): HealthUnit
    static jouleUnit(prefix: HealthMetricPrefix): HealthUnit

    // Power
    static watt(): HealthUnit
    static wattUnit(prefix: HealthMetricPrefix): HealthUnit

    // Temperature
    static degreeCelsius(): HealthUnit
    static degreeFahrenheit(): HealthUnit
    static kelvin(): HealthUnit

    static hertz(): HealthUnit
    static hertzUnit(prefix: HealthMetricPrefix): HealthUnit

    static diopter(): HealthUnit
    static prismDiopter(): HealthUnit

    // Angle
    static degreeAngle(): HealthUnit
    static radianAngle(): HealthUnit
    static radianAngleUnit(prefix: HealthMetricPrefix): HealthUnit

    static siemen(): HealthUnit
    static siemenUnit(prefix: HealthMetricPrefix): HealthUnit

    static volt(): HealthUnit
    static voltUnit(prefix: HealthMetricPrefix): HealthUnit

    static internationalUnit(): HealthUnit

    static lux(): HealthUnit
    static luxUnit(prefix: HealthMetricPrefix): HealthUnit

    // Dimensionless
    static count(): HealthUnit
    static percent(): HealthUnit

    // Sound
    static decibelAWeightedSoundPressureLevel(): HealthUnit
    static decibelHearingLevel(): HealthUnit
  }

  /**
   * This class provides an interface for health statistics.
   * It allows you to retrieve and calculate various statistics related to health data, such as average quantities, sums, minimums, maximums, and durations.
   * The statistics are based on a specific health quantity type and a date range.
   * You can use this class to analyze health data over a specified period, such as daily, weekly, or monthly statistics.
   */
  class HealthStatistics {
    /**
     * The identifier for the health quantity type that this statistics object represents.
     */
    readonly quantityType: HealthQuantityType

    readonly sources: HealthSource[] | null
    /**
     * The start of the time period included in these statistics.
     */
    readonly startDate: Date
    /**
     * The end of the time period included in these statistics.
     */
    readonly endDate: Date

    /**
     * Returns the total duration covering all the samples that match the query.
     * @param unit The unit in which to express the duration.
     * @param source An optional HealthSource to filter the samples by a specific source.
     * If provided, only samples from this source will be considered in the duration calculation.
     * If not provided, all samples matching the query will be considered.
     * @returns The total duration in the specified unit, or null if no samples match the query.
     */
    duration(unit: HealthUnit, source?: HealthSource): number | null
    /**
     * Returns the average quantity covering all the samples that match the query.
     * @param unit The unit in which to express the average quantity.
     * @param source An optional HealthSource to filter the samples by a specific source.
     * If provided, only samples from this source will be considered in the average calculation.
     * If not provided, all samples matching the query will be considered.
     * @returns The average quantity in the specified unit, or null if no samples match the query.
     */
    averageQuantity(unit: HealthUnit, source?: HealthSource): number | null
    /**
     * Returns the sum of all the samples that match the query.
     * @param unit The unit in which to express the sum of quantities.
     * @param source An optional HealthSource to filter the samples by a specific source.
     * If provided, only samples from this source will be considered in the sum calculation.
     * If not provided, all samples matching the query will be considered.
     * @return The sum of quantities in the specified unit, or null if no samples match the query.
     */
    sumQuantity(unit: HealthUnit, source?: HealthSource): number | null
    /**
     * Returns the minimum quantity covering all the samples that match the query.
     * @param unit The unit in which to express the minimum quantity.
     * @param source An optional HealthSource to filter the samples by a specific source.
     * If provided, only samples from this source will be considered in the minimum calculation.
     * If not provided, all samples matching the query will be considered.
     * @returns The minimum quantity in the specified unit, or null if no samples match the query.
     */
    minimumQuantity(unit: HealthUnit, source?: HealthSource): number | null
    /**
     * Returns the maximum quantity covering all the samples that match the query.
     * @param unit The unit in which to express the maximum quantity.
     * @param source An optional HealthSource to filter the samples by a specific source.
     * If provided, only samples from this source will be considered in the maximum calculation.
     * If not provided, all samples matching the query will be considered.
     * @returns The maximum quantity in the specified unit, or null if no samples match the
     */
    maximumQuantity(unit: HealthUnit, source?: HealthSource): number | null
    /**
     * Returns the most recent quantity covering all the samples that match the query.
     * The most recent quantity is the last recorded value within the specified date range.
     * If there are no samples in the specified date range, this method returns null.
     * @param unit The unit in which to express the most recent quantity.
     * @param source An optional HealthSource to filter the samples by a specific source.
     * If provided, only samples from this source will be considered in the most recent quantity calculation.
     * If not provided, all samples matching the query will be considered.
     * @return The most recent quantity in the specified unit, or null if no samples match the query.
     */
    mostRecentQuantity(unit: HealthUnit, source?: HealthSource): number | null
    /**
     * Returns the date interval of the most recent quantity covering all the samples that match the query.
     * The date interval represents the start and end dates of the most recent quantity sample.
     * @param source An optional HealthSource to filter the samples by a specific source.
     */
    mostRecentQuantityDateInterval(source?: HealthSource): HealthDateInterval | null
  }

  /**
   * This class provides an interface for health statistics collections.
   * It allows you to access collections of health statistics, which can include multiple health sources and statistics for different health quantity types.
   */
  class HealthStatisticsCollection {
    sources(): HealthSource[]
    statistics(): HealthStatistics[]
    statisticsFor(date: Date): HealthStatistics | null
  }

  /**
   * This class provides an interface for health quantity samples.
   * 
   * It allows you to access individual health quantity samples, including their UUID, type, start and end dates, count, and metadata.
   * 
   * You can also retrieve the quantity value in a specified health unit.
   * 
   * This class is useful for working with specific health data points, such as a single measurement of heart rate, step count, or any other health quantity type.
   * @see {@link https://developer.apple.com/documentation/healthkit/hkquantitysample}
   */
  class HealthQuantitySample {
    readonly uuid: string
    readonly quantityType: HealthQuantityType
    readonly startDate: Date
    readonly endDate: Date
    readonly count: number
    readonly metadata: Record<string, any> | null
    readonly device: HealthDevice | null
    readonly sourceRevision: HealthSourceRevision

    quantityValue(unit: HealthUnit): number

    /**
     * Creates a new HealthQuantitySample instance with the specified parameters.
     * @param options - An object containing the properties for creating a health quantity sample.
     * @param options.type - The type of health quantity sample to create.
     * @param options.startDate - The start date of the health quantity sample.
     * @param options.endDate - The end date of the health quantity sample.
     * @param options.value - The value of the health quantity sample.
     * @param options.unit - The unit of measurement for the health quantity sample.
     * @param options.metadata - Optional metadata associated with the health quantity sample.
     * @returns A new HealthQuantitySample instance if the parameters are valid, or null if the parameters are invalid.
     */
    static create(options: {
      type: HealthQuantityType
      startDate: Date
      endDate: Date
      value: number
      unit: HealthUnit
      metadata?: Record<string, any> | null
    }): HealthQuantitySample | null
  }

  /**
   * This class provides an interface for cumulative health quantity samples.
   * 
   * It allows you to access cumulative health quantity samples, which represent the total quantity of a specific health metric over a period of time.
   * 
   * The class includes properties such as UUID, quantity type, start and end dates, count, metadata, and whether the sample has an undetermined duration.
   * 
   * You can also retrieve the sum of the quantity in a specified health unit and the quantity value in a specified health unit.
   * 
   * This class is useful for working with cumulative health data,
   * such as total steps taken, total distance traveled, or any other cumulative health quantity type.
   * @see {@link https://developer.apple.com/documentation/healthkit/hkcumulativequantitysample}
   */
  class HealthCumulativeQuantitySample {
    readonly uuid: string
    readonly quantityType: HealthQuantityType
    readonly startDate: Date
    readonly endDate: Date
    readonly count: number
    readonly metadata: Record<string, any> | null
    readonly hasUndeterminedDuration: boolean
    readonly device: HealthDevice | null
    readonly sourceRevision: HealthSourceRevision

    sumQuantity(unit: HealthUnit): number
    quantityValue(unit: HealthUnit): number
  }

  /**
   * This class provides an interface for discrete health quantity samples.
   * 
   * It allows you to access discrete health quantity samples, which represent individual measurements of a specific health metric taken at specific times.
   * 
   * The class includes properties such as UUID, quantity type, start and end dates, count, metadata, and the most recent quantity date interval.
   * 
   * You can also retrieve the quantity value in a specified health unit, as well as calculate the average, maximum, minimum, and most recent quantities in a specified health unit.
   * 
   * This class is useful for working with discrete health data,
   * such as individual heart rate measurements, step counts, or any other discrete health quantity type.
   * @see {@link https://developer.apple.com/documentation/healthkit/hkdiscretequantitysample}
   */
  class HealthDiscreteQuantitySample {
    readonly uuid: string
    readonly quantityType: HealthQuantityType
    readonly startDate: Date
    readonly endDate: Date
    readonly count: number
    readonly metadata: Record<string, any> | null
    readonly mostRecentQuantityDateInterval: HealthDateInterval | null
    readonly device: HealthDevice | null
    readonly sourceRevision: HealthSourceRevision

    quantityValue(unit: HealthUnit): number
    averageQuantity(unit: HealthUnit): number
    maximumQuantity(unit: HealthUnit): number
    minimumQuantity(unit: HealthUnit): number
    mostRecentQuantity(unit: HealthUnit): number | null
  }

  /**
   * This class provides an interface for health category samples.
   * 
   * It allows you to access individual health category samples, which represent specific health events or conditions recorded over a period of time.
   * 
   * The class includes properties such as UUID, category type, start and end dates, value, and optional metadata.
   * 
   * You can use this class to work with various health category types, such as sleep analysis, menstrual flow, ovulation test results, and more.
   * Each sample represents a specific health event or condition, allowing you to track and analyze health data over time.
   * @see {@link https://developer.apple.com/documentation/healthkit/hkcategorysample}
   */
  class HealthCategorySample {
    readonly uuid: string
    readonly categoryType: HealthCategoryType
    readonly startDate: Date
    readonly endDate: Date
    readonly value: number
    readonly metadata: Record<string, any> | null
    readonly device: HealthDevice | null
    readonly sourceRevision: HealthSourceRevision

    /**
     * Creates a new HealthCategorySample instance with the specified parameters.
     * @param options - An object containing the properties for creating a health category sample.
     * @param options.type - The type of health category sample to create.
     * @param options.startDate - The start date of the health category sample.
     * @param options.endDate - The end date of the health category sample.
     * @param options.value - The value of the health category sample, which can be one of several specific types such as appetite changes, apple stand hour, ovulation test result, etc.
     * @param options.metadata - Optional metadata associated with the health category sample.
     * @returns A new HealthCategorySample instance if the parameters are valid, or null if the parameters are invalid.
     */
    static create(options: {
      type: HealthCategoryType
      startDate: Date
      endDate: Date
      value: HealthCategoryValueAppetiteChanges | HealthCategoryValueAppleStandHour | HealthCategoryValueAppleWalkingSteadinessEvent | HealthCategoryValueCervicalMucusQuality | HealthCategoryValueContraceptive | HealthCategoryValueEnvironmentalAudioExposureEvent | HealthCategoryValueHeadphoneAudioExposureEvent | HealthCategoryValueLowCardioFitnessEvent | HealthCategoryValueOvulationTestResult | HealthCategoryValuePregnancyTestResult | HealthCategoryValuePresence | HealthCategoryValueProgesteroneTestResult | HealthCategoryValueSeverity | HealthCategoryValueSleepAnalysis | HealthCategoryValueVaginalBleeding
      metadata?: Record<string, any> | null
    }): HealthCategorySample | null
  }

  /**
   * This class provides an interface for health correlations.
   * 
   * It allows you to access health correlations, which are relationships between different health data types.
   * 
   * Correlations can link related health data, such as food intake with blood pressure readings or menstrual cycles with ovulation test results.
   * 
   * The class includes properties such as UUID, correlation type, start and end dates, optional metadata, and an array of samples.
   * 
   * You can use this class to work with various health correlation types, such as food correlations or blood pressure correlations.
   * 
   * Each correlation represents a relationship between different health data types, allowing you to analyze and understand health data in a more comprehensive way.
   * @see {@link https://developer.apple.com/documentation/healthkit/hkcorrelation}
   */
  class HealthCorrelation {
    readonly uuid: string
    readonly correlationType: HealthCorrelationType
    readonly startDate: Date
    readonly endDate: Date
    readonly metadata: Record<string, any> | null
    readonly samples: (HealthQuantitySample | HealthCumulativeQuantitySample | HealthDiscreteQuantitySample | HealthCategorySample)[]
    readonly device: HealthDevice | null
    readonly sourceRevision: HealthSourceRevision
    /**
     * Because `HealthCumulativeQuantitySample` and `HealthDiscreteQuantitySample` are both subclasses of `HealthQuantitySample`, this property can contain samples of all three types.
     */
    readonly quantitySamples: HealthQuantitySample[]
    readonly cumulativeQuantitySamples: HealthCumulativeQuantitySample[]
    readonly discreteQuantitySamples: HealthDiscreteQuantitySample[]
    readonly categorySamples: HealthCategorySample[]

    /**
     * Creates a new HealthCorrelation instance with the specified parameters.
     * @param options - An object containing the properties for creating a health correlation.
     * @param options.type - The type of health correlation to create.
     * @param options.startDate - The start date of the health correlation.
     * @param options.endDate - The end date of the health correlation.
     * @param options.metadata - Optional metadata associated with the health correlation.
     * @param options.objects - An array of health samples that are part of the correlation.
     * @returns A new HealthCorrelation instance if the parameters are valid, or null if the parameters are invalid.
     */
    static create(options: {
      type: HealthCorrelationType
      startDate: Date
      endDate: Date
      metadata?: Record<string, any> | null
      objects: (HealthQuantitySample | HealthCategorySample)[]
    }): HealthCorrelation | null
  }

  /**
   * This enum defines the types of health workout events.
   */
  enum HealthWorkoutEventType {
    pause = 1,
    resume = 2,
    lap = 3,
    marker = 4,
    motionPaused = 5,
    motionResumed = 6,
    segment = 7,
    pauseOrResumeRequest = 8,
  }

  /**
   * This enum defines the activity types for health workouts.
   */
  enum HealthWorkoutActivityType {
    americanFootball = 1,
    archery = 2,
    australianFootball = 3,
    badminton = 4,
    baseball = 5,
    basketball = 6,
    bowling = 7,
    boxing = 8,
    climbing = 9,
    cricket = 10,
    crossTraining = 11,
    curling = 12,
    cycling = 13,
    dance = 14,
    danceInspiredTraining = 15,
    elliptical = 16,
    equestrianSports = 17,
    fencing = 18,
    fishing = 19,
    functionalStrengthTraining = 20,
    golf = 21,
    gymnastics = 22,
    handball = 23,
    hiking = 24,
    hockey = 25,
    hunting = 26,
    lacrosse = 27,
    martialArts = 28,
    mindAndBody = 29,
    mixedMetabolicCardioTraining = 30,
    paddleSports = 31,
    play = 32,
    preparationAndRecovery = 33,
    racquetball = 34,
    rowing = 35,
    rugby = 36,
    running = 37,
    sailing = 38,
    skatingSports = 39,
    snowSports = 40,
    soccer = 41,
    softball = 42,
    squash = 43,
    stairClimbing = 44,
    surfingSports = 45,
    swimming = 46,
    tableTennis = 47,
    tennis = 48,
    trackAndField = 49,
    traditionalStrengthTraining = 50,
    volleyball = 51,
    walking = 52,
    waterFitness = 53,
    waterPolo = 54,
    waterSports = 55,
    wrestling = 56,
    yoga = 57,
    barre = 58,
    coreTraining = 59,
    crossCountrySkiing = 60,
    downhillSkiing = 61,
    flexibility = 62,
    highIntensityIntervalTraining = 63,
    jumpRope = 64,
    kickboxing = 65,
    pilates = 66,
    snowboarding = 67,
    stairs = 68,
    stepTraining = 69,
    wheelchairWalkPace = 70,
    wheelchairRunPace = 71,
    taiChi = 72,
    mixedCardio = 73,
    handCycling = 74,
    discSports = 75,
    fitnessGaming = 76,
    cardioDance = 77,
    socialDance = 78,
    pickleball = 79,
    cooldown = 80,
    swimBikeRun = 82,
    transition = 83,
    underwaterDiving = 84,
    other = 3000,
  }

  /**
   * This class provides an interface for health workout events.
   * 
   * It allows you to access individual workout events, which represent specific actions or milestones during a workout session.
   * The class includes properties such as type, date interval, and optional metadata.
   * 
   * You can use this class to track and analyze workout events, such as pauses, resumes, laps, markers, and motion events.
   * 
   * Each event represents a specific action taken during a workout, allowing you to gain insights into workout performance and progress.
   * @see {@link https://developer.apple.com/documentation/healthkit/hkworkoutevent}
   */
  class HealthWorkoutEvent {
    readonly type: HealthWorkoutEventType
    readonly dateInterval: HealthDateInterval
    readonly metadata: Record<string, any> | null
  }

  /**
   * This class provides an interface for health workouts.
   * 
   * It allows you to access individual workouts, which represent a complete workout session with specific activity types, start and end dates, duration, and optional metadata.
   * 
   * The class includes properties such as UUID, workout activity type, start and end dates, duration, metadata, and an array of workout events.
   * 
   * You can use this class to track and analyze workouts, including the type of activity performed, the duration of the workout, and any associated events.
   * Each workout represents a complete session of physical activity, allowing you to monitor fitness progress and performance over time.
   * @see {@link https://developer.apple.com/documentation/healthkit/hkworkout}
   */
  class HealthWorkout {
    readonly uuid: string
    readonly workoutActivityType: HealthWorkoutActivityType
    readonly startDate: Date
    readonly endDate: Date
    readonly duration: number
    readonly metadata: Record<string, any> | null
    readonly device: HealthDevice | null
    readonly sourceRevision: HealthSourceRevision
    readonly workoutEvents: HealthWorkoutEvent[] | null
    readonly allStatistics: Record<HealthQuantityType, HealthStatistics | null>
  }

  /**
   * This class provides an interface for health heartbeat series samples.
   * 
   * It allows you to access individual heartbeat series samples, which represent a series of heart rate measurements taken over a period of time.
   * 
   * The class includes properties such as UUID, sample type, start and end dates, count, and optional metadata.
   * 
   * You can use this class to track and analyze heart rate data, including the heart rate at specific times and any associated metadata.
   * Each heartbeat series sample represents a collection of heart rate measurements, allowing you to monitor heart health and fitness over time.
   * @see {@link https://developer.apple.com/documentation/healthkit/hkheartbeatseriessample}
   */
  class HealthHeartbeatSeriesSample {
    readonly uuid: string
    readonly sampleType: string
    readonly startDate: Date
    readonly endDate: Date
    readonly count: number
    readonly metadata: Record<string, any> | null
    readonly device: HealthDevice | null
    readonly sourceRevision: HealthSourceRevision
  }

  /**
   * This enum defines the modes for health activity move summaries.
   */
  enum HealthActivityMoveMode {
    activeEnergy = 1,
    appleMoveTime = 2,
  }

  /**
   * This class provides an interface for health activity summaries.
   * 
   * It allows you to access daily summaries of health activity, including active energy burned, exercise time, stand hours, and more.
   */
  class HealthActivitySummary {
    readonly dateComponents: DateComponents
    readonly activityMoveMode: HealthActivityMoveMode

    activeEnergyBurned(unit: HealthUnit): number
    activeEnergyBurnedGoal(unit: HealthUnit): number
    appleMoveTime(unit: HealthUnit): number
    appleMoveTimeGoal(unit: HealthUnit): number
    appleExerciseTime(unit: HealthUnit): number
    appleExerciseTimeGoal(unit: HealthUnit): number
    appleStandHours(unit: HealthUnit): number
    appleStandHoursGoal(unit: HealthUnit): number
  }

  enum HealthCategoryValueAppetiteChanges {
    unspecified = 0,
    noChange = 1,
    decreased = 2,
    increased = 3,
  }

  enum HealthCategoryValueAppleStandHour {
    stood = 0,
    idle = 1,
  }

  enum HealthCategoryValueAppleWalkingSteadinessEvent {
    initialLow = 1,
    initialVeryLow = 2,
    repeatLow = 3,
    repeatVeryLow = 4,
  }

  enum HealthCategoryValueCervicalMucusQuality {
    dry = 1,
    sticky = 2,
    creamy = 3,
    watery = 4,
    eggWhite = 5,
  }

  enum HealthCategoryValueContraceptive {
    unspecified = 1,
    implant = 2,
    injection = 3,
    intrauterineDevice = 4,
    intravaginalRing = 5,
    oral = 6,
    patch = 7,
  }

  enum HealthCategoryValueEnvironmentalAudioExposureEvent {
    momentaryLimit = 1
  }

  enum HealthCategoryValueHeadphoneAudioExposureEvent {
    sevenDayLimit = 1
  }

  enum HealthCategoryValueLowCardioFitnessEvent {
    lowFitness = 1
  }

  enum HealthCategoryValueOvulationTestResult {
    negative = 1,
    luteinizingHormoneSurge = 2,
    indeterminate = 3,
    estrogenSurge = 4,
  }

  enum HealthCategoryValuePregnancyTestResult {
    negative = 1,
    positive = 2,
    indeterminate = 3,
  }

  enum HealthCategoryValuePresence {
    present = 0,
    notPresent = 1,
  }

  enum HealthCategoryValueProgesteroneTestResult {
    negative = 1,
    positive = 2,
    indeterminate = 3,
  }

  enum HealthCategoryValueSeverity {
    unspecified = 0,
    notPresent = 1,
    mild = 2,
    moderate = 3,
    severe = 4,
  }

  enum HealthCategoryValueSleepAnalysis {
    inBed = 0,
    asleepUnspecified = 1,
    awake = 2,
    asleepCore = 3,
    asleepDeep = 4,
    asleepREM = 5,
  }

  /**
   * @requires iOS 18.0
   */
  enum HealthCategoryValueVaginalBleeding {
    unspecified = 1,
    light = 2,
    medium = 3,
    heavy = 4,
    none = 5,
  }

  /**
   * This type defines the identifiers for various health-related quantity types.
   * @see {@link https://developer.apple.com/documentation/healthkit/hkstatisticsoptions}
   */
  type HealthStatisticsOptions = "cumulativeSum" | "discreteAverage" | "discreteMax" | "discreteMin" | "mostRecent" | "duration" | "separateBySource"

  enum HealthBiologicalSex {
    notSet = 0,
    female = 1,
    male = 2,
    other = 3,
  }

  enum HealthBloodType {
    notSet = 0,
    aPositive = 1,
    aNegative = 2,
    bPositive = 3,
    bNegative = 4,
    abPositive = 5,
    abNegative = 6,
    oPositive = 7,
    oNegative = 8,
  }

  enum HealthFitzpatrickSkinType {
    notSet = 0,
    I = 1,
    II = 2,
    III = 3,
    IV = 4,
    V = 5,
    VI = 6,
  }

  enum HealthWheelchairUse {
    notSet = 0,
    no = 1,
    yes = 2,
  }

  namespace Health {
    /**
     * Indicates whether health data is available on the device.
     */
    const isHealthDataAvailable: boolean

    /**
     * Reads the user’s date of birth as date components.
     * @returns A promise that resolves to a DateComponents object representing the user's date of birth.
     * @throws Will throw an error if the date of birth is not available or if there is an issue reading it.
     */
    function dateOfBirth(): Promise<DateComponents>
    /**
     * Reads user's biological sex.
     * @returns A promise that resolves to the user's biological sex.
     * @throws Will throw an error if the biological sex is not available or if there is an issue reading it.
     */
    function biologicalSex(): Promise<HealthBiologicalSex>

    /**
     * Reads user's blood type.
     * @returns A promise that resolves to the user's blood type.
     * @throws Will throw an error if the blood type is not available or if there is an issue reading it.
     */
    function bloodType(): Promise<HealthBloodType>

    /**
     * Reads user's Fitzpatrick skin type.
     * @returns A promise that resolves to the user's Fitzpatrick skin type.
     * @throws Will throw an error if the Fitzpatrick skin type is not available or if there is an issue reading it.
     */
    function fitzpatrickSkinType(): Promise<HealthFitzpatrickSkinType>

    /**
     * Reads whether the user uses a wheelchair.
     * @returns A promise that resolves to the user's wheelchair use status.
     * @throws Will throw an error if the wheelchair use status is not available or if there is an issue reading it.
     */
    function wheelchairUse(): Promise<HealthWheelchairUse>

    /**
     * Reads the user's activity move mode.
     * The activity move mode indicates how the user prefers to track their activity, such as through active energy burned or Apple Move Time.
     * @returns A promise that resolves to the user's activity move mode.
     * @throws Will throw an error if the activity move mode is not available or if there is an issue reading it.
     */
    function activityMoveMode(): Promise<HealthActivityMoveMode>

    /**
     * Queries health quantity samples of a specific type.
     * @param quantityType The type of health quantity to query, e.g., "heartRate", "stepCount", etc.
     * @param options Optional parameters for the query, including:
     * - startDate: The start date for the query range.
     * - endDate: The end date for the query range.
     * - limit: The maximum number of samples to return.
     * - strictStartDate: If true, only samples that start exactly at the specified start date will be included.
     * - strictEndDate: If true, only samples that end exactly at the specified end date will be included.
     * - sortDescriptors: An array of sort descriptors to sort the results by specific keys such as "startDate", "endDate", or "count".
     * @returns A promise that resolves to an array of health quantity samples, which can include cumulative and discrete samples.
     */
    function queryQuantitySamples(
      quantityType: HealthQuantityType,
      options?: {
        startDate?: Date
        endDate?: Date
        limit?: number
        strictStartDate?: boolean
        strictEndDate?: boolean
        sortDescriptors?: Array<{
          key: "startDate" | "endDate" | "count"
          order?: "forward" | "reverse"
        }>
      }
    ): Promise<Array<HealthQuantitySample | HealthCumulativeQuantitySample | HealthDiscreteQuantitySample>>

    /**
     * Queries health statistics for a specific quantity type over a date range.
     * @param categoryType The type of health category to query, e.g., "sleepAnalysis", "menstrualFlow", etc.
     * @param options Optional parameters for the query, including:
     * - startDate: The start date for the query range.
     * - endDate: The end date for the query range.
     * - limit: The maximum number of samples to return.
     * - strictStartDate: If true, only samples that start exactly at the specified start date will be included.
     * - strictEndDate: If true, only samples that end exactly at the specified end date will be included.
     * - sortDescriptors: An array of sort descriptors to sort the results by specific keys such as "startDate", "endDate", or "value".
     * @returns A promise that resolves to an array of health category samples.
     * Each sample represents a specific health event or condition, such as sleep analysis, menstrual flow, or ovulation test results.
     * The samples can include metadata and are sorted according to the specified sort descriptors.
     * @see {@link https://developer.apple.com/documentation/healthkit/hkcategorysample}
     */
    function queryCategorySamples(
      categoryType: HealthCategoryType,
      options?: {
        startDate?: Date
        endDate?: Date
        limit?: number
        strictStartDate?: boolean
        strictEndDate?: boolean
        sortDescriptors?: Array<{
          key: "startDate" | "endDate" | "value"
          order?: "forward" | "reverse"
        }>
      }
    ): Promise<HealthCategorySample[]>

    /**
     * Queries health characteristics for the device.
     * @param correlationType The type of health correlation to query, e.g., "food", "bloodPressure", etc.
     * @param options Optional parameters for the query, including:
     * - startDate: The start date for the query range.
     * - endDate: The end date for the query range.
     * - limit: The maximum number of correlations to return.
     * - strictStartDate: If true, only correlations that start exactly at the specified start date will be included.
     * - strictEndDate: If true, only correlations that end exactly at the specified end date will be included.
     * - sortDescriptors: An array of sort descriptors to sort the results by specific keys such as "startDate" or "endDate".
     * @returns A promise that resolves to an array of health correlations.
     * Each correlation represents a relationship between different health data types, such as food intake and blood pressure readings.
     * The correlations can include metadata and are sorted according to the specified sort descriptors.
     * @see {@link https://developer.apple.com/documentation/healthkit/hkcorrelation}
     */
    function queryCorrelations(
      correlationType: HealthCorrelationType,
      options?: {
        startDate?: Date
        endDate?: Date
        limit?: number
        strictStartDate?: boolean
        strictEndDate?: boolean
        sortDescriptors?: Array<{
          key: "startDate" | "endDate"
          order?: "forward" | "reverse"
        }>
      }
    ): Promise<HealthCorrelation[]>

    /**
     * Queries health statistics for a specific quantity type over a date range.
     * This method retrieves statistics such as average, sum, minimum, maximum, and most recent quantities,
     * as well as the total duration covering all samples that match the query.
     * @param quantityType The type of health quantity to query, e.g., "stepCount", "heartRate", etc.
     * @param options Optional parameters for the query, including:
     * - startDate: The start date for the query range.
     * - endDate: The end date for the query range.
     * - strictStartDate: If true, only statistics that start exactly at the specified start date will be included.
     * - strictEndDate: If true, only statistics that end exactly at the specified end date will be included.
     * - statisticsOptions: An array of statistics options to specify which statistics to include in the query.
     *   The options can include "cumulativeSum", "discreteAverage", "discreteMax", "discreteMin", "mostRecent", "duration", and "separateBySource".
     * @returns A promise that resolves to a HealthStatistics object containing statistics for the specified quantity type.
     * @see {@link https://developer.apple.com/documentation/healthkit/hkstatistics}
     */
    function queryStatistics(
      quantityType: HealthQuantityType,
      options?: {
        startDate?: Date
        endDate?: Date
        strictStartDate?: boolean
        strictEndDate?: boolean
        statisticsOptions?: HealthStatisticsOptions | Array<HealthStatisticsOptions>
      }
    ): Promise<HealthStatistics | null>

    /**
     * 
     * @param quantityType The type of health quantity to query, e.g., "stepCount", "heartRate", etc.
     * @param options Optional parameters for the query.
     * @param options.startDate The start date for the query range.
     * @param options.endDate The end date for the query range.
     * @param options.strictStartDate If true, only statistics that start exactly at the specified start date will be included.
     * @param options.strictEndDate If true, only statistics that end exactly at the specified end date will be included.
     * @param options.statisticsOptions An array of statistics options to specify which statistics to include in the query.
     *   The options can include "cumulativeSum", "discreteAverage", "discreteMax", "discreteMin",
     *   "mostRecent", "duration", and "separateBySource".
     * @param options.anchorDate The anchor date for the query, which is used to align the statistics collection with specific intervals.
     * @param options.intervalComponents The date components that define the interval for the statistics collection,
     *   such as day, week, month, etc.
     * @returns A promise that resolves to a HealthStatisticsCollection object containing statistics for the specified quantity type.
     * The collection includes statistics for each interval defined by the anchor date and interval components.
     * @see {@link https://developer.apple.com/documentation/healthkit/hkstatisticscollection}
     */
    function queryStatisticsCollection(
      quantityType: HealthQuantityType,
      options: {
        startDate?: Date
        endDate?: Date
        strictStartDate?: boolean
        strictEndDate?: boolean
        statisticsOptions?: HealthStatisticsOptions | Array<HealthStatisticsOptions>
        anchorDate: Date
        intervalComponents: DateComponents
      }
    ): Promise<HealthStatisticsCollection>

    /**
     * Queries health statistics for a specific quantity type over a date range.
     * @param options Optional parameters for the query, including:
     * - startDate: The start date for the query range.
     * - endDate: The end date for the query range.
     * - limit: The maximum number of activity summaries to return.
     * - strictStartDate: If true, only summaries that start exactly at the specified start date will be included.
     * - strictEndDate: If true, only summaries that end exactly at the specified end date will be included.
     * - sortDescriptors: An array of sort descriptors to sort the results by specific keys such as "startDate" or "endDate".
     * - requestPermissions: An array of health quantity types for which to request permissions before querying. You must request permissions for the types you want to query. Default only requests permissions for the workout activity type.
     * @returns A promise that resolves to an array of health activity summaries.
     * Each summary represents a daily summary of health activity, including active energy burned, exercise time, stand hours, and more.
     * The summaries can include metadata and are sorted according to the specified sort descriptors.
     * @see {@link https://developer.apple.com/documentation/healthkit/hkactivitysummary}
     */
    function queryWorkouts(
      options?: {
        startDate?: Date
        endDate?: Date
        limit?: number
        strictStartDate?: boolean
        strictEndDate?: boolean
        sortDescriptors?: Array<{
          key: "startDate" | "endDate" | "duration"
          order?: "forward" | "reverse"
        }>
        requestPermissions?: HealthQuantityType[]
      }
    ): Promise<HealthWorkout[]>

    /**
     * Queries health heartbeat series samples.
     * @param options Optional parameters for the query, including:
     * - startDate: The start date for the query range.
     * - endDate: The end date for the query range.
     * - limit: The maximum number of heartbeat series samples to return.
     * - strictStartDate: If true, only samples that start exactly at the specified start date will be included.
     * - strictEndDate: If true, only samples that end exactly at the specified end date will be included.
     * - sortDescriptors: An array of sort descriptors to sort the results by specific keys such as "startDate", "endDate", or "count".
     * - requestPermissions: An array of health quantity types for which to request permissions before querying. You must request permissions for the types you want to query. Default only requests permissions for the `heartbeat`, `heartRateVariabilitySDNN` and `heartRate` types.
     * @returns A promise that resolves to an array of health heartbeat series samples.
     * Each sample represents a series of heart rate measurements taken over a period of time.
     * The samples can include metadata and are sorted according to the specified sort descriptors.
     * @see {@link https://developer.apple.com/documentation/healthkit/hkheartbeatseriessample}
     */
    function queryHeartbeatSeriesSamples(
      options?: {
        startDate?: Date
        endDate?: Date
        limit?: number
        strictStartDate?: boolean
        strictEndDate?: boolean
        sortDescriptors?: Array<{
          key: "startDate" | "endDate" | "count"
          order?: "forward" | "reverse"
        }>
        requestPermissions?: HealthQuantityType[]
      }
    ): Promise<HealthHeartbeatSeriesSample[]>

    /**
     * Queries health activity summaries for a specific date range.
     * @param options Optional parameters for the query, including:
     * - start: The start date for the query range, specified as a DateComponents object.
     * - end: The end date for the query range, specified as a DateComponents object.
     * @returns A promise that resolves to an array of health activity summaries.
     * Each summary represents a daily summary of health activity, including active energy burned, exercise time, stand hours, and more.
     * The summaries can include metadata and are sorted by date.
     * @see {@link https://developer.apple.com/documentation/healthkit/hkactivitysummary}
     */
    function queryActivitySummaries(
      options?: {
        start: DateComponents
        end: DateComponents
      }
    ): Promise<HealthActivitySummary[]>

    /**
     * Saves a health quantity sample to the HealthKit store.
     * @param quantitySample The health quantity sample to save.
     * @returns A promise that resolves when the quantity sample is successfully saved.
     * @throws An error if the quantity sample cannot be saved.
     */
    function saveQuantitySample(
      quantitySample: HealthQuantitySample
    ): Promise<void>

    /**
     * Saves a health cumulative quantity sample to the HealthKit store.
     * @param categorySample The health category sample to save.
     * @returns A promise that resolves when the category sample is successfully saved.
     * @throws An error if the category sample cannot be saved.
     */
    function saveCategorySample(
      categorySample: HealthCategorySample
    ): Promise<void>

    /**
     * Saves a health correlation to the HealthKit store.
     * @param correlation The health correlation to save.
     * @returns A promise that resolves when the correlation is successfully saved.
     * @throws An error if the correlation cannot be saved.
     */
    function saveCorrelation(
      correlation: HealthCorrelation
    ): Promise<void>

    /**
     * Deletes a health object from the HealthKit store.
     * @param object The health object to delete, which can be a `HealthQuantitySample`,
     * `HealthCumulativeQuantitySample`, `HealthDiscreteQuantitySample`, `HealthCategorySample`,
     * `HealthCorrelation`, `HealthWorkout`, or `HealthHeartbeatSeriesSample`.
     * @returns A promise that resolves when the object is successfully deleted.
     * @throws An error if the object cannot be deleted.
     */
    function deleteObject(
      object: HealthQuantitySample | HealthCumulativeQuantitySample | HealthDiscreteQuantitySample | HealthCategorySample | HealthCorrelation | HealthWorkout | HealthHeartbeatSeriesSample
    ): Promise<void>

    /**
     * Retrieves the preferred units for a given array of health quantity types.
     * @param quantityTypes An array of health quantity types for which to retrieve preferred units.
     * @returns A promise that resolves to a record mapping each health quantity type to its preferred unit.
     * @throws An error if the preferred units cannot be retrieved.
     */
    function preferredUnits(quantityTypes: HealthQuantityType[]): Promise<Record<HealthQuantityType, HealthUnit>>
  }

  /**
   * This namespace provides functions for translating text between different languages.
   * It includes methods for translating individual texts as well as batches of texts.
   * Requires iOS 18.0 or later.
   */
  class Translation {

    /**
     * The shared instance of the Translation class for convenient access to translation methods.
     * This instance has been bind to a shared `translationHost` of the app, so you can use it directly when your script has no user interface.
     * @example
     * ```ts
     * const translatedText = await Translation.shared.translate({
     *   text: "Hello, world!",
     *   target: "es",
     *   source: "en"
     * })
     * console.log(translatedText) // "¡Hola, mundo!"
     * ```
     */
    static readonly shared: Translation

    /**
     * Translates a single text from the source language to the target language.
     * @param options An object containing the text to be translated, the target language, and optionally the source language.
     * @param options.text The text to be translated.
     * @param options.source The language the source content is in. If this is null, the session tries to identify the language and prompts the person to pick the source language if it’s unclear.
     * @param options.target The language to translate content into. A null value means the session picks a target according to the person’s `Device.preferredLanguages` and the source. 
     * @returns A promise that resolves to the translated text.
     * @throws An error if the translation fails.
     */
    translate(options: {
      text: string
      source?: string
      target?: string
    }): Promise<string>

    /**
     * Translates a batch of texts from the source language to the target language.
     * @param options An object containing the array of texts to be translated, the target language, and optionally the source language.
     * @param options.texts An array of texts to be translated.
     * @param options.source The language the source content is in. If this is null, the session tries to identify the language and prompts the person to pick the source language if it’s unclear.
     * @param options.target The language to translate content into. A null value means the session picks a target according to the person’s `Device.preferredLanguages` and the source. 
     * @returns A promise that resolves to an array of translated texts, in the same order as the input texts.
     * @throws An error if the translation fails.
     */
    translateBatch(options: {
      texts: string[]
      source?: string
      target?: string
    }): Promise<string[]>
  }

  /**
   * This interface allows you to custom your own keyboard extension.
   */
  namespace CustomKeyboard {

    /**
     * Text input traits. You should use `useTraits()` to get the current traits instead of importing this type directly, the value will be updated when `textDidChange` or `selectionDidChange` event is emitted.
     * 
     *  - `autocapitalizationType`: The autocapitalization style for the text object.
     *  - `autocorrectionType`: The autocorrection style for the text object.
     *  - `inlinePredictionType`: The inline prediction style for the text object.
     *  - `spellCheckingType`: The spell-checking style for the text object.
     *  - `smartQuotesType`: The smart quotes style for the text object.
     *  - `smartDashesType`: The smart dashes style for the text object.
     *  - `smartInsertDeleteType`: The smart insert/delete style for the text object.
     *  - `keyboardType`: The keyboard type to be displayed for the text object.
     *  - `keyboardAppearance`: The appearance style of the keyboard for the text object.
     *  - `returnKeyType`: The return key type for the keyboard.
     *  - `enablesReturnKeyAutomatically`: A Boolean value that indicates whether the return key is automatically enabled when the user enters text.
     *  - `textContentType`: A string that describes the semantic meaning expected of the content in a text input area.
     */
    type TextInputTraits = {
      autocapitalizationType: 'default' | 'none' | 'words' | 'sentences' | 'allCharacters'
      autocorrectionType: 'default' | 'no' | 'yes'
      inlinePredictionType: 'default' | 'no' | 'yes'
      spellCheckingType: 'default' | 'no' | 'yes'
      smartQuotesType: 'default' | 'no' | 'yes'
      smartDashesType: 'default' | 'no' | 'yes'
      smartInsertDeleteType: 'default' | 'no' | 'yes'
      keyboardType: 'default' | 'asciiCapable' | 'numbersAndPunctuation' | 'url' | 'numberPad' | 'phonePad' | 'namePhonePad' | 'emailAddress' | 'decimalPad' | 'twitter' | 'webSearch' | 'asciiCapableNumberPad'
      keyboardAppearance: 'default' | 'dark' | 'light'
      returnKeyType: 'default' | 'go' | 'google' | 'join' | 'next' | 'route' | 'search' | 'send' | 'yahoo' | 'done' | 'emergencyCall' | 'continue'
      enablesReturnKeyAutomatically: boolean
      textContentType: "URL" |
      "namePrefix" |
      "name" |
      "nameSuffix" |
      "givenName" |
      "middleName" |
      "familyName" |
      "nickname" |
      "organizationName" |
      "jobTitle" |
      "location" |
      "fullStreetAddress" |
      "streetAddressLine1" |
      "streetAddressLine2" |
      "addressCity" |
      "addressCityAndState" |
      "addressState" |
      "postalCode" |
      "sublocality" |
      "countryName" |
      "username" |
      "password" |
      "newPassword" |
      "oneTimeCode" |
      "emailAddress" |
      "telephoneNumber" |
      "cellularEID" |
      "cellularIMEI" |
      "creditCardNumber" |
      "creditCardExpiration" |
      "creditCardExpirationMonth" |
      "creditCardExpirationYear" |
      "creditCardSecurityCode" |
      "creditCardType" |
      "creditCardName" |
      "creditCardGivenName" |
      "creditCardMiddleName" |
      "creditCardFamilyName" |
      "birthdate" |
      "birthdateDay" |
      "birthdateMonth" |
      "birthdateYear" |
      "dateTime" |
      "flightNumber" |
      "shipmentTrackingNumber"
    }

    const traits: TextInputTraits

    /**
     * The text before the cursor, or null if there is no text before the cursor.
     */
    const textBeforeCursor: Promise<string | null>
    /**
     * The text after the cursor, or null if there is no text after the cursor.
     */
    const textAfterCursor: Promise<string | null>
    /**
     * The currently selected text, or null if there is no selected text.
     */
    const selectedText: Promise<string | null>
    /**
     * A Boolean value that indicates whether the text input object has any text.
     */
    const hasText: Promise<boolean>

    /**
     * Sets the visibility of the dictation key of the system.
     * @param value A boolean value indicating whether the dictation key should be shown (true) or hidden (false).
     * @returns A promise that resolves when the dictation key visibility is successfully set.
     */
    function setHasDictationKey(value: boolean): Promise<void>

    /**
     * Dismisses the custom keyboard.
     */
    function dismiss(): Promise<void>
    /**
     * Switches to the next keyboard in the list of enabled keyboards.
     */
    function nextKeyboard(): Promise<void>
    /**
     * Moves the cursor by the specified offset.
     * @param offset The number of characters to move the cursor. A positive value moves the cursor to the right, while a negative value moves it to the left.
     */
    function moveCursor(offset: number): Promise<void>
    /**
     * Inserts the specified text at the current cursor position.
     * @param text The text to insert.
     */
    function insertText(text: string): Promise<void>
    /**
     * Deletes a character before the current cursor position.
     */
    function deleteBackward(): Promise<void>
    /**
     * Inserts the provided text and marks it to indicate that it’s part of an active input session.
     * @param text The text to be marked.
     * @param location The starting position of the marked text.
     * @param length The length of the marked text.
     */
    function setMarkedText(text: string, location: number, length: number): Promise<void>
    /**
     * Unmarks the currently marked text.
     */
    function unmarkText(): Promise<void>

    /**
     * Requests the system to adjust the height of the custom keyboard.
     * @param height The desired height in points.
     * Note: The system may ignore this request if the height is too small or too large.
     */
    function requestHeight(height: number): Promise<void>

    /**
     * Sets the visibility of the custom keyboard's toolbar. The toolbar defaults to visible, and it is useful for debugging.
     * @param visible A boolean value indicating whether the toolbar should be visible (true) or hidden (false).
     */
    function setToolbarVisible(visible: boolean): Promise<void>

    /**
     *  Play keyboard clicks sound.
     */
    function playInputClick(): void

    /**
     * Dismisses the currently presented custom keyboard script view
     * and returns to the Scripting keyboard home screen (script list).
     *
     * Use this method when you want to exit the active keyboard script
     * and allow the user to choose another script from the home screen.
     *
     * Example:
     * ```ts
     * await CustomKeyboard.dismissToHome()
     * ```
     */
    function dismissToHome(): Promise<void>

    /**
     * Adds an event listener for the specified event.
     * @param event Event name
     * @param listener Event listener
     */
    function addListener(event: 'textWillChange' | 'selectionWillChange', listener: () => void): void
    function addListener(event: 'textDidChange' | 'selectionDidChange', listener: (traits: TextInputTraits) => void): void

    /**
     * Removes an event listener for the specified event.
     * @param event Event name
     * @param listener Event listener
     */
    function removeListener(event: 'textWillChange' | 'selectionWillChange', listener: () => void): void
    function removeListener(event: 'textDidChange' | 'selectionDidChange', listener: (traits: TextInputTraits) => void): void

    /**
     * Removes all event listeners for the specified event.
     * @param event Event name
     */
    function removeAllListeners(event: 'textWillChange' | 'selectionWillChange' | 'textDidChange' | 'selectionDidChange'): void

    /**
     * A hook to get the current text input traits. The returned value will be updated when `textDidChange` or `selectionDidChange` event is emitted.
     * @returns The current text input traits.
     */
    function useTraits(): TextInputTraits

    /**
     * Presents a custom keyboard interface using the provided virtual node.
     * This method can only be called once during the keyboard's lifecycle.
     * @param node The root virtual node representing the custom keyboard UI.
     */
    function present(node: VirtualNode): void

  }

  type BluetoothCharacteristicProperty =
    "broadcast" |
    "read" |
    "writeWithoutResponse" |
    "write" |
    "notify" |
    "indicate" |
    "authenticatedSignedWrites" |
    "extendedProperties" |
    "notifyEncryptionRequired" |
    "indicateEncryptionRequired"

  type BluetoothAttributePermissions =
    "readable" |
    "writeable" |
    "readEncryptionRequired" |
    "writeEncryptionRequired"

  /**
   * This class represents a Bluetooth characteristic, which is a basic data element used in Bluetooth communication.
   * It contains properties that describe the characteristic's UUID, service UUID, properties, notification status, and value.
   */
  class BluetoothCharacteristic {
    /**
     * The UUID of the characteristic.
     */
    readonly uuid: string
    /**
     * The UUID of the service that contains this characteristic, or null if the service is not known.
     */
    readonly serviceUUID: string | null
    /**
     * The properties of the characteristic, which indicate the operations that can be performed on it.
     */
    readonly properties: BluetoothCharacteristicProperty[]
    /**
     * A boolean value that indicates whether notifications are enabled for the characteristic.
     * If true, the peripheral will send updates to the central when the characteristic's value changes.
     * If false, notifications are disabled.
     */
    readonly isNotifying: boolean
    /**
     * The current value of the characteristic, or null if the value is not known.
     */
    readonly value: Data | null
  }

  /**
   * This class represents a Bluetooth service, which is a collection of characteristics and relationships to other services.
   * It contains properties that describe the service's UUID, peripheral ID, primary status, included services, and characteristics.
   */
  class BluetoothService {
    /**
     * The UUID of the service.
     */
    readonly uuid: string
    /**
     * The identifier of the peripheral that contains this service, or null if the peripheral is not known.
     */
    readonly peripheralId: string | null
    /**
     * A boolean value that indicates whether the service is a primary service.
     * A primary service is one that is essential to the functionality of the peripheral.
     * A secondary service is one that is not essential, but may provide additional features or information.
     */
    readonly isPrimary: boolean
    /**
     * An array of included services, or null if the included services are not known.
     * Included services are services that are referenced by this service.
     * They may be primary or secondary services.
     * If the included services have not been discovered, this property will be null.
     * You can discover included services by calling the `discoverIncludedServices` method on the peripheral.
     */
    readonly includedServices: BluetoothService[] | null
    /**
     * An array of characteristics, or null if the characteristics are not known.
     * Characteristics are data elements that are used to exchange information between the central and peripheral.
     * If the characteristics have not been discovered, this property will be null.
     * You can discover characteristics by calling the `discoverCharacteristics` method on the peripheral.
     */
    readonly characteristics: BluetoothCharacteristic[] | null
  }

  /**
   * This class represents a Bluetooth peripheral, which is a device that offers services and characteristics to a central device.
   * It contains properties that describe the peripheral's name, ID, services, and capabilities, as well as methods for interacting with the peripheral.
   */
  class BluetoothPeripheral {
    /**
     * The name of the peripheral, or null if the name is not known.
     */
    readonly name: string | null
    /**
     * The identifier of the peripheral. This value is unique to the device and remains constant across app launches.
     * It can be used to identify and connect to the peripheral.
     */
    readonly id: string
    /**
     * An array of services offered by the peripheral, or null if the services are not known.
     * Services are collections of characteristics and relationships to other services.
     * If the services have not been discovered, this property will be null.
     * You can discover services by calling the `discoverServices` method on the peripheral.
     */
    readonly services: BluetoothService[] | null
    /**
     * A boolean value that indicates whether the peripheral is connected to the central device.
     * If true, the peripheral is connected and can be used for communication.
     * If false, the peripheral is not connected.
     */
    readonly isConnected: boolean
    /**
     * A boolean value that indicates whether the peripheral can send write requests without a response.
     * If true, the peripheral can send write requests without waiting for a response from the central device.
     * If false, the peripheral must wait for a response before sending another write request.
     * The `onReadyToSendWriteWithoutResponse` event will be emitted when the peripheral is ready to send more write requests without a response.
     */
    readonly canSendWriteWithoutResponse: boolean
    /**
     * A boolean value that indicates whether the peripheral is authorized to use the Apple Notification Center Service (ANCS).
     * If true, the peripheral is authorized to use ANCS and can receive notifications from the central device.
     * If false, the peripheral is not authorized to use ANCS.
     * This property is only relevant for peripherals that support ANCS.
     */
    readonly ancsAuthorized: boolean

    /**
     * Event handler that is called when the peripheral is connected.
     */
    onConnected: (() => void) | null

    /**
     * Event handler that is called when the peripheral is disconnected.
     * @param error An Error object if there was an error during disconnection, or null if the disconnection was intentional.
     * @param isReconnecting A boolean value that indicates whether the peripheral is attempting to reconnect.
     * If true, the peripheral is trying to reconnect after an unexpected disconnection.
     * If false, the disconnection was intentional and no reconnection will be attempted.
     */
    onDisconnected: ((error: Error | null, isReconnecting: boolean) => void) | null

    /**
     * Event handler that is called when the peripheral fails to connect.
     */
    onConnectFailed: ((error: Error) => void) | null

    /**
     * Event handler that is called when the peripheral's name changes.
     */
    onNameChanged: ((name: string | null) => void) | null

    /**
     * Event handler that is called when the peripheral's services are updated.
     * This event is triggered after calling `discoverServices()`.
     */
    onDiscoverServices: ((error: Error | null, services: BluetoothService[] | null) => void) | null

    /**
     * Event handler that is called when the peripheral's characteristics are updated.
     * This event is triggered after calling `discoverCharacteristics()`.
     */
    onDiscoverCharacteristics: ((error: Error | null, characteristics: BluetoothCharacteristic[] | null) => void) | null

    /**
     * Event handler that is called when the peripheral's included services are updated.
     * This event is triggered after calling `discoverIncludedServices()`.
     */
    onDiscoverIncludedServices: ((error: Error | null, services: BluetoothService[] | null) => void) | null

    /**
     * Event handler that is called when the peripheral is ready to send write requests without a response.
     * This event is triggered when the `canSendWriteWithoutResponse` property changes from false to true.
     * You can use this event to send more write requests without a response.
     */
    onReadyToSendWriteWithoutResponse: (() => void) | null

    /**
     * Reads the value of the specified characteristic from the peripheral.
     * @param characteristic The characteristic to read the value from.
     * @returns A promise that resolves to the value of the characteristic as a Data object.
     * If the read operation fails, the promise will be rejected with an error.
     */
    readValue(characteristic: BluetoothCharacteristic): Promise<Data>

    /**
     * Gets the maximum length of data that can be written to the specified characteristic using the specified write type.
     * @param writeType The type of write operation to perform. It can be either "withResponse" or "withoutResponse".
     * - "withResponse": The write operation will wait for a response from the peripheral to confirm that the write was successful.
     * - "withoutResponse": The write operation will not wait for a response from the peripheral. This is faster but less reliable.
     * @returns The maximum length of data that can be written to the characteristic using the specified write type.
     * This value is determined by the peripheral's capabilities and may vary between different devices and characteristics.
     */
    maxWriteValueLength(writeType: "withResponse" | "withoutResponse"): number

    /**
     * Writes the specified value to the specified characteristic on the peripheral.
     * @param characteristic The characteristic to write the value to.
     * @param value The value to write to the characteristic, represented as a Data object.
     * @param writeType The type of write operation to perform. It can be either "withResponse" or "withoutResponse".
     * - "withResponse": The write operation will wait for a response from the peripheral to confirm that the write was successful.
     * - "withoutResponse": The write operation will not wait for a response from the peripheral. This is faster but less reliable.
     * @returns A promise that resolves when the write operation is complete.
     * If the write operation fails, the promise will be rejected with an error.
     */
    writeValue(characteristic: BluetoothCharacteristic, value: Data, writeType: "withResponse" | "withoutResponse"): Promise<void>

    /**
     * Sets a notification handler for the specified characteristic on the peripheral.
     * When the characteristic's value changes, the handler function will be called with the new value.
     * This method should only be called if the characteristic has the "notify" or "indicate" property, and should only be called once per characteristic.
     * @param characteristic The characteristic to set the notification handler for.
     * @param handler The handler function that will be called when the characteristic's value changes.
     * The handler function takes two arguments:
     * - error: An Error object if there was an error, or null if the operation was successful.
     * - value: The new value of the characteristic as a Data object, or null if there was an error.
     * @returns A promise that resolves when the notification handler is successfully set.
     * If the operation fails, the promise will be rejected with an error.
     * 
     * Note: You must call `removeNotifyHandler()` to remove the notification handler when you no longer need it.
     */
    subscribe(characteristic: BluetoothCharacteristic, handler: (error: Error | null, value: Data | null) => void): Promise<void>

    /**
     * Removes the notification handler for the specified characteristic on the peripheral.
     * @param characteristic The characteristic to remove the notification handler from.
     * This method should be called when you no longer need to receive notifications for the characteristic.
     * @returns A promise that resolves when the notification handler is successfully removed.
     * If the operation fails, the promise will be rejected with an error.
     */
    unsubscribe(characteristic: BluetoothCharacteristic): Promise<void>

    /**
     * Discovers the services of the peripheral.
     * @param serviceUUIDs An optional array of UUID strings to filter the services to discover.
     * If this parameter is not provided, all services will be discovered.
     * @returns A promise that resolves when the services have been discovered.
     * If the discovery operation fails, the promise will be rejected with an error.
     * 
     * Note: You must call this method after connecting to the peripheral.
     */
    discoverServices(serviceUUIDs?: string[]): Promise<void>

    /**
     * Discovers the included services of the specified service on the peripheral.
     * @param service The service to discover included services for.
     * @param includedServiceUUIDs An optional array of UUID strings to filter the included services to discover.
     * If this parameter is not provided, all included services will be discovered.
     * @returns A promise that resolves when the included services have been discovered.
     * If the discovery operation fails, the promise will be rejected with an error.
     * 
     * Note: You must call this method after discovering the service using `discoverServices()`.
     */
    discoverIncludedServices(service: BluetoothService, includedServiceUUIDs?: string[]): Promise<void>

    /**
     * Discovers the characteristics of the specified service on the peripheral.
     * @param service The service to discover characteristics for.
     * @param characteristicUUIDs An optional array of UUID strings to filter the characteristics to discover.
     * If this parameter is not provided, all characteristics will be discovered.
     * @returns A promise that resolves when the characteristics have been discovered.
     * If the discovery operation fails, the promise will be rejected with an error.
     * 
     * Note: You must call this method after discovering the service using `discoverServices()`.
     */
    discoverCharacteristics(service: BluetoothService, characteristicUUIDs?: string[]): Promise<void>

    /**
     * Reads the Received Signal Strength Indicator (RSSI) value for the peripheral.
     * The RSSI value indicates the signal strength of the peripheral, measured in decibels (dBm).
     * A higher RSSI value indicates a stronger signal, while a lower value indicates a weaker signal.
     * @returns A promise that resolves to the RSSI value as a number.
     * If the read operation fails, the promise will be rejected with an error.
     * 
     * Note: You must call this method after connecting to the peripheral.
     */
    readRSSI(): Promise<number>
  }

  /**
   * This type represents the advertisement data received from a Bluetooth peripheral during scanning.
   *  - `localName`: The local name of the peripheral, if available.
   *  - `txPowerLevel`: The transmit power level of the peripheral, if available.
   *  - `manufacturerData`: The manufacturer-specific data of the peripheral, if available.
   *  - `serviceData`: A record of service UUIDs and their associated data, if available.
   *  - `serviceUUIDs`: An array of service UUIDs advertised by the peripheral, if available.
   *  - `overflowServiceUUIDs`: An array of overflow service UUIDs advertised by the peripheral, if available.
   *  - `isConnectable`: A boolean value indicating whether the peripheral is connectable, if available.
   *  - `solicitedServiceUUIDs`: An array of solicited service UUIDs advertised by the peripheral, if available.
   */
  type BluetoothAdvertisementData = {
    localName?: string
    txPowerLevel?: number
    manufacturerData?: Data
    serviceData?: Record<string, Data>
    serviceUUIDs?: string[]
    overflowServiceUUIDs?: string[]
    isConnectable?: boolean
    solicitedServiceUUIDs?: string[]
  }

  /**
   * This namespace provides functions for managing Bluetooth central operations, including scanning for peripherals, connecting to peripherals, and retrieving known or connected peripherals.
   */
  namespace BluetoothCentralManager {

    /**
     * A promise that resolves to a boolean indicating whether the BluetoothCentralManager is scanning for peripherals.
     */
    const isScanning: Promise<boolean>

    /**
     * Starts scanning for Bluetooth peripherals that are advertising the specified services.
     * This method will continuously scan for peripherals until `stopScan()` is called.
     * @param onDiscoverPeripheral A callback function that is called when a peripheral is discovered during scanning.
     * The function receives three arguments:
     * - `peripheral`: The discovered BluetoothPeripheral object.
     * - `advertisementData`: The advertisement data received from the peripheral, represented as a BluetoothAdvertisementData object.
     * - `rssi`: The Received Signal Strength Indicator (RSSI) value of the peripheral, indicating its signal strength.
     * @param options Optional parameters for scanning, including:
     * - services: An array of UUID strings representing the services to filter peripherals by.
     * If this parameter is not provided, all advertising peripherals will be discovered.
     * - allowDuplicates: A boolean value that specifies whether the scan should run without duplicate filtering. If true, the central disables filtering and generates a discovery event each time it receives an advertising packet from the peripheral. If false (the default), the central coalesces multiple discoveries of the same peripheral into a single discovery event.
     * - solicitedServiceUUIDs: An array of UUID strings representing the services that are solicited by the central. Specifying this scan option causes the central manager to also scan for peripherals soliciting any of the services contained in the array.
     * @returns A promise that resolves when scanning has started.
     * If the scanning operation fails, the promise will be rejected with an error.
     * 
     * Note: You must call `stopScan()` to stop scanning when you no longer need to discover peripherals.
     */
    function startScan(
      onDiscoverPeripheral: (
        peripheral: BluetoothPeripheral,
        advertisementData: BluetoothAdvertisementData,
        rssi: number
      ) => void,
      options?: {
        services?: string[]
        allowDuplicates?: boolean
        solicitedServiceUUIDs?: string[]
      }
    ): Promise<void>

    /**
     * Stops scanning for Bluetooth peripherals.
     * @returns A promise that resolves when scanning has stopped.
     */
    function stopScan(): Promise<void>

    /**
     * Retrieves a list of known Bluetooth peripherals by their identifiers.
     * These peripherals may or may not be currently connected.
     * @param ids An array of peripheral identifiers (UUID strings) to retrieve.
     * @returns A promise that resolves to an array of BluetoothPeripheral objects representing the retrieved peripherals.
     * If a peripheral with a specified identifier is not found, it will not be included in the returned array.
     */
    function retrievePeripherals(ids: string[]): Promise<BluetoothPeripheral[]>

    /**
     * Retrieves a list of currently connected Bluetooth peripherals that offer the specified services.
     * The list of connected peripherals can include those that other apps have connected. You need to connect these peripherals locally using the `connect` method before using them.
     * @param serviceUUIDs An array of service UUID strings to filter the connected peripherals by.
     * Only peripherals that are currently connected and offer at least one of the specified services will be returned.
     * @returns A promise that resolves to an array of BluetoothPeripheral objects representing the connected peripherals that match the specified service UUIDs.
     * If no connected peripherals match the specified service UUIDs, the returned array will be empty.
     */
    function retrieveConnectedPeripherals(serviceUUIDs: string[]): Promise<BluetoothPeripheral[]>

    /**
     * Connects to the specified Bluetooth peripheral.
     * @param peripheral The BluetoothPeripheral object representing the peripheral to connect to.
     * @param options Optional parameters for the connection, including:
     * - startDelay: The delay in seconds before attempting to connect to the peripheral. Default is 0.
     * - enableTransportBridging: A boolean value that specifies whether to enable transport bridging for the connection. Default is false.
     * - requiresANCS: A boolean value that specifies whether the peripheral requires the Apple Notification Center Service (ANCS) for the connection. Default is false.
     * - enableAutoReconnect: A boolean value that specifies whether to enable automatic reconnection to the peripheral if the connection is lost. Default is false.
     * - notifyOnConnection: A boolean value that specifies whether to notify the app when the connection is established. Default is false.
     * - notifyOnNotification: A boolean value that specifies whether to notify the app when a notification is received from the peripheral. Default is false.
     * - notifyOnDisconnection: A boolean value that specifies whether to notify the app when the connection is lost. Default is false.
     * @returns A promise that resolves when the connection is successfully established.
     * If the connection operation fails, the promise will be rejected with an error.
     */
    function connect(peripheral: BluetoothPeripheral, options?: {
      startDelay?: number
      enableTransportBridging?: boolean
      requiresANCS?: boolean
      enableAutoReconnect?: boolean
      notifyOnConnection?: boolean
      notifyOnNotification?: boolean
      notifyOnDisconnection?: boolean
    }): Promise<void>

    /**
     * Disconnects from the specified Bluetooth peripheral.
     * This method is nonblocking, and any BluetoothPeripheral class commands that are still pending to peripheral may not complete. Because other apps may still have a connection to the peripheral, canceling a local connection doesn’t guarantee that the underlying physical link is immediately disconnected. From the app’s perspective, however, the peripheral is effectively disconnected, and the `onDisconnect` callback of the peripheral will be called, if it is set.
     * @param peripheral The BluetoothPeripheral object representing the peripheral to disconnect from.
     */
    function disconnect(peripheral: BluetoothPeripheral): Promise<void>
  }

  /**
   * This enum represents the possible response codes for Bluetooth Attribute Protocol (ATT) operations.
   * Each code indicates the result of an ATT operation, such as reading or writing a characteristic.
   */
  enum BluetoothATTResponseCode {
    success = 0,
    invalidHandle = 1,
    readNotPermitted = 2,
    writeNotPermitted = 3,
    invalidPdu = 4,
    insufficientAuthentication = 5,
    requestNotSupported = 6,
    invalidOffset = 7,
    insufficientAuthorization = 8,
    prepareQueueFull = 9,
    attributeNotFound = 10,
    attributeNotLong = 11,
    insufficientEncryptionKeySize = 12,
    invalidAttributeValueLength = 13,
    unlikelyError = 14,
    insufficientEncryption = 15,
    unsupportedGroupType = 16,
    insufficientResources = 17,
  }

  type BluetoothServiceInfo = {
    uuid: string
    isPrimary: boolean
    characteristics?: BluetoothCharacteristicInfo[]
    peripheralId?: string | null
    includedServices?: BluetoothServiceInfo[] | null
  }

  type BluetoothCharacteristicInfo = {
    uuid: string
    properties: BluetoothCharacteristicProperty[]
    permissions: BluetoothAttributePermissions[]
    value?: Data | null
    serviceUUID?: string | null
    isNotifying: boolean
  }

  namespace BluetoothPeripheralManager {

    /**
     * For apps that opt-in to state preservation and restoration, this is the first method invoked when Scripting app is relaunched into the background to complete some Bluetooth-related task. Use this method to synchronize your script's state with the state of the Bluetooth system.
     */
    var onRestoreState: ((state: {
      services: BluetoothServiceInfo[]
      advertisementData: BluetoothAdvertisementData
    }) => void) | null

    /**
     * When a call to the `updateValue` method fails because the underlying queue used to transmit the updated characteristic value is full, Bluetooth System calls this callback when more space in the transmit queue becomes available. You can then implement this callback to resend the value.
     */
    var onReadyToUpdateSubscribers: (() => void) | null

    /**
     * When a remote central wants to read the value of a characteristic, Bluetooth System calls this callback. Implement this callback to provide the requested value. If you do not implement this callback, the read request fails and the central receives a response with the `readNotPermitted` error code.
     * @param characteristicId The UUID string of the characteristic whose value is being read.
     * @param offset The offset within the characteristic value where the read is to begin.
     * @param central An object representing the central that is requesting the read operation. It contains the following properties:
     * - `id`: The identifier of the central.
     * - `maximumUpdateValueLength`: The maximum length of data that the central can receive in a single update.
     * @returns A promise that resolves to an object containing the result of the read operation and the value of the characteristic, if applicable.
     * The object has the following properties:
     * - `result`: A BluetoothATTResponseCode indicating the result of the read operation.
     * - `value`: A Data object containing the value of the characteristic, or null if the read operation failed.
     */
    var onReadCharacteristicValue: (
      characteristicId: string,
      offset: number,
      central: {
        id: string
        maximumUpdateValueLength: number
      }
    ) => Promise<{
      result: BluetoothATTResponseCode
      value?: Data | null
    }> | null

    /**
     * When a remote central wants to write a value to a characteristic, Bluetooth System calls this callback. Implement this callback to process the write request. If you do not implement this callback, the write request fails and the central receives a response with the `writeNotPermitted` error code.
     * @param characteristicId The UUID string of the characteristic whose value is being written.
     * @param offset The offset within the characteristic value where the write is to begin.
     * @param value A Data object containing the value to be written to the characteristic.
     * @param central An object representing the central that is requesting the write operation. It contains the following properties:
     * - `id`: The identifier of the central.
     * - `maximumUpdateValueLength`: The maximum length of data that the central can receive in a single update.
     * @returns A promise that resolves to a BluetoothATTResponseCode indicating the result of the write operation.
     */
    var onWriteCharacteristicValue: ((
      characteristicId: string,
      offset: number,
      value: Data, central: {
        id: string
        maximumUpdateValueLength: number
      }
    ) => Promise<BluetoothATTResponseCode>) | null

    /**
     * When a remote central subscribes to a characteristic, Bluetooth System calls this callback. Implement this callback to start sending updates to the central when the characteristic value changes. If you do not implement this callback, the subscribe request fails and the central does not receive notifications or indications for the characteristic.
     * @param characteristicId The UUID string of the characteristic that the central is subscribing to.
     * @param central An object representing the central that is requesting the subscription. It contains the following properties:
     * - `id`: The identifier of the central.
     * - `maximumUpdateValueLength`: The maximum length of data that the central can receive in a single update.
     */
    var onSubscribe: ((
      characteristicId: string,
      central: {
        id: string
        maximumUpdateValueLength: number
      }
    ) => void) | null

    /**
     * When a remote central unsubscribes from a characteristic, Bluetooth System calls this callback. Implement this callback to stop sending updates to the central for the characteristic. If you do not implement this callback, the unsubscribe request fails and the central continues to receive notifications or indications for the characteristic.
     * @param characteristicId The UUID string of the characteristic that the central is unsubscribing from.
     * @param central An object representing the central that is requesting the unsubscription. It contains the following properties:
     * - `id`: The identifier of the central.
     * - `maximumUpdateValueLength`: The maximum length of data that the central can receive in a single update.
     */
    var onUnsubscribe: ((
      characteristicId: string,
      central: {
        id: string
        maximumUpdateValueLength: number
      }
    ) => void) | null

    /**
     * A promise that resolves to a boolean indicating whether the BluetoothPeripheralManager is currently advertising.
     */
    const isAdvertising: Promise<boolean>

    /**
     * Add a service to the peripheral manager.
     * @param service A service object that defines the service to be added to the peripheral manager. The service object should include the following properties:
     * - `uuid`: A string representing the UUID of the service.
     * - `characteristics`: An array of characteristic objects that define the characteristics of the service. Each characteristic object should include the following properties:
     *   - `uuid`: A string representing the UUID of the characteristic.
     *   - `properties`: An array of BluetoothCharacteristicProperty values that define the properties of the characteristic.
     *   - `permissions`: An array of BluetoothAttributePermissions values that define the permissions of the characteristic.
     *   - `value` (optional): A Data object representing the initial value of the characteristic, or null if the characteristic has no initial value.
     * - `includedServices` (optional): An array of service objects that define the included services of the service. Each included service object should have the same structure as the main service object.
     * @returns A promise that resolves when the service has been successfully added to the peripheral manager.
     * @throws An error if the service could not be added, for example, if a service with the same UUID already exists.
     */
    function addService(service: {
      uuid: string
      characteristics: {
        uuid: string
        properties: BluetoothCharacteristicProperty[]
        permissions: BluetoothAttributePermissions[]
        value?: Data | null
      }[]
      includedServices?: {
        uuid: string
        characteristics: {
          uuid: string
          properties: BluetoothCharacteristicProperty[]
          permissions: BluetoothAttributePermissions[]
          value?: Data | null
        }[]
      }[]
    }): Promise<void>

    /**
     * Remove the specified service from the peripheral manager.
     * Because apps on the local peripheral device share the GATT database, more than one instance of a service may exist in the database. As a result, this method removes only the instance of the service that Scripting app added to the database (using the `addService` method). If any other services contains this service, you must first remove them.
     * @param serviceUUID The UUID string of the service to be removed from the peripheral manager.
     * @returns A promise that resolves when this method call is complete. If the service with the specified UUID is not found, the promise will still resolve successfully.
     */
    function removeService(serviceUUID: string): Promise<void>

    /**
     * Removes all services from the peripheral manager.
     * Because apps on the local peripheral device share the GATT database, more than one instance of a service may exist in the database. As a result, this method removes only the instances of services that Scripting app added to the database (using the `addService` method). If any other services exist, you must first remove them.
     * @returns A promise that resolves when this method call is complete. If no services were found, the promise will still resolve successfully.
     */
    function removeAllServices(): Promise<void>

    /**
     * Starts advertising the specified advertisement data.
     * After calling this method, the peripheral manager begins broadcasting the advertisement data to nearby central devices. The advertisement continues until you call the `stopAdvertising` method or the peripheral manager is stopped.
     * @param advertisementData An object containing the advertisement data to be broadcast by the peripheral manager. The object can include the following optional properties:
     * - `localName`: A string representing the local name of the peripheral. This name will be advertised to nearby central devices.
     * - `serviceUUIDs`: An array of UUID strings representing the services that the peripheral offers. These UUIDs will be advertised to nearby central devices.
     * @returns A promise that resolves when advertising has started successfully. If advertising could not be started, the promise will be rejected with an error.
     */
    function startAdvertising(advertisementData: {
      localName?: string
      serviceUUIDs?: string[]
    }): Promise<void>

    /**
     * Stops advertising the peripheral manager.
     * After calling this method, the peripheral manager stops broadcasting its advertisement data to nearby central devices.
     * @returns A promise that resolves when advertising has stopped successfully.
     */
    function stopAdvertising(): Promise<void>

    /**
     * Get a list of centrals that are currently subscribed to the specified characteristic.
     * When a central subscribes to a characteristic, it indicates that it wants to receive notifications or indications whenever the value of that characteristic changes. You can use this method to retrieve a list of such centrals.
     * @param characteristicId The UUID string of the characteristic for which to retrieve the list of subscribed centrals.
     * @returns A promise that resolves to an array of objects, each representing a central that is subscribed to the specified characteristic. Each object contains the following properties:
     * - `id`: A string representing the identifier of the subscribed central.
     * - `maximumUpdateValueLength`: A number representing the maximum length of data that the central can receive in a single update.
     * If no centrals are subscribed to the specified characteristic, the returned array will be empty.
     */
    function getSubscribers(characteristicId: string): Promise<{
      id: string
      maximumUpdateValueLength: number
    }[]>

    /**
     * Updates the value of the specified characteristic and notifies subscribed centrals of the change.
     * You use this method to send updates of a characteristic’s value—through a notification or indication—to selected centrals that have subscribed to that characteristic’s value. If the method returns false because the underlying transmit queue is full, the peripheral manager calls the `onReadyToUpdateSubscribers` method when more space in the transmit queue becomes available. After you receive this callback, you may resend the update.
If the length of the value parameter exceeds the length of the `maximumUpdateValueLength` property of a subscribed central, the value parameter truncates accordingly.
     * @param characteristicId The UUID string of the characteristic to be updated.
     * @param value A Data object representing the new value to be set for the characteristic.
     * @param options Optional parameters for the update, including:
     * - `centrals`: An array of central identifiers (UUID strings) to which the update should be sent. If this parameter is not provided, the update will be sent to all subscribed centrals.
     * @returns A promise that resolves to a boolean value, this value is true if the update is successfully sent to the subscribed central or centrals. false if the update isn’t successfully sent because the underlying transmit queue is full. If the update could not be initiated (for example, if the characteristic is not found), the promise will be rejected with an error.
     */
    function updateValue(
      characteristicId: string,
      value: Data,
      options?: {
        centrals?: string[]
      }
    ): Promise<boolean>

    /**
     * Sets the desired connection latency for a connected central.
     * The latency of a peripheral-central connection controls how frequently the peripheral and the peripheral’s connected central can exchange messages. By setting a desired connection latency, you manage the relationship between the frequency of the data exchange and the resulting battery performance of the peripheral device. When you call this method to set the connection latency, note that connection latency changes aren’t guaranteed. As a result, the latency may vary. If you don’t explicitly set a latency, the central device uses the connection latency it chose when establishing the connection. Typically, you don’t need to change the connection latency.
     * @param centralId The identifier of the connected central for which to set the desired connection latency.
     * @param latency The desired connection latency. It can be one of the following values:
     * - "low": Requests a low connection latency, which results in more frequent data exchanges.
     * - "medium": Requests a medium connection latency, which balances responsiveness and power consumption.
     * - "high": Requests a high connection latency, which reduces the frequency of data exchanges.
     * @returns A promise that resolves when the desired connection latency has been set successfully. If the operation fails (for example, if the central is not found), the promise will be rejected with an error.
     */
    function setDesiredConnectionLatency(
      centralId: string,
      latency: "low" | "medium" | "high"
    ): Promise<void>
  }

  /**
   * Controls background keep-alive behavior for the Scripting App.
   * 
   * Only available in `Script.env === "index"`.
   *
   * You can call the `keepAlive()` method after the app switches to the background
   * (triggered by a background event) to attempt to keep the Scripting App alive.
   * When the app switches back to the foreground (triggered by a foreground event),
   * call the `stopKeepAlive()` method to stop the keep-alive process.
   *
   * Multiple scripts can request keep-alive simultaneously. Each call to `keepAlive()`
   * adds the calling script to an internal keep-alive queue, and calling `stopKeepAlive()`
   * removes it from the queue. The keep-alive process will only be fully stopped
   * when the queue becomes empty.
   *
   * Note: Even if keep-alive is enabled, the system may still terminate the Scripting App
   * under certain conditions, such as when its memory usage is too high.
   *
   * ⚠️ Caution:
   * The Scripting App does not enable keep-alive automatically. Using this feature
   * may increase device power consumption, so please use it with care.
   */
  namespace BackgroundKeeper {
    /**
     * A promise that resolves to a boolean value that indicates whether the keep-alive process is active.
     */
    const isActive: Promise<boolean>
    /**
     * Starts the keep-alive process.
     * @returns A promise that resolves to a boolean value that indicates whether the keep-alive process was successfully started. If the keep-alive process is already active, the promise resolves to true.
     */
    function keepAlive(): Promise<boolean>
    /**
     * Stops the keep-alive process.
     * It does not indicate whether the keep-alive process was successfully stopped, because other scripts may have requested keep-alive, when all requests have been removed, the keep-alive process will be stopped.
     * @returns A promise that resolves when the function call completes. 
     */
    function stopKeepAlive(): Promise<void>
  }

  /**
   * A progress object for a download or upload task.
   *  - `fractionCompleted`: A number between 0 and 1 representing the fraction of the task that has been completed.
   *  - `totalUnitCount`: The total number of units in the task.
   *  - `completedUnitCount`: The number of units that have been completed.
   *  - `isFinished`: A boolean indicating whether the task is finished.
   *  - `estimatedTimeRemaining`: An optional number representing the estimated time remaining in seconds.
   */
  interface URLSessionProgress {
    fractionCompleted: number
    totalUnitCount: number
    completedUnitCount: number
    isFinished: boolean
    estimatedTimeRemaining: number | null
  }

  /**
   * A string that represents the state of a URL session task.
   */
  type URLSessionTaskState = "running" | "suspended" | "canceling" | "completed" | "unknown"

  /**
   * A URL session download task.
   */
  class URLSessionDownloadTask {
    /**
     * The identifier of the download task.
     */
    readonly id: string
    /**
     * The state of the download task.
     */
    readonly state: URLSessionTaskState
    /**
     * The progress of the download task.
     */
    readonly progress: URLSessionProgress
    /**
     * The priority of the download task. You can set this value to a number between 0 and 1 to control the priority of the download task. Defaults to 0.5.
     */
    priority: number
    /**
     * The earliest begin date of the download task. You can set this value to a Date object to specify the earliest begin date of the download task.
     */
    earliestBeginDate?: Date | null
    /**
     * A best-guess upper bound on the number of bytes the client expects to send.
     */
    countOfBytesClientExpectsToSend: number
    /**
     * A best-guess upper bound on the number of bytes the client expects to receive.
     */
    countOfBytesClientExpectsToReceive: number

    /**
     * The callback function that is called when the progress of the download task changes.
     * The `details` parameter is an object that contains the progress details, including the progress, bytes written, total bytes written, and total bytes expected to write.
     */
    onProgress?: ((details: {
      progress: number
      bytesWritten: number
      totalBytesWritten: number
      totalBytesExpectedToWrite: number
    }) => void) | null

    /**
     * The callback function that is called when the download task is finished downloading.
     * If the download is successful, the `error` parameter is null and the `details` parameter contains the temporary file path and the destination file path.
     * If the download fails, the `error` parameter contains the error information and the `details` parameter contains the temporary file path but the destination file path may be null.
     * You should check the `error` parameter to determine whether the download is successful or not.
     */
    onFinishDownload?: ((error: Error | null, details: {
      temporary: string
      destination: string | null
    }) => void) | null

    /**
     * The callback function that is called when the download task is completed.
     * If the download is successful, the `error` parameter is null and the `resumeData` parameter is null.
     * If the download fails, the `error` parameter contains the error information and you can check the `resumeData` parameter to determine whether the download can be resumed or not.
     */
    onComplete?: ((error: Error | null, resumeData: Data | null) => void) | null

    /**
     * Suspends the download task. A task, while suspended, produces no network traffic and isn’t subject to timeouts. Call `resume()` to resume data transfer.
     */
    suspend(): void
    /**
     * Resumes the download task.
     * Newly-initialized tasks begin in a suspended state, so you need to call this method to start the task.
     */
    resume(): void

    /**
     * Cancels the download task.
     * This method returns immediately, marking the task as being canceled. Once a task is marked as being canceled, the `onComplete` callback is called with an error.
     * This method may be called on a task that is suspended.
     */
    cancel(): void

    /**
     * Cancels the download task and produces resume data.
     * This method returns a promise that resolves to the resume data, which you can use to resume the download task later. If the download is resumable the returned promise resolves the resume data, otherwise it resolves null.
     * 
     * You can call `BackgroundURLSession.resumeDownload()` with the resume data to resume the download task.
     */
    cancelByProducingResumeData(): Promise<Data | null>
  }

  /**
   * A URL session upload task.
   */
  class URLSessionUploadTask {
    /**
     * The identifier of the upload task.
     */
    readonly id: string
    /**
     * The state of the upload task.
     */
    readonly state: URLSessionTaskState
    /**
     * The progress of the upload task.
     */
    readonly progress: URLSessionProgress
    /**
     * The priority of the upload task.
     * You can set this value to a number between 0 and 1 to control the priority of the upload task. Defaults to 0.5.
     */
    priority: number
    /**
     * The earliest begin date of the upload task.
     * You can set this value to a Date object to specify the earliest begin date of the upload task.
     */
    earliestBeginDate?: Date | null
    /**
     * A best-guess upper bound on the number of bytes the client expects to send.
     */
    countOfBytesClientExpectsToSend: number
    /**
     * A best-guess upper bound on the number of bytes the client expects to receive.
     */
    countOfBytesClientExpectsToReceive: number

    /**
     * The callback function that is called when response data is received.
     */
    onReceiveData?: ((data: Data) => void) | null
    /**
     * The callback function that is called when the upload task is finished uploading.
     * If the upload is successful, the `error` parameter is null and the `resumeData` parameter is null.
     * If the upload fails, the `error` parameter contains the error information and you can check the `resumeData` parameter to determine whether the upload can be resumed or not.
     */
    onComplete?: ((error: Error | null, resumeData: Data | null) => void) | null

    /**
     * Suspends the upload task. A task, while suspended, produces no network traffic and isn’t subject to timeouts. Call `resume()` to resume data transfer.
     */
    suspend(): void
    /**
     * Resumes the upload task.
     * Newly-initialized tasks begin in a suspended state, so you need to call this method to start the task.
     */
    resume(): void
    /**
     * Cancels the upload task.
     * This method returns immediately, marking the task as being canceled. Once a task is marked as being canceled, the `onComplete` callback is called with an error.
     * This method may be called on a task that is suspended.
     */
    cancel(): void
    /**
     * Cancels the upload task and produces resume data.
     * This depends on the server to support resumable uploads.
     */
    cancelByProducingResumeData(): Promise<Data | null>
  }

  /**
   * The background URL session manager.
   */
  namespace BackgroundURLSession {

    /**
     * Starts a download task.
     * @param options The options for the download task.
     * @param options.url The URL of the file to download.
     * @param options.destination The path to save the downloaded file to.
     * @param options.headers The headers to use for the download request.
     * @param options.notifyOnFinished The local notification to show when the download is finished.
     * @param options.notifyOnFinished.success The title of the success notification.
     * @param options.notifyOnFinished.failure The title of the failure notification.
     * @returns A URLSessionDownloadTask object.
     */
    function startDownload(options: {
      url: string
      destination: string
      headers?: Record<string, string>
      notifyOnFinished?: {
        success: string
        failure: string
      }
    }): URLSessionDownloadTask

    /**
     * Resumes a download task.
     * @param options The options for the download task.
     * @param options.resumeData The resume data for the download task.
     * @param options.destination The path to save the downloaded file to.
     * @param options.notifyOnFinished The local notification to show when the download is finished.
     * @param options.notifyOnFinished.success The title of the success notification.
     * @param options.notifyOnFinished.failure The title of the failure notification.
     * @returns A new URLSessionDownloadTask object.
     */
    function resumeDownload(options: {
      resumeData: Data
      destination: string
      notifyOnFinished?: {
        success: string
        failure: string
      }
    }): URLSessionDownloadTask

    /**
     * Gets the download tasks.
     * When your script start a background download task, your script may be terminated before the download task is finished. When your script restart, you can get the download tasks and add callback to them.
     * @returns A promise that resolves to an array of URLSessionDownloadTask objects.
     */
    function getDownloadTasks(): Promise<URLSessionDownloadTask[]>

    /**
     * Starts an upload task.
     * @param options The options for the upload task.
     * @param options.filePath The path of the file to upload.
     * @param options.toURL The URL to upload the file to.
     * @param options.method The HTTP method to use for the upload request. Defaults to "POST".
     * @param options.headers The headers to use for the upload request.
     * @param options.notifyOnFinished Whether to send a local notification when the upload is finished.
     * @param options.notifyOnFinished.success The title of the success notification.
     * @param options.notifyOnFinished.failure The title of the failure notification.
     * @returns A URLSessionUploadTask object.
     */
    function startUpload(options: {
      filePath: string
      toURL: string
      method?: string
      headers?: Record<string, string>
      notifyOnFinished?: {
        success: string
        failure: string
      }
    }): URLSessionUploadTask

    /**
     * Resumes an upload task.
     * @param options The options for the upload task.
     * @param options.resumeData The resume data for the upload task.
     * @param options.notifyOnFinished Whether to send a local notification when the upload is finished.
     * @param options.notifyOnFinished.success The title of the success notification.
     * @param options.notifyOnFinished.failure The title of the failure notification.
     * @returns A new URLSessionUploadTask object.
     */
    function resumeUpload(options: {
      resumeData: Data
      notifyOnFinished?: {
        success: string
        failure: string
      }
    }): URLSessionUploadTask

    /**
     * Gets the upload tasks.
     * When your script start a background upload task, your script may be terminated before the upload task is finished. When your script restart, you can get the upload tasks and add callback to them.
     * @returns A promise that resolves to an array of URLSessionUploadTask objects.
     */
    function getUploadTasks(): Promise<URLSessionUploadTask[]>
  }

  class FileEntity {
    /**
     * The path of the file
     */
    readonly path: string

    /**
     * Seeks to the specified offset in the file.
     * @param offset The offset to seek to
     * @returns Whether the seek was successful
     */
    seek(offset: number): boolean

    /**
     * Reads the specified number of bytes from the file, starting from the current position.
     * @param size The number of bytes to read
     * @returns A Data object containing the read bytes
     * @throws An error if the file cannot be read
     */
    read(size: number): Data

    /**
     * Writes the specified data to the file, starting from the current position.
     * @param data The data to write
     * @throws An error if the file cannot be written
     */
    write(data: Data): void

    /**
     * Closes the file.
     */
    close(): void

    /**
     * Opens a file for reading.
     * @param path The path of the file
     * @returns A FileEntity object
     * @throws An error if the file cannot be opened
     */
    static openForReading(path: string): FileEntity

    /**
     * Opens a file for writing.
     * @param path The path of the file
     * @returns A FileEntity object
     * @throws An error if the file cannot be opened
     */
    static openNewForWriting(path: string): FileEntity

    /**
     * Opens a file for reading and writing.
     * @param path The path of the file
     * @returns A FileEntity object
     * @throws An error if the file cannot be opened
     */
    static openForWritingAndReading(path: string): FileEntity

    /**
     * Opens a file for the specified mode.
     * @param path The path of the file
     * @param mode The mode of the file, e.g. "r", "w", "a", "r+", "w+", "a+"
     * @returns A FileEntity object
     * @throws An error if the file cannot be opened
     */
    static openForMode(path: string, mode: string): FileEntity
  }

  /**
   * The HTTP response body.
   */
  class HttpResponseBody {
    /**
     * Creates a text response body.
     * @param text The text content of the response body.
     */
    static text(text: string): HttpResponseBody
    /**
     * Creates a data response body.
     * @param data The data content of the response body.
     */
    static data(data: Data): HttpResponseBody
    /**
     * Creates an HTML response body.
     * @param html The HTML content of the response body.
     */
    static html(html: string): HttpResponseBody
    /**
     * Creates an HTML response body.
     * @param html The HTML body content of the response body.
     */
    static htmlBody(html: string): HttpResponseBody
  }

  /**
   * The HTTP response.
   */
  class HttpResponse {
    /**
     * The status code of the response.
     */
    readonly statusCode: number
    /**
     * The reason phrase of the response.
     */
    readonly reasonPhrase: string

    /**
     * The headers of the response.
     */
    headers(): Record<string, string>

    /**
     * Creates an HTTP response with ok status code.
     * @param body The body of the response.
     * @returns A new HTTP response.
     */
    static ok(body: HttpResponseBody): HttpResponse
    static created(): HttpResponse
    static accepted(): HttpResponse
    /**
     * Creates a permanent redirect response.
     * @param url The URL to redirect to.
     */
    static movedPermanently(url: string): HttpResponse
    /**
     * Creates a temporary redirect response.
     * @param url The URL to redirect to.
     */
    static movedTemporarily(url: string): HttpResponse
    /**
     * Creates a bad request response.
     * @param body The body of the response.
     */
    static badRequest(body?: HttpResponseBody | null): HttpResponse
    static tooManyRequests(): HttpResponse
    static unauthorized(): HttpResponse
    static forbidden(): HttpResponse
    static notFound(): HttpResponse
    static notAcceptable(): HttpResponse
    static internalServerError(): HttpResponse

    /**
     * Creates a raw HTTP response.
     * @param statusCode The status code of the response.
     * @param phrase The reason phrase of the response.
     * @param options The options for the response.
     * @param options.headers The headers of the response.
     * @param options.body The body of the response, can be a Data object or a FileEntity object.
     */
    static raw(statusCode: number, phrase: string, options?: {
      headers?: Record<string, string>
      body?: Data | FileEntity
    } | null): HttpResponse
  }

  /**
   * The HTTP request.
   */
  class HttpRequest {
    /**
     * The path of the request.
     */
    readonly path: string
    /**
     * The method of the request.
     */
    readonly method: string
    /**
     * The headers of the request.
     */
    readonly headers: Record<string, string>
    /**
     * The body of the request.
     */
    readonly body: Data
    /**
     * The address of the request.
     */
    readonly address: string | null
    /**
     * The parameters of the request.
     */
    readonly params: Record<string, string>
    /**
     * The query parameters of the request.
     */
    readonly queryParams: Array<{ key: string; value: string }>

    /**
     * Checks if the request has a token for the specified header name.
     * @param headerName The header name.
     * @param token The token.
     * @returns True if the request has a token for the specified header name, false otherwise.
     */
    hasTokenForHeader(headerName: string, token: string): boolean

    /**
     * Parses the URL-encoded form data of the request.
     * @returns An array of key-value pairs.
     */
    parseUrlencodedForm(): Array<{ key: string; value: string }>

    /**
     * Parses the multi-part form data of the request.
     * @returns An array of multi-part form data.
     */
    parseMultiPartFormData(): Array<{
      name: string | null
      filename: string | null
      headers: Record<string, string>
      data: Data
    }>
  }

  /**
   * The WebSocket session.
   */
  class WebSocketSession {
    /**
     * Writes text to the session.
     * @param text The text to write.
     */
    writeText(text: string): void
    /**
     * Writes binary data to the session.
     * @param data The data to write.
     */
    writeData(data: Data): void
    /**
     * Closes the session.
     */
    close(): void
  }

  /**
   * The HTTP server state.
   */
  type HttpServerState = "starting" | "running" | "stopping" | "stopped"

  /**
   * The HTTP server.
   */
  class HttpServer {
    /**
     * The state of the HTTP server.
     */
    readonly state: HttpServerState
    /**
     * The port of the HTTP server. If the server is not running, this is null.
     */
    readonly port: number | null
    /**
     * True if the server is listening on IPv4, false otherwise.
     */
    readonly isIPv4: boolean

    /**
     * String representation of the IPv4 address to receive requests from. It’s only used when the server is started with `forceIPv4` option set to true. Otherwise, `listenAddressIPv6` will be used.
     */
    listenAddressIPv4: string | null
    /**
     * String representation of the IPv6 address to receive requests from. It’s only used when the server is started with `forceIPv6` option set to true. Otherwise, `listenAddressIPv4` will be used.
     */
    listenAddressIPv6: string | null

    /**
     * Registers a handler for the specified path.
     * @param path The path to register the handler for.
     * @param handler The handler function. The handler function takes a request as an argument and returns a response.
     */
    registerHandler(path: string, handler: (request: HttpRequest) => HttpResponse): void

    /**
     * Register a static file for the specified path.
     * @param path 
     * @param filePath 
     * @example
     * ```ts
     * server.registerFile("/readme", Path.join(Script.directory, "README.md"))
     * ```
     */
    registerFile(path: string, filePath: string): void

    /**
     * Register the files of the specified directory for the specified path.
     * @param path The path to register the files for.
     * @param directory The directory to register the files from.
     * @param options The options for the directory.
     * @param options.defaults The default files to serve if no file is specified, defaults to ["index.html", "default.html"]
     * @example
     * ```ts
     * server.registerFilesFromDirectory("/static/:file", Path.join(Script.directory, "html"), {
     *   defaults: ["index.html", "index.htm"]
     * })
     * ```
     */
    registerFilesFromDirectory(path: string, directory: string, options?: {
      defaults?: string[]
    }): void

    /**
     * Registers a websocket handler for the specified path.
     * @param path The path to register the websocket handler for.
     * @param handlers The websocket handlers.
     * @param handlers.onPong The function to call when a ping is received.
     * @param handlers.onConnected The function to call when a connection is established.
     * @param handlers.onDisconnected The function to call when a connection is disconnected.
     * @param handlers.handleText The function to call when a text message is received.
     * @param handlers.handleBinary The function to call when a binary message is received.
     * @example
     * ```ts
     * server.registerWebsocket("/ws", {
     *   onPong: (session) => {
     *     session.writeText("received pong")
     *   },
     *   onConnected: (session) => {
     *     connectedSessions.push(session)
     *   },
     *   onDisconnected: (session) => {
     *     connectedSessions.splice(connectedSessions.indexOf(session), 1)
     *   },
     *   handleText: (session, text) => {
     *     // receive text
     *     session.writeText("some response text")
     *   },
     *   handleBinary: (session, data) => {
     *     // receive binary
     *   }
     * })
     * ```
     */
    registerWebsocket(path: string, handlers: {
      onPong?: (session: WebSocketSession) => void
      onConnected?: (session: WebSocketSession) => void
      onDisconnected?: (session: WebSocketSession) => void
      handleText?: (session: WebSocketSession, text: string) => void
      handleBinary?: (session: WebSocketSession, data: Data) => void
    }): void

    /**
     * Starts the HTTP server.
     * @param options The options for the HTTP server.
     * @param options.port The port to listen on. Defaults to 8080, if specified 0, the server will listen on a random port.
     * @param options.forceIPv4 Whether to force the server to listen on IPv4. Defaults to false.
     * @returns An error message if the server fails to start, or null if the server starts successfully.
     */
    start(options?: {
      port?: number
      forceIPv4?: boolean
    }): string | null

    /**
     * Stops the HTTP server.
     */
    stop(): void
  }

  interface ArchiveEntry {
    /**
     * The path of the entry.
     */
    readonly path: string
    /**
     * The type of the entry.
     */
    readonly type: "file" | "directory" | "symlink"
    /**
     * Whether the entry is compressed.
     */
    readonly isCompressed: boolean
    /**
     * The compressed size of the entry.
     */
    readonly compressedSize: number
    /**
     * The uncompressed size of the entry.
     */
    readonly uncompressedSize: number
    /**
     * The attributes of the entry.
     */
    readonly fileAttributes: {
      posixPermissions?: number
      modificationDate?: Date
    }
  }

  class Archive {
    /**
     * Opens an archive for specifed path and accessMode.
     * @param path The path of the archive
     * @param accessMode The access mode of the archive, e.g. "update", "read"
     * @param options The options for the archive
     * @param options.pathEncoding The encoding to use for the path, defaults to "utf-8"
     * @returns An Archive object
     * @throws An error if the archive cannot be opened
     */
    static openForMode(
      path: string,
      accessMode: "update" | "read",
      options?: {
        pathEncoding?: Encoding
      }
    ): Archive

    /**
     * The path of the archive.
     */
    readonly path: string

    /**
     * The data of the archive.
     */
    readonly data: Data | null

    /**
     * The entries of the archive.
     * @param pathEncoding The encoding to use for the path, defaults to "utf-8"
     * @returns The entries
     */
    entries(pathEncoding?: Encoding): ArchiveEntry[]

    /**
     * The entry paths of the archive.
     * @param encoding The encoding to use for the path, defaults to "utf-8"
     */
    getEntryPaths(encoding?: Encoding): string[]

    /**
     * The entry of the archive.
     * @param path The path of the entry
     * @returns The entry, or null if the entry does not exist
     */
    getEntry(path: string): ArchiveEntry | null

    /**
     * Checks if the archive contains the specified path.
     * @param path The path to check
     */
    contains(path: string): boolean

    /**
     * Add an entry to the archive.
     * @param path The source path
     * @param toPath The destination path
     * @param options The options for the entry
     * @param options.compressionMethod The compression method to use, defaults to "none"
     * @param options.bufferSize The buffer size to use, defaults to 16*1024
     * @returns A promise that resolves when the entry has been added, or rejects with an error.
     */
    addEntry(path: string, toPath: string, options?: {
      compressionMethod?: "deflate" | "none"
      bufferSize?: number
    }): Promise<void>

    /**
     * Add an entry to the archive, this is a synchronous version of addEntry.
     * @param path The source path
     * @param toPath The destination path
     * @param options The options for the entry
     * @param options.compressionMethod The compression method to use, defaults to "none"
     * @param options.bufferSize The buffer size to use, defaults to 16*1024
     * @throws An error if the entry cannot be added
     */
    addEntrySync(path: string, toPath: string, options?: {
      compressionMethod?: "deflate" | "none"
      bufferSize?: number
    }): void

    /**
     * Add a file entry to the archive.
     * @param path The path of the file to add
     * @param uncompressedSize The uncompressed size of the file
     * @param provider The function that provides the file data
     * @param options The options for the entry
     * @param options.compressionMethod The compression method to use, defaults to "none"
     * @param options.bufferSize The buffer size to use, defaults to 16*1024
     * @returns A promise that resolves when the entry has been added, or rejects with an error.
     * @example
     * ```ts
     * archive.addFileEntry(
     *   "file.txt",
     *   1024,
     *   (offset, length) => {
     *     // provide file data
     *   }
     * )
     * ```
     */
    addFileEntry(
      path: string,
      uncompressedSize: number,
      provider: (offset: number, length: number) => Data,
      options?: {
        modificationDate?: Date
        compressionMethod?: "deflate" | "none"
        bufferSize?: number
      }
    ): Promise<void>

    /**
     * Add a file entry to the archive, this is a synchronous version of addFileEntry.
     * @param path The path of the file to add
     * @param uncompressedSize The uncompressed size of the file
     * @param provider The function that provides the file data
     * @param options The options for the entry
     * @param options.compressionMethod The compression method to use, defaults to "none"
     * @param options.bufferSize The buffer size to use, defaults to 16*1024
     * @throws An error if the entry cannot be added
     */
    addFileEntrySync(
      path: string,
      uncompressedSize: number,
      provider: (offset: number, length: number) => Data,
      options?: {
        modificationDate?: Date
        compressionMethod?: "deflate" | "none"
        bufferSize?: number
      }
    ): void

    /**
     * Add a directory entry to the archive.
     * @param path The path of the directory to add
     * @param options The options for the entry
     * @param options.modificationDate The modification date of the directory
     * @param options.compressionMethod The compression method to use, defaults to "none"
     * @param options.bufferSize The buffer size to use, defaults to 16*1024
     * @returns A promise that resolves when the entry has been added, or rejects with an error.
     */
    addDirectoryEntry(
      path: string,
      options?: {
        modificationDate?: Date
        compressionMethod?: "deflate" | "none"
        bufferSize?: number
      }
    ): Promise<void>

    /**
     * Add a directory entry to the archive, this is a synchronous version of addDirectoryEntry.
     * @param path The path of the directory to add
     * @param options The options for the entry
     * @param options.modificationDate The modification date of the directory
     * @param options.compressionMethod The compression method to use, defaults to "none"
     * @param options.bufferSize The buffer size to use, defaults to 16*1024
     * @throws An error if the entry cannot be added
     */
    addDirectoryEntrySync(
      path: string,
      options?: {
        modificationDate?: Date
        compressionMethod?: "deflate" | "none"
        bufferSize?: number
      }
    ): void

    /**
     * Remove an entry from the archive.
     * @param path The path of the entry to remove
     * @param options The options for the entry
     * @param options.bufferSize The buffer size to use, defaults to 16*1024
     * @returns A promise that resolves when the entry has been removed, or rejects with an error.
     */
    removeEntry(path: string, options?: {
      bufferSize?: number
    }): Promise<void>

    /**
     * Remove an entry from the archive, this is a synchronous version of removeEntry.
     * @param path The path of the entry to remove
     * @param options The options for the entry
     * @param options.bufferSize The buffer size to use, defaults to 16*1024
     * @throws An error if the entry cannot be removed
     */
    removeEntrySync(path: string, options?: {
      bufferSize?: number
    }): void

    /**
     * Extract an entry from the archive.
     * @param path The path of the entry to extract
     * @param consumer The consumer to receive the data
     * @param options The options for the entry
     * @param options.bufferSize The buffer size to use, defaults to 16*1024
     * @returns A promise that resolves when the entry has been extracted, or rejects with an error.
     */
    extract(path: string, consumer: (data: Data) => void, options?: {
      bufferSize?: number
    }): Promise<void>

    /**
     * Extract an entry from the archive, this is a synchronous version of extract.
     * @param path The path of the entry to extract
     * @param consumer The consumer to receive the data
     * @param options The options for the entry
     * @param options.bufferSize The buffer size to use, defaults to 16*1024
     * @throws An error if the entry cannot be extracted
     */
    extractSync(path: string, consumer: (data: Data) => void, options?: {
      bufferSize?: number
    }): void

    /**
     * Extract an entry from the archive.
     * @param path The path of the entry to extract
     * @param to The path to extract to
     * @param options The options for the entry
     * @param options.bufferSize The buffer size to use, defaults to 16*1024
     * @param options.allowUncontainedSymlinks Whether to allow uncontained symlinks, defaults to false
     * @returns A promise that resolves when the entry has been extracted, or rejects with an error.
     */
    extractTo(path: string, to: string, options?: {
      bufferSize?: number
      allowUncontainedSymlinks?: boolean
    }): Promise<void>

    /**
     * Extract an entry from the archive, this is a synchronous version of extractTo.
     * @param path The path of the entry to extract
     * @param to The path to extract to
     * @param options The options for the entry
     * @param options.bufferSize The buffer size to use, defaults to 16*1024
     * @param options.allowUncontainedSymlinks Whether to allow uncontained symlinks, defaults to false
     * @throws An error if the entry cannot be extracted
     */
    extractToSync(path: string, to: string, options?: {
      bufferSize?: number
      allowUncontainedSymlinks?: boolean
    }): void
  }

  /**
   * Represents an animation.
   */
  class Animation {
    /**
     * Delay the animation by the given time.
     * @param time The time to delay in seconds.
     * @returns A new animation.
     */
    delay(time: DurationInSeconds): Animation
    /**
     * Repeat the animation the given number of times.
     * @param count The number of times to repeat the animation.
     * @param autoreverses Whether to reverse the animation after each repeat. Defaults to true.
     * @returns A new animation.
     */
    repeatCount(count: number, autoreverses?: boolean): Animation
    /**
     * Repeat the animation indefinitely.
     * @param autoreverses Whether to reverse the animation after each repeat. Defaults to true.
     * @returns A new animation.
     */
    repeatForever(autoreverses?: boolean): Animation
    // /**
    //  * Set the speed of the animation.
    //  * @param value The speed of the animation.
    //  * @returns A new animation.
    //  */
    // speed(value: number): Animation

    /**
     * Create a default animation.
     */
    static default(): Animation
    /**
     * Create a linear animation.
     * @param duration The duration of the animation in seconds.
     */
    static linear(duration?: DurationInSeconds | null): Animation
    /**
     * Create an ease-in animation.
     * @param duration The duration of the animation in seconds.
     */
    static easeIn(duration?: DurationInSeconds | null): Animation
    /**
     * Create an ease-out animation.
     * @param duration The duration of the animation in seconds.
     */
    static easeOut(duration?: DurationInSeconds | null): Animation
    /**
     * Create an bounce animation.
     * @param options The options for the animation
     * @param options.duration The duration of the animation in seconds.
     * @param options.extraBounce The extra bounce of the animation. 
     */
    static bouncy(options?: {
      duration?: DurationInSeconds
      extraBounce?: number
    }): Animation
    /**
     * Create a smooth animation.
     * @param options The options for the animation
     * @param options.duration The duration of the animation in seconds.
     * @param options.extraBounce The extra bounce of the animation. 
     */
    static smooth(options?: {
      duration?: DurationInSeconds
      extraBounce?: number
    }): Animation
    /**
     * Create a snappy animation.
     * @param options The options for the animation
     * @param options.duration The duration of the animation in seconds.
     * @param options.extraBounce The extra bounce of the animation. 
     */
    static snappy(options?: {
      duration?: DurationInSeconds
      extraBounce?: number
    }): Animation
    /**
     * Create a spring animation.
     * @param options The options for the animation, the options can be either a duration or a response and damping fraction.
     *  - Duration options
     *    - duration: The duration of the animation in seconds.
     *    - bounce: The bounce of the animation.
     *  - Response options
     *    - response: The response of the animation.
     *    - dampingFraction: The damping fraction of the animation.
     * @param options.blendDuration The duration of the animation in seconds.
     */
    static spring(options?: {
      blendDuration?: number
    } & ({
      duration?: DurationInSeconds
      bounce?: number
      response?: never
      dampingFraction?: never
    } | {
      response?: number
      dampingFraction?: number
      duration?: never
      bounce?: never
    })): Animation
    /**
     * Create an interactive spring animation.
     * @param options The options for the animation
     * @param options.response The response of the animation.
     * @param options.dampingFraction The damping fraction of the animation.
     * @param options.blendDuration The duration of the animation in seconds.
     */
    static interactiveSpring(options?: {
      response?: number
      dampingFraction?: number
      blendDuration?: number
    }): Animation
    /**
     * Create an interpolating spring animation.
     * @param options The options for the animation, the options can be either a duration or a mass, stiffness, damping and initial velocity.
     *  - Duration options
     *    - duration: The duration of the animation in seconds.
     *    - bounce: The bounce of the animation.
     *    - initialVelocity: The initial velocity of the animation.
     *  - Mass options
     *    - mass: The mass of the animation.
     *    - stiffness: The stiffness of the animation.
     *    - damping: The damping of the animation.
     *    - initialVelocity: The initial velocity of the animation.
     */
    static interpolatingSpring(options?: {
      mass?: number
      stiffness: number
      damping: number
      initialVelocity?: number
    } | {
      duration?: DurationInSeconds
      bounce?: number
      initialVelocity?: number
      mass?: never
      stiffness?: never
      damping?: never
    }): Animation
  }

  /**
   * Represents a transition.
   */
  class Transition {
    animation(animation?: Animation): Transition
    combined(other: Transition): Transition

    /**
     * Create an identity transition.
     */
    static identity(): Transition

    /**
     * Create a move transition.
     * @param edge The edge of the view to move
     */
    static move(edge: Edge): Transition

    /**
     * Create an offset transition.
     * @param position The position of the view, default is { x: 0, y: 0 }
     */
    static offset(position?: Point): Transition

    /**
     * Create a push transition.
     * @param edge The edge of the view to push
     */
    static pushFrom(edge: Edge): Transition

    /**
     * Create an opacity transition.
     */
    static opacity(): Transition

    /**
     * Create a scale transition.
     * @param scale The scale of the view, default is 1
     * @param anchor The anchor of the scale, default is "center"
     */
    static scale(scale?: number, anchor?: Point | KeywordPoint): Transition

    /**
     * Create a slide transition.
     */
    static slide(): Transition

    /**
     * Create a fade transition.
     * @param duration The duration of the animation in seconds.
     */
    static fade(duration?: DurationInSeconds): Transition

    /**
     * Create a flip transition from the left.
     * @param duration The duration of the animation in seconds.
     */
    static flipFromLeft(duration?: DurationInSeconds): Transition

    /**
     * Create a flip transition from the bottom.
     * @param duration The duration of the animation in seconds.
     */
    static flipFromBottom(duration?: DurationInSeconds): Transition

    /**
     * Create a flip transition from the right.
     * @param duration The duration of the animation in seconds.
     */
    static flipFromRight(duration?: DurationInSeconds): Transition

    /**
     * Create a flip transition from the top.
     * @param duration The duration of the animation in seconds.
     */
    static flipFromTop(duration?: DurationInSeconds): Transition

    /**
     * Create an asymmetric transition.
     * @param insertion The transition to use for insertion.
     * @param removal The transition to use for removal.
     */
    static asymmetric(insertion: Transition, removal: Transition): Transition
  }

  class Observable<T> {
    constructor(initialValue: T)
    value: T
    setValue: (value: T) => void
    subscribe: (callback: (value: T, oldValue: T) => void) => void
    unsubscribe: (callback: (value: T, oldValue: T) => void) => void
    dispose(): void
  }

  function withAnimation(body: () => void): Promise<void>
  function withAnimation(animation: Animation, body: () => void): Promise<void>
  function withAnimation(animation: Animation, completionCriteria: "logicallyComplete" | "removed", body: () => void): Promise<void>

  namespace Thread {

    /**
     * Whether the current thread is the main thread
     */
    const isMainThread: boolean

    /**
     * Runs a function in the main thread, it's useful when you want to update the UI, it can't switch back to the current thread.
     * @param execute The function to run
     */
    function runInMain(execute: () => void): void

    /**
     * Runs a function in the background thread, it's useful when you want to do some background work, it will switch back to the current thread and return the result.
     * @param execute The function to run, it can return a promise or a value
     * @returns The result of the function
     */
    function runInBackground<T>(execute: () => Promise<T> | T): Promise<T>
  }

  class EditMode {

    readonly value: "active" | "inactive" | "transient" | "unknown"
    readonly isEditing: boolean

    static active(): EditMode
    static inactive(): EditMode
    static transient(): EditMode
  }

  /**
   * Represents the result of an open URL action.
   * This is used in the `openURL` view modifier.
   */
  class OpenURLActionResult {

    type: string

    static handled(): OpenURLActionResult
    static discarded(): OpenURLActionResult

    /**
     * The handler asks the system to open the modified URL.
     * @param options 
     * @param options.url The URL that the handler asks the system to open.
     * @param options.prefersInApp Whether the handler prefers to open the URL in the app.
     */
    static systemAction(options?: {
      url?: string
      prefersInApp: boolean
    }): OpenURLActionResult
  }

  namespace IntentMemoryStorage {
    function get<T>(key: string, options?: {
      shared?: boolean
    }): T | null
    function set(key: string, value: any, options?: {
      shared?: boolean
    }): void
    function remove(key: string, options?: {
      shared?: boolean
    }): void
    function contains(key: string, options?: {
      shared?: boolean
    }): boolean
    function clear(): void
    function keys(): string[]
  }

  /**
   * Represents the customizations of a tab view section.
   * @available iOS 18.4+
   */
  class TabViewCustomizationSection {
    readonly tabOrder: string[] | null
    resetTabOrder(): void
  }

  /**
   * Represents the customizations of a tab view tab.
   * @available iOS 18.4+
   */
  class TabViewCustomizationTab {
    readonly tabBarVisibility: Visibility
    sidebarVisibility: Visibility
  }

  /**
   * Represents the customizations of a tab view.
   * This is used in the `tabViewCustomization` view modifier.
   * @available iOS 18.0+
   */
  class TabViewCustomization {
    /**
     * Create a TabViewCustomization from data.
     * @param data The data to create the TabViewCustomization from, use the `toData` method to create the data.
     * @returns The TabViewCustomization or null if the data is invalid.
     */
    static fromData(data: Data): TabViewCustomization | null

    /**
     * Get the section with the given id.
     * @param id The id of the section.
     * @returns The section or null if the section is not found.
     * @available iOS 18.4+
     */
    getSection(id: string): TabViewCustomizationSection | null

    /**
     * Get the tab with the given id.
     * @param id The id of the tab.
     * @returns The tab or null if the tab is not found.
     * @available iOS 18.4+
     */
    getTab(id: string): TabViewCustomizationTab | null

    /**
     * Reset the section order.
     */
    resetSectionOrder(): void

    /**
     * Reset the tab visibility.
     */
    resetVisibility(): void

    /**
     * Convert the TabViewCustomization to data. You can use this to save the customization to a file or the Storage.
     * @returns The data or null if the TabViewCustomization is invalid.
     */
    toData(): Data | null
  }

  /**
   * Represents the ID of a namespace. You cannot create a NamespaceID instance, it is created by the `NamespaceReader` view.
   */
  abstract class NamespaceID {
    readonly hasValue: number
  }

  /**
   * A class that defines the configuration of the Liquid Glass material.
   * @available iOS 26.0+
   */
  class UIGlass {
    /**
     * Returns a new instance configured to be interactive. Defaults to true.
     */
    interactive(value?: boolean): UIGlass
    /**
     * Returns a new instance with a configured tint color.
     */
    tint(color: Color): UIGlass

    /**
     * The clear variant of glass.
     */
    static clear(): UIGlass
    /**
     * The identity variant of glass. When applied, your content remains unaffected as if no glass effect was applied.
     */
    static regular(): UIGlass
    /**
     * The regular variant of the Liquid Glass material.
     */
    static identity(): UIGlass
  }

  namespace AppStore {
    /**
     * Apens a modal that will allow user to interact with a product in the App Store without leaving the Scripting app.
     * @param id The identifier of the app to open in the App Store.
     * @returns A promise that resolves when the modal is closed. Or throws an error if there was already a modal open.
     */
    function presentApp(id: string): Promise<void>
    /**
     * Dismiss the modal that was opened using `presentApp`.
     */
    function dismissApp(): Promise<void>
  }
}

export { }