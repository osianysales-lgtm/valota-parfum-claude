// Apara a sobra transparente de um PNG recortado.
// Uso: swift aparar-recorte.swift entrada.png saida.png [y0 y1]
//   y0 y1 (opcional, 0 a 1, a partir do topo): só considera essa faixa da imagem.
import Foundation
import AppKit
let a = CommandLine.arguments
guard let img = NSImage(contentsOfFile: a[1]),
      let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else { print("erro ao abrir"); exit(1) }
let w = cg.width, h = cg.height
let y0 = a.count > 4 ? Int(Double(a[3])! * Double(h)) : 0
let y1 = a.count > 4 ? Int(Double(a[4])! * Double(h)) : h
var px = [UInt8](repeating: 0, count: w * h * 4)
let ctx = CGContext(data: &px, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4,
                    space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
var minX = w, minY = h, maxX = -1, maxY = -1
for y in y0..<y1 { for x in 0..<w where px[(y * w + x) * 4 + 3] > 24 {
    minX = min(minX, x); maxX = max(maxX, x); minY = min(minY, y); maxY = max(maxY, y) } }
guard maxX >= 0 else { print("vazio"); exit(1) }
let m = 6
let r = CGRect(x: max(0, minX - m), y: max(0, minY - m),
               width: min(w, maxX + m) - max(0, minX - m), height: min(h, maxY + m) - max(0, minY - m))
let full = ctx.makeImage()!.cropping(to: r)!
let rep = NSBitmapImageRep(cgImage: full)
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: a[2]))
print("ok \(Int(r.width))x\(Int(r.height))")
