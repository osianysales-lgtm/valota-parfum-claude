// Recorta o objeto em primeiro plano que está sob um ponto (x,y em pixels, origem no topo-esquerdo).
// uso: swift recortar-objeto.swift entrada.png saida.png [x y]   (sem ponto = todos os objetos)
import Foundation
import Vision
import CoreImage
import AppKit

let a = CommandLine.arguments
let url = URL(fileURLWithPath: a[1])
let ci = CIImage(contentsOf: url)!
let req = VNGenerateForegroundInstanceMaskRequest()
let h = VNImageRequestHandler(ciImage: ci)
try h.perform([req])
guard let r = req.results?.first else { print("nenhum objeto"); exit(1) }
var inst = r.allInstances
if a.count >= 5, let x = Int(a[3]), let y = Int(a[4]) {
  // descobre qual instância está sob o ponto
  let lab = r.instanceMask
  CVPixelBufferLockBaseAddress(lab, .readOnly)
  let w = CVPixelBufferGetWidth(lab), hh = CVPixelBufferGetHeight(lab)
  let px = x * w / Int(ci.extent.width), py = y * hh / Int(ci.extent.height)
  let row = CVPixelBufferGetBaseAddress(lab)! + py * CVPixelBufferGetBytesPerRow(lab)
  let v = row.assumingMemoryBound(to: UInt8.self)[px]
  CVPixelBufferUnlockBaseAddress(lab, .readOnly)
  print("instâncias:", r.allInstances.map{$0}, "no ponto:", v)
  if v == 0 { print("ponto fora de objeto"); exit(1) }
  inst = IndexSet(integer: Int(v))
}
let out = try r.generateMaskedImage(ofInstances: inst, from: h, croppedToInstancesExtent: false)
let o = CIImage(cvPixelBuffer: out)
let ctx = CIContext()
try ctx.writePNGRepresentation(of: o, to: URL(fileURLWithPath: a[2]), format: .RGBA8, colorSpace: CGColorSpaceCreateDeviceRGB())
print("ok")
