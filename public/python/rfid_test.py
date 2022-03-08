from unittest import result
from rfid_connection import rfid_connection
import threading

x = rfid_connection()

thread = threading.Thread(target= x.read) 
thread.start()
print("Thread Created")

print("During")

thread.join()

print(x.read_after_thread())