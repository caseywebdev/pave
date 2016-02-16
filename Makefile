BIN=node_modules/.bin/
COGS=$(BIN)cogs
WATCHY=$(BIN)watchy

dev:
	@npm install
	@make -j build-w test-w

build-w:
	@$(COGS) -w pave.es6,test.es6

test-w:
	@$(WATCHY) -w pave.js,test.js -- npm test
