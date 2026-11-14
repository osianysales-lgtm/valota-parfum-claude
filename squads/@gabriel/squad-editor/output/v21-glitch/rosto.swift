import Vision; import AppKit
let dir = CommandLine.arguments[1]
let files = try! FileManager.default.contentsOfDirectory(atPath: dir).filter{$0.hasSuffix(".jpg")}.sorted()
var out: [[Double]] = []
for f in files {
  let url = URL(fileURLWithPath: dir + "/" + f)
  let req = VNDetectFaceRectanglesRequest()
  let h = VNImageRequestHandler(url: url)
  try? h.perform([req])
  let n = Int(f.dropFirst().dropLast(4))!
  if let r = (req.results ?? []).max(by: {$0.boundingBox.width < $1.boundingBox.width}) {
    let b = r.boundingBox
    out.append([Double(n-1)/4.0, b.minX*1080, (1-b.maxY)*1920, b.maxX*1080, (1-b.minY)*1920])
  } else { out.append([Double(n-1)/4.0, -1, -1, -1, -1]) }
}
let d = try! JSONSerialization.data(withJSONObject: out)
FileManager.default.createFile(atPath: dir + "/../rosto.json", contents: d)
print(out.count)
