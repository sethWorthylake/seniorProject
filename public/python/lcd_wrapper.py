from i2c_dev import Lcd

class lcd_wrapper:
    def __init__(self):
        self.display = Lcd()

    def _check_input_string(self, input):
        if not isinstance(input, str):
            raise Exception("Input is not string")
    
    def _check_input_int(self, input):
        if not isinstance(input, int):
            raise Exception("Input is not Int")
    
    def display_string(self, string, line):
        self._check_input_string(string)
        self._check_input_int(line)
        self.display.lcd_display_string(string, line)