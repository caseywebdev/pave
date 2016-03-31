BIN=node_modules/.bin/
COGS=$(BIN)cogs
WATCHY=$(BIN)watchy

all: install clean test

dev: clean install
	@make -j build-w test-w

clean:
	@rm -fr build

install:
	@npm install

build:
	@$(COGS)

build-w:
	@$(COGS) -w src

test: build
	@npm test

test-w:
	@$(WATCHY) -w build -- npm test
