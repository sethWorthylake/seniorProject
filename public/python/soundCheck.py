import sys
from sound_player import sound_player

sound = sound_player()

print(sound.check_file(sys.argv[1]))
sys.stdout.flush()