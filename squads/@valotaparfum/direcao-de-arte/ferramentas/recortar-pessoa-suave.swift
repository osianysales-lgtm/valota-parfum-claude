// Recorte de PESSOA com borda suave (cabelo e rosto sem serrilhado nem halo claro).
// Usa VNGeneratePersonSegmentationRequest (.accurate), que segura fios de cabelo melhor que o
// recorte genérico, encolhe a borda um pouco (tira o halo do fundo) e esfuma.
// Uso: swift recortar-pessoa-suave.swift entrada.jpg saida.png [encolher=2] [esfumar=2.5]
import Foundation
import Vision
import CoreImage
import CoreImage.CIFilterBuiltins
import AppKit

let a = CommandLine.arguments
guard a.count >= 3 else { print("uso: entrada saida [encolher] [esfumar]"); exit(1) }
let encolher = a.count > 3 ? Double(a[3])! : 2
let esfumar = a.count > 4 ? Double(a[4])! : 2.5
let ci = CIImage(contentsOf: URL(fileURLWithPath: a[1]))!
let req = VNGeneratePersonSegmentationRequest()
req.qualityLevel = .accurate
req.outputPixelFormat = kCVPixelFormatType_OneComponent8
let h = VNImageRequestHandler(ciImage: ci)
try h.perform([req])
guard let buf = req.results?.first?.pixelBuffer else { print("sem pessoa"); exit(1) }
var m = CIImage(cvPixelBuffer: buf)
// mascara no tamanho da foto
m = m.transformed(by: CGAffineTransform(scaleX: ci.extent.width / m.extent.width, y: ci.extent.height / m.extent.height))
if encolher > 0 {
    let e = CIFilter.morphologyMinimum(); e.inputImage = m; e.radius = Float(encolher); m = e.outputImage!.cropped(to: ci.extent)
}
if esfumar > 0 {
    let b = CIFilter.gaussianBlur(); b.inputImage = m.clampedToExtent(); b.radius = Float(esfumar); m = b.outputImage!.cropped(to: ci.extent)
}
let f = CIFilter.blendWithMask()
f.inputImage = ci
f.backgroundImage = CIImage.empty()
f.maskImage = m
let out = f.outputImage!.cropped(to: ci.extent)
let ctx = CIContext()
try ctx.writePNGRepresentation(of: out, to: URL(fileURLWithPath: a[2]), format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
print("ok")
