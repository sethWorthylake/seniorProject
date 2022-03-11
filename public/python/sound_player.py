from pygame import mixer

_speaker_volume = 1

class sound_player:
    def __init__(self):
        mixer.init()
        mixer.music.set_volume(_speaker_volume)

    def play_sound(self,path, modifier=_speaker_volume):
        mixer.music.set_volume(modifier)
        if not self.check_file(path):
            raise Exception("File '" + path + "' cannot be played")
        mixer.music.play()

    def play_sound_then_wait(self,path, modifier=_speaker_volume):
        try:
            self.play_sound(path,modifier)
        except Exception as e:
            raise Exception(e)
        while mixer.music.get_busy() == True:
            continue

    def check_file(self,path):
        try:
            mixer.music.load(path)
            return True
        except:
            return False