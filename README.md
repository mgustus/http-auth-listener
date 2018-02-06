# http-auth-listener
a command-line http listener with optional basic authentication checking.

## Usage

	http-auth-listener [options] 
  
#### Available Options:
	--port         Port to use (default: 8080)
	--rcode        Response status code (default: 200)
	-u             Username for basic authentication (default: none)
	-p             Password for basic authentication (default: none)

	-b, --body     Print event body (default: no)
	-h, --headers  Print event headers (default: no)

	--help         Print help and exit
#### Example:
	node bin/http-auth-listener --port=7770 --rcode=404 -u user@domain -p secret -bh

&nbsp;
&nbsp;
## Installation
Copy this repository locally, then in the http-auth-listener directory run:

```sh
> npm install
```

## Running
```sh
> node bin/http-auth-listener -bh
``` 
