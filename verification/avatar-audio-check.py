import subprocess,array,math

def samples(path):
    return array.array('h',subprocess.check_output(['ffmpeg','-v','error','-i',path,'-map','0:a:0','-ac','1','-ar','16000','-f','s16le','-']))
a=samples('verification/avatar-source-fixture.mp4')
b=samples('verification/avatar-composite-fixture.mp4')
best=(-2,0)
for lag in range(-1024,1025):
    pairs=[(a[i],b[i+lag]) for i in range(2048,14000,8)]
    dot=sum(x*y for x,y in pairs)
    aa=sum(x*x for x,y in pairs)
    bb=sum(y*y for x,y in pairs)
    corr=dot/math.sqrt(aa*bb)
    if corr>best[0]:best=(corr,lag)
corr,lag=best
assert corr>.98,(corr,lag)
assert abs(lag)<=32,('Audio moved by more than 2 ms',lag)
print(f'PASS source audio retained: decoded waveform correlation {corr:.6f}, codec alignment offset {lag/16000*1000:.2f} ms')
print('Fixture audio is original music; no live Seedance speech is claimed.')
