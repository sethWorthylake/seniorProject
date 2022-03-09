from rfid_connection import rfid_connection
from sql_connection import sql_connection
from lcd_wrapper import lcd_wrapper
from sound_player import sound_player
import string
import random
import time
import os
import sys

def id_generator(size=6, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

working_dir = format(os.getcwd())
sounds_dir = working_dir + "/public/files/"

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
    retval = ""
    results = sql.select_from_sounds()
    if(results):
        if(results[0]):
            retval = results[0][1]
    
    return retval

def fill_sound_database():
    pass 


#if no account create account
#create name + give new person sound
#Now that there is an account display name on LCD + play sound
#takes RFID signal and returns account number
def rfid_scan_handling():
    rfid_code = str(rfid.read())
    sql.refresh_connection()
    lcd.clear_screen()
    user = sql.select_single_user_by_rfid_code(rfid_code)
    if not user:
        lcd.display_string("Default Account",1)
        sql.insert_user(get_random_name(),get_sound_name(),rfid_code,"default")
        user = sql.select_single_user_by_rfid_code(rfid_code)
    else:
        lcd.display_string("Welcome Back",1)

    lcd.display_string(user.name,2)

    try:
        sound.play_sound(sounds_dir + user.sound)
    except Exception as e:
        print("Failed to play sound")
        print(e)
    time.sleep(2)

    #Log this into attendance log
    #RFID should wait for a second

while True:
    print("Start MAIN HANDLER")
    sys.stdout.flush()
    rfid_scan_handling()
    print("End MAIN HANDLER")
    rfid.clean_up()