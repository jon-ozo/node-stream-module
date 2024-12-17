const { Writable } = require('node:stream');
const { open, write, close } = require('node:fs');

class CustomWritable extends Writable {
	constructor({ highwaterMark, fileName }) {
		super({ highwaterMark });
		this.fileName = fileName;
		this.fd = null;
		this.chunks = [];
		this.chunksSize = 0;
		this.numberOfWrites = 0;
	}

	_construct(callback) {
		open(this.fileName, 'w', (err, fd) => {
			if (err) return callback(err);

			this.fd = fd;
			callback();
		});
	}

	_write(chunk, encoding, callback) {
		this.chunksSize += chunk.length;
		this.chunks.push(chunk);

		if (this.chunksSize > this.writableHighWaterMark) {
			write(this.fd, Buffer.concat(this.chunks), (err) => {
				if (err) return callback(err);

				this.chunks = [];
				this.chunksSize = 0;
				++this.numberOfWrites;
				callback();
			});
		} else {
			callback();
		}
	}

	_final(callback) {
		write(this.fd, Buffer.concat(this.chunks), (err) => {
			if (err) return callback(err);

			this.chunks = [];
			callback();
		});
	}

	_destroy(e, callback) {
		console.log('Number of writes: ' + this.numberOfWrites);

		if (this.fd) {
			close(this.fd, (err) => {
				if (err) return callback(err || e);

				callback(e);
			});
		}
	}
}

// const customWriteStream = new CustomWritable({
// 	highwaterMark: 16000,
// 	fileName: 'text.txt',
// });
// customWriteStream.write(
// 	Buffer.from('Written through the custom writable stream.')
// );
// customWriteStream.end(Buffer.from(' The last write into the file.'));
// customWriteStream.on('finish', () => {
// 	console.log('Streaming done');
// });

(() => {
	console.time('Streaming...');

	const stream = new CustomWritable({ fileName: 'huge-text.txt' });

	let i = 0;
	const writeToBuffer = () => {
		while (i < 1000000) {
			const buff = Buffer.from(` ${i} `, 'utf-8');

			if (i == 999999) {
				return stream.end(buff);
			}

			i++;

			if (!stream.write(buff)) break;
		}
	};
	writeToBuffer();

	stream.on('drain', () => {
		writeToBuffer();
	});

	stream.on('finish', () => {
		console.timeEnd('Streaming...');
	});
})();
