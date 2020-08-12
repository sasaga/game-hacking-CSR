import curses
import codecs
import frida
from pynput import mouse
import struct 
from tabulate import tabulate

class csr4c3:
    def __init__(self):
        self.session = frida.get_usb_device().attach('CSR Racing')

        with codecs.open('./src/csr4c3.js', 'r', 'utf-8') as file:
            self.source = file.read()

        self.script = self.session.create_script(self.source)
        self.script.load()

        self.rpc = self.script.exports

#------------------------------------------------------------------------ Clases
class Menu(object) :

    def __init__(self, prompt="csr4c3@hook>") :
        self.prompt = prompt + " "
        self.opciones = [
            self.addValuesNew,
        ]
        self.presentacion = "------------------ MENU csr4c3 ------------------\n"

        for numero, opcion in enumerate(self.opciones, 1) :
            self.presentacion += "{0}. {1}\n".format(numero, opcion.__name__[:])

        self.myObject = csr4c3();

    def type_format(self, mem_type, value):
        self.mem_types = {
            'u32': ('<I', 4), # unsigned int (4 bytes)
            's32': ('<i', 4), # signed int (4 bytes)
            'u64': ('<Q', 8), # unsigned long (8 bytes)
            's64': ('<q', 8), # signed long (8 bytes)
            'f'  : ('<f', 4), # float (4 bytes)
            'd'  : ('<d', 8)  # double (8 byte)
        }

        if mem_type == 's':
            self.s = value.encode().hex()
        else:
            self.s = struct.pack(self.mem_types[mem_type][0], value)
            self.s = codecs.encode(self.s, 'hex').decode()

        self.s = iter(self.s)
        return ' '.join(i + j for i, j in zip(self.s, self.s))

    def loop(self):
        while True:
            print(self.presentacion)
            try:
                self.seleccion = int(input(self.prompt))

                if self.seleccion == 1:
                    self.addValuesNew()
            except ValueError:
                input("debe ingresar un numero :(")
            except KeyboardInterrupt:
                break

    def addValuesNew(self):
        self.cash = input("Cuanto dinero desea agregar al juego: ")
        self.gold = input("Cuanto oro desea agregar al juego: ")
        self.fuel = input("Cuanto gasolina desea agregar al juego: ")

        self.cash = self.type_format("u32", int(self.cash))
        self.cash = list(map(lambda x: int(x, 16), self.cash.split()))
        self.gold = self.type_format("u32", int(self.gold))
        self.gold = list(map(lambda x: int(x, 16), self.gold.split()))
        self.fuel = self.type_format("u32", int(self.fuel))
        self.fuel = list(map(lambda x: int(x, 16), self.fuel.split()))
        self.myObject.rpc.add_values_new(self.cash, self.gold, self.fuel)

mi_menu = Menu()
mi_menu.loop()