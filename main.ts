//% weight=100 color=#0fbc11 icon=""
namespace TTSModule {
    let initialized = false;

	//% block="TTS: Initialize TX %tx=serial_pin|RX %rx=serial_pin"
	//% tx.defl=SerialPin.P0
	//% rx.defl=SerialPin.P1
	export function initTTS(tx: SerialPin, rx: SerialPin): void {
		if (!initialized) {
			serial.redirect(tx, rx, BaudRate.BaudRate115200);
			initialized = true;
			basic.pause(1000); // Allow time for initialization
		}
	}

    //% block="TTS: SpeakGB2312Hex %hexStr"
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
		let packet = pins.createBuffer(5 + gb2312Buffer.length);
		packet.setNumber(NumberFormat.UInt8BE, 0, header);
		packet.setNumber(NumberFormat.UInt16BE, 1, dataLength);
		packet.setNumber(NumberFormat.UInt8BE, 3, command);
		packet.setNumber(NumberFormat.UInt8BE, 4, encoding);

		// Copy the GB2312-encoded bytes into the packet
		for (let i = 0; i < gb2312Buffer.length; i++) {
			packet.setNumber(NumberFormat.UInt8BE, 5 + i, gb2312Buffer[i]);
		}

		console.log(packet);
		// Send the packet over UART
		serial.writeBuffer(packet);

		// Wait for response
		let response = serial.readBuffer(1);
		if (response[0] != 0x41) {
			basic.showString("TTS Failed");
		}
	}

	function parseHexString(hexStr: string): Buffer {
		// Manually remove spaces
		let cleanHexStr = "";
		for (let i = 0; i < hexStr.length; i++) {
			if (hexStr.charAt(i) !== " ") {
				cleanHexStr += hexStr.charAt(i);
			}
		}

		// Check if the cleaned string has an even number of characters (valid hex string)
		if (cleanHexStr.length % 2 !== 0) {
			console.error("Invalid hex string. Length must be even.");
			return pins.createBuffer(0); // Return an empty buffer or handle this case differently
		}

		// Split the string into an array of two-character hex bytes
		let hexArray: string[] = [];
		for (let i = 0; i < cleanHexStr.length; i += 2) {
			hexArray.push(cleanHexStr.substr(i, 2));
		}

		// Create a buffer and fill it with the parsed hex values
		let buffer = pins.createBuffer(hexArray.length);
		for (let i = 0; i < hexArray.length; i++) {
			let hexValue = parseInt(hexArray[i], 16);
			if (isNaN(hexValue)) {
				hexValue = 0; // Default or error handling for invalid hex values
			}
			buffer.setNumber(NumberFormat.UInt8BE, i, hexValue);
		}

		return buffer;
	}
}
