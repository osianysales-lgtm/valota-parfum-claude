// Realça letra clara/cinza em frasco PRETO (ex.: Armani Code): curva que mantém o preto e
// joga os cinzas médios pro branco, sem acinzentar o vidro. Mantém a transparência do PNG.
// Uso: swift realcar-rotulo.swift entrada.png saida.png
import Foundation
import CoreImage
import CoreImage.CIFilterBuiltins
let a = CommandLine.arguments
let ci = CIImage(contentsOf: URL(fileURLWithPath: a[1]))!
let c = CIFilter.toneCurve()
c.inputImage = ci
c.point0 = CGPoint(x: 0, y: 0)
c.point1 = CGPoint(x: 0.18, y: 0.15)
c.point2 = CGPoint(x: 0.4, y: 0.72)
c.point3 = CGPoint(x: 0.65, y: 0.95)
c.point4 = CGPoint(x: 1, y: 1)
let ctx = CIContext()
try ctx.writePNGRepresentation(of: c.outputImage!, to: URL(fileURLWithPath: a[2]), format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
print("ok")
