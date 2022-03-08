import sys
from lcd_wrapper import lcd_wrapper

print('{"status":"Started" }')
sys.stdout.flush()
lcd = lcd_wrapper()

if sys.argv[1]:
    lcd.display_string(sys.argv[1],1)
    print(sys.argv[1])
elif sys.argv[2]:
    lcd.display_string(sys.argv[2],2)
    print(sys.argv[2])