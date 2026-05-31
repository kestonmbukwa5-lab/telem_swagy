import os
import wave
import math
import struct

folder = 'audio'
os.makedirs(folder, exist_ok=True)
tracks = [
    ('lusaka-lights', [440, 554, 659]),
    ('copper-city', [392, 494, 587]),
    ('zambezi-flow', [330, 440, 523]),
    ('kafue-nights', [262, 330, 392]),
    ('manda-hill-anthem', [349, 440, 523]),
    ('sunset-on-the-strip', [294, 370, 440]),
    ('ndola-rise', [415, 523, 659]),
]
framerate = 44100
duration = 4
amplitude = 16000
nframes = int(duration * framerate)

for name, freqs in tracks:
    path = os.path.join(folder, f'{name}.wav')
    with wave.open(path, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(framerate)
        frames = bytearray()
        for i in range(nframes):
            t = i / framerate
            sample = 0.0
            for j, f in enumerate(freqs):
                sample += amplitude * math.sin(2 * math.pi * f * t) * (0.5 ** j)
            sample = int(max(-32767, min(32767, sample)))
            frames.extend(struct.pack('<h', sample))
        wf.writeframes(frames)

print('created', len(tracks), 'audio files in', folder)
