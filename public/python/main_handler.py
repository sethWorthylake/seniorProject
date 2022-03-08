from rfid_connection import rfid_connection
from sql_connection import sql_connection
from lcd_wrapper import lcd_wrapper
from sound_player import sound_player
import string
import random
import time
import os

def id_generator(size=6, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

sql = sql_connection()
rfid = rfid_connection()
lcd = lcd_wrapper()
sound = sound_player()

def get_random_name():
    name = id_generator(3)
    #TODO figure out why this logic works like this
    while sql.check_for_user(name):
        name = id_generator(3)
    return name

def get_sound_name():
    retval = sql.select_from_sounds()[0][1]
    return retval

def fill_sound_database():
    pass 


#if no account create account
#create name + give new person sound
#Now that there is an account display name on LCD + play sound
#takes RFID signal and returns account number
def rfid_scan_handling():
    rfid_code = str(rfid.read())
    user = sql.select_single_user_by_rfid_code(rfid_code)
    if not user:
        lcd.display_string("New User",1)
        sql.insert_user(get_random_name(),get_sound_name(),rfid_code,"default")
        user = sql.select_single_user_by_rfid_code(rfid_code)
    else:
        lcd.display_string("Welcome Back",1)

    lcd.display_string(user.name,2)
    try:
        sound.play_sound(user.sound)
    except Exception as e:
        print(e)
    time.sleep(1)

    #Log this into attendance log
    #RFID should wait for a second
try:
    while True:
        print("Start")
        rfid_scan_handling()
        print("End")
except KeyboardInterrupt:
    rfid.clean_up()
    raise