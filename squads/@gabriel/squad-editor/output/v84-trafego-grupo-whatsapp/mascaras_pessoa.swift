// v84: máscara da pessoa quadro a quadro (Vision .accurate), borda encolhida 1 px e esfumada.
// Uso: ./mascaras_pessoa pasta_jpg pasta_png
import Foundation
import Vision
import CoreImage
import CoreImage.CIFilterBuiltins
import AppKit
let a = CommandLine.arguments
let fm = FileManager.default
try? fm.createDirectory(atPath: a[2], withIntermediateDirectories: true)
let arquivos = try fm.contentsOfDirectory(atPath: a[1]).filter { $0.hasSuffix(".jpg") }.sorted()
let ctx = CIContext()
let cinza = CGColorSpaceCreateDeviceGray()
var n = 0
for nome in arquivos {
  autoreleasepool {
    let ci = CIImage(contentsOf: URL(fileURLWithPath: a[1] + "/" + nome))!
    let W = ci.extent.width, H = ci.extent.height
    let req = VNGeneratePersonSegmentationRequest()
    req.qualityLevel = .accurate
    req.outputPixelFormat = kCVPixelFormatType_OneComponent8
    try? VNImageRequestHandler(ciImage: ci).perform([req])
    guard let buf = req.results?.first?.pixelBuffer else { return }
    var m = CIImage(cvPixelBuffer: buf)
    m = m.transformed(by: CGAffineTransform(scaleX: W / m.extent.width, y: H / m.extent.height))
    let e = CIFilter.morphologyMinimum(); e.inputImage = m; e.radius = 1; m = e.outputImage!.cropped(to: ci.extent)
    let b = CIFilter.gaussianBlur(); b.inputImage = m.clampedToExtent(); b.radius = 1.5; m = b.outputImage!.cropped(to: ci.extent)
    let cg = ctx.createCGImage(m, from: ci.extent)!
    let bc = CGContext(data: nil, width: Int(W), height: Int(H), bitsPerComponent: 8, bytesPerRow: 0, space: cinza, bitmapInfo: CGImageAlphaInfo.none.rawValue)!
    bc.draw(cg, in: CGRect(x: 0, y: 0, width: W, height: H))
    let px = bc.data!.bindMemory(to: UInt8.self, capacity: bc.bytesPerRow * Int(H))
    for i in 0..<(bc.bytesPerRow * Int(H)) where px[i] < 40 { px[i] = 0 }
    let rep = NSBitmapImageRep(cgImage: bc.makeImage()!)
    try? rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: a[2] + "/" + nome.replacingOccurrences(of: ".jpg", with: ".png")))
    n += 1
  }
}
print("ok \(n) máscaras")
