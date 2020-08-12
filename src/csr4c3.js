/*
Filename:    csr4c3.js
Description: This project hacks the csr4c3 game using frida and Hooking techniques
Author:      Samir sanchez garnica @sasaga92
command:     Frida "Name Process" -l csr4c3.js
*/


/* This is the list to global variable */

var nameProcess = Process.getModuleByName('csr4c3');
var nameProcessBaseAddress = nameProcess.base;


var Player = {
    'functionPointerPlayer':0x15bae0, //This is pointer Pplayer
    'offsetCash':0x88,
    'offsetGold':0x90,
    'offsetFuel':0xb8
}

/*  This is the list of global functions */

//This function reads the amount and memory content of an assigned pointer
function readMemory(pAddress, size) {
    return Memory.readByteArray(ptr(pAddress), size);
}

//This function extracts UTF-8 string from an assigned pointer
function readMemoryString(pAddress) {
    return Memory.readUtf8String(ptr(pAddress));
}

function getPointer(pAddress){
    return Memory.readPointer(ptr(pAddress));
}

//This function write the amount and memory content of an assigned pointer
function writeMemory(pAddress, opcodes){
    return Memory.writeByteArray(ptr(pAddress), opcodes);
}

//This function extracts Float value from an assigned pointer
function readMemoryFloat(pAddress) {
    return Memory.readFloat(ptr(pAddress));
}

//This function write Float value from an assigned pointer
function writeMemoryFloat(pAddress, value) {
    return Memory.writeFloat(ptr(pAddress), value);
}

//This function returns the value written in memory as an integer
function getIntValueOpcodes(bytes){
    var byte = new Uint8Array(bytes);
    var strOpcodes = [];
    var temp = "0x";
    for(var i = 0; i < byte.length; i++) {

        strOpcodes.push(byte[i].toString(16));
    }
    strOpcodes = strOpcodes.reverse();

    for (var index = 0; index < strOpcodes.length; index++) {
        temp += strOpcodes[index];
    }
    return parseInt(temp);
}

//This function read bytes and convert to ascci
function hex_to_ascii(hex){
    var data = new Uint8Array(hex);
    var str = '';

    for (var i=0; i<data.length; i++) {
        if(data[i] <= 126){
            str += String.fromCharCode(data[i]);
        }
        //str += (data[i].toString(16) + " ");
    }

    return str;
 }

function addValuesNew(cash, gold, fuel){
    var functionPrtPlayer = nameProcessBaseAddress.add(Player['functionPointerPlayer'])
    Interceptor.attach(functionPrtPlayer, {
        onEnter: function(args){
            var ptrPlayer = getPointer(this.context['x19'].add(0x20));
            var ptrPlayerCash = ptr(ptrPlayer.add(Player['offsetCash']));
            var ptrPlayerGold = ptr(ptrPlayer.add(Player['offsetGold']));
            var ptrPlayerFuel = ptr(ptrPlayer.add(Player['offsetFuel']));

            console.log("[+] pointer basePlayer: "+ ptrPlayer);
            console.log("[+] pointer playerCash: "+ ptrPlayerCash + " new value: " + cash);
            console.log("[+] pointer playerGold: "+ ptrPlayerGold + " new value: " + gold);
            console.log("[+] pointer playerFuel: "+ ptrPlayerFuel + " new value: " + fuel);

            writeMemory(ptr(ptrPlayer.add(Player['offsetCash'])), cash)
            writeMemory(ptr(ptrPlayer.add(Player['offsetGold'])), gold)
            writeMemory(ptr(ptrPlayer.add(Player['offsetFuel'])), fuel)
            console.log("[+] new values adjust apply correct....")
            Interceptor.detachAll();
        }
    });
}



rpc.exports = {
    readMemory: readMemory,
    readMemoryString: readMemoryString,
    writeMemory: writeMemory,
    readMemoryFloat: readMemoryFloat,
    writeMemoryFloat: writeMemoryFloat,
    addValuesNew: addValuesNew,
}