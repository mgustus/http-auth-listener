const		colors     = require('colors/safe'),
			os         = require('os'),
			portfinder = require('portfinder'),
			http       = require('http'),
			auth       = require('basic-auth'),
			cliui      = require('cliui'),
			moment     = require('moment');


module.exports = class HttpServer {

	constructor(logger, options) {
		this.logger = logger;
		this.options = options;
	}

	requestHandler(req, res) {
		const body = [];
		const date = new Date();

		this.logger.info('[%s] %s %s "%s"',
			moment().format('DD-MMM-YYYY HH:mm:ss.SSS'), colors.cyan(req.method), colors.cyan(req.url),
			req.headers['user-agent']
		);

		res.on('error', err => this.logger.error(colors.red('Error on response'), err));

		req.on('error', err => this.logger.error(colors.red('Error on request'), err))
			.on('data', chunk => body.push(chunk))
			.on('end', () => {
				this.logHeaders(req);
				this.logBody(body);

				if(this.validateBasicAuthentication(req, res)) {
					res.statusCode = this.options.statusCode;
					res.end();
				}
			});
	}

	validateBasicAuthentication(req, res) {
		if(!this.options.user && !this.options.pass){
			return true;
		}

		const credentials = auth(req);

		if (!credentials || credentials.name !== this.options.user || credentials.pass !== this.options.pass) {
			this.logger.error(colors.red('ERROR: Basic Authentication - Access denied.'));
			res.statusCode = 401;
			res.end('Access denied!');
			return false;
		}

		this.logger.info(colors.green('Basic Authentication - Access granted.'));
		return true;
	}

	logHeaders(req) {
		if(!this.options.logHeaders){
			return;
		}

		const prettyHeaders = JSON.stringify(req.headers, null, 2);
		this.logger.info(colors.cyan('Received headers:\n'), colors.yellow(prettyHeaders));
	}

	logBody(body) {
		if(!this.options.logBody){
			return;
		}

		let prettyBody;
		const strBody = Buffer.concat(body).toString();

		try {
			prettyBody = JSON.stringify(JSON.parse(strBody), null, 2);
		} catch (e) {
			prettyBody = strBody;
		}

		if(prettyBody) {
			this.logger.info(colors.cyan('Received body:\n'), colors.yellow(prettyBody));
		} else {
			this.logger.info(colors.cyan('Received empty body.'));
		}
	}

	getPort() {
			if (this.options.port) {
				return Promise.resolve(this.options.port);
			}

			portfinder.basePort = 8080;
			return portfinder.getPortPromise();
	}

	printServerAddresses(port) {
		const ifaces = os.networkInterfaces();
		let arrAddresses = [];

		Object.keys(ifaces).forEach(netAdapter => {
			ifaces[netAdapter].forEach(details => {
				if (details.family === 'IPv4') {
					const network = details.internal ? 'internal' : netAdapter;
					arrAddresses.push('  http://' + details.address + ':' + colors.green(port) + '\t  (' + network + ')');
				}
			});
		});

		const ui = cliui();
		ui.div(arrAddresses.join('\n'));
		this.logger.info(colors.yellow('Available on:'));
		this.logger.info(ui.toString());
	}

	async listen() {
		let port = await this.getPort();

		const server = http.createServer(this.requestHandler.bind(this));

		server.listen(port, () => {
			this.logger.info(colors.yellow('Starting up http-auth-listener.'));
			this.printServerAddresses(port);
			this.logger.info('Press CTRL-C to stop the server\n');
		});
	}

};

