import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522
#TODO Implement logging function
#TODO ensure a read thread and write thread cannot occur at same time 

class rfid_connection:
    def __init__(self) -> None:
        GPIO.setwarnings(False)
        self.connection = SimpleMFRC522()

    def write(self, data_to_write):
        self.connection.write(data_to_write)
        print("Wrote '", data_to_write, "' to RFID tag")

    def read(self):
        self.last_read_value = -1
        id, values = self.connection.read()
        print("Read '", values , "' from RFID tag with ID: ", id)
        self.last_read_value = id
        return self.last_read_value
    
    def read_after_thread(self):
        return self.last_read_value

    def clean_up(self):
        GPIO.cleanup() 