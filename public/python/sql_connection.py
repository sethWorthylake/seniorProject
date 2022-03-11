import mysql.connector
from mysql.connector import Error
import logging
#logging.basicConfig(format='%(levelname)s:%(message)s', filename='example.log', encoding='utf-8', level=logging.DEBUG)
#TODO proper logging
import os
from sound_player import sound_player

_host = "localhost"
_user = "pi"
_password = "raspberry"
_database_name = "attendance"
_user_table_description = "id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), sound VARCHAR(255), rfid_code VARCHAR(255), password VARCHAR(255), admin BOOL, modifier INT, is_default BOOL"
_sounds_table_description = "id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), size INT"

_sound_default_name = "fake"
_sound_default_size = 0

_user_default_name = "Seth"
_user_default_sound = "fake"
_user_default_key = 0
_user_default_password = 000
_user_default_admin = True
_user_default_modifier = 1

_user_values_names = "name, sound, rfid_code, password, admin, modifier, is_default"
_user_values_format = "%s,%s,%s,%s,%s,%s,%s"

_database_creation_error = "1007 (HY000): Can't create database 'attendance'; database exists"
_sounds_creation_error = "1050 (42S01): Table 'sounds' already exists"
_users_creation_error = "1050 (42S01): Table 'users' already exists"

class user:
  pass

class sound:
  pass

class sql_connection:
  def __init__(self) -> None:
    self._connect()

  def refresh_connection(self):
    self.connection.close()
    self._connect()

  def _reset(self):
    self._drop_database()
    logging.debug("Database Dropped")

  def _connect(self, database_name = _database_name):
    try:
      self.connection = mysql.connector.connect(
        host= _host,
        user= _user,
        password= _password,
        database=database_name,
      )
    except Error as e:
      logging.error(e)
      raise Exception(e)

  def _execute(self, command, arguments=""):
    try:
      my_cursor = self.connection.cursor()
      my_cursor.execute(command,arguments)
      return my_cursor.fetchall() # returns an array of outputs
    except Error as e:
      logging.error(e)
      raise Exception(e)

  def _create_database(self, database_name=_database_name):
    command = "CREATE DATABASE " + database_name
    try:
      self._execute(command)
    except Error as e:
      logging.error(e)
      raise Exception(e)

  def _create_table(self, table_name, values):
    command = "CREATE TABLE " + table_name + " (" + values + ")"
    try:
      self._execute(command)
    except Error as e:
      raise Exception(e)

  def _insert(self, table, name_of_values, format_of_values, values):
    command = "INSERT INTO " + table + " (" + name_of_values + ") VALUES (" + format_of_values + ")"
    try:
      self._execute(command,values)
      self.connection.commit()
    except Error as e:
      raise Exception(e)

  def _select(self, table, values_to_select, where="", delete=""):
    command = ""
    if delete:
      command = "DELETE FROM " + table
    else:
      command = "SELECT " + values_to_select + " FROM " + table
    
    if where:
      command = command + " WHERE " + where
    try:
      return self._execute(command)
    except Error as e:
      raise Exception(e)

  def _drop_database(self,database=_database_name):
    self._execute("DROP DATABASE " + database)

  def select_from_sounds(self, values_to_select="*", where_value_name="", where_logic="", where_value=""):
    where = ""
    if where_value and where_logic and where_value_name:
      where = where_value_name + " " + where_logic + " '" + where_value + "'"
    return self._select("sounds", values_to_select, where)

  def delete_from_sounds(self, where_value_name, where_logic, where_value):
    where = where_value_name + " " + where_logic + " '" + where_value + "'"
    self._select("sounds", "", where,"delete")
    self.connection.commit()

  def select_from_users(self, values_to_select="*", where_value_name="", where_logic="", where_value=""):
    where = ""
    if where_value and where_logic and where_value_name:
      where = where_value_name + " " + where_logic + " '" + where_value + "'"
    return self._select("users", values_to_select, where)

  def delete_from_users(self, where_value_name, where_logic, where_value):
    where = where_value_name + " " + where_logic + " '" + where_value + "'"
    self._select("users", "", where,"delete")
    self.connection.commit()
  
  def check_for_user(self, name="", sound="", rfid_code=""):
    retval = False
    if name:
        retval = self.select_from_users("*", "name", "=", name) 
    elif sound:
        retval = self.select_from_users("*", "sound", "=", sound)
    elif rfid_code:
        retval = self.select_from_users("*", "rfid_code", "=", rfid_code)
    return retval 

  def check_for_sound(self, name): 
    return self.select_from_sounds("*","name","=", name)

  def insert_user(self, name, sound, key, password, admin=0, modifier=1, is_default=1):
    if self.check_for_user(name):
      raise Exception("User Already Exists")
    #TODO check to ensure the key dose not exist 
    self._insert("users", _user_values_names, _user_values_format, (name, sound, key, password, admin, modifier, is_default))

  def _format_single_user(self, user_data_array):
    if user_data_array:
      user_data = user_data_array[0]
      retval = user()
      retval.name = user_data[1]
      retval.sound = user_data[2]
      retval.rfid_code = user_data[3]
      retval.admin = user_data[4]
      retval.modifier = user_data[5]
      return retval
    else:
      return user_data_array 

  def select_single_user_by_name(self, name):
    return self._format_single_user( self.check_for_user(name))

  def select_single_user_by_rfid_code(self, rfid_code):
    return self._format_single_user( self.check_for_user("","",rfid_code))

  def insert_sound(self, name, size):
    os.system("cd sounds")
    command = "rm " + name
    if self.check_for_sound(name):
      os.system(command)
      raise Exception("Sound Already Exists")
    check = sound_player()
    if not check.check_file(name):
      os.system(command)
      raise Exception("Cant Play File")
    
    self._insert("sounds","name, size","%s,%s", (name, size))

  def _setup_sounds(self):
    pass
    #full_path = "/home/pi/ws/SeniorProject/public/files/"
    #full_name = "applause-1.wav"
    #full_command = "wget http://www.pacdv.com/sounds/people_sound_effects/applause-1.wav" 
    #if not(os.path.exists(full_path + full_name)):
        #os.system(full_command + " -P " + full_path)
        #self.insert_sound(full_name, os.path.getsize(full_path + full_name))
