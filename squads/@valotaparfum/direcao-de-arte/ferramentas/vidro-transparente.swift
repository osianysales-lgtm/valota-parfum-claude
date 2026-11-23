// Deixa o VIDRO CLARO de um frasco recortado semitransparente (para fundo escuro).
// O vidro transparente fotografado em fundo branco vira uma moldura branca; este script
// reduz o alfa dos pixels claros FORA do rótulo escuro (o rótulo e a tampa ficam intactos).
// Uso: swift vidro-transparente.swift entrada.png saida.png [y_inicio_vidro 0-1] [opacidade_min 0-1] [margem px]
//   y_inicio_vidro: a partir de que altura começa o vidro (abaixo da tampa). Padrão 0.2.
//   opacidade_min: quanto do vidro branco sobra. Padrão 0.3.
import Foundation
import AppKit

let a = CommandLine.arguments
guard a.count >= 3, let img = NSImage(contentsOfFile: a[1]),
      let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else { print("uso: entrada saida [y0] [min]"); exit(1) }
let y0f = a.count > 3 ? Double(a[3])! : 0.2
let minA = a.count > 4 ? Double(a[4])! : 0.3
let W = cg.width, H = cg.height
var px = [UInt8](repeating: 0, count: W * H * 4)
let cs = CGColorSpaceCreateDeviceRGB()
let ctx = CGContext(data: &px, width: W, height: H, bitsPerComponent: 8, bytesPerRow: W * 4, space: cs,
                    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.draw(cg, in: CGRect(x: 0, y: 0, width: W, height: H))
let yStart = Int(Double(H) * y0f)  // linha (do topo) onde começa o vidro
func lum(_ i: Int) -> Double {
    let al = Double(px[i + 3]); if al < 1 { return 0 }
    return (0.299 * Double(px[i]) + 0.587 * Double(px[i + 1]) + 0.114 * Double(px[i + 2])) / al
}
// bbox do rótulo escuro (pixels opacos e escuros abaixo da tampa)
var x1 = W, x2 = 0, r1 = H, r2 = 0
for r in yStart..<H { for x in 0..<W {
    let i = (r * W + x) * 4
    if px[i + 3] > 230 && lum(i) < 0.18 { x1 = min(x1, x); x2 = max(x2, x); r1 = min(r1, r); r2 = max(r2, r) }
} }
// refina x: só colunas em que o escuro ocupa a maior parte da altura do rótulo (tira os filetes do vidro)
var cols = [Int](repeating: 0, count: W)
for r in r1...r2 { for x in 0..<W { let i = (r * W + x) * 4; if px[i + 3] > 230 && lum(i) < 0.18 { cols[x] += 1 } } }
let alt = r2 - r1 + 1
let boas = (0..<W).filter { Double(cols[$0]) > 0.6 * Double(alt) }
if let f = boas.first, let l = boas.last { x1 = f; x2 = l }
let m = (a.count > 5 ? Int(a[5])! : 6)  // margem: positivo protege menos a borda do rótulo
print("rótulo x \(x1)-\(x2) y \(r1)-\(r2)")
for r in yStart..<H { for x in 0..<W {
    if x > x1 + m && x < x2 - m && r > r1 + m && r < r2 - m { continue }
    let i = (r * W + x) * 4
    let al = Double(px[i + 3]); if al < 1 { continue }
    let l = lum(i)
    let s = l > 0.55 ? max(minA, 1 - (l - 0.55) / 0.45 * (1 - minA)) : 1
    for c in 0..<4 { px[i + c] = UInt8(Double(px[i + c]) * s) }
} }
let out = ctx.makeImage()!
let rep = NSBitmapImageRep(cgImage: out)
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: a[2]))
print("ok")
