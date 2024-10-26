//% weight=100 color=#0fbc11 icon=""
namespace TTSModule {
    let initialized = false;

	//% block="initialize TTS with TX %tx=serial_pin|RX %rx=serial_pin"
	//% tx.defl=SerialPin.P0
	//% rx.defl=SerialPin.P1
	export function initTTS(tx: SerialPin, rx: SerialPin): void {
		serial.redirect(tx, rx, BaudRate.BaudRate9600);
	}

    //% block="send hex string %hexStr to TTS module"
    export function sendText(hexStr: string): void {
        if (!initialized) {
            basic.showString("Init first!");
            return;
        }

        // Convert the human-readable hex string to a byte array
        let gb2312Buffer = parseHexString(hexStr);
        let dataLength = gb2312Buffer.length + 2; // Command + Encoding + Text length
        let header = 0xFD;
        let command = 0x01; // Text synthesis command
        let encoding = 0x01; // GB2312 encoding

        // Create a buffer with the required packet structure
        let packet = pins.createBuffer(4 + gb2312Buffer.length);
        packet.setNumber(NumberFormat.UInt8BE, 0, header);
        packet.setNumber(NumberFormat.UInt16BE, 1, dataLength);
        packet.setNumber(NumberFormat.UInt8BE, 3, command);
        packet.setNumber(NumberFormat.UInt8BE, 4, encoding);

        // Copy the GB2312-encoded bytes into the packet
        for (let i = 0; i < gb2312Buffer.length; i++) {
            packet.setNumber(NumberFormat.UInt8BE, 5 + i, gb2312Buffer[i]);
        }

        // Send the packet over UART
        serial.writeBuffer(packet);

        // Wait for response
        let response = serial.readBuffer(1);
        if (response[0] == 0x41) {
            basic.showString("Success");
        } else {
            basic.showString("Fail");
        }
    }

    // Helper function to parse a hex string into a byte array
    function parseHexString(hexStr: string): Buffer {
        let hexArray = hexStr.split(" ");
        let buffer = pins.createBuffer(hexArray.length);

        for (let i = 0; i < hexArray.length; i++) {
            buffer.setNumber(NumberFormat.UInt8BE, i, parseInt(hexArray[i], 16));
        }

        return buffer;
    }
}
