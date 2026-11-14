// Recorte preciso de produto fotografado em FUNDO BRANCO (ex.: fotos da Fragrantica/lojas).
// A borda vem da cor (pixel a pixel, sem serrilhado) e o miolo é protegido pela máscara do
// Vision (encolhida), para o vidro claro não virar buraco. Também tira o "halo" branco da borda.
// Uso: swift recortar-fundo-branco.swift entrada.jpg saida.png [so-cor]
// "so-cor": não protege o miolo (use em frasco opaco com parte VAZADA, ex.: alça do Mandarin Sky).
import Foundation
import Vision
import CoreImage
import AppKit

let args = CommandLine.arguments
guard args.count >= 3 else { print("uso: entrada saida"); exit(1) }
let ci = CIImage(contentsOf: URL(fileURLWithPath: args[1]))!
let W = Int(ci.extent.width), H = Int(ci.extent.height)
let ctx = CIContext(options: [.workingColorSpace: NSNull()])
let srgb = CGColorSpace(name: CGColorSpace.sRGB)!

func bytes(_ img: CIImage) -> [UInt8] {
    var buf = [UInt8](repeating: 0, count: W * H * 4)
    ctx.render(img, toBitmap: &buf, rowBytes: W * 4, bounds: CGRect(x: 0, y: 0, width: W, height: H), format: .RGBA8, colorSpace: srgb)
    return buf
}

// 1) máscara do Vision, encolhida (só o miolo garantido)
let req = VNGenerateForegroundInstanceMaskRequest()
let h = VNImageRequestHandler(ciImage: ci)
try h.perform([req])
var miolo = [UInt8](repeating: 0, count: W * H * 4)
var area = [UInt8](repeating: 255, count: W * H * 4)
if let r = req.results?.first {
    let m = try r.generateScaledMaskForImage(forInstances: r.allInstances, from: h)
    let mci = CIImage(cvPixelBuffer: m)
    let er = mci.applyingFilter("CIMorphologyMinimum", parameters: ["inputRadius": 7]).cropped(to: ci.extent)
    miolo = bytes(er)
    let di = mci.applyingFilter("CIMorphologyMaximum", parameters: ["inputRadius": 3]).cropped(to: ci.extent)
    area = bytes(di)   // fora daqui é fundo, mesmo que a cor não seja branca pura (artefato de JPEG)
}

// 2) alfa pela distância do branco + descontaminação do branco
let src = bytes(ci)
var out = [UInt8](repeating: 0, count: W * H * 4)
for i in stride(from: 0, to: W * H * 4, by: 4) {
    let r = Double(src[i]), g = Double(src[i + 1]), b = Double(src[i + 2])
    let d = 255 - min(r, min(g, b))            // quão longe do branco
    var a = max(0, min(1, (d - 6) / 22))       // borda suave pela cor
    a = min(a, Double(area[i]) / 255)
    let m = (args.count > 3 && args[3] == "so-cor") ? 0 : Double(miolo[i]) / 255   // miolo do Vision
    a = max(a, m)
    if a <= 0.002 { continue }
    // tira o branco misturado na borda: c = (obs - (1-a)*255) / a
    func dec(_ c: Double) -> UInt8 { UInt8(max(0, min(255, (c - (1 - a) * 255) / a))) }
    let usaDec = m < 0.99
    out[i] = usaDec ? dec(r) : UInt8(r)
    out[i + 1] = usaDec ? dec(g) : UInt8(g)
    out[i + 2] = usaDec ? dec(b) : UInt8(b)
    out[i + 3] = UInt8(a * 255)
}

// 2b) fecha a borda em 1 px (tira o contorno claro de JPEG) e endurece o alfa da borda
var fech = out
for y in 0..<H { for x in 0..<W {
    let i = (y * W + x) * 4
    if out[i + 3] == 0 { continue }
    var mn = out[i + 3]
    for (dx, dy) in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, 1), (-1, 1), (1, -1)] {
        let nx = x + dx, ny = y + dy
        if nx < 0 || ny < 0 || nx >= W || ny >= H { mn = 0; break }
        mn = min(mn, out[(ny * W + nx) * 4 + 3])
    }
    let a = Double(mn) / 255
    fech[i + 3] = UInt8(pow(a, 1.4) * 255)
} }
out = fech

// 3) salva PNG (RGBA não pré-multiplicado)
let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: W, pixelsHigh: H, bitsPerSample: 8, samplesPerPixel: 4,
                           hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bitmapFormat: [.alphaNonpremultiplied],
                           bytesPerRow: W * 4, bitsPerPixel: 32)!
memcpy(rep.bitmapData!, out, W * H * 4)
try rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: args[2]))
print("ok", W, H)
