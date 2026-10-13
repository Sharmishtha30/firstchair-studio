import Foundation
import AVFoundation
import Vision
import CoreImage
// Local-only person mask. Input is the worker's upright, constant-30fps preview.
let input = CommandLine.arguments[1], output = CommandLine.arguments[2]
let asset = AVURLAsset(url: URL(fileURLWithPath: input))
let track = asset.tracks(withMediaType: .video)[0]
let reader = try AVAssetReader(asset: asset)
let frames = AVAssetReaderTrackOutput(track: track, outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA])
reader.add(frames)
let encoder = Process(), pipe = Pipe()
encoder.executableURL = URL(fileURLWithPath: "/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg")
encoder.arguments = ["-v","error","-y","-f","rawvideo","-pixel_format","gray","-video_size","360x640","-framerate","30","-i","pipe:0","-c:v","ffv1",output]
encoder.standardInput = pipe
try encoder.run()
let request = VNGeneratePersonSegmentationRequest()
request.qualityLevel = .balanced
request.outputPixelFormat = kCVPixelFormatType_OneComponent8
let handler = VNSequenceRequestHandler(), context = CIContext()
reader.startReading()
var count = 0
while let sample = frames.copyNextSampleBuffer() {
 try autoreleasepool {
  guard let pixel = CMSampleBufferGetImageBuffer(sample) else { return }
  try handler.perform([request], on: pixel)
  guard let mask = request.results?.first?.pixelBuffer else { throw NSError(domain:"No person mask",code:1) }
  let image = CIImage(cvPixelBuffer: mask)
  let scaled = image.transformed(by: CGAffineTransform(scaleX:360/image.extent.width,y:640/image.extent.height))
  var bytes = [UInt8](repeating:0,count:360*640)
  context.render(scaled,toBitmap:&bytes,rowBytes:360,bounds:CGRect(x:0,y:0,width:360,height:640),format:.L8,colorSpace:CGColorSpaceCreateDeviceGray())
  try pipe.fileHandleForWriting.write(contentsOf:Data(bytes))
  count += 1
 }
}
try pipe.fileHandleForWriting.close()
encoder.waitUntilExit()
guard reader.status == .completed, encoder.terminationStatus == 0, count > 0 else { throw NSError(domain:"Person masking failed",code:2) }
print("Masked \(count) frames")
