// Recorte de frasco em FUNDO BRANCO por preenchimento a partir das bordas da imagem.
// Só vira fundo o branco que está LIGADO à borda; rótulo branco, vidro claro e reflexos
// dentro do contorno do frasco ficam intactos (resolve "mordida" e rótulo vazado).
// Uso: swift recortar-por-borda.swift entrada.png saida.png [limiar=236]
import Foundation
import AppKit

let a = CommandLine.arguments
guard a.count >= 3 else { print("uso: entrada saida [limiar]"); exit(1) }
let lim = a.count > 3 ? Int(a[3])! : 236
guard let img = NSImage(contentsOfFile: a[1]),
      let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else { print("erro ao abrir"); exit(1) }
let w = cg.width, h = cg.height
var px = [UInt8](repeating: 0, count: w * h * 4)
let cs = CGColorSpace(name: CGColorSpace.sRGB)!
let ctx = CGContext(data: &px, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: cs,
                    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1)); ctx.fill(CGRect(x: 0, y: 0, width: w, height: h))
ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))

func mn(_ i: Int) -> Int { min(Int(px[i * 4]), Int(px[i * 4 + 1]), Int(px[i * 4 + 2])) }
var fundo = [Bool](repeating: false, count: w * h)
var fila = [Int](); fila.reserveCapacity(w * h)
for x in 0..<w { for y in [0, h - 1] { let i = y * w + x; if mn(i) >= lim && !fundo[i] { fundo[i] = true; fila.append(i) } } }
for y in 0..<h { for x in [0, w - 1] { let i = y * w + x; if mn(i) >= lim && !fundo[i] { fundo[i] = true; fila.append(i) } } }
var k = 0
while k < fila.count {
    let i = fila[k]; k += 1
    let x = i % w, y = i / w
    for (dx, dy) in [(1, 0), (-1, 0), (0, 1), (0, -1)] {
        let nx = x + dx, ny = y + dy
        if nx < 0 || ny < 0 || nx >= w || ny >= h { continue }
        let j = ny * w + nx
        if !fundo[j] && mn(j) >= lim { fundo[j] = true; fila.append(j) }
    }
}
// alfa: fundo = 0; frasco = 255; na borda (frasco vizinho de fundo) alfa pela "brancura" pra não serrilhar
var alfa = [Double](repeating: 0, count: w * h)
for i in 0..<(w * h) { alfa[i] = fundo[i] ? 0 : 1 }
for y in 1..<(h - 1) { for x in 1..<(w - 1) {
    let i = y * w + x
    if fundo[i] { continue }
    if fundo[i - 1] || fundo[i + 1] || fundo[i - w] || fundo[i + w] {
        let m = Double(mn(i))
        alfa[i] = max(0.35, min(1, (255 - m) / Double(255 - lim + 25)))
    }
} }
var out = [UInt8](repeating: 0, count: w * h * 4)
for i in 0..<(w * h) {
    let al = alfa[i]
    if al <= 0 { continue }
    for c in 0..<3 {
        // tira o halo branco: "desmistura" do branco na borda
        let v = Double(px[i * 4 + c])
        let limpo = al < 1 ? max(0, min(255, (v - (1 - al) * 255) / al)) : v
        out[i * 4 + c] = UInt8(limpo * al)  // pré-multiplicado
    }
    out[i * 4 + 3] = UInt8(al * 255)
}
let octx = CGContext(data: &out, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: cs,
                     bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
let rep = NSBitmapImageRep(cgImage: octx.makeImage()!)
try rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: a[2]))
print("ok")
