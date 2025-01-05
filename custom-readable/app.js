const { Readable } = require('node:stream');
const { Buffer } = require('node:buffer');
const { open, read, close } = require('node:fs');

class CustomReadable extends Readable {
	constructor({ highWaterMark, fileName }) {
		super({ highWaterMark });
		this.fileName = fileName;
		this.fd = null;
	}

	_construct(callback) {
		open(this.fileName, 'r', (err, fd) => {
			if (err) return callback(err);

			this.fd = fd;
			callback();
		});
	}

	_read(size) {
		const buffer = new Buffer.alloc(size);

		read(this.fd, buffer, 0, size, null, (err, bytesRead) => {
			if (err) return this.destroy(err);

			this.push(bytesRead > 0 ? buffer.subarray(0, bytesRead) : null);
		});
	}

	_destroy(error, callback) {
		if (this.fd) {
			close(this.fd, (err) => callback(err || error));
		} else {
			callback(error);
		}
	}
}

const customRead = new CustomReadable({
	fileName: '../readable-stream/dest-even.txt',
});
customRead.on('data', (chunk) => {
	console.log(chunk.toString('utf-8'));
});

customRead.on('end', () => {
	console.log('Done streaming');
});
