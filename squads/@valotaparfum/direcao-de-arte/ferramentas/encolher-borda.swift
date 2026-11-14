// Encolhe a borda de um recorte PNG (tira halo claro). Uso: swift encolher.swift in.png out.png raio
import Foundation
import CoreImage
import AppKit
let a = CommandLine.arguments
let r = Double(a[3]) ?? 3
let src = CIImage(contentsOf: URL(fileURLWithPath: a[1]))!
let ext = src.extent
// máscara = alfa em cinza
let alpha = src.applyingFilter("CIColorMatrix", parameters: [
  "inputRVector": CIVector(x:0,y:0,z:0,w:1), "inputGVector": CIVector(x:0,y:0,z:0,w:1),
  "inputBVector": CIVector(x:0,y:0,z:0,w:1), "inputAVector": CIVector(x:0,y:0,z:0,w:0),
  "inputBiasVector": CIVector(x:0,y:0,z:0,w:1)])
let er = alpha.applyingFilter("CIMorphologyMinimum", parameters: ["inputRadius": r])
  .applyingFilter("CIGaussianBlur", parameters: ["inputRadius": 0.8]).cropped(to: ext)
let clear = CIImage(color: .clear).cropped(to: ext)
let out = src.applyingFilter("CIBlendWithMask", parameters: ["inputBackgroundImage": clear, "inputMaskImage": er]).cropped(to: ext)
let ctx = CIContext()
let cs = CGColorSpace(name: CGColorSpace.sRGB)!
try! ctx.writePNGRepresentation(of: out, to: URL(fileURLWithPath: a[2]), format: .RGBA8, colorSpace: cs)
print("ok")
