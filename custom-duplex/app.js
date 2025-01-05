const { Buffer } = require('node:buffer');
const { Duplex } = require('node:stream');
const { open, read, write, close } = require('node:fs');

class CustomDuplex extends Duplex {
	constructor({
		readableHighWaterMark,
		writableHighWaterMark,
		readFileName,
		writeFileName,
	}) {
		super({ readableHighWaterMark, writableHighWaterMark });
		this.readFileName = readFileName;
		this.writeFileName = writeFileName;
		this.readFd = null;
		this.writeFd = null;
		this.chunks = [];
		this.chunksSize = 0;
	}

	_construct(callback) {
		open(this.readFileName, 'r', (err, fd) => {
			if (err) return callback(err);

			this.readFd = fd;

			open(this.writeFileName, 'w', (err, fd) => {
				if (err) return callback(err);

				this.writeFd = fd;
				callback();
			});
		});
	}

	_read(size) {
		const readBuffer = new Buffer.alloc(size);

		read(this.readFd, readBuffer, 0, size, null, (err, bytesRead) => {
			if (err) return this.destroy(err);

			this.push(bytesRead > 0 ? readBuffer.subarray(0, bytesRead) : null);
		});
	}

	_write(chunk, encoding, callback) {
		this.chunksSize += chunk.length;
		this.chunks.push(chunk);

		if (this.chunksSize > this.writableHighWaterMark) {
			write(this.writeFd, Buffer.concat(this.chunks), (err) => {
				if (err) return callback(err);

				this.chunksSize = 0;
				this.chunks = [];
				callback();
			});
		} else {
			callback();
		}
	}

	_final(callback) {
		write(
			this.writeFd,
			Buffer.concat(this.chunks),
			0,
			this.chunksSize,
			null,
			(err) => {
				if (err) return callback(err);

				this.chunks = [];
				callback();
			}
		);
	}
}

const customDuplex = new CustomDuplex({
	readFileName: '../custom-writable/huge-text.txt',
	writeFileName: 'duplex-write.txt',
});
customDuplex.on('data', (chunk) => {
	customDuplex.write(chunk);
});
customDuplex.on('end', () => {
	console.log('Done reading data');
});
