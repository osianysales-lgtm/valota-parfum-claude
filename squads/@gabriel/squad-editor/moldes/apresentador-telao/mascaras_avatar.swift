// Máscaras do avatar quadro a quadro (molde APRESENTADOR DE TELÃO).
// Para cada JPG da pasta de entrada: segmentação de pessoa do Vision (.accurate), apaga a cadeira
// com os polígonos desenhados à mão (coordenadas do quadro 1080x1920 do avatar osianyreal),
// encolhe/esfuma a borda e corta o alfa fraco (névoa da parede). Saída: PNG cinza (máscara) com o mesmo nome.
// Uso: swift mascaras_avatar.swift pasta_quadros pasta_mascaras [encolher=1] [esfumar=1.2]
import Foundation
import Vision
import CoreImage
import CoreImage.CIFilterBuiltins
import AppKit

let a = CommandLine.arguments
guard a.count >= 3 else { print("uso: pasta_quadros pasta_mascaras"); exit(1) }
let encolher = a.count > 3 ? Double(a[3])! : 1
let esfumar = a.count > 4 ? Double(a[4])! : 1.2
let fm = FileManager.default
try? fm.createDirectory(atPath: a[2], withIntermediateDirectories: true)
let arquivos = try fm.contentsOfDirectory(atPath: a[1]).filter { $0.hasSuffix(".jpg") }.sorted()
// cadeira (quadro 1080x1920, y de cima pra baixo)
let polis: [[(Double, Double)]] = [
  [(0,620),(172,620),(190,838),(222,860),(230,890),(232,1045),(150,1100),(80,1145),(40,1170),(0,1192)],
  [(0,1560),(30,1625),(56,1710),(64,1920),(0,1920)],
  [(968,640),(1080,640),(1080,1045),(1010,1050),(968,1040)],   // encosto escuro da cadeira à direita do cabelo
]
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
    if encolher > 0 { let e = CIFilter.morphologyMinimum(); e.inputImage = m; e.radius = Float(encolher); m = e.outputImage!.cropped(to: ci.extent) }
    if esfumar > 0 { let b = CIFilter.gaussianBlur(); b.inputImage = m.clampedToExtent(); b.radius = Float(esfumar); m = b.outputImage!.cropped(to: ci.extent) }
    // desenha a máscara num bitmap cinza e apaga a cadeira
    let cg = ctx.createCGImage(m, from: ci.extent)!
    let bc = CGContext(data: nil, width: Int(W), height: Int(H), bitsPerComponent: 8, bytesPerRow: 0, space: cinza, bitmapInfo: CGImageAlphaInfo.none.rawValue)!
    bc.draw(cg, in: CGRect(x: 0, y: 0, width: W, height: H))
    bc.setFillColor(gray: 0, alpha: 1)
    let sx = W / 1080, sy = H / 1920
    for p in polis {
      bc.beginPath()
      for (i, (x, y)) in p.enumerated() {
        let pt = CGPoint(x: x * sx, y: H - y * sy)
        if i == 0 { bc.move(to: pt) } else { bc.addLine(to: pt) }
      }
      bc.closePath(); bc.fillPath()
    }
    // alfa fraco (< 150) vira 0
    let px = bc.data!.bindMemory(to: UInt8.self, capacity: bc.bytesPerRow * Int(H))
    for i in 0..<(bc.bytesPerRow * Int(H)) where px[i] < 150 { px[i] = 0 }
    let out = bc.makeImage()!
    let rep = NSBitmapImageRep(cgImage: out)
    try? rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: a[2] + "/" + nome.replacingOccurrences(of: ".jpg", with: ".png")))
    n += 1
    if n % 200 == 0 { print("máscaras \(n)/\(arquivos.count)") }
  }
}
print("ok \(n) máscaras")
